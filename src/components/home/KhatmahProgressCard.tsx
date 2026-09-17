import React from 'react';
import { Target, CheckCircle, Clock, CalendarDays, BookMarked, Sparkles } from 'lucide-react';
import { Khatmah } from '../../types';
import { calculateKhatmahProgress, TOTAL_PAGES } from '../../utils/wirdCalculator';

interface KhatmahProgressCardProps {
  khatmah: Khatmah;
  onOpenKhatmatManager: () => void;
}

export const KhatmahProgressCard: React.FC<KhatmahProgressCardProps> = ({
  khatmah,
  onOpenKhatmatManager,
}) => {
  const { percentage, readPages, remainingPages, remainingDays } = calculateKhatmahProgress(khatmah);

  // تنسيق التاريخ المتوقع
  const formatExpectedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white font-serif">
            تقدم الختمة: {khatmah.title}
          </h3>
        </div>
        <button
          onClick={onOpenKhatmatManager}
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          إدارة الختمات
        </button>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-3xl font-extrabold text-neutral-900 dark:text-white font-serif">
            {percentage}%
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {readPages} من أصل {TOTAL_PAGES} صفحة
          </span>
        </div>
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Current Juz */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
            <span>الجزء الحالي</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-serif">
            الجزء {khatmah.currentJuz || 1}
          </span>
        </div>

        {/* Read Pages */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>الصفحات المقروءة</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-serif">
            {readPages} صفحة
          </span>
        </div>

        {/* Remaining Pages */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>المتبقي للختم</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-serif">
            {remainingPages} صفحة
          </span>
        </div>

        {/* Remaining Days */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>الأيام المتبقية</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-serif">
            {remainingDays} يوماً
          </span>
        </div>

      </div>

      {/* Expected Completion Date */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          <span>الموعد المتوقع للختم:</span>
        </div>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          {formatExpectedDate(khatmah.expectedEndDate)}
        </span>
      </div>

    </div>
  );
};
