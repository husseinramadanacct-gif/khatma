import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2, Sparkles, ChevronLeft } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showAndroidGuideModal, setShowAndroidGuideModal] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // التحقق من أندرويد
    const ua = navigator.userAgent.toLowerCase();
    const androidDevice = ua.includes('android');
    setIsAndroid(androidDevice);

    // التحقق مما إذا كان التطبيق مفتوحاً بالفعل كتطبيق أندرويد مستقل (Standalone PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // التحقق من التفضيل المحفوظ للإخفاء المؤقت
    const dismissedAt = localStorage.getItem('khatmah_pwa_dismissed_at');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 3) {
        setIsDismissed(true);
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // إذا لم يكن حدث المتصفح متاحاً مباشرة، نعرض دليل التثبيت السريع لأندرويد
      setShowAndroidGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('khatmah_pwa_dismissed_at', Date.now().toString());
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Banner for Android / PWA */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-emerald-950 to-teal-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/60 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 font-serif">
              <span>تطبيق خاتمة على أندرويد</span>
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 mt-0.5">
              تثبيت خفيف وسريع يعمل دون اتصال بالإنترنت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-emerald-400 hover:text-white p-1 rounded-lg transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Modal for Manual Android Installation */}
      {showAndroidGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
                  تثبيت تطبيق خاتمة على أندرويد
                </h3>
              </div>
              <button
                onClick={() => setShowAndroidGuideModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-4 leading-relaxed">
              يمكنك تشغيل التطبيق كتطبيق أصلي مستقل على هاتفك الأندرويد والاستمتاع بتجربة ملء الشاشة الكاملة والحفظ بدون اتصال باتباع هذه الخطوات:
            </p>

            <div className="space-y-3 mb-6 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white">في متصفح Chrome أو Samsung Internet:</span>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                    اضغط على قائمة الخيارات الثلاث نقاط <span className="font-bold">⋮</span> في أعلى أو أسفل الشاشة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white">اختر خيار التثبيت:</span>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                    اضغط على <span className="font-bold text-emerald-700 dark:text-emerald-400">"تثبيت التطبيق" (Install App)</span> أو <span className="font-bold text-emerald-700 dark:text-emerald-400">"إضافة إلى الشاشة الرئيسية"</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white">تأكيد التثبيت:</span>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                    سيظهر تطبيق "خاتمة" فوراً على شاشة هاتفك مع أيقونة المصحف الشريف ويعمل تلقائياً بدون إنترنت.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuideModal(false)}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-2xl transition-colors text-sm"
            >
              فهمت ذلك، تم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
