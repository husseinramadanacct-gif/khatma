import { Khatmah, PaceType, DailyWird } from '../types';
import { getSurahByPage, getSurahMeta, SURAHS_METADATA } from '../data/surahsMeta';
import { getPageStart } from '../data/quranPagesMeta';

export const TOTAL_PAGES = 604;
export const TOTAL_JUZ = 30;
export const TOTAL_HIZB = 60;
export const TOTAL_AYAHS = 6236;

/**
 * حساب عدد الأيام المتوقعة للختمة بناءً على نوع وكمية الورد
 */
export function calculateExpectedDays(paceType: PaceType, paceAmount: number): number {
  if (paceAmount <= 0) return 30;

  switch (paceType) {
    case 'pages':
      return Math.ceil(TOTAL_PAGES / paceAmount);
    case 'juz':
      return Math.ceil(TOTAL_JUZ / paceAmount);
    case 'hizb':
      return Math.ceil(TOTAL_HIZB / paceAmount);
    case 'days_target':
      return paceAmount; // عدد الأيام المحددة مسبقًا
    default:
      return 30;
  }
}

/**
 * حساب مقدار الورد اليومي بالصفحات بناءً على الخطة
 */
export function calculateDailyPages(paceType: PaceType, paceAmount: number): number {
  switch (paceType) {
    case 'pages':
      return paceAmount;
    case 'juz':
      // جزء واحد يعادل تقريباً 20 صفحة
      return Math.round((TOTAL_PAGES / TOTAL_JUZ) * paceAmount);
    case 'hizb':
      // حزب واحد يعادل تقريباً 10 صفحات
      return Math.round((TOTAL_PAGES / TOTAL_HIZB) * paceAmount);
    case 'days_target':
      return Math.max(1, Math.ceil(TOTAL_PAGES / Math.max(1, paceAmount)));
    default:
      return 5;
  }
}

/**
 * حساب تاريخ النهاية المتوقع بناءً على تاريخ البدء والأيام
 */
export function calculateExpectedEndDate(startDateStr: string, totalDays: number): string {
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) {
    const today = new Date();
    today.setDate(today.getDate() + totalDays);
    return today.toISOString().split('T')[0];
  }
  date.setDate(date.getDate() + totalDays);
  return date.toISOString().split('T')[0];
}

/**
 * حساب نسبة التقدم المئوية في الختمة (0 - 100%)
 * تعتمد على رقم الصفحة وموقع الآية بالنسبة للقرآن كاملاً
 */
export function calculateKhatmahProgress(khatmah: Khatmah): {
  percentage: number;
  readPages: number;
  remainingPages: number;
  remainingDays: number;
  statusText: string;
} {
  const readPages = Math.min(TOTAL_PAGES, Math.max(0, khatmah.readPagesCount || (khatmah.currentPage - 1)));
  const percentage = Math.min(100, Math.round((readPages / TOTAL_PAGES) * 100));
  const remainingPages = Math.max(0, TOTAL_PAGES - readPages);

  // حساب الأيام المتبقية
  const now = new Date();
  const endDate = new Date(khatmah.expectedEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  let statusText = `${percentage}% من الختمة`;
  if (percentage === 100) {
    statusText = 'مكتملة بحمد الله';
  } else if (readPages > 0) {
    statusText = `الصفحة ${khatmah.currentPage} من ${TOTAL_PAGES}`;
  }

  return {
    percentage,
    readPages,
    remainingPages,
    remainingDays,
    statusText,
  };
}

/**
 * تحديد نطاق ورد اليوم (الصفحات، السور والآيات) بدقة مع متابعة التقدم اليومي الجزئي
 */
export function generateTodayWird(khatmah: Khatmah): DailyWird {
  const dailyPagesTarget = calculateDailyPages(khatmah.paceType, khatmah.paceAmount);
  const todayStr = new Date().toISOString().split('T')[0];

  // حساب رقم اليوم من بداية الختمة
  const startDate = new Date(khatmah.startDate);
  const todayDate = new Date(todayStr);
  const diffDays = Math.max(1, Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // إذا كان هناك تقدم مسجل لنفس تاريخ اليوم
  let startPage = 1;
  let endPage = 1;
  const savedDayProg = khatmah.wirdDayProgress;

  if (savedDayProg && savedDayProg.date === todayStr) {
    startPage = savedDayProg.startPage;
    endPage = savedDayProg.endPage;
  } else {
    // يوم جديد: الورد يبدأ من آخر صفحة أتمها القارئ أو من الصفحة الحالية
    // إذا كانت readPagesCount مسجلة، فإن الورد التالي يبدأ من (readPagesCount + 1)
    // أو من currentPage
    startPage = Math.min(
      TOTAL_PAGES, 
      Math.max(1, khatmah.readPagesCount ? khatmah.readPagesCount + 1 : (khatmah.currentPage || 1))
    );
    endPage = Math.min(TOTAL_PAGES, startPage + dailyPagesTarget - 1);
  }

  const actualPagesCount = Math.max(1, endPage - startPage + 1);
  const startRef = getPageStart(startPage);
  const endRef = getPageStart(endPage);
  const startSurahMeta = getSurahMeta(startRef.surah);
  const endSurahMeta = getSurahMeta(endRef.surah);

  // حساب الآية النهائية للورد بدقة تامة
  let calculatedEndAyah = endSurahMeta.numberOfAyahs;
  if (endPage < TOTAL_PAGES) {
    const nextRef = getPageStart(endPage + 1);
    if (nextRef.surah === endRef.surah && nextRef.ayah > 1) {
      calculatedEndAyah = nextRef.ayah - 1;
    } else {
      calculatedEndAyah = endSurahMeta.numberOfAyahs;
    }
  } else {
    calculatedEndAyah = 6; // سورة الناس
  }

  // حساب أين يقف القارئ الآن بالنسبة لورد اليوم
  const currentProgressPage = khatmah.currentPage || startPage;
  
  // عدد الصفحات المنجزة من ورد اليوم
  let readPagesToday = 0;
  if (currentProgressPage >= startPage) {
    readPagesToday = Math.min(actualPagesCount, currentProgressPage - startPage);
    if (khatmah.readPagesCount >= endPage) {
      readPagesToday = actualPagesCount;
    }
  }

  const isCompleted = (khatmah.readPagesCount >= endPage) || (currentProgressPage > endPage) || (savedDayProg?.isCompleted ?? false);
  const isSurplus = currentProgressPage > endPage;
  const surplusPagesCount = isSurplus ? (currentProgressPage - endPage) : 0;
  const remainingPagesToday = isCompleted ? 0 : Math.max(0, actualPagesCount - readPagesToday);
  const progressPercent = isCompleted 
    ? 100 
    : Math.min(99, Math.round((readPagesToday / actualPagesCount) * 100));

  return {
    khatmahId: khatmah.id,
    date: todayStr,
    dayNumber: diffDays,
    startSurah: startRef.surah,
    startAyah: startRef.ayah,
    startPage,
    endSurah: endRef.surah,
    endAyah: calculatedEndAyah,
    endPage,
    pagesCount: actualPagesCount,
    currentProgressPage,
    readPagesToday,
    remainingPagesToday,
    progressPercent,
    isCompleted,
    isSurplus,
    surplusPagesCount,
  };
}

/**
 * فحص ما إذا كان هناك ورد فائت غير مكتمل
 */
export function checkMissedWird(khatmah: Khatmah): {
  hasMissed: boolean;
  isMissed: boolean;
  missedPagesCount: number;
  missedDays: number;
} {
  const startDate = new Date(khatmah.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceStart <= 0) {
    return { hasMissed: false, isMissed: false, missedPagesCount: 0, missedDays: 0 };
  }

  const dailyPagesTarget = calculateDailyPages(khatmah.paceType, khatmah.paceAmount);
  const expectedPagesByToday = Math.min(TOTAL_PAGES, daysSinceStart * dailyPagesTarget);
  const actualReadPages = khatmah.readPagesCount || 0;

  if (actualReadPages < expectedPagesByToday - 2) {
    // فارق أكثر من صفحتين يعتبر تأخراً هادئاً يمكن تعويضه
    const missedPages = expectedPagesByToday - actualReadPages;
    const missedDays = Math.ceil(missedPages / dailyPagesTarget);
    return {
      hasMissed: true,
      isMissed: true,
      missedPagesCount: missedPages,
      missedDays,
    };
  }

  return { hasMissed: false, isMissed: false, missedPagesCount: 0, missedDays: 0 };
}

export const calculateTodayWird = generateTodayWird;

/**
 * معالجة التعويض المرن للورد الفائت
 */
export function applyCompensationOption(
  khatmah: Khatmah,
  option: 'gradual' | 'extend' | 'skip'
): Partial<Khatmah> {
  const missed = checkMissedWird(khatmah);
  if (!missed.hasMissed) return {};

  if (option === 'gradual') {
    // زيادة طفيفة بالصفحات اليومية بما لا يتجاوز 1.3x من الورد الأصلي
    const currentDaily = calculateDailyPages(khatmah.paceType, khatmah.paceAmount);
    const addedDaily = Math.min(3, Math.ceil(missed.missedPagesCount / 7));
    return {
      paceType: 'pages',
      paceAmount: currentDaily + addedDaily,
    };
  }

  if (option === 'extend') {
    // تمديد تاريخ الختم بعدد أيام التأخير للمحافظة على الورد المريح
    const currentEnd = new Date(khatmah.expectedEndDate);
    currentEnd.setDate(currentEnd.getDate() + missed.missedDays);
    return {
      expectedEndDate: currentEnd.toISOString().split('T')[0],
      totalDays: khatmah.totalDays + missed.missedDays,
    };
  }

  if (option === 'skip') {
    // تجاهل الورد الفائت والبدء من الموقع الحالي دون تعويض إضافي
    const todayStr = new Date().toISOString().split('T')[0];
    const remainingDays = Math.max(7, Math.ceil((new Date(khatmah.expectedEndDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)));
    const remainingPages = TOTAL_PAGES - (khatmah.readPagesCount || 0);
    const newDaily = Math.max(1, Math.ceil(remainingPages / remainingDays));
    return {
      paceType: 'pages',
      paceAmount: newDaily,
    };
  }

  return {};
}
