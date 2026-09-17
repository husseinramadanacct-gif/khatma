import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, ChevronRight, ChevronLeft, Sliders, List, 
  Bookmark, Loader2, Sparkles, CheckCircle2, Volume2 
} from 'lucide-react';
import { Ayah, SurahMeta, UserPreferences, Khatmah, Bookmark as BookmarkType } from '../../types';
import { QuranProvider } from '../../services/quranProvider';
import { getSurahMeta, getSurahByPage, SURAHS_METADATA } from '../../data/surahsMeta';
import { getPageStart, getPageForAyahNumber, getJuzForPage } from '../../data/quranPagesMeta';
import { SurahHeader } from './SurahHeader';
import { AyahItem } from './AyahItem';
import { AyahActionSheet } from './AyahActionSheet';
import { TafsirModal } from './TafsirModal';
import { QuranIndexModal } from './QuranIndexModal';
import { ReaderControls } from './ReaderControls';

interface QuranReaderProps {
  initialSurah?: number;
  initialAyah?: number;
  initialPage?: number;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  activeAudioAyah: { surah: number; ayah: number } | null;
  onPlayAyah: (ayah: Ayah) => void;
  activeKhatmah: Khatmah | null;
  onUpdateKhatmahProgress: (surah: number, ayah: number, page: number, juz: number) => void;
  bookmarks: BookmarkType[];
  onAddBookmark: (ayah: Ayah, note?: string) => void;
  onRemoveBookmark: (id: string) => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  initialSurah = 1,
  initialAyah = 1,
  initialPage = 1,
  preferences,
  onUpdatePreferences,
  activeAudioAyah,
  onPlayAyah,
  activeKhatmah,
  onUpdateKhatmahProgress,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
}) => {
  const [currentSurahNum, setCurrentSurahNum] = useState<number>(initialSurah);
  const [currentPageNum, setCurrentPageNum] = useState<number>(initialPage);
  const [viewMode, setViewMode] = useState<'surah' | 'page'>(preferences.readingMode || 'surah');
  
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // متابعة التلاوة وتقليب الصفحات تلقائياً مع القارئ
  const [autoFollowAudio, setAutoFollowAudio] = useState<boolean>(true);

  // Modals state
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState<boolean>(false);
  const [isTafsirOpen, setIsTafsirOpen] = useState<boolean>(false);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // تحديث الموضع عند تغير initial props بدقة
  useEffect(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604) {
      setCurrentPageNum(initialPage);
      const pageStart = getPageStart(initialPage);
      setCurrentSurahNum(initialSurah || pageStart.surah);
    } else if (initialSurah) {
      setCurrentSurahNum(initialSurah);
      if (initialAyah) {
        const p = getPageForAyahNumber(initialSurah, initialAyah);
        setCurrentPageNum(p);
      }
    }
  }, [initialSurah, initialAyah, initialPage]);

  // التمرير التلقائي للآية المستهدفة بعد اكتمال التحميل
  useEffect(() => {
    if (!loading && initialAyah && ayahs.length > 0) {
      const timer = setTimeout(() => {
        const ayahId = `ayah-${currentSurahNum}-${initialAyah}`;
        const el = document.getElementById(ayahId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-emerald-50/80', 'dark:bg-emerald-950/50');
          setTimeout(() => {
            el.classList.remove('bg-emerald-50/80', 'dark:bg-emerald-950/50');
          }, 2000);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, currentSurahNum, initialAyah, ayahs.length]);

  // تحميل الآيات بحسب النمط (سورة أو صفحة)
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        if (viewMode === 'surah') {
          const list = await QuranProvider.getSurahAyahs(currentSurahNum);
          if (!isCancelled) {
            setAyahs(list);
            setLoading(false);
            // تحديد رقم الصفحة المناسبة إما من الآية الحالية أو من أول آية
            if (initialAyah && initialSurah === currentSurahNum) {
              const exactPage = getPageForAyahNumber(currentSurahNum, initialAyah);
              setCurrentPageNum(exactPage);
            } else if (list.length > 0 && list[0].page) {
              setCurrentPageNum(list[0].page);
            }
          }
        } else {
          const list = await QuranProvider.getPageAyahs(currentPageNum);
          if (!isCancelled) {
            setAyahs(list);
            setLoading(false);
            // تحديث السورة بناء على الصفحة
            if (list.length > 0) {
              setCurrentSurahNum(list[0].surahNumber);
              // تحديث موضع القراءة وحفظه عند تقليب الصفحة أو فتحها
              if (activeKhatmah) {
                const representativeAyah = list[0];
                onUpdateKhatmahProgress(
                  representativeAyah.surahNumber,
                  representativeAyah.numberInSurah,
                  currentPageNum,
                  representativeAyah.juz
                );
              }
            }
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error(err);
          setError(err.message || 'حدث خطأ أثناء تحميل آيات القرآن الكريم.');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [currentSurahNum, currentPageNum, viewMode]);

  // متابعة التلاوة وتقليب الصفحات ذاتياً مع القارئ
  useEffect(() => {
    if (!activeAudioAyah || !autoFollowAudio) return;

    const { surah, ayah } = activeAudioAyah;

    if (viewMode === 'page') {
      // فحص ما إذا كانت الآية موجودة بالفعل في الصفحة الحالية
      const isAyahOnCurrentPage = ayahs.some(
        a => a.surahNumber === surah && a.numberInSurah === ayah
      );

      if (isAyahOnCurrentPage) {
        if (surah !== currentSurahNum) {
          setCurrentSurahNum(surah);
        }
      } else {
        // الآية في صفحة أخرى - يجب تقليب الصفحة فوراً مع القارئ
        let targetPage = QuranProvider.getPageForAyahSync(surah, ayah);

        if (!targetPage) {
          // إذا كان انتقالاً متتابعاً للآية التي تلي آخر آية في الصفحة
          if (ayahs.length > 0 && surah === currentSurahNum) {
            const lastAyah = ayahs[ayahs.length - 1];
            if (ayah === lastAyah.numberInSurah + 1 && currentPageNum < 604) {
              targetPage = currentPageNum + 1;
            }
          }
        }

        if (targetPage && targetPage !== currentPageNum) {
          setCurrentPageNum(targetPage);
          if (surah !== currentSurahNum) {
            setCurrentSurahNum(surah);
          }
        } else {
          // جلب رقم الصفحة عبر البروفايدر بشكل غير متزامن
          QuranProvider.getPageForAyah(surah, ayah).then(page => {
            if (page && page !== currentPageNum) {
              setCurrentPageNum(page);
              if (surah !== currentSurahNum) {
                setCurrentSurahNum(surah);
              }
            }
          });
        }
      }
    } else {
      // نمط السورة: الانتقال للسورة التالية إذا تغيرت
      if (surah !== currentSurahNum) {
        setCurrentSurahNum(surah);
      }
    }
  }, [activeAudioAyah, autoFollowAudio, ayahs, viewMode, currentPageNum, currentSurahNum]);

  // التمرير السلس للآية النشطة عند تغير الآية أو اكتمال تحميل الصفحة/السورة
  useEffect(() => {
    if (activeAudioAyah && autoFollowAudio && !loading) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`ayah-${activeAudioAyah.surah}-${activeAudioAyah.ayah}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [activeAudioAyah, autoFollowAudio, loading, ayahs]);

  // تسجيل موضع القراءة الحالي في الختمة
  const handleRecordProgress = (ayah: Ayah) => {
    onUpdateKhatmahProgress(ayah.surahNumber, ayah.numberInSurah, ayah.page, ayah.juz);
  };

  const handleAyahClick = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setIsActionSheetOpen(true);
    handleRecordProgress(ayah);
  };

  // التحقق من وجود علامة مرجعية
  const isAyahBookmarked = (ayah: Ayah) => {
    return bookmarks.some(b => b.surahNumber === ayah.surahNumber && b.ayahNumber === ayah.numberInSurah);
  };

  const handleToggleBookmark = (ayah: Ayah, note?: string) => {
    const existing = bookmarks.find(b => b.surahNumber === ayah.surahNumber && b.ayahNumber === ayah.numberInSurah);
    if (existing) {
      onRemoveBookmark(existing.id);
    } else {
      onAddBookmark(ayah, note);
    }
  };

  const currentSurahMeta = getSurahMeta(currentSurahNum);

  // الانتقال للسورة التالية / السابقة
  const goToNextSurah = () => {
    if (currentSurahNum < 114) {
      const next = currentSurahNum + 1;
      setCurrentSurahNum(next);
      const meta = getSurahMeta(next);
      setCurrentPageNum(meta.startPage);
    }
  };

  const goToPrevSurah = () => {
    if (currentSurahNum > 1) {
      const prev = currentSurahNum - 1;
      setCurrentSurahNum(prev);
      const meta = getSurahMeta(prev);
      setCurrentPageNum(meta.startPage);
    }
  };

  // الانتقال للصفحة التالية / السابقة
  const goToNextPage = () => {
    if (currentPageNum < 604) {
      setCurrentPageNum(p => p + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageNum > 1) {
      setCurrentPageNum(p => p - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 min-h-[calc(100vh-8rem)] flex flex-col" ref={containerRef}>
      
      {/* Top Reader Controls Bar */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl p-2.5 mb-4 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-xs">
        
        {/* Navigation / Index Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIndexOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors"
          >
            <List className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-serif">سورة {currentSurahMeta.name}</span>
          </button>

          <span className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono">
            ص {currentPageNum}
          </span>

          {activeKhatmah && (
            <button
              onClick={() => {
                const first = ayahs[0];
                const last = ayahs[ayahs.length - 1] || first;
                if (last) {
                  onUpdateKhatmahProgress(last.surahNumber, last.numberInSurah, currentPageNum, last.juz);
                } else {
                  onUpdateKhatmahProgress(currentSurahNum, 1, currentPageNum, Math.ceil(currentPageNum / 20));
                }
              }}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 transition-colors"
              title="تثبيت وصولك لهذه الصفحة في الختمة والورد اليومي"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>تثبيت الموضع في الختمة</span>
            </button>
          )}
        </div>

        {/* Mode Switch & Settings */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Surah / Page view */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl flex items-center text-xs">
            <button
              onClick={() => {
                setViewMode('surah');
                onUpdatePreferences({ readingMode: 'surah' });
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                viewMode === 'surah'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-800 dark:text-emerald-200 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
            >
              السورة
            </button>
            <button
              onClick={() => {
                setViewMode('page');
                onUpdatePreferences({ readingMode: 'page' });
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                viewMode === 'page'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-800 dark:text-emerald-200 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
            >
              الصفحة
            </button>
          </div>

          {/* Reader Display Settings */}
          <button
            onClick={() => setIsControlsOpen(true)}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="خيارات العرض والخط والتجويد"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* شريط حالة متابعة التلاوة والتقليب التلقائي */}
      {activeAudioAyah && (
        <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-800/80 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold font-serif">تلاوة جارية:</span>
              <span className="font-medium">سورة {getSurahMeta(activeAudioAyah.surah).name}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/70 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                آية {activeAudioAyah.ayah}
              </span>
              {viewMode === 'page' && (
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 hidden xs:inline">
                  • ص {currentPageNum}
                </span>
              )}
            </div>
          </div>

          {/* مفتاح تشغيل/إيقاف التقليب والمتابعة التلقائية */}
          <button
            onClick={() => setAutoFollowAudio(!autoFollowAudio)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 shadow-xs ${
              autoFollowAudio
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
            }`}
            title={autoFollowAudio ? 'انقر لإيقاف التقليب التلقائي للصفحات' : 'انقر لتفعيل التقليب التلقائي للصفحات مع القارئ'}
          >
            <span>{autoFollowAudio ? 'التقليب التلقائي: مفعّل ✓' : 'التقليب: يدوي'}</span>
          </button>
        </div>
      )}

      {/* Main Reading Surface */}
      <div className={`flex-1 rounded-3xl p-6 sm:p-10 transition-colors shadow-xs border ${
        preferences.theme === 'sepia'
          ? 'bg-[#fbf7ee] border-[#ece1cb] text-amber-950'
          : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100'
      }`}>
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs text-neutral-500 font-medium">جاري تحميل الآيات الكريمة...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div>
            {/* Surah Decorative Header if starting a surah */}
            {ayahs.length > 0 && (viewMode === 'surah' || ayahs[0].numberInSurah === 1) && (
              <SurahHeader surah={currentSurahMeta} />
            )}

            {/* Verses Text Flow (Traditional Continuous Mushaf Layout) */}
            <div 
              className="text-justify leading-loose tracking-normal"
              dir="rtl"
            >
              {ayahs.map(ayah => {
                const isActive = Boolean(
                  activeAudioAyah &&
                  activeAudioAyah.surah === ayah.surahNumber &&
                  activeAudioAyah.ayah === ayah.numberInSurah
                );

                const isBookmarked = isAyahBookmarked(ayah);

                return (
                  <AyahItem
                    key={`${ayah.surahNumber}-${ayah.numberInSurah}`}
                    ayah={ayah}
                    isActive={isActive}
                    isBookmarked={isBookmarked}
                    showTajweed={preferences.showTajweedColors}
                    fontSize={preferences.fontSize}
                    lineSpacing={preferences.lineSpacing}
                    fontFamily={preferences.fontFamily}
                    onClick={handleAyahClick}
                  />
                );
              })}
            </div>

            {/* Page Bottom Margin Ornament & Indicator */}
            <div className="mt-12 pt-6 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono select-none">
              <span>الجزء {ayahs[0]?.juz || currentSurahMeta.juzNumber}</span>
              <span className="font-bold text-neutral-600 dark:text-neutral-300">
                — {currentPageNum} —
              </span>
              <span>الحزب {ayahs[0]?.hizbQuarter ? Math.ceil(ayahs[0].hizbQuarter / 4) : 1}</span>
            </div>
          </div>
        )}

      </div>

      {/* Reader Bottom Navigation (Next / Prev) */}
      <div className="mt-4 flex items-center justify-between px-2 pb-16 sm:pb-4">
        
        {viewMode === 'surah' ? (
          <>
            <button
              onClick={goToNextSurah}
              disabled={currentSurahNum >= 114}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السورة التالية</span>
            </button>

            <span className="text-xs text-neutral-400 font-serif">
              {currentSurahNum} من ١١٤
            </span>

            <button
              onClick={goToPrevSurah}
              disabled={currentSurahNum <= 1}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors shadow-xs"
            >
              <span>السورة السابقة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={goToNextPage}
              disabled={currentPageNum >= 604}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الصفحة التالية</span>
            </button>

            <span className="text-xs text-neutral-400 font-mono">
              صفحة {currentPageNum} من ٦٠٤
            </span>

            <button
              onClick={goToPrevPage}
              disabled={currentPageNum <= 1}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors shadow-xs"
            >
              <span>الصفحة السابقة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}

      </div>

      {/* Ayah Action Sheet */}
      <AyahActionSheet
        ayah={selectedAyah}
        isOpen={isActionSheetOpen}
        isBookmarked={selectedAyah ? isAyahBookmarked(selectedAyah) : false}
        onClose={() => setIsActionSheetOpen(false)}
        onPlayAyah={(a) => {
          onPlayAyah(a);
          handleRecordProgress(a);
        }}
        onOpenTafsir={() => setIsTafsirOpen(true)}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Tafsir Modal */}
      <TafsirModal
        ayah={selectedAyah}
        isOpen={isTafsirOpen}
        onClose={() => setIsTafsirOpen(false)}
      />

      {/* Quran Index Navigation Modal */}
      <QuranIndexModal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        onSelectSurah={(sNum) => {
          setCurrentSurahNum(sNum);
          const meta = getSurahMeta(sNum);
          setCurrentPageNum(meta.startPage);
        }}
        onSelectPage={(pNum) => {
          setCurrentPageNum(pNum);
          const surahMeta = getSurahByPage(pNum);
          setCurrentSurahNum(surahMeta.number);
        }}
      />

      {/* Reader Controls Modal */}
      <ReaderControls
        preferences={preferences}
        onUpdatePreferences={onUpdatePreferences}
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />

    </div>
  );
};
