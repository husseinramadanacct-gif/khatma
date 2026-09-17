import React from 'react';
import { HeartHandshake, Check, Calendar, TrendingUp, RefreshCw, X } from 'lucide-react';
import { Khatmah } from '../../types';
import { checkMissedWird, applyCompensationOption } from '../../utils/wirdCalculator';

interface MissedWirdModalProps {
  khatmah: Khatmah;
  isOpen: boolean;
  onClose: () => void;
  onApplyCompensation: (updatedKhatmah: Khatmah) => void;
}

export const MissedWirdModal: React.FC<MissedWirdModalProps> = ({
  khatmah,
  isOpen,
  onClose,
  onApplyCompensation,
}) => {
  if (!isOpen) return null;

  const missed = checkMissedWird(khatmah);

  const handleSelectOption = (option: 'gradual' | 'extend' | 'skip') => {
    const updates = applyCompensationOption(khatmah, option);
    const updated = { ...khatmah, ...updates };
    onApplyCompensation(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gentle Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-serif">
              لديك ورد سابق لم يكتمل
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              لا بأس أبدًا، يسّر الله لك متابعة كتابك بحب وسكينة
            </span>
          </div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-5 bg-neutral-50 dark:bg-neutral-800/50 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          المقدار الفائت يقارب <strong className="text-amber-700 dark:text-amber-400 font-bold">{missed.missedPagesCount} صفحات</strong>. اختر الطريقة الأنسب لجدولك دون أي مشقة أو ضغط:
        </p>

        {/* Options List */}
        <div className="space-y-3 mb-6">
          
          {/* Option 1: Gradual */}
          <button
            onClick={() => handleSelectOption('gradual')}
            className="w-full text-right p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-neutral-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all flex items-start gap-3 group"
          >
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                التعويض تدريجيًا
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                إضافة صفحة أو صفحتين لوردك اليومي خلال الأيام القادمة حتى تعود لموعدك.
              </div>
            </div>
          </button>

          {/* Option 2: Extend End Date */}
          <button
            onClick={() => handleSelectOption('extend')}
            className="w-full text-right p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-neutral-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all flex items-start gap-3 group"
          >
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                تمديد تاريخ الختم
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                الحفاظ على مقدار وردك اليومي المريح وتأجيل موعد النهاية {missed.missedDays} أيام.
              </div>
            </div>
          </button>

          {/* Option 3: Skip and Reset */}
          <button
            onClick={() => handleSelectOption('skip')}
            className="w-full text-right p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-neutral-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all flex items-start gap-3 group"
          >
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                تجاهل الورد السابق والمتابعة
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                البدء من مكانك الحالي دون تعويض إضافي، وإعادة توزيع الصفحات المتبقية.
              </div>
            </div>
          </button>

        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-sm transition-colors"
        >
          تذكيري لاحقًا
        </button>

      </div>
    </div>
  );
};
