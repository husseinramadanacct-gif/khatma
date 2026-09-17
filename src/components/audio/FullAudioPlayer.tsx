import React, { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw, 
  Repeat, Settings2, X, ChevronDown, Sparkles, Headphones, Layers, BookOpen,
  Download, CheckCircle2, WifiOff
} from 'lucide-react';
import { Reciter, AudioPlaybackScope, WirdListeningTarget } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';
import { ReciterSelector } from './ReciterSelector';

interface FullAudioPlayerProps {
  isOpen: boolean;
  isPlaying: boolean;
  surahNumber: number;
  ayahNumber: number;
  totalAyahsInSurah: number;
  reciter: Reciter;
  playbackRate: number;
  repeatCount: number;
  scope?: AudioPlaybackScope;
  wirdTarget?: WirdListeningTarget | null;
  isOfflineAudio?: boolean;
  onTogglePlay: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onSelectReciter: (reciter: Reciter) => void;
  onChangePlaybackRate: (rate: number) => void;
  onChangeRepeatCount: (count: number) => void;
  onChangeScope?: (scope: AudioPlaybackScope) => void;
  onOpenAudioQuranModal?: () => void;
  onOpenDownloadManager?: () => void;
  onNavigateToReader?: () => void;
  onClose: () => void;
}

export const FullAudioPlayer: React.FC<FullAudioPlayerProps> = ({
  isOpen,
  isPlaying,
  surahNumber,
  ayahNumber,
  totalAyahsInSurah,
  reciter,
  playbackRate,
  repeatCount,
  scope = 'continuous',
  wirdTarget,
  isOfflineAudio = false,
  onTogglePlay,
  onNextAyah,
  onPrevAyah,
  onSelectReciter,
  onChangePlaybackRate,
  onChangeRepeatCount,
  onChangeScope,
  onOpenAudioQuranModal,
  onOpenDownloadManager,
  onNavigateToReader,
  onClose,
}) => {
  const [isReciterSelectorOpen, setIsReciterSelectorOpen] = useState(false);

  if (!isOpen) return null;

  const surahMeta = getSurahMeta(surahNumber);
  const safeReciter = reciter || { id: 'alafasy', name: 'Mishary Rashid Alafasy', arabicName: 'مشاري بن راشد العفاسي', style: 'مرتل', bitrate: '128kbps' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col text-center relative">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Volume2 className="w-4 h-4" />
            <span>مشغل التلاوة القرآني</span>
          </div>

          <div className="flex items-center gap-1">
            {onOpenDownloadManager && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDownloadManager();
                }}
                className="p-1.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1 font-semibold border border-neutral-200 dark:border-neutral-700"
                title="إدارة التنزيلات الصوتية دون إنترنت"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>تحميل بدون نت</span>
              </button>
            )}
            {onOpenAudioQuranModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAudioQuranModal();
                }}
                className="p-1.5 rounded-xl text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1 font-semibold"
                title="تخصيص المصحف الصوتي"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>المصحف الصوتي</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Scope Banner & Offline State */}
        <div className="mb-4 space-y-2">
          {scope === 'wird' && wirdTarget ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-center justify-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>استماع للورد اليومي بالكامل (ص {wirdTarget.startPage} - {wirdTarget.endPage})</span>
            </div>
          ) : scope === 'continuous' ? (
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-2 text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-1.5">
              <span>🎧 نمط التشغيل: تلاوة متواصلة لكامل المصحف</span>
            </div>
          ) : (
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-2 text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-1.5">
              <span>🎧 نمط التشغيل: سورة {surahMeta.name} كاملة</span>
            </div>
          )}

          {/* Offline Playback Badge */}
          {isOfflineAudio && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300/80 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>يتم التشغيل من الذاكرة المحلية (دون إنترنت 100%)</span>
            </div>
          )}
        </div>

        {/* Action to switch to Quran reader with follow-along */}
        {onNavigateToReader && (
          <button
            onClick={() => {
              onClose();
              onNavigateToReader();
            }}
            className="mb-4 py-2 px-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>متابعة القراءة في المصحف (تقليب تلقائي للصفحات)</span>
          </button>
        )}

        {/* Central Graphic Ornament */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 text-emerald-200 flex flex-col items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/20 border border-emerald-700/40 relative">
          <Volume2 className={`w-10 h-10 text-emerald-300 ${isPlaying ? 'scale-110 animate-pulse' : ''} transition-transform`} />
        </div>

        {/* Surah & Ayah Titles */}
        <h3 className="text-2xl font-bold font-serif text-neutral-900 dark:text-white mb-1">
          سورة {surahMeta.name}
        </h3>

        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-mono">
          <span>الآية {ayahNumber} من {totalAyahsInSurah || surahMeta.numberOfAyahs}</span>
          <span>•</span>
          <span>صفحة {surahMeta.startPage}</span>
        </div>

        {/* Reciter Picker Trigger */}
        <button
          onClick={() => setIsReciterSelectorOpen(true)}
          className="mx-auto px-4 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-2 mb-5 transition-colors border border-neutral-200 dark:border-neutral-700"
        >
          <span className="text-neutral-500">القارئ:</span>
          <span className="font-bold font-serif">{safeReciter.arabicName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 mr-1" />
        </button>

        {/* Playback Controls (Previous, Play/Pause, Next) */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <button
            onClick={onPrevAyah}
            className="p-3 rounded-2xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="الآية السابقة"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-3xl bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </button>

          <button
            onClick={onNextAyah}
            className="p-3 rounded-2xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="الآية التالية"
          >
            <SkipBack className="w-6 h-6" />
          </button>
        </div>

        {/* Audio Extra Controls: Speed & Repeat */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3 flex items-center justify-around border border-neutral-100 dark:border-neutral-800 text-xs">
          
          {/* Playback Speed */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">السرعة:</span>
            <div className="flex gap-1">
              {[0.75, 1.0, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => onChangePlaybackRate(rate)}
                  className={`px-1.5 py-0.5 rounded font-mono ${
                    playbackRate === rate
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

          {/* Repeat Verse */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">تكرار الآية:</span>
            <div className="flex gap-1">
              {[1, 3, 5].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => onChangeRepeatCount(cnt)}
                  className={`px-1.5 py-0.5 rounded font-mono ${
                    repeatCount === cnt
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  {cnt}×
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Reciter Selector Submodal */}
      <ReciterSelector
        selectedReciterId={safeReciter.id}
        onSelectReciter={onSelectReciter}
        isOpen={isReciterSelectorOpen}
        onClose={() => setIsReciterSelectorOpen(false)}
      />

    </div>
  );
};
