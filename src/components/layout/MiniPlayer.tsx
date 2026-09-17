import React from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, ChevronUp, Headphones, BookOpen } from 'lucide-react';
import { Reciter, AudioPlaybackScope, WirdListeningTarget } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';

interface MiniPlayerProps {
  isPlaying: boolean;
  surahNumber: number;
  ayahNumber: number;
  reciter: Reciter;
  scope?: AudioPlaybackScope;
  wirdTarget?: WirdListeningTarget | null;
  isOfflineAudio?: boolean;
  onTogglePlay: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onOpenFullPlayer: () => void;
  onNavigateToReader?: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  isPlaying,
  surahNumber,
  ayahNumber,
  reciter,
  scope,
  wirdTarget,
  isOfflineAudio = false,
  onTogglePlay,
  onNextAyah,
  onPrevAyah,
  onOpenFullPlayer,
  onNavigateToReader,
  onClose,
}) => {
  const surahMeta = getSurahMeta(surahNumber);
  const safeReciter = reciter || { id: 'alafasy', name: 'Mishary Rashid Alafasy', arabicName: 'مشاري بن راشد العفاسي', style: 'مرتل', bitrate: '128kbps' };

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-4 right-4 max-w-xl mx-auto z-40 bg-neutral-900/95 text-white backdrop-blur-md rounded-2xl shadow-xl border border-neutral-700/60 p-2.5 sm:px-4 flex items-center justify-between transition-all animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Surah & Ayah Info with Click to Expand */}
      <div 
        onClick={onOpenFullPlayer}
        className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-700/60 flex items-center justify-center shrink-0 text-emerald-200">
          <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-emerald-300' : ''}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm truncate font-serif">
              سورة {surahMeta.name}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-400 font-mono">
              آية {ayahNumber}
            </span>
            {isOfflineAudio && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-semibold">
                💾 محلي دون نت
              </span>
            )}
            {scope === 'wird' && wirdTarget && (
              <span className="hidden xs:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/50">
                <Headphones className="w-2.5 h-2.5" />
                <span>الورد: ص {wirdTarget.startPage}-{wirdTarget.endPage}</span>
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-400 truncate">
            {safeReciter.arabicName}
          </span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-1 sm:gap-2 mr-2">
        <button
          onClick={onPrevAyah}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="الآية السابقة"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow transition-transform active:scale-95"
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={onNextAyah}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="الآية التالية"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {onNavigateToReader && (
          <button
            onClick={onNavigateToReader}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-800/50 transition-colors"
            title="متابعة القراءة في المصحف"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenFullPlayer}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1"
          title="توسيع المشغل"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
