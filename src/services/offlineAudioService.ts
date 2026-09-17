import { ReciterProvider } from './reciterProvider';
import { SURAHS_METADATA, getSurahMeta } from '../data/surahsMeta';

const AUDIO_DB_NAME = 'khatmah_offline_audio_db';
const AUDIO_DB_VERSION = 1;

export interface AudioStorageRecord {
  id: string; // `${reciterId}:${surah}:${ayah}`
  reciterId: string;
  surah: number;
  ayah: number;
  blob: Blob;
  size: number;
  downloadedAt: number;
}

export interface SurahDownloadStatus {
  surahNumber: number;
  name: string;
  downloadedAyahs: number;
  totalAyahs: number;
  isComplete: boolean;
  sizeBytes: number;
  formattedSize: string;
}

export interface ReciterStorageStats {
  reciterId: string;
  totalAyahs: number;
  completedSurahsCount: number;
  totalBytes: number;
  formattedSize: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 ميجابايت';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) {
    const kb = bytes / 1024;
    return `${Math.round(kb)} كيلوبايت`;
  }
  return `${mb.toFixed(1)} ميجابايت`;
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

function openAudioDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
      return;
    }

    const request = indexedDB.open(AUDIO_DB_NAME, AUDIO_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('audio_files')) {
        const store = db.createObjectStore('audio_files', { keyPath: 'id' });
        store.createIndex('by_reciter', 'reciterId', { unique: false });
        store.createIndex('by_reciter_surah', ['reciterId', 'surah'], { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export const OfflineAudioService = {
  formatBytes,

  /**
   * التحقق مما إذا كانت آية معينة محملة محلياً بالفعل
   */
  async isAyahDownloaded(reciterId: string, surah: number, ayah: number): Promise<boolean> {
    try {
      const db = await openAudioDB();
      const id = `${reciterId}:${surah}:${ayah}`;
      return new Promise<boolean>((resolve) => {
        const tx = db.transaction('audio_files', 'readonly');
        const store = tx.objectStore('audio_files');
        const req = store.getKey(id);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  /**
   * جلب ملف الصوت المحلي لآية كـ Blob
   */
  async getAyahAudioBlob(reciterId: string, surah: number, ayah: number): Promise<Blob | null> {
    try {
      const db = await openAudioDB();
      const id = `${reciterId}:${surah}:${ayah}`;
      return new Promise<Blob | null>((resolve) => {
        const tx = db.transaction('audio_files', 'readonly');
        const store = tx.objectStore('audio_files');
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result.blob);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  /**
   * الحصول على رابط التشغيل للآية (محلي إذا كان محملاً، أو عبر الإنترنت)
   */
  async getAyahAudioUrl(
    reciterId: string, 
    surah: number, 
    ayah: number
  ): Promise<{ url: string; isLocal: boolean; blob?: Blob }> {
    const blob = await this.getAyahAudioBlob(reciterId, surah, ayah);
    if (blob) {
      const localUrl = URL.createObjectURL(blob);
      return { url: localUrl, isLocal: true, blob };
    }

    const onlineUrl = ReciterProvider.getAyahAudioUrl(reciterId, surah, ayah);
    return { url: onlineUrl, isLocal: false };
  },

  /**
   * حفظ ملف صوتي للآية في قاعدة بيانات التخزين دون اتصال
   */
  async saveAyahAudio(reciterId: string, surah: number, ayah: number, blob: Blob): Promise<void> {
    const db = await openAudioDB();
    const id = `${reciterId}:${surah}:${ayah}`;
    const record: AudioStorageRecord = {
      id,
      reciterId,
      surah,
      ayah,
      blob,
      size: blob.size,
      downloadedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('audio_files', 'readwrite');
      const store = tx.objectStore('audio_files');
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * تحميل آية فردية من السيرفر وحفظها محلياً
   */
  async fetchAndStoreAyah(
    reciterId: string, 
    surah: number, 
    ayah: number, 
    signal?: AbortSignal
  ): Promise<number> {
    // إذا كانت محملة مسبقاً، لا داعي لإعادة تحميلها
    const existingBlob = await this.getAyahAudioBlob(reciterId, surah, ayah);
    if (existingBlob) {
      return existingBlob.size;
    }

    const url = ReciterProvider.getAyahAudioUrl(reciterId, surah, ayah);
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`تعذر تنزيل صوت الآية ${surah}:${ayah} (كود: ${response.status})`);
    }

    const blob = await response.blob();
    await this.saveAyahAudio(reciterId, surah, ayah, blob);
    return blob.size;
  },

  /**
   * تنزيل سورة كاملة لقارئ محدد مع متابعة نسبة التقدم
   */
  async downloadSurah(
    reciterId: string,
    surahNumber: number,
    onProgress?: (downloadedCount: number, totalCount: number, currentAyah: number) => void,
    signal?: AbortSignal
  ): Promise<{ successCount: number; failCount: number; totalBytes: number }> {
    const surahMeta = getSurahMeta(surahNumber);
    const totalAyahs = surahMeta.numberOfAyahs;
    let successCount = 0;
    let failCount = 0;
    let totalBytes = 0;

    // تشغيل التنزيل بالتوازي المنظم (دفعات من 3 آيات لتسريع التنزيل دون إرهاق الشبكة)
    const concurrency = 3;
    const ayahsToDownload: number[] = [];
    for (let a = 1; a <= totalAyahs; a++) {
      ayahsToDownload.push(a);
    }

    let currentIndex = 0;
    const runWorker = async () => {
      while (currentIndex < ayahsToDownload.length) {
        if (signal?.aborted) throw new DOMException('Download aborted', 'AbortError');
        const ayahNum = ayahsToDownload[currentIndex++];
        try {
          const size = await this.fetchAndStoreAyah(reciterId, surahNumber, ayahNum, signal);
          successCount++;
          totalBytes += size;
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          console.warn(`فشل تنزيل الآية ${ayahNum} في سورة ${surahNumber}:`, err);
          failCount++;
        }
        if (onProgress) {
          onProgress(successCount + failCount, totalAyahs, ayahNum);
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, totalAyahs) }, () => runWorker());
    await Promise.all(workers);

    return { successCount, failCount, totalBytes };
  },

  /**
   * تنزيل قائمة مخصصة من الآيات (مثل ورد اليوم أو جزء كامل)
   */
  async downloadAyahRange(
    reciterId: string,
    items: { surah: number; ayah: number }[],
    onProgress?: (completed: number, total: number, current: { surah: number; ayah: number }) => void,
    signal?: AbortSignal
  ): Promise<{ successCount: number; failCount: number }> {
    let successCount = 0;
    let failCount = 0;
    const total = items.length;
    let index = 0;
    const concurrency = 3;

    const runWorker = async () => {
      while (index < items.length) {
        if (signal?.aborted) throw new DOMException('Download aborted', 'AbortError');
        const item = items[index++];
        try {
          await this.fetchAndStoreAyah(reciterId, item.surah, item.ayah, signal);
          successCount++;
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          failCount++;
        }
        if (onProgress) {
          onProgress(successCount + failCount, total, item);
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, total) }, () => runWorker());
    await Promise.all(workers);

    return { successCount, failCount };
  },

  /**
   * جلب تفاصيل التنزيل لجميع السور الخاصة بقارئ معين
   */
  async getSurahsDownloadStatus(reciterId: string): Promise<SurahDownloadStatus[]> {
    try {
      const db = await openAudioDB();
      const records = await new Promise<AudioStorageRecord[]>((resolve) => {
        const tx = db.transaction('audio_files', 'readonly');
        const store = tx.objectStore('audio_files');
        const index = store.index('by_reciter');
        const req = index.getAll(reciterId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      // تجميع حسب السور
      const countsBySurah: Record<number, { count: number; bytes: number }> = {};
      for (const rec of records) {
        if (!countsBySurah[rec.surah]) {
          countsBySurah[rec.surah] = { count: 0, bytes: 0 };
        }
        countsBySurah[rec.surah].count++;
        countsBySurah[rec.surah].bytes += (rec.size || 0);
      }

      return SURAHS_METADATA.map((surah) => {
        const info = countsBySurah[surah.number] || { count: 0, bytes: 0 };
        const isComplete = info.count >= surah.numberOfAyahs;
        return {
          surahNumber: surah.number,
          name: surah.name,
          downloadedAyahs: info.count,
          totalAyahs: surah.numberOfAyahs,
          isComplete,
          sizeBytes: info.bytes,
          formattedSize: formatBytes(info.bytes),
        };
      });
    } catch {
      return SURAHS_METADATA.map((surah) => ({
        surahNumber: surah.number,
        name: surah.name,
        downloadedAyahs: 0,
        totalAyahs: surah.numberOfAyahs,
        isComplete: false,
        sizeBytes: 0,
        formattedSize: '0 ميجابايت',
      }));
    }
  },

  /**
   * إحصائيات التخزين الإجمالية لقارئ محدد
   */
  async getReciterStorageStats(reciterId: string): Promise<ReciterStorageStats> {
    const list = await this.getSurahsDownloadStatus(reciterId);
    let totalAyahs = 0;
    let completedSurahsCount = 0;
    let totalBytes = 0;

    for (const item of list) {
      totalAyahs += item.downloadedAyahs;
      if (item.isComplete) completedSurahsCount++;
      totalBytes += item.sizeBytes;
    }

    return {
      reciterId,
      totalAyahs,
      completedSurahsCount,
      totalBytes,
      formattedSize: formatBytes(totalBytes),
    };
  },

  /**
   * حذف جميع تلاوات سورة معينة لقارئ محدد لتحرير المساحة
   */
  async deleteSurahAudio(reciterId: string, surahNumber: number): Promise<void> {
    const db = await openAudioDB();
    const surahMeta = getSurahMeta(surahNumber);
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audio_files', 'readwrite');
      const store = tx.objectStore('audio_files');
      for (let a = 1; a <= surahMeta.numberOfAyahs; a++) {
        store.delete(`${reciterId}:${surahNumber}:${a}`);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * حذف كافة التلاوات المحملة لقارئ معين
   */
  async deleteReciterAudio(reciterId: string): Promise<void> {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audio_files', 'readwrite');
      const store = tx.objectStore('audio_files');
      const index = store.index('by_reciter');
      const req = index.openCursor(IDBKeyRange.only(reciterId));
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};
