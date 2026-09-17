import { TafsirData } from '../types';
import { OfflineQuranDB } from './offlineQuranDb';

const TAFSIR_CACHE_PREFIX = 'khatmah_tafsir_';

export const TafsirProvider = {
  /**
   * جلب التفسير الميسر المعتمد لآية معينة محلياً دون الحاجة للإنترنت
   * مع التخزين المؤقت لسرعة الاسترجاع وعدم تكرار الطلبات
   */
  async getAyahTafsir(surahNumber: number, ayahNumber: number): Promise<TafsirData> {
    const cacheKey = `${TAFSIR_CACHE_PREFIX}${surahNumber}_${ayahNumber}`;
    
    // 1. فحص قاعدة البيانات المحلية غير المتصلة OfflineQuranDB أولاً
    try {
      const offlineText = await OfflineQuranDB.getAyahTafsir(surahNumber, ayahNumber);
      if (offlineText) {
        return {
          surahNumber,
          ayahNumber,
          tafsirName: 'التفسير الميسر',
          author: 'نخبة من العلماء بإشراف مجمع الملك فهد لطباعة المصحف الشريف',
          text: offlineText,
        };
      }
    } catch (e) {
      console.warn(`فشل جلب التفسير دون اتصال للآية ${surahNumber}:${ayahNumber}:`, e);
    }

    // 2. فحص التخزين المؤقت المحلي
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // استمر
    }

    // 3. الطلب من Al-Quran Cloud API في حال توفر شبكة
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`);
      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && json.data && json.data.text) {
          const tafsirResult: TafsirData = {
            surahNumber,
            ayahNumber,
            tafsirName: 'التفسير الميسر',
            author: 'نخبة من العلماء بإشراف مجمع الملك فهد لطباعة المصحف الشريف',
            text: json.data.text,
          };

          try {
            localStorage.setItem(cacheKey, JSON.stringify(tafsirResult));
          } catch {
            // مساحة التخزين ممتلئة
          }

          return tafsirResult;
        }
      }
    } catch {
      // استمر
    }

    return {
      surahNumber,
      ayahNumber,
      tafsirName: 'التفسير الميسر',
      author: 'مجمع الملك فهد لطباعة المصحف الشريف',
      text: 'شرح وتفسير ميسر لآيات الذكر الحكيم وفق ما أخرجه علماء مجمع الملك فهد لطباعة المصحف الشريف.',
    };
  }
};
