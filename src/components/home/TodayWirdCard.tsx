import React, { useState } from 'react';
import { 
  BookOpen, Volume2, CheckCircle2, Calendar, ArrowLeft, Headphones, 
  Play, Sparkles, Award, Clock, ArrowRight, Check 
} from 'lucide-react';
import { DailyWird, Khatmah, Reciter } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';
import { VERIFIED_RECITERS } from '../../services/reciterProvider';
import { WirdListenModal } from './WirdListenModal';

interface TodayWirdCardProps {
  khatmah: Khatmah;
  todayWird: DailyWird;
  reciter?: Reciter;
  onReadWird: (targetPage?: number) => void;
  onListenWird: (mode?: 'follow' | 'audio_only', startPage?: number) => void;
  onToggleComplete: () => void;
  onOpenBonusModal?: () => void;
  onOpenMissedModal?: () => void;
}

export const TodayWirdCard: React.FC<TodayWirdCardProps> = ({
  khatmah,
  todayWird,
  reciter,
  onReadWird,
  onListenWird,
  onToggleComplete,
  onOpenBonusModal,
  onOpenMissedModal,
}) => {
  const [isListenModalOpen, setIsListenModalOpen] = useState(false);
  const startSurah = getSurahMeta(todayWird.startSurah);
  const endSurah = getSurahMeta(todayWird.endSurah);

  const surahRangeText = startSurah.number === endSurah.number
    ? `سورة ${startSurah.name}`
    : `من سورة ${startSurah.name} إلى سورة ${endSurah.name}`;

  // حساب دقيق لتقدم اليوم
  const currentProgressPage = todayWird.currentProgressPage || khatmah.currentPage || todayWird.startPage;
  const isStarted = currentProgressPage > todayWird.startPage;
  const isPartiallyDone = isStarted && !todayWird.isCompleted;
  const isSurplus = todayWird.isSurplus || (currentProgressPage > todayWird.endPage);
  const surplusCount = todayWird.surplusPagesCount || (isSurplus ? (currentProgressPage - todayWird.endPage) : 0);

  // حساب النسبة
  const progressPercent = todayWird.isCompleted ? 100 : (todayWird.progressPercent || 0);

  const handleSelectListenMode = (mode: 'follow' | 'audio_only') => {
    setIsListenModalOpen(false);
    // البدء من الصفحة التي وصل إليها القارئ حالياً إذا كان بدأ بالفعل
    const startListenPage = isPartiallyDone ? currentProgressPage : todayWird.startPage;
    onListenWird(mode, startListenPage);
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-800/80">
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              اليوم {todayWird.dayNumber} من {khatmah.totalDays}
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-serif">
              ورد اليوم
            </h3>
          </div>
        </div>

        {/* Completion status button */}
        <button
          onClick={onToggleComplete}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            todayWird.isCompleted
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs'
              : isPartiallyDone
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
          title="تحديد حالة إكمال ورد اليوم ومستوى التقدم"
        >
          <CheckCircle2 className={`w-4 h-4 ${
            todayWird.isCompleted 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : isPartiallyDone 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-neutral-400'
          }`} />
          <span>
            {todayWird.isCompleted 
              ? 'تم إنجاز الورد' 
              : isPartiallyDone 
              ? `قيد القراءة (${progressPercent}%)` 
              : 'غير مكتمل بعد'}
          </span>
        </button>
      </div>

      {/* Wird Details Box */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 mb-4 border border-neutral-100 dark:border-neutral-800">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-300 font-serif">
              {todayWird.pagesCount}
            </span>
            <span className="text-base font-medium text-neutral-600 dark:text-neutral-400">
              صفحات مخطط لها
            </span>
            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mr-1 bg-white dark:bg-neutral-900 px-2.5 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700">
              ص {todayWird.startPage} — ص {todayWird.endPage}
            </span>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-serif hidden sm:inline">
            {surahRangeText}
          </span>
        </div>

        {/* مؤشر مدى التقدم في الورد اليومي (قراءة على أكثر من مرة خلال اليوم) */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 mt-2">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>موضعك الحالي في ورد اليوم:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md">
                ص {currentProgressPage}
              </span>
            </div>

            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 font-mono">
              {todayWird.isCompleted 
                ? 'مكتمل 100%' 
                : `${todayWird.readPagesToday || 0} من ${todayWird.pagesCount} صفحات (${progressPercent}%)`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-200 dark:bg-neutral-700/70 rounded-full h-2 overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                todayWird.isCompleted 
                  ? 'bg-emerald-600 dark:bg-emerald-400' 
                  : isSurplus
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-emerald-600 dark:bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(isPartiallyDone ? 10 : 0, progressPercent))}%` }}
            />
          </div>

          {/* حالة التقدم التفصيلية */}
          <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            {todayWird.isCompleted ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> أتممت ورد اليوم بنجاح، هنيئاً لك!
              </span>
            ) : isPartiallyDone ? (
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                قرأت حتى ص {currentProgressPage} • متبقٍ {todayWird.remainingPagesToday || 0} صفحات لإتمام الورد
              </span>
            ) : (
              <span>لم تبدأ بعد في ورد اليوم، افتح المصحف من ص {todayWird.startPage}</span>
            )}

            {/* مكافأة وزيادة القراءة */}
            {isSurplus && (
              <button
                onClick={onOpenBonusModal}
                className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/70 px-2 py-0.5 rounded-full font-bold hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors animate-pulse"
                title="عرض وسام مكافأة الزيادة في القراءة"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>مكافأة الزيادة (+{surplusCount} ص)</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* زر قراءة الورد مع الاستمرار الذكي من حيث وصل */}
        <button
          onClick={() => onReadWird(isPartiallyDone ? currentProgressPage : todayWird.startPage)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 text-sm group"
        >
          <BookOpen className="w-4 h-4" />
          <span>
            {isPartiallyDone 
              ? `متابعة القراءة من ص ${currentProgressPage}` 
              : 'قراءة الورد'}
          </span>
          <ArrowLeft className="w-4 h-4 mr-auto group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* زر الاستماع مع دعم الاستمرار من الصفحة الحالية */}
        <button
          onClick={() => setIsListenModalOpen(true)}
          className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 text-sm"
        >
          <Headphones className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>
            {isPartiallyDone
              ? `الاستماع بدءاً من ص ${currentProgressPage}`
              : 'الاستماع إلى الورد بالكامل'}
          </span>
        </button>
      </div>

      {/* Modal for choosing Listen Mode: Follow along vs Audio only */}
      <WirdListenModal
        isOpen={isListenModalOpen}
        onClose={() => setIsListenModalOpen(false)}
        todayWird={todayWird}
        reciter={reciter || VERIFIED_RECITERS[0]}
        onSelectOption={handleSelectListenMode}
      />

    </div>
  );
};

