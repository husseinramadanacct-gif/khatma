import { Khatmah, ReadingPosition, Bookmark, UserPreferences } from '../types';
import { getPageStart, getPageForAyahNumber, getJuzForPage } from '../data/quranPagesMeta';

const STORAGE_KEYS = {
  KHATMAT: 'khatmah_records_v1',
  ACTIVE_KHATMAH_ID: 'khatmah_active_id_v1',
  LAST_READING_POS: 'khatmah_last_position_v1',
  BOOKMARKS: 'khatmah_bookmarks_v1',
  PREFERENCES: 'khatmah_preferences_v1',
  ONBOARDING_COMPLETED: 'khatmah_onboarding_done_v1',
  CACHED_SURAHS: 'khatmah_cached_tajweed_surah_v2_',
  CACHED_PAGES: 'khatmah_cached_tajweed_page_v2_',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  fontSize: 24,
  lineSpacing: 2.2,
  showTajweedColors: true,
  defaultReciterId: 'alafasy',
  fontFamily: 'amiri-quran',
  readingMode: 'page',
  playbackSpeed: 1.0,
  repeatAyahTimes: 1,
  notificationsEnabled: true,
  notificationTime: '20:00',
  audioAutoScroll: true,
};

export const StorageService = {
  // --- إدارة الختمات ---
  getKhatmat(): Khatmah[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KHATMAT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveKhatmat(khatmat: Khatmah[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.KHATMAT, JSON.stringify(khatmat));
    } catch (e) {
      console.error('Failed to save khatmat to localStorage', e);
    }
  },

  getActiveKhatmahId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_KHATMAH_ID);
  },

  setActiveKhatmahId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_KHATMAH_ID, id);
  },

  getActiveKhatmah(): Khatmah | null {
    const list = this.getKhatmat();
    const activeId = this.getActiveKhatmahId();
    if (!activeId && list.length > 0) {
      return list[0];
    }
    return list.find(k => k.id === activeId) || (list.length > 0 ? list[0] : null);
  },

  saveOrUpdateKhatmah(khatmah: Khatmah): void {
    const list = this.getKhatmat();
    const index = list.findIndex(k => k.id === khatmah.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...khatmah };
    } else {
      list.unshift(khatmah);
    }
    this.saveKhatmat(list);
    this.setActiveKhatmahId(khatmah.id);
  },

  saveKhatmah(khatmah: Khatmah): void {
    this.saveOrUpdateKhatmah(khatmah);
  },

  deleteKhatmah(id: string): void {
    const list = this.getKhatmat().filter(k => k.id !== id);
    this.saveKhatmat(list);
    if (this.getActiveKhatmahId() === id) {
      if (list.length > 0) {
        this.setActiveKhatmahId(list[0].id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_KHATMAH_ID);
      }
    }
  },

  // --- موضع القراءة الأخير ---
  getLastReadingPosition(): ReadingPosition | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_READING_POS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLastReadingPosition(
    surahOrPos: number | ReadingPosition,
    ayahNumber?: number,
    pageNumber?: number,
    juzNumber?: number
  ): ReadingPosition {
    let pos: ReadingPosition;
    if (typeof surahOrPos === 'object') {
      pos = { ...surahOrPos };
    } else {
      const s = surahOrPos;
      const a = ayahNumber || 1;
      const p = pageNumber || getPageForAyahNumber(s, a);
      pos = {
        surahNumber: s,
        ayahNumber: a,
        pageNumber: p,
        juzNumber: juzNumber || getJuzForPage(p),
        updatedAt: new Date().toISOString(),
      };
    }

    // ضمان المزامنة الدقيقة بين رقم الصفحة ورقم الآية والسورة
    if (pos.pageNumber && pos.pageNumber >= 1 && pos.pageNumber <= 604) {
      const expectedPage = getPageForAyahNumber(pos.surahNumber, pos.ayahNumber);
      // إذا كانت الآية لا تقع ضمن هذه الصفحة (مثل خطأ آية 1 في صفحة 19)
      if (expectedPage !== pos.pageNumber) {
        const pageStart = getPageStart(pos.pageNumber);
        pos.surahNumber = pageStart.surah;
        pos.ayahNumber = pageStart.ayah;
      }
      pos.juzNumber = getJuzForPage(pos.pageNumber);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_READING_POS, JSON.stringify(pos));

      // تحديث الختمة النشطة إن وجدت
      const active = this.getActiveKhatmah();
      if (active) {
        active.currentSurah = pos.surahNumber;
        active.currentAyah = pos.ayahNumber;
        active.currentPage = pos.pageNumber;
        active.currentJuz = pos.juzNumber;
        active.readPagesCount = Math.max(active.readPagesCount || 0, pos.pageNumber);
        active.lastReadAt = new Date().toISOString();
        this.saveOrUpdateKhatmah(active);
      }
    } catch (e) {
      console.error('Failed to save last reading position', e);
    }
    return pos;
  },

  // --- العلامات المرجعية ---
  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addBookmark(
    surahOrObj: number | Omit<Bookmark, 'id' | 'createdAt'>,
    ayahNumber?: number,
    pageNumber?: number,
    note?: string
  ): Bookmark[] {
    const list = this.getBookmarks();
    let newBookmark: Bookmark;

    if (typeof surahOrObj === 'object') {
      newBookmark = {
        ...surahOrObj,
        id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
      };
    } else {
      newBookmark = {
        id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        surahNumber: surahOrObj,
        ayahNumber: ayahNumber || 1,
        pageNumber: pageNumber || 1,
        note,
        createdAt: new Date().toISOString(),
      };
    }

    list.unshift(newBookmark);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save bookmark', e);
    }
    return list;
  },

  removeBookmark(id: string): Bookmark[] {
    const list = this.getBookmarks().filter(b => b.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to remove bookmark', e);
    }
    return list;
  },

  isAyahBookmarked(surahNumber: number, ayahNumber: number): boolean {
    const list = this.getBookmarks();
    return list.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  },

  // --- الإعدادات والتفضيلات ---
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
    return updated;
  },

  // --- التحقق من الجولة التعريفية Onboarding ---
  isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  },

  setOnboardingCompleted(): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  },

  // --- التخزين المؤقت للنصوص القرآنية (Offline Caching) ---
  getCachedSurah(surahNumber: number): any | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHED_SURAHS + surahNumber);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCachedSurah(surahNumber: number, data: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_SURAHS + surahNumber, JSON.stringify(data));
    } catch {
      // قد تمتلئ مساحة التخزين في متصفح قديم
    }
  },

  getCachedPage(pageNumber: number): any | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHED_PAGES + pageNumber);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCachedPage(pageNumber: number, data: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_PAGES + pageNumber, JSON.stringify(data));
    } catch {
      // تجاهل امتلاء التخزين
    }
  },

  clearQuranCache(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(STORAGE_KEYS.CACHED_SURAHS) || key.startsWith(STORAGE_KEYS.CACHED_PAGES) || key.startsWith('khatmah_tafsir_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Failed to clear cache', e);
    }
  }
};
