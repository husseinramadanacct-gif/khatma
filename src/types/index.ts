/**
 * الأنواع والواجهات البرمجية الأساسية لتطبيق «خاتمة» — Khatmah
 */

export interface SurahMeta {
  number: number;                   // رقم السورة (1 - 114)
  name: string;                     // اسم السورة بالعربية (مثل: الفاتحة، البقرة)
  englishName: string;              // الاسم بالإنجليزية
  englishNameTranslation: string;   // ترجمة المعنى
  numberOfAyahs: number;            // عدد الآيات
  revelationType: 'Meccan' | 'Medinan'; // مكان النزول: مكية / مدنية
  startPage: number;                // صفحة بداية السورة في مصحف المدينة (1 - 604)
  juzNumber: number;                // الجزء الذي تبدأ فيه
}

export interface Ayah {
  number: number;                   // الرقم التراكمي للآية (1 - 6236)
  numberInSurah: number;            // رقم الآية داخل السورة
  text: string;                     // النص العثماني الأصيل
  surahNumber: number;              // رقم السورة
  juz: number;                      // رقم الجزء (1 - 30)
  page: number;                     // رقم الصفحة في المصحف (1 - 604)
  hizbQuarter?: number;             // ربع الحزب (1 - 240)
  sajda?: boolean | object;         // سجدة تلاوة
}

export type PaceType = 'pages' | 'juz' | 'hizb' | 'days_target';

export interface Khatmah {
  id: string;
  title: string;                    // عنوان الختمة (مثلاً: ختمة رمضان، ختمتي الأولى)
  createdAt: string;                // تاريخ الإنشاء ISO
  startDate: string;                // تاريخ البدء
  expectedEndDate: string;          // التاريخ المتوقع للإتمام
  completedAt?: string;             // تاريخ الإتمام الفعلي
  status: 'active' | 'completed' | 'paused';
  paceType: PaceType;               // نوع تحديد الورد
  paceAmount: number;               // كمية الورد (مثلاً 5 صفحات، أو 30 يومًا)
  reminderTime: string;             // وقت التذكير بالورد (مثلاً "20:00")
  reminderEnabled: boolean;         // تفعيل التنبيه
  totalDays: number;                // إجمالي الأيام المخططة
  currentSurah: number;             // السورة الحالية
  currentAyah: number;              // الآية الحالية
  currentPage: number;              // الصفحة الحالية
  currentJuz: number;               // الجزء الحالي
  readPagesCount: number;           // عدد الصفحات المنجزة
  totalReadingSessions: number;     // إجمالي الجلسات
  lastReadAt: string;               // آخر وقت للقراءة
  wirdDayProgress?: {
    date: string;                   // تاريخ اليوم الحالي YYYY-MM-DD
    dayNumber: number;              // رقم اليوم
    startPage: number;              // صفحة بداية ورد اليوم
    endPage: number;                // صفحة نهاية ورد اليوم المخططة
    lastReadPage: number;           // آخر صفحة وصل إليها القارئ اليوم
    completedPagesCount: number;    // عدد الصفحات المقروءة اليوم
    isCompleted: boolean;           // هل اكتمل الورد
    surplusPagesCount?: number;     // صفحات إضافية زائدة عن الورد
  };
  bonusAwards?: {
    id: string;
    date: string;
    title: string;
    pagesRead: number;
    pagesTarget: number;
    surplusCount: number;
    rewardMessage: string;
    badgeName: string;
  }[];
}

export interface DailyWird {
  khatmahId: string;
  date: string;                     // تاريخ اليوم YYYY-MM-DD
  dayNumber: number;                // رقم اليوم من الختمة (1..N)
  startSurah: number;
  startAyah: number;
  startPage: number;
  endSurah: number;
  endAyah: number;
  endPage: number;
  pagesCount: number;
  currentProgressPage?: number;     // الصفحة الحالية التي وصل إليها القارئ في ورد اليوم (مثلاً 144)
  readPagesToday?: number;          // عدد الصفحات المقروءة من ورد اليوم
  remainingPagesToday?: number;     // الصفحات المتبقية لإكمال ورد اليوم
  progressPercent?: number;         // نسبة إنجاز ورد اليوم 0-100%
  isCompleted: boolean;
  completedAt?: string;
  isSurplus?: boolean;              // هل تجاوز الورد المطلوب
  surplusPagesCount?: number;       // عدد الصفحات الزائدة
}

export interface ReadingPosition {
  surahNumber: number;
  ayahNumber: number;
  pageNumber: number;
  juzNumber: number;
  updatedAt: string;
  khatmahId?: string;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  pageNumber: number;
  ayahText?: string;
  surahName?: string;
  note?: string;
  createdAt: string;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  subfolder: string;
  style: string;
  bitrate: string;
  serverType: 'everyayah' | 'islamic_network';
}

export interface TafsirData {
  surahNumber: number;
  ayahNumber: number;
  tafsirName: string;
  author: string;
  text: string;
}

export interface SearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  page: number;
  matchSnippet: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;                 // بالبكسل (20 - 40)
  lineSpacing: number;              // (1.8 - 2.8)
  showTajweedColors: boolean;       // إظهار ألوان التجويد
  defaultReciterId: string;         // معرف القارئ الافتراضي
  fontFamily: 'amiri-quran' | 'amiri';
  readingMode?: 'surah' | 'page';
  playbackSpeed?: number;           // سرعة التشغيل (0.75 - 1.5)
  repeatAyahTimes?: number;         // تكرار الآية (1 - 5)
  notificationsEnabled?: boolean;
  notificationTime?: string;
  audioAutoScroll?: boolean;        // التمرير التلقائي أثناء الاستماع
}

export type ActiveTab = 'home' | 'reader' | 'khatmat' | 'search' | 'bookmarks' | 'settings';

export type AudioPlaybackScope = 'continuous' | 'surah' | 'wird' | 'single';

export interface WirdListeningTarget {
  khatmahId: string;
  dayNumber: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  startPage: number;
  endPage: number;
  pagesCount: number;
}
