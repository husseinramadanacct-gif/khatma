import React from 'react';
import { Award, Sparkles, Star, ChevronLeft, Heart, Flame } from 'lucide-react';

interface BonusAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  award?: {
    title: string;
    surplusCount: number;
    pagesRead: number;
    pagesTarget: number;
    rewardMessage: string;
    badgeName: string;
  } | null;
  todayWird?: any;
  khatmah?: any;
  onContinueReading?: () => void;
}

export const BonusAwardModal: React.FC<BonusAwardModalProps> = ({
  isOpen,
  onClose,
  award,
  todayWird,
  khatmah,
  onContinueReading,
}) => {
  if (!isOpen) return null;

  // استخراج تفاصيل الوسام إما من الـ award الممرر أو تلقائياً من الختمة وورد اليوم
  const effectiveAward = award || (khatmah?.bonusAwards && khatmah.bonusAwards[0]) || {
    title: `وسام الهمة العالية (+${todayWird?.surplusPagesCount || 1} ص)`,
    surplusCount: todayWird?.surplusPagesCount || 1,
    pagesRead: todayWird?.readPagesToday || ((todayWird?.pagesCount || 5) + (todayWird?.surplusPagesCount || 1)),
    pagesTarget: todayWird?.pagesCount || 5,
    rewardMessage: `ما شاء الله تبارك الله! زدت في قراءتك بمقدار مبارك عن ورد اليوم المقرّر. نسأل الله أن يتقبل منك ويثبّتك.`,
    badgeName: 'وسام السابقين بالخيرات',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200/80 dark:border-amber-800/80 text-center relative overflow-hidden">
        
        {/* Shimmer background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon Emblem */}
        <div className="relative mx-auto mb-4 w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300">
          <Award className="w-10 h-10 animate-bounce" />
          <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white dark:border-neutral-900">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Badge & Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>وسام: {effectiveAward.badgeName}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-serif mb-2">
          {effectiveAward.title}
        </h3>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-5">
          {effectiveAward.rewardMessage}
        </p>

        {/* Stat highlight */}
        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-neutral-800/80 dark:to-neutral-800/40 rounded-2xl p-4 mb-6 border border-amber-200/60 dark:border-neutral-700 flex items-center justify-around">
          <div className="text-center">
            <span className="block text-2xl font-black text-emerald-800 dark:text-emerald-300 font-serif">
              +{effectiveAward.surplusCount}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              صفحات إضافية
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
          <div className="text-center">
            <span className="block text-2xl font-black text-amber-800 dark:text-amber-300 font-serif">
              {effectiveAward.pagesRead}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              إجمالي قراءتك اليوم
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (onContinueReading) {
              onContinueReading();
            } else {
              onClose();
            }
          }}
          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-2xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
        >
          <span>الحمد لله، متابعة الهمّة</span>
          <ChevronLeft className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
