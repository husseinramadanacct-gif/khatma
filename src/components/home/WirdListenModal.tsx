import React from 'react';
import { X, BookOpen, Headphones, ArrowLeft, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { DailyWird, Reciter } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';

interface WirdListenModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayWird: DailyWird | null;
  reciter: Reciter;
  onSelectOption: (mode: 'follow' | 'audio_only') => void;
  onOpenReciterSelector?: () => void;
}

export const WirdListenModal: React.FC<WirdListenModalProps> = ({
  isOpen,
  onClose,
  todayWird,
  reciter,
  onSelectOption,
  onOpenReciterSelector,
}) => {
  if (!isOpen || !todayWird) return null;

  const startSurahMeta = getSurahMeta(todayWird.startSurah);
  const endSurahMeta = getSurahMeta(todayWird.endSurah);
  const isSameSurah = todayWird.startSurah === todayWird.endSurah;

  const surahRange = isSameSurah
    ? `سورة ${startSurahMeta.name}`
    : `من سورة ${startSurahMeta.name} إلى سورة ${endSurahMeta.name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col relative text-right animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white">
                خيارات الاستماع لورد اليوم
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                اليوم {todayWird.dayNumber} • ص {todayWird.startPage} إلى ص {todayWird.endPage} ({todayWird.pagesCount} صفحات)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope Info Pill */}
        <div className="my-4 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">{surahRange}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono">
              (الصفحات {todayWird.startPage} - {todayWird.endPage})
            </span>
          </div>
          <div className="text-neutral-500 dark:text-neutral-400 text-[11px] font-serif">
            القارئ: <span className="text-emerald-800 dark:text-emerald-300 font-semibold">{reciter?.arabicName || 'مشاري العفاسي'}</span>
          </div>
        </div>

        {/* Choice Cards */}
        <div className="space-y-3 mb-6">
          
          {/* Option 1: Follow in reader with auto-flip */}
          <div
            onClick={() => onSelectOption('follow')}
            className="group cursor-pointer p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-all text-right relative shadow-xs"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                    <span>الاستماع مع متابعة القراءة</span>
                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-semibold px-2 py-0.5 rounded-full">
                      موصى به
                    </span>
                  </h4>
                  <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-2">
                  فتح المصحف بالرسم العثماني، وتحديد الآية الجاري تلاوتها بدقة، مع <strong className="text-emerald-800 dark:text-emerald-300 font-bold">تقليب الصفحات ذاتياً وتلقائياً</strong> دون الحاجة للمس الشاشة.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تقليب صفحات تلقائي
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تحديد الآية المقروءة
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Audio Only */}
          <div
            onClick={() => onSelectOption('audio_only')}
            className="group cursor-pointer p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-right"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    الاستماع الصوتي فقط
                  </h4>
                  <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  تشغيل تلاوة الورد في المشغل الصوتي والبقاء في الشاشة الحالية. مناسب للاستماع في الخلفية، أثناء القيادة أو الانشغال.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-neutral-400">
          يمكنك في أي وقت أثناء الاستماع الضغط على المصحف لمتابعة القراءة أو إيقاف التقليب التلقائي
        </div>

      </div>
    </div>
  );
};
