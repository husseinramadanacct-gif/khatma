import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, Sparkles, PlusCircle, Compass } from 'lucide-react';
import { Khatmah, ReadingPosition } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';
import { getPageStart, getPageForAyahNumber } from '../../data/quranPagesMeta';
import { calculateKhatmahProgress } from '../../utils/wirdCalculator';

interface ResumeCardProps {
  activeKhatmah: Khatmah | null;
  lastPosition: ReadingPosition | null;
  onResumeReading: (surah?: number, ayah?: number, page?: number) => void;
  onStartNewKhatmah: () => void;
  onFreeReading: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  activeKhatmah,
  lastPosition,
  onResumeReading,
  onStartNewKhatmah,
  onFreeReading,
}) => {
  // تحديد موضع القراءة الحالي بدقة (سورة + آية + صفحة)
  // إذا أتم القارئ قراءة صفحة معينة (مثلاً أتم حتى الصفحة 19 المسجلة في readPagesCount)
  // فإن الموضع التالي الذي يستأنف منه هو بداية الصفحة التالية (20)
  const lastReadPage = Math.max(
    activeKhatmah?.readPagesCount || 0,
    activeKhatmah?.currentPage || 0,
    lastPosition?.pageNumber || 0,
    1
  );

  // إذا أتم القارئ قراءة الصفحة بالكامل، ينتقل إلى الصفحة التالية
  const isPageCompleted = (activeKhatmah?.readPagesCount || 0) >= (activeKhatmah?.currentPage || lastPosition?.pageNumber || 1);
  const targetPageNum = isPageCompleted && lastReadPage < 604 && (activeKhatmah?.readPagesCount || 0) > 0
    ? (activeKhatmah?.readPagesCount || 1) + 1
    : lastReadPage;

  // استخراج البداية الدقيقة للصفحة (السورة والآية الصحيحة 100%)
  const pageStartRef = getPageStart(targetPageNum);
  const surahNum = pageStartRef.surah;
  
  // الآية المستهدفة: إذا كان هناك موضع محفوظ بدقة لنفس الصفحة نستخدمه، وإلا نستخدم أول آية في الصفحة
  let ayahNum = pageStartRef.ayah;
  if (lastPosition && lastPosition.pageNumber === targetPageNum && lastPosition.ayahNumber) {
    ayahNum = lastPosition.ayahNumber;
  }

  const surahMeta = getSurahMeta(surahNum);
  const pageNum = targetPageNum;

  const progress = activeKhatmah ? calculateKhatmahProgress(activeKhatmah) : null;

  // الوقت الفعلي المباشر المتوافق تماماً مع إعدادات وتوقيت هاتف وجهاز المستخدم
  const [deviceTime, setDeviceTime] = useState<string>(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date());
    } catch {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  });

  useEffect(() => {
    const updateClock = () => {
      try {
        setDeviceTime(
          new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date())
        );
      } catch {
        setDeviceTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      }
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // تنسيق وقت آخر قراءة بشكل وصفي نسبي
  const formatLastReadRelative = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const readDate = new Date(isoString);
      if (isNaN(readDate.getTime())) return null;
      const now = new Date();
      const diffMs = now.getTime() - readDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} د`;
      if (diffHours < 24) return `منذ ${diffHours} س`;
      if (diffDays === 1) return 'أمس';
      if (diffDays < 7) return `منذ ${diffDays} أيام`;
      return readDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  const lastReadText = formatLastReadRelative(activeKhatmah?.lastReadAt || lastPosition?.updatedAt);

  return (
    <div className="w-full bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-emerald-950/20 relative overflow-hidden transition-all">
      
      {/* Subtle Islamic Motif Geometric Background (SVG Pure Math) */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-5 pointer-events-none -translate-x-12 -translate-y-12">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" fill="none" />
          <polygon points="50,5 95,50 50,95 5,50" stroke="white" strokeWidth="1.5" fill="none" />
          <polygon points="20,20 80,20 80,80 20,80" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        
        {/* Header Greeting & Context */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-medium tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate max-w-[170px] sm:max-w-none">
              {activeKhatmah ? activeKhatmah.title : 'مرحباً بك في رحاب القرآن'}
            </span>
          </div>
          <div 
            className="flex items-center gap-1.5 text-xs text-emerald-100 bg-emerald-950/70 border border-emerald-700/60 px-2.5 py-1 rounded-full font-mono shadow-xs backdrop-blur-xs"
            title={lastReadText ? `الوقت الفعلي: ${deviceTime} • آخر قراءة: ${lastReadText}` : `الوقت الفعلي: ${deviceTime}`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">{deviceTime}</span>
            {lastReadText && (
              <span className="hidden sm:inline text-[10px] text-emerald-300/80 font-sans border-r border-emerald-700/60 pr-1.5 mr-0.5">
                آخر قراءة {lastReadText}
              </span>
            )}
          </div>
        </div>

        {/* Core Question & Resume Target */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif mb-2 text-emerald-50">
            {activeKhatmah ? 'هل تريد الاستمرار من حيث توقفت؟' : 'ابدأ رحلتك المباركة مع القرآن'}
          </h2>

          <div className="flex flex-wrap items-baseline gap-2 text-emerald-100 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-white">
              سورة {surahMeta.name}
            </span>
            <span className="text-base text-emerald-300 font-medium">
              — الآية {ayahNum}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700/50">
              الصفحة {pageNum}
            </span>
          </div>

          {/* Progress Bar if Khatmah Exists */}
          {progress && (
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-emerald-200 mb-1.5">
                <span>إنجاز الختمة</span>
                <span className="font-bold font-mono text-emerald-300">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-emerald-950/80 rounded-full h-2 overflow-hidden border border-emerald-800/40">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons (Strictly matching prompt specs) */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          
          <button
            onClick={() => onResumeReading(surahNum, ayahNum, pageNum)}
            className="flex-1 min-w-[140px] bg-white hover:bg-emerald-50 text-emerald-950 font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <span>أكمل القراءة</span>
            <ArrowLeft className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onStartNewKhatmah}
            className="bg-emerald-800/70 hover:bg-emerald-700/80 text-emerald-100 font-medium py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 border border-emerald-700/60 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>ابدأ ختمة جديدة</span>
          </button>

          <button
            onClick={onFreeReading}
            className="bg-transparent hover:bg-emerald-800/40 text-emerald-200 font-medium py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors text-xs sm:text-sm"
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>قراءة مستقلة</span>
          </button>

        </div>

      </div>
    </div>
  );
};
