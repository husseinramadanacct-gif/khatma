import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Download, X, Check, Trash2, HardDrive, Volume2, Search, 
  Loader2, AlertCircle, RefreshCw, Sparkles, Pause, Play, CheckCircle2,
  Headphones, ChevronDown, BookOpen
} from 'lucide-react';
import { Reciter, DailyWird } from '../../types';
import { VERIFIED_RECITERS, ReciterProvider } from '../../services/reciterProvider';
import { SURAHS_METADATA, getSurahMeta } from '../../data/surahsMeta';
import { normalizeForSearch } from '../../utils/arabicNormalizer';
import { 
  OfflineAudioService, 
  SurahDownloadStatus, 
  ReciterStorageStats 
} from '../../services/offlineAudioService';
import { getAyahsForPageRange } from '../../data/quranPagesMeta';

interface AudioDownloadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReciterId?: string;
  todayWird?: DailyWird | null;
  onSelectReciter?: (reciter: Reciter) => void;
  onAudioDownloaded?: () => void;
}

export const AudioDownloadManagerModal: React.FC<AudioDownloadManagerModalProps> = ({
  isOpen,
  onClose,
  activeReciterId = 'alafasy',
  todayWird = null,
  onSelectReciter,
  onAudioDownloaded,
}) => {
  const [selectedReciterId, setSelectedReciterId] = useState<string>(activeReciterId);
  const [surahsStatus, setSurahsStatus] = useState<SurahDownloadStatus[]>([]);
  const [stats, setStats] = useState<ReciterStorageStats | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'downloaded' | 'not_downloaded'>('all');

  // تنزيل السورة الفردية
  const [activeSurahDownloading, setActiveSurahDownloading] = useState<number | null>(null);
  const [activeSurahProgress, setActiveSurahProgress] = useState<{ current: number; total: number; ayah: number }>({ current: 0, total: 0, ayah: 0 });

  // تنزيل المصحف كاملاً
  const [isFullQuranDownloading, setIsFullQuranDownloading] = useState<boolean>(false);
  const [fullQuranProgress, setFullQuranProgress] = useState<{
    currentSurah: number;
    surahName: string;
    completedAyahs: number;
    totalAyahs: number;
    percent: number;
  }>({
    currentSurah: 1,
    surahName: 'الفاتحة',
    completedAyahs: 0,
    totalAyahs: 6236,
    percent: 0,
  });

  // تنزيل الورد اليومي
  const [isWirdDownloading, setIsWirdDownloading] = useState<boolean>(false);
  const [wirdProgress, setWirdProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // رسائل التنبيه والنجاح
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteReciter, setConfirmDeleteReciter] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // تحديث القارئ المحدد عند فتح النافذة
  useEffect(() => {
    if (isOpen && activeReciterId) {
      setSelectedReciterId(activeReciterId);
    }
  }, [isOpen, activeReciterId]);

  // تحميل حالة السور والإحصائيات
  const refreshStatus = async (reciterId: string) => {
    setIsLoadingList(true);
    try {
      const [list, reciterStats] = await Promise.all([
        OfflineAudioService.getSurahsDownloadStatus(reciterId),
        OfflineAudioService.getReciterStorageStats(reciterId),
      ]);
      setSurahsStatus(list);
      setStats(reciterStats);
    } catch (err) {
      console.error('فشل جلب بيانات التخزين الصوتي:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus(selectedReciterId);
    }
  }, [isOpen, selectedReciterId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // اختيار قارئ
  const handleSelectReciter = (rId: string) => {
    if (isFullQuranDownloading || activeSurahDownloading !== null || isWirdDownloading) {
      showToast('يرجى إيقاف التنزيل الحالي أولاً قبل تبديل القارئ');
      return;
    }
    setSelectedReciterId(rId);
    const reciterObj = ReciterProvider.getReciterById(rId);
    if (onSelectReciter) {
      onSelectReciter(reciterObj);
    }
  };

  // إلغاء أي تنزيل نشط
  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsFullQuranDownloading(false);
    setActiveSurahDownloading(null);
    setIsWirdDownloading(false);
    showToast('تم إيقاف التنزيل');
    refreshStatus(selectedReciterId);
  };

  // تنزيل سورة واحدة
  const handleDownloadSurah = async (surahNumber: number) => {
    if (activeSurahDownloading !== null || isFullQuranDownloading || isWirdDownloading) {
      showToast('هناك عملية تنزيل جارية بالفعل، انتظر اكتمالها');
      return;
    }

    const surahMeta = getSurahMeta(surahNumber);
    setActiveSurahDownloading(surahNumber);
    setActiveSurahProgress({ current: 0, total: surahMeta.numberOfAyahs, ayah: 1 });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await OfflineAudioService.downloadSurah(
        selectedReciterId,
        surahNumber,
        (current, total, ayah) => {
          setActiveSurahProgress({ current, total, ayah });
        },
        controller.signal
      );

      showToast(`تم تنزيل تلاوة سورة ${surahMeta.name} بنجاح (${res.successCount} آية)`);
      if (onAudioDownloaded) onAudioDownloaded();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast(`حدث خطأ أثناء تنزيل سورة ${surahMeta.name}، يرجى المحاولة لاحقاً`);
      }
    } finally {
      setActiveSurahDownloading(null);
      abortControllerRef.current = null;
      refreshStatus(selectedReciterId);
    }
  };

  // حذف تلاوة سورة معينة
  const handleDeleteSurah = async (surahNumber: number) => {
    const surahMeta = getSurahMeta(surahNumber);
    try {
      await OfflineAudioService.deleteSurahAudio(selectedReciterId, surahNumber);
      showToast(`تم حذف التلاوة الصوتية لسورة ${surahMeta.name}`);
      refreshStatus(selectedReciterId);
      if (onAudioDownloaded) onAudioDownloaded();
    } catch {
      showToast('تعذر حذف تلاوة السورة');
    }
  };

  // تنزيل المصحف كاملاً
  const handleDownloadFullQuran = async () => {
    if (isFullQuranDownloading || activeSurahDownloading !== null || isWirdDownloading) {
      showToast('هناك عملية تنزيل جارية بالفعل');
      return;
    }

    setIsFullQuranDownloading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let overallCompleted = 0;
    const totalQuranAyahs = 6236;

    try {
      for (let s = 1; s <= 114; s++) {
        if (controller.signal.aborted) break;

        const surahMeta = getSurahMeta(s);
        setFullQuranProgress({
          currentSurah: s,
          surahName: surahMeta.name,
          completedAyahs: overallCompleted,
          totalAyahs: totalQuranAyahs,
          percent: Math.round((overallCompleted / totalQuranAyahs) * 100),
        });

        await OfflineAudioService.downloadSurah(
          selectedReciterId,
          s,
          (curr, total) => {
            const currentTotal = overallCompleted + curr;
            setFullQuranProgress(prev => ({
              ...prev,
              completedAyahs: currentTotal,
              percent: Math.min(100, Math.round((currentTotal / totalQuranAyahs) * 100)),
            }));
          },
          controller.signal
        );

        overallCompleted += surahMeta.numberOfAyahs;
      }

      showToast('ما شاء الله! اكتمل تنزيل المصحف الصوتي كاملاً بنجاح');
      if (onAudioDownloaded) onAudioDownloaded();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast('توقف تنزيل المصحف، يمكنك استكماله في أي وقت');
      }
    } finally {
      setIsFullQuranDownloading(false);
      abortControllerRef.current = null;
      refreshStatus(selectedReciterId);
    }
  };

  // تنزيل ورد اليوم
  const handleDownloadWird = async () => {
    if (!todayWird) return;
    if (isFullQuranDownloading || activeSurahDownloading !== null || isWirdDownloading) {
      showToast('هناك عملية تنزيل جارية بالفعل');
      return;
    }

    setIsWirdDownloading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // استخراج قائمة الآيات التابعة لصفحات الورد
    const wirdAyahs = getAyahsForPageRange(todayWird.startPage, todayWird.endPage);
    setWirdProgress({ current: 0, total: wirdAyahs.length });

    try {
      await OfflineAudioService.downloadAyahRange(
        selectedReciterId,
        wirdAyahs,
        (completed, total) => {
          setWirdProgress({ current: completed, total });
        },
        controller.signal
      );

      showToast(`تم تنزيل تلاوة ورد اليوم كاملاً (ص ${todayWird.startPage} إلى ${todayWird.endPage}) بنجاح`);
      if (onAudioDownloaded) onAudioDownloaded();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast('تعذر اكتمال تنزيل الورد اليومي');
      }
    } finally {
      setIsWirdDownloading(false);
      abortControllerRef.current = null;
      refreshStatus(selectedReciterId);
    }
  };

  // حذف جميع تلاوات القارئ
  const handleDeleteAllReciterAudio = async () => {
    try {
      await OfflineAudioService.deleteReciterAudio(selectedReciterId);
      setConfirmDeleteReciter(false);
      showToast('تم حذف كافة التلاوات الصوتية المحملة لهذا القارئ وتفريغ المساحة');
      refreshStatus(selectedReciterId);
      if (onAudioDownloaded) onAudioDownloaded();
    } catch {
      showToast('تعذر حذف التلاوات');
    }
  };

  // تصفية السور
  const filteredSurahs = useMemo(() => {
    return surahsStatus.filter(item => {
      // فلتر البحث
      if (searchQuery.trim()) {
        const q = normalizeForSearch(searchQuery.trim());
        const matchName = normalizeForSearch(item.name).includes(q);
        const matchNum = String(item.surahNumber).includes(q);
        if (!matchName && !matchNum) return false;
      }
      // فلتر التبويب
      if (filterTab === 'downloaded') return item.isComplete;
      if (filterTab === 'not_downloaded') return !item.isComplete;
      return true;
    });
  }, [surahsStatus, searchQuery, filterTab]);

  const currentReciter = ReciterProvider.getReciterById(selectedReciterId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/20">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white font-serif">
                  تحميل المصحف الصوتي دون إنترنت
                </h3>
                <span className="text-[11px] font-semibold bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Offline Audio
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                حمّل تلاوة الشيخ المفضل لديك للاستماع في أي وقت دون الحاجة للشبكة
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isFullQuranDownloading || activeSurahDownloading !== null || isWirdDownloading) {
                if (window.confirm('هناك تنزيل نشط، هل تريد إيقافه وإغلاق النافذة؟')) {
                  handleCancelDownload();
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 rounded-2xl bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Section 1: Sheikh / Reciter Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                ١. اختر القارئ المراد تنزيل صوته:
              </label>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-serif font-semibold">
                القارئ الحالي: {currentReciter.arabicName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VERIFIED_RECITERS.map(r => {
                const isSelected = selectedReciterId === r.id;
                const isLowData = r.bitrate === '40kbps';
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectReciter(r.id)}
                    className={`p-3 rounded-2xl text-right border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 ring-2 ring-emerald-600/30 font-semibold text-emerald-950 dark:text-emerald-100'
                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-serif font-bold truncate">{r.arabicName}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{r.style}</div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isLowData 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold' 
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {r.bitrate} {isLowData ? '⚡ خفيف' : ''}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Storage Stats & Quick Actions Card */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-700/80 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/70 dark:border-neutral-700">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    مساحة التلاوات المحملة لـ {currentReciter.arabicName}:
                  </div>
                  <div className="text-sm font-serif font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {stats ? (
                      stats.totalAyahs > 0 ? (
                        <span>
                          تم تنزيل {stats.completedSurahsCount} من ١١٤ سورة ({stats.totalAyahs.toLocaleString('ar-EG')} آية) • المساحة: {stats.formattedSize}
                        </span>
                      ) : (
                        <span className="text-neutral-500 font-sans font-normal text-xs">
                          لم يتم تنزيل أي تلاوة لهذا القارئ بعد.
                        </span>
                      )
                    ) : (
                      <span>جاري الفحص...</span>
                    )}
                  </div>
                </div>
              </div>

              {stats && stats.totalAyahs > 0 && !isFullQuranDownloading && (
                <div>
                  {!confirmDeleteReciter ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteReciter(true)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف التلاوات المحملة</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-700 font-bold">تأكيد الحذف؟</span>
                      <button
                        type="button"
                        onClick={handleDeleteAllReciterAudio}
                        className="px-2.5 py-1 text-xs bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700"
                      >
                        نعم، احذف
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteReciter(false)}
                        className="px-2.5 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Bulk Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: Download Full Quran */}
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm font-serif text-neutral-900 dark:text-white">
                      المصحف الصوتي كاملاً (١١٤ سورة)
                    </span>
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                    تنزيل جميع سور القرآن الـ 114 دفعة واحدة للاستماع غير المحدود دون نت.
                  </p>
                </div>

                {isFullQuranDownloading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-serif">
                        جاري تنزيل سورة {fullQuranProgress.surahName}...
                      </span>
                      <span className="font-mono font-bold text-neutral-600 dark:text-neutral-300">
                        {fullQuranProgress.percent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${fullQuranProgress.percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {fullQuranProgress.completedAyahs} من {fullQuranProgress.totalAyahs} آية
                      </span>
                      <button
                        onClick={handleCancelDownload}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        إلغاء التنزيل
                      </button>
                    </div>
                  </div>
                ) : stats && stats.completedSurahsCount === 114 ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>المصحف كاملاً مُحمّل وجاهز دون إنترنت</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={activeSurahDownloading !== null || isWirdDownloading}
                    onClick={handleDownloadFullQuran}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>بدء تنزيل المصحف كاملاً ({currentReciter.arabicName})</span>
                  </button>
                )}
              </div>

              {/* Option B: Download Today's Wird */}
              {todayWird ? (
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm font-serif text-neutral-900 dark:text-white">
                        تنزيل ورد اليوم (ص {todayWird.startPage} - {todayWird.endPage})
                      </span>
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                      تنزيل صفحات وردك اليومي ({todayWird.pagesCount} صفحات) للاستماع أثناء الطريق دون اتصال.
                    </p>
                  </div>

                  {isWirdDownloading ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          جاري تنزيل آيات الورد...
                        </span>
                        <span className="font-mono font-bold">
                          {Math.round((wirdProgress.current / Math.max(1, wirdProgress.total)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 transition-all rounded-full"
                          style={{ width: `${Math.round((wirdProgress.current / Math.max(1, wirdProgress.total)) * 100)}%` }}
                        />
                      </div>
                      <button
                        onClick={handleCancelDownload}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 block text-left"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isFullQuranDownloading || activeSurahDownloading !== null}
                      onClick={handleDownloadWird}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                      <span>تنزيل ورد اليوم فقط للاستماع دون إنترنت</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col justify-center text-center">
                  <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    تنزيل سريع بالسورة
                  </div>
                  <p className="text-xs text-neutral-400">
                    يمكنك اختيار السور المرغوبة من القائمة أدناه وتنزيلها بشكل مستقل في ثوانٍ معدودة.
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* Section 3: Surahs List & Download by Surah */}
          <div className="space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                ٢. قائمة السور وإمكانية التنزيل الفردي:
              </label>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                    filterTab === 'all'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  الكل (١١٤)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('downloaded')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                    filterTab === 'downloaded'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  المُحمّلة ({stats?.completedSurahsCount || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('not_downloaded')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                    filterTab === 'not_downloaded'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  غير المُحمّلة ({114 - (stats?.completedSurahsCount || 0)})
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="ابحث باسم السورة أو رقمها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 text-neutral-900 dark:text-white"
              />
            </div>

            {/* Surahs Table / Items */}
            {isLoadingList ? (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">جاري فحص التلاوات المحملة...</span>
              </div>
            ) : filteredSurahs.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl">
                لم يتم العثور على سور مطابقة
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-72 overflow-y-auto bg-white dark:bg-neutral-900">
                {filteredSurahs.map((surah) => {
                  const isThisDownloading = activeSurahDownloading === surah.surahNumber;
                  return (
                    <div 
                      key={surah.surahNumber}
                      className="p-3 flex items-center justify-between hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-mono font-bold flex items-center justify-center">
                          {surah.surahNumber}
                        </span>
                        <div>
                          <span className="font-serif font-bold text-sm text-neutral-900 dark:text-white block">
                            سورة {surah.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {surah.totalAyahs} آية
                            {surah.downloadedAyahs > 0 && ` • ${surah.formattedSize}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isThisDownloading ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>
                              {activeSurahProgress.current} / {activeSurahProgress.total}
                            </span>
                            <button
                              type="button"
                              onClick={handleCancelDownload}
                              className="text-[11px] text-rose-500 hover:underline mr-1"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : surah.isComplete ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                              <Check className="w-3 h-3" />
                              <span>مُحمَّلة دون نت</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSurah(surah.surahNumber)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-neutral-800 transition-colors"
                              title="حذف هذه السورة لتحرير المساحة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={activeSurahDownloading !== null || isFullQuranDownloading}
                            onClick={() => handleDownloadSurah(surah.surahNumber)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-emerald-600 hover:text-white dark:bg-neutral-800 dark:hover:bg-emerald-600 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>تنزيل</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* User Advice Note */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="font-bold font-serif text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>كيف تعمل التلاوة دون إنترنت؟</span>
            </div>
            <div>• بمجرد تنزيل أي سورة أو ورد أو المصحف كاملاً، تُحفظ ملفات الصوت مباشرة في ذاكرة هاتفك.</div>
            <div>• عند تشغيل الصوت بدون اتصال بالإنترنت، يعمل المشغل فورياً من التخزين المحلي دون أي انقطاع.</div>
            <div>• للشيخ سعد الغامدي حجم اقتصادي مخفف (40kbps) يتيح تنزيل المصحف كاملاً بسرعة فائقة ومساحة صغيرة.</div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {stats ? `الإجمالي المحفوظ: ${stats.formattedSize}` : ''}
          </span>
          <button
            onClick={() => {
              if (isFullQuranDownloading || activeSurahDownloading !== null || isWirdDownloading) {
                if (window.confirm('هناك تنزيل نشط، هل تريد إيقافه وإغلاق النافذة؟')) {
                  handleCancelDownload();
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
          >
            تم وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
