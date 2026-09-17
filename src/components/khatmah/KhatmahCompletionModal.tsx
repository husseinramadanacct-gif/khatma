import React from 'react';
import { Sparkles, Calendar, BookCheck, Check, Plus, X } from 'lucide-react';
import { Khatmah } from '../../types';

interface KhatmahCompletionModalProps {
  khatmah: Khatmah;
  isOpen: boolean;
  onClose: () => void;
  onStartNewKhatmah: () => void;
}

export const KhatmahCompletionModal: React.FC<KhatmahCompletionModalProps> = ({
  khatmah,
  isOpen,
  onClose,
  onStartNewKhatmah,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // حساب الأيام المستغرقة
  const start = new Date(khatmah.startDate);
  const end = new Date(todayStr);
  const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-7 text-center shadow-2xl border border-neutral-200 dark:border-neutral-800 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Calm Peaceful Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mx-auto mb-5 shadow-sm">
          <BookCheck className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif mb-2">
          أتممت ختمتك بحمد الله
        </h3>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 font-serif">
          «اللهم اجعل القرآن العظيم ربيع قلوبنا، ونور صدورنا، وجلاء أحزاننا، وذهاب همومنا وغمومنا».
        </p>

        {/* Peaceful Statistics Summary */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-4 mb-6 border border-neutral-100 dark:border-neutral-800 text-xs space-y-2.5 text-right">
          
          <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">اسم الختمة:</span>
            <span className="font-bold text-neutral-900 dark:text-white font-serif">{khatmah.title}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">تاريخ البداية:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{khatmah.startDate}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">تاريخ الإتمام:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{todayStr}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">المدة المستغرقة:</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">{diffDays} يوماً</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-neutral-500">جلسات القراءة:</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              {Math.max(1, khatmah.totalReadingSessions || diffDays)} جلسة
            </span>
          </div>

        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              onStartNewKhatmah();
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>ابدأ ختمة جديدة</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
