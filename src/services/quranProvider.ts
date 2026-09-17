import { Ayah, SurahMeta, SearchResult } from '../types';
import { SURAHS_METADATA, getSurahMeta, getSurahByPage } from '../data/surahsMeta';
import { getPageStart, getPageForAyahNumber, getJuzForPage } from '../data/quranPagesMeta';
import { StorageService } from './storageService';
import { normalizeForSearch, extractSnippet } from '../utils/arabicNormalizer';
import { stripTajweedCodes } from '../utils/tajweedParser';
import { OfflineQuranDB } from './offlineQuranDb';

// الذاكرة المؤقتة السريعة للعمليات المتكررة في الجلسة الواحدة
const inMemorySurahCache: Record<number, Ayah[]> = {};
const inMemoryPageCache: Record<number, Ayah[]> = {};

// بدء التهيئة التلقائية المسبقة لقاعدة البيانات غير المتصلة
if (typeof window !== 'undefined') {
  OfflineQuranDB.initialize().catch(err => console.warn('Offline DB background init:', err));
}

export const QuranProvider = {
  /**
   * جلب قائمة جميع السور
   */
  getSurahs(): SurahMeta[] {
    return SURAHS_METADATA;
  },

  /**
   * جلب معلومات سورة معينة
   */
  getSurahMeta(number: number): SurahMeta {
    return getSurahMeta(number);
  },

  /**
   * جلب آيات سورة كاملة بنص المصحف المجود الملون دون الحاجة للإنترنت
   */
  async getSurahAyahs(surahNumber: number): Promise<Ayah[]> {
    if (surahNumber < 1 || surahNumber > 114) surahNumber = 1;

    // 1. فحص ذاكرة الرام الفورية
    if (inMemorySurahCache[surahNumber]) {
      return inMemorySurahCache[surahNumber];
    }

    // 2. فحص قاعدة البيانات المحلية OfflineQuranDB (تعمل دون إنترنت 100%)
    try {
      const offlineAyahs = await OfflineQuranDB.getSurahAyahs(surahNumber);
      if (offlineAyahs && offlineAyahs.length > 0) {
        inMemorySurahCache[surahNumber] = offlineAyahs;
        return offlineAyahs;
      }
    } catch (e) {
      console.warn(`فشل القراءة من قاعدة البيانات غير المتصلة للسورة ${surahNumber}:`, e);
    }

    // 3. فحص التخزين المحلي
    const cached = StorageService.getCachedSurah(surahNumber);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      inMemorySurahCache[surahNumber] = cached;
      return cached;
    }

    // 4. محاولة الاتصال بالإنترنت في حال كانت متوفرة
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-tajweed`);
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.ayahs) {
          const ayahs: Ayah[] = data.data.ayahs.map((item: any) => ({
            number: item.number,
            numberInSurah: item.numberInSurah,
            text: item.text,
            surahNumber: surahNumber,
            juz: item.juz,
            page: item.page,
            hizbQuarter: item.hizbQuarter,
            sajda: item.sajda,
          }));

          inMemorySurahCache[surahNumber] = ayahs;
          StorageService.setCachedSurah(surahNumber, ayahs);
          return ayahs;
        }
      }
    } catch {
      // استمر
    }

    // 5. Fallback نهائي للفاتحة
    if (surahNumber === 1) {
      const fatihaTajweed: Ayah[] = [
        { number: 1, numberInSurah: 1, text: "بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّح[p[ِي]مِ", surahNumber: 1, juz: 1, page: 1 },
        { number: 2, numberInSurah: 2, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ [h:4[ٱ]لْعَ[n[ـٰ]لَم[p[ِي]نَ", surahNumber: 1, juz: 1, page: 1 },
        { number: 3, numberInSurah: 3, text: "ٱ[l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّح[p[ِي]مِ", surahNumber: 1, juz: 1, page: 1 },
        { number: 4, numberInSurah: 4, text: "مَ[n[ـٰ]لِكِ يَوْمِ [h:5[ٱ][l[ل]دّ[p[ِي]نِ", surahNumber: 1, juz: 1, page: 1 },
        { number: 5, numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَع[p[ِي]نُ", surahNumber: 1, juz: 1, page: 1 },
        { number: 6, numberInSurah: 6, text: "ٱهْدِنَا [h:6[ٱ][l[ل]صِّر[n[َٲ]طَ [h:7[ٱ]لْمُسْتَق[p[ِي]مَ", surahNumber: 1, juz: 1, page: 1 },
        { number: 7, numberInSurah: 7, text: "صِر[n[َٲ]طَ [h:8[ٱ]لَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ [h:9[ٱ]لْمَغْضُوبِ عَلَيْهِمْ وَلَا [h:10[ٱ][l[ل]ضّ[m[َا]ٓلّ[p[ِي]نَ", surahNumber: 1, juz: 1, page: 1 },
      ];
      inMemorySurahCache[1] = fatihaTajweed;
      return fatihaTajweed;
    }

    throw new Error(`تعذر تحميل آيات السورة ${surahNumber}. يرجى المحاولة مرة أخرى.`);
  },

  /**
   * جلب آيات صفحة معينة من مصحف المدينة المجود (1 - 604) دون اتصال بالإنترنت
   */
  async getPageAyahs(pageNumber: number): Promise<Ayah[]> {
    if (pageNumber < 1 || pageNumber > 604) {
      pageNumber = 1;
    }

    // 1. فحص ذاكرة الرام الفورية
    if (inMemoryPageCache[pageNumber]) {
      return inMemoryPageCache[pageNumber];
    }

    // 2. فحص قاعدة البيانات المحلية غير المتصلة OfflineQuranDB
    try {
      const offlineAyahs = await OfflineQuranDB.getPageAyahs(pageNumber);
      if (offlineAyahs && offlineAyahs.length > 0) {
        inMemoryPageCache[pageNumber] = offlineAyahs;
        return offlineAyahs;
      }
    } catch (e) {
      console.warn(`فشل جلب الصفحة ${pageNumber} من قاعدة البيانات غير المتصلة:`, e);
    }

    // 3. فحص التخزين المحلي
    const cached = StorageService.getCachedPage(pageNumber);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      inMemoryPageCache[pageNumber] = cached;
      return cached;
    }

    // 4. محاولة الاتصال بالإنترنت
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-tajweed`);
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.ayahs) {
          const ayahs: Ayah[] = data.data.ayahs.map((item: any) => ({
            number: item.number,
            numberInSurah: item.numberInSurah,
            text: item.text,
            surahNumber: item.surah.number,
            juz: item.juz,
            page: item.page,
            hizbQuarter: item.hizbQuarter,
            sajda: item.sajda,
          }));

          inMemoryPageCache[pageNumber] = ayahs;
          StorageService.setCachedPage(pageNumber, ayahs);
          return ayahs;
        }
      }
    } catch {
      // استمر
    }

    // 5. كحل بديل: جلب السورة التابعة لهذه الصفحة واستخلاص آيات الصفحة
    const surahMeta = getSurahByPage(pageNumber);
    const surahAyahs = await this.getSurahAyahs(surahMeta.number);
    const pageAyahs = surahAyahs.filter(a => a.page === pageNumber);
    if (pageAyahs.length > 0) {
      inMemoryPageCache[pageNumber] = pageAyahs;
      return pageAyahs;
    }

    return surahAyahs;
  },

  /**
   * معرفة رقم صفحة آية معينة بسرعة وبدقة تامة (متزامن وبدون اتصال)
   */
  getPageForAyahSync(surahNumber: number, ayahNumber: number): number {
    return getPageForAyahNumber(surahNumber, ayahNumber);
  },

  /**
   * جلب بداية الصفحة (السورة، الآية) بدقة
   */
  getPageStartSync(pageNumber: number): { surah: number; ayah: number; page: number } {
    return getPageStart(pageNumber);
  },

  /**
   * جلب رقم صفحة آية معينة بدقة متناهية
   */
  async getPageForAyah(surahNumber: number, ayahNumber: number): Promise<number> {
    return getPageForAyahNumber(surahNumber, ayahNumber);
  },

  /**
   * محرك البحث الشامل داخل نصوص القرآن الكريم (يعمل 100% دون إنترنت)
   */
  async searchQuran(query: string): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    // 1. البحث الفوري بدون اتصال عبر كامل المصحف (114 سورة)
    try {
      const offlineMatches = await OfflineQuranDB.searchQuran(trimmed, 60);
      if (offlineMatches && offlineMatches.length > 0) {
        return offlineMatches.map(m => {
          const meta = getSurahMeta(m.surah);
          return {
            surahNumber: m.surah,
            surahName: meta.name,
            ayahNumber: m.ayah,
            text: m.text,
            page: m.page,
            matchSnippet: extractSnippet(m.text, trimmed),
          };
        });
      }
    } catch (e) {
      console.warn('تعذر البحث عبر قاعدة البيانات غير المتصلة:', e);
    }

    // 2. البحث عبر API إذا كان متصلاً بالإنترنت
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/ar`);
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.matches) {
          const results: SearchResult[] = data.data.matches.slice(0, 50).map((match: any) => {
            const surahMeta = getSurahMeta(match.surah.number);
            const cleanText = stripTajweedCodes(match.text);
            return {
              surahNumber: match.surah.number,
              surahName: surahMeta.name,
              ayahNumber: match.numberInSurah,
              text: cleanText,
              page: match.page || surahMeta.startPage,
              matchSnippet: extractSnippet(cleanText, trimmed),
            };
          });
          return results;
        }
      }
    } catch {
      // تجاهل
    }

    return [];
  }
};
