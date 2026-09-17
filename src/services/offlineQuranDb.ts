import { Ayah, SurahMeta } from '../types';
import { normalizeForSearch } from '../utils/arabicNormalizer';
import { stripTajweedCodes } from '../utils/tajweedParser';

const DB_NAME = 'khatmah_offline_quran_db';
const DB_VERSION = 1;

// ذاكرة سريعة في الرام لسرعة القراءة الفائقة وتجنب أي تأخير
const memoryPages: Record<number, Ayah[]> = {};
const memorySurahs: Record<number, Ayah[]> = {};
const memoryTafsir: Record<string, string> = {};

let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * فتح قاعدة بيانات IndexedDB المحلية المضمونة في متصفحات الهواتف وأندرويد
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB غير مدعوم في هذه البيئة'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pages')) {
        db.createObjectStore('pages', { keyPath: 'page' });
      }
      if (!db.objectStoreNames.contains('surahs')) {
        db.createObjectStore('surahs', { keyPath: 'number' });
      }
      if (!db.objectStoreNames.contains('tafsir')) {
        db.createObjectStore('tafsir', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const OfflineQuranDB = {
  /**
   * تهيئة وتثبيت بيانات القرآن الكريم والتفسير محلياً 100% دون حاجة للإنترنت
   */
  async initialize(): Promise<void> {
    if (isInitialized) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        const db = await openDB();

        // فحص هل تم تثبيت البيانات مسبقاً في IndexedDB
        const isReady = await new Promise<boolean>((resolve) => {
          try {
            const tx = db.transaction('meta', 'readonly');
            const store = tx.objectStore('meta');
            const req = store.get('quran_loaded');
            req.onsuccess = () => resolve(!!req.result?.value);
            req.onerror = () => resolve(false);
          } catch {
            resolve(false);
          }
        });

        if (isReady) {
          isInitialized = true;
          return;
        }

        // تحميل ملفات المصحف والتفسير المدمجة محلياً في التطبيق
        const [pagesRes, quranRes, tafsirRes] = await Promise.all([
          fetch('/data/pages.json').then(r => r.json()).catch(() => null),
          fetch('/data/quran.json').then(r => r.json()).catch(() => null),
          fetch('/data/tafsir.json').then(r => r.json()).catch(() => null),
        ]);

        if (pagesRes) {
          const txPages = db.transaction('pages', 'readwrite');
          const pStore = txPages.objectStore('pages');
          for (const [pageNumStr, ayahs] of Object.entries(pagesRes)) {
            const pNum = parseInt(pageNumStr, 10);
            memoryPages[pNum] = ayahs as Ayah[];
            pStore.put({ page: pNum, ayahs });
          }
        }

        if (quranRes && Array.isArray(quranRes)) {
          const txSurahs = db.transaction('surahs', 'readwrite');
          const sStore = txSurahs.objectStore('surahs');
          for (const s of quranRes) {
            memorySurahs[s.number] = s.ayahs;
            sStore.put(s);
          }
        }

        if (tafsirRes) {
          const txTafsir = db.transaction('tafsir', 'readwrite');
          const tStore = txTafsir.objectStore('tafsir');
          for (const [key, text] of Object.entries(tafsirRes)) {
            memoryTafsir[key] = text as string;
            tStore.put({ key, text });
          }
        }

        // تسجيل اكتمال التثبيت المحلي
        const txMeta = db.transaction('meta', 'readwrite');
        txMeta.objectStore('meta').put({ key: 'quran_loaded', value: true, date: Date.now() });

        isInitialized = true;
      } catch (err) {
        console.warn('تعذر حفظ البيانات في IndexedDB، جاري الاعتماد على التخزين السريع في الذاكرة:', err);
        // حتى لو فشل IndexedDB (مثلاً في وضع التصفح المتخفي الشديد)، نقوم بتحميل الملفات في الذاكرة
        try {
          const [pagesRes, quranRes, tafsirRes] = await Promise.all([
            fetch('/data/pages.json').then(r => r.json()).catch(() => null),
            fetch('/data/quran.json').then(r => r.json()).catch(() => null),
            fetch('/data/tafsir.json').then(r => r.json()).catch(() => null),
          ]);
          if (pagesRes) {
            for (const [pageNumStr, ayahs] of Object.entries(pagesRes)) {
              memoryPages[parseInt(pageNumStr, 10)] = ayahs as Ayah[];
            }
          }
          if (quranRes && Array.isArray(quranRes)) {
            for (const s of quranRes) {
              memorySurahs[s.number] = s.ayahs;
            }
          }
          if (tafsirRes) {
            for (const [key, text] of Object.entries(tafsirRes)) {
              memoryTafsir[key] = text as string;
            }
          }
          isInitialized = true;
        } catch (memErr) {
          console.error('خطأ في تحميل ملفات القرآن المحلية:', memErr);
        }
      }
    })();

    return initPromise;
  },

  /**
   * جلب آيات صفحة كاملة (1 - 604) دون أي اتصال بالإنترنت
   */
  async getPageAyahs(pageNumber: number): Promise<Ayah[] | null> {
    if (pageNumber < 1 || pageNumber > 604) pageNumber = 1;

    // 1. فحص الذاكرة السريعة
    if (memoryPages[pageNumber]) {
      return memoryPages[pageNumber];
    }

    // التأكد من بدء التهيئة
    await this.initialize();

    if (memoryPages[pageNumber]) {
      return memoryPages[pageNumber];
    }

    // 2. قراءة من IndexedDB
    try {
      const db = await openDB();
      const ayahs = await new Promise<Ayah[] | null>((resolve) => {
        const tx = db.transaction('pages', 'readonly');
        const store = tx.objectStore('pages');
        const req = store.get(pageNumber);
        req.onsuccess = () => {
          if (req.result && req.result.ayahs) {
            resolve(req.result.ayahs);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });

      if (ayahs) {
        memoryPages[pageNumber] = ayahs;
        return ayahs;
      }
    } catch {
      // استمر
    }

    // 3. Fallback مباشر لجلب الملف المحلي
    try {
      const res = await fetch('/data/pages.json');
      if (res.ok) {
        const pages = await res.json();
        if (pages && pages[pageNumber]) {
          memoryPages[pageNumber] = pages[pageNumber];
          return pages[pageNumber];
        }
      }
    } catch {
      // غير متاح
    }

    return null;
  },

  /**
   * جلب آيات سورة كاملة (1 - 114) دون اتصال بالإنترنت
   */
  async getSurahAyahs(surahNumber: number): Promise<Ayah[] | null> {
    if (surahNumber < 1 || surahNumber > 114) surahNumber = 1;

    if (memorySurahs[surahNumber]) {
      return memorySurahs[surahNumber];
    }

    await this.initialize();

    if (memorySurahs[surahNumber]) {
      return memorySurahs[surahNumber];
    }

    try {
      const db = await openDB();
      const surahData = await new Promise<any>((resolve) => {
        const tx = db.transaction('surahs', 'readonly');
        const store = tx.objectStore('surahs');
        const req = store.get(surahNumber);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      if (surahData && surahData.ayahs) {
        memorySurahs[surahNumber] = surahData.ayahs;
        return surahData.ayahs;
      }
    } catch {
      // استمر
    }

    // Fallback مباشر
    try {
      const res = await fetch('/data/quran.json');
      if (res.ok) {
        const quran = await res.json();
        const found = quran.find((s: any) => s.number === surahNumber);
        if (found && found.ayahs) {
          memorySurahs[surahNumber] = found.ayahs;
          return found.ayahs;
        }
      }
    } catch {
      // غير متاح
    }

    return null;
  },

  /**
   * جلب التفسير الميسر المعتمد لأي آية دون اتصال بالإنترنت
   */
  async getAyahTafsir(surahNumber: number, ayahNumber: number): Promise<string | null> {
    const key = `${surahNumber}_${ayahNumber}`;
    if (memoryTafsir[key]) {
      return memoryTafsir[key];
    }

    await this.initialize();

    if (memoryTafsir[key]) {
      return memoryTafsir[key];
    }

    try {
      const db = await openDB();
      const tafsir = await new Promise<string | null>((resolve) => {
        const tx = db.transaction('tafsir', 'readonly');
        const store = tx.objectStore('tafsir');
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.text) {
            resolve(req.result.text);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });

      if (tafsir) {
        memoryTafsir[key] = tafsir;
        return tafsir;
      }
    } catch {
      // استمر
    }

    return null;
  },

  /**
   * البحث الفوري في جميع آيات القرآن الكريم دون اتصال
   */
  async searchQuran(query: string, limit = 50): Promise<{ surah: number; ayah: number; text: string; page: number }[]> {
    if (!query || query.trim().length < 2) return [];

    const normQuery = normalizeForSearch(query);
    const results: { surah: number; ayah: number; text: string; page: number }[] = [];

    // تأكد من توفر السور
    await this.initialize();

    for (let sNum = 1; sNum <= 114; sNum++) {
      const ayahs = memorySurahs[sNum] || (await this.getSurahAyahs(sNum));
      if (!ayahs) continue;

      for (const ayah of ayahs) {
        const plainText = stripTajweedCodes(ayah.text || '');
        const normAyah = normalizeForSearch(plainText);
        if (normAyah.includes(normQuery)) {
          results.push({
            surah: ayah.surahNumber,
            ayah: ayah.numberInSurah,
            text: plainText,
            page: ayah.page,
          });

          if (results.length >= limit) return results;
        }
      }
    }

    return results;
  }
};
