import React, { useState, useMemo, useEffect } from 'react';
import { 
  Volume2, Headphones, Play, X, Search, Check, 
  Sparkles, Layers, BookOpen, Music, ChevronLeft, Download
} from 'lucide-react';
import { Reciter, AudioPlaybackScope, DailyWird } from '../../types';
import { SURAHS_METADATA } from '../../data/surahsMeta';
import { VERIFIED_RECITERS } from '../../services/reciterProvider';
import { normalizeForSearch } from '../../utils/arabicNormalizer';

interface AudioQuranModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReciter?: Reciter;
  currentReciterId?: string;
  currentSurahNumber?: number;
  currentScope?: AudioPlaybackScope;
  todayWird?: DailyWird | null;
  onOpenDownloadManager?: () => void;
  onStartPlayback: (params: {
    surahNumber: number;
    ayahNumber: number;
    reciterId: string;
    scope: AudioPlaybackScope;
    followInReader?: boolean;
  }) => void;
}

export const AudioQuranModal: React.FC<AudioQuranModalProps> = ({
  isOpen,
  onClose,
  currentReciter,
  currentReciterId,
  currentSurahNumber = 1,
  currentScope = 'continuous',
  todayWird = null,
  onOpenDownloadManager,
  onStartPlayback,
}) => {
  const initialReciterId = currentReciter?.id || currentReciterId || VERIFIED_RECITERS[0].id;
  const [selectedReciterId, setSelectedReciterId] = useState<string>(initialReciterId);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(currentSurahNumber || 1);
  const [selectedScope, setSelectedScope] = useState<AudioPlaybackScope>(currentScope || 'continuous');
  const [wirdFollowMode, setWirdFollowMode] = useState<'follow' | 'audio_only'>('follow');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const activeId = currentReciter?.id || currentReciterId;
      if (activeId) {
        setSelectedReciterId(activeId);
      }
      if (currentSurahNumber) {
        setSelectedSurahNumber(currentSurahNumber);
      }
      if (currentScope) {
        setSelectedScope(currentScope);
      }
    }
  }, [isOpen, currentReciter, currentReciterId, currentSurahNumber, currentScope]);

  // فلترة قائمة السور
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAHS_METADATA;
    const normQuery = normalizeForSearch(searchQuery.trim());
    return SURAHS_METADATA.filter(s => {
      const normName = normalizeForSearch(s.name);
      return normName.includes(normQuery) || String(s.number).includes(normQuery);
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleStart = () => {
    onStartPlayback({
      surahNumber: selectedScope === 'wird' && todayWird ? todayWird.startSurah : selectedSurahNumber,
      ayahNumber: selectedScope === 'wird' && todayWird ? (todayWird.startAyah || 1) : 1,
      reciterId: selectedReciterId,
      scope: selectedScope,
      followInReader: selectedScope === 'wird' ? (wirdFollowMode === 'follow') : true,
    });
    onClose();
  };

  const selectedSurahMeta = SURAHS_METADATA.find(s => s.number === selectedSurahNumber) || SURAHS_METADATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white font-serif">
                المصحف الصوتي المرتل
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                استمع للقرآن الكريم كاملاً أو بالسور بتشغيل متواصل وبأصوات كبار القراء
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Offline Audio Download Callout Banner */}
          {onOpenDownloadManager && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-neutral-900 dark:text-white font-serif">
                    تريد الاستماع دون اتصال بالإنترنت؟
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    يمكنك تنزيل تلاوة سورة معينة أو المصحف كاملاً للشيخ المفضل لديك للاستماع دون نت.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDownloadManager();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>فتح مدير التنزيل دون نت</span>
              </button>
            </div>
          )}

          {/* Section 1: Playback Scope / نمط التشغيل */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
              ١. نمط التشغيل الصوتي:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Option 1: Continuous Full Quran */}
              <button
                type="button"
                onClick={() => setSelectedScope('continuous')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between ${
                  selectedScope === 'continuous'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 dark:text-emerald-100'
                    : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm font-serif">المصحف كاملاً</span>
                  {selectedScope === 'continuous' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  تشغيل صوتي متواصل ينتقل تلقائياً بين السور بلا توقف
                </span>
              </button>

              {/* Option 2: Single Surah */}
              <button
                type="button"
                onClick={() => setSelectedScope('surah')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between ${
                  selectedScope === 'surah'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 dark:text-emerald-100'
                    : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm font-serif">السورة فقط</span>
                  {selectedScope === 'surah' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  تلاوة السورة المختارة من بدايتها حتى نهايتها ثم التوقف
                </span>
              </button>

              {/* Option 3: Today's Wird */}
              {todayWird ? (
                <button
                  type="button"
                  onClick={() => setSelectedScope('wird')}
                  className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between ${
                    selectedScope === 'wird'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 dark:text-emerald-100'
                      : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm font-serif">الورد اليومي</span>
                    {selectedScope === 'wird' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    الاستماع لورد اليوم كاملاً (ص {todayWird.startPage} - ص {todayWird.endPage})
                  </span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl text-right border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 flex flex-col justify-center">
                  <span className="font-bold text-xs">الورد اليومي</span>
                  <span className="text-[10px] mt-0.5">يتطلب ختمة نشطة</span>
                </div>
              )}

            </div>

            {/* Sub-options when Wird is selected: Follow along vs Audio only */}
            {selectedScope === 'wird' && todayWird && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-top-1">
                <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block mb-2">
                  طريقة الاستماع للورد:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWirdFollowMode('follow')}
                    className={`p-2.5 rounded-xl text-right border transition-all text-xs flex flex-col gap-0.5 ${
                      wirdFollowMode === 'follow'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>📖 متابعة القراءة والمصحف</span>
                      {wirdFollowMode === 'follow' && <span>✓</span>}
                    </div>
                    <span className={`text-[10px] ${wirdFollowMode === 'follow' ? 'text-emerald-100' : 'text-neutral-400'}`}>
                      تقليب الصفحات تلقائياً وتحديد الآيات
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWirdFollowMode('audio_only')}
                    className={`p-2.5 rounded-xl text-right border transition-all text-xs flex flex-col gap-0.5 ${
                      wirdFollowMode === 'audio_only'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>🎧 استماع صوتي فقط</span>
                      {wirdFollowMode === 'audio_only' && <span>✓</span>}
                    </div>
                    <span className={`text-[10px] ${wirdFollowMode === 'audio_only' ? 'text-emerald-100' : 'text-neutral-400'}`}>
                      تشغيل في المشغل فقط بدون فتح المصحف
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Reciter Selection / اختيار القارئ */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
              ٢. اختر القارئ:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {VERIFIED_RECITERS.map(rec => {
                const isSelected = selectedReciterId === rec.id;
                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setSelectedReciterId(rec.id)}
                    className={`p-3 rounded-2xl text-right border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold'
                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    <div>
                      <div className="font-serif text-sm">{rec.arabicName}</div>
                      <div className="text-[11px] text-neutral-400 font-sans">{rec.style}</div>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Surah Selection / اختيار السورة */}
          {selectedScope !== 'wird' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  ٣. اختر السورة للبدء:
                </label>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-serif font-bold">
                  السورة المحددة: {selectedSurahMeta.name}
                </span>
              </div>

              {/* Search Surah */}
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

              {/* Surah List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                {filteredSurahs.map(surah => {
                  const isSelected = selectedSurahNumber === surah.number;
                  return (
                    <button
                      key={surah.number}
                      type="button"
                      onClick={() => setSelectedSurahNumber(surah.number)}
                      className={`p-2.5 rounded-xl text-right border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                          : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                        }`}>
                          {surah.number}
                        </span>
                        <span className="text-xs font-serif">{surah.name}</span>
                      </div>
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-neutral-400'}`}>
                        {surah.numberOfAyahs} آية
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wird Scope Notice */}
          {selectedScope === 'wird' && todayWird && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-bold font-serif text-sm">تفاصيل الاستماع إلى الورد اليومي:</div>
              <div>• سيبدأ المشغل من صفحة <strong>{todayWird.startPage}</strong> وحتى صفحة <strong>{todayWird.endPage}</strong>.</div>
              <div>• إجمالي الصفحات المستمع إليها: <strong>{todayWird.pagesCount} صفحات</strong>.</div>
              <div>• عند اكتمال الورد، سيتوقف الصوت تلقائياً مع خيار توثيق الإنجاز في الختمة.</div>
            </div>
          )}

        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center gap-3">
          <button
            onClick={handleStart}
            className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-900/20 transition-all text-sm active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {selectedScope === 'wird' 
                ? 'بدء الاستماع إلى الورد بالكامل' 
                : selectedScope === 'continuous'
                  ? `تشغيل المصحف صوتي متواصل (من سورة ${selectedSurahMeta.name})`
                  : `تشغيل سورة ${selectedSurahMeta.name} كاملة`}
            </span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
