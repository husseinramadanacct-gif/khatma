import React, { useState } from 'react';
import { BookOpen, Target, HeartHandshake, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onStartKhatmahNow: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onStartKhatmahNow,
}) => {
  const [slide, setSlide] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center flex flex-col justify-between min-h-[440px]">
        
        {/* Slide Indicators */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                slide === s ? 'w-8 bg-emerald-600' : 'w-2 bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>

        {/* SLIDE 1 */}
        {slide === 1 && (
          <div className="space-y-4 my-auto animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/20">
              <BookOpen className="w-10 h-10 text-emerald-100" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
              مرحبًا بك في «خاتمة»
            </h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold font-serif">
              رفيقك في ختم القرآن
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
              تطبيق صُمم بعناية ليعينك على دوام الصلة بكتاب الله بتلاوة عذبة، وتفسير ميسر، ومتابعة هادئة لا تشتت روحانيتك.
            </p>
          </div>
        )}

        {/* SLIDE 2 */}
        {slide === 2 && (
          <div className="space-y-4 my-auto animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Target className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
              اختر هدفك القرآني
            </h2>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-2 max-w-xs mx-auto text-right bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span><strong>ختمة شخصية:</strong> حدد مدة أو عدد صفحات يومي.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span><strong>ورد مرن:</strong> نظام تعويض لطيف بدون أي لوم.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span><strong>قراءة حرة:</strong> تصفح واستماع في أي وقت.</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3 */}
        {slide === 3 && (
          <div className="space-y-4 my-auto animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
              خصوصيتك محفوظة تمامًا
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
              بدون إعلانات، وبدون جمع بيانات شخصية، وبدون تتبع. بياناتك وختماتك محفوظة بأمان على جهازك فقط.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <button
            onClick={onComplete}
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-medium"
          >
            تخطي
          </button>

          {slide < 3 ? (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onComplete();
                  onStartKhatmahNow();
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow"
              >
                ابدأ ختمة الآن
              </button>
              <button
                onClick={onComplete}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-colors"
              >
                تصفح المصحف
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
