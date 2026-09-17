import React, { useState } from 'react';
import { Plus, CheckCircle, Trash2, Play, Sparkles, Calendar, BookOpen, Clock, AlertTriangle, X } from 'lucide-react';
import { Khatmah } from '../../types';
import { calculateKhatmahProgress, TOTAL_PAGES } from '../../utils/wirdCalculator';
import { getSurahMeta } from '../../data/surahsMeta';

interface KhatmahListProps {
  khatmat: Khatmah[];
  activeKhatmahId: string | null;
  onSelectActiveKhatmah: (id: string) => void;
  onStartNewKhatmah: () => void;
  onDeleteKhatmah: (id: string) => void;
  onContinueReading: (khatmah: Khatmah) => void;
}

export const KhatmahList: React.FC<KhatmahListProps> = ({
  khatmat,
  activeKhatmahId,
  onSelectActiveKhatmah,
  onStartNewKhatmah,
  onDeleteKhatmah,
  onContinueReading,
}) => {
  const [khatmahToDelete, setKhatmahToDelete] = useState<Khatmah | null>(null);
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif">
            ختماتي القرآنية
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            إدارة ومتابعة ختماتك المتعددة، كل ختمة بوردها وتقدمها المستقل.
          </p>
        </div>

        <button
          onClick={onStartNewKhatmah}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>ابدأ ختمة جديدة</span>
        </button>
      </div>

      {/* Empty State */}
      {khatmat.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-serif">
            لم تبدأ أي ختمة بعد
          </h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            أنشئ ختمتك الأولى وحدد خطة القراءة والورد المناسب لك، لنعينك على الختم بتوفيق الله.
          </p>
          <button
            onClick={onStartNewKhatmah}
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow"
          >
            إنشاء الختمة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {khatmat.map(khatmah => {
            const isActive = khatmah.id === activeKhatmahId;
            const progress = calculateKhatmahProgress(khatmah);
            const currentSurahMeta = getSurahMeta(khatmah.currentSurah || 1);

            return (
              <div
                key={khatmah.id}
                className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-neutral-900 dark:text-white font-serif">
                        {khatmah.title}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          النشطة حالياً
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setKhatmahToDelete(khatmah)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="حذف الختمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress details */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                      <span>إنجاز الختمة</span>
                      <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                        {progress.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Position Metadata */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-3.5 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 mb-4 border border-neutral-100 dark:border-neutral-800">
                    <div className="flex justify-between">
                      <span>الموضع الحالي:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        سورة {currentSurahMeta.name} — آية {khatmah.currentAyah || 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الصفحة والجزء:</span>
                      <span>صفحة {khatmah.currentPage || 1} (الجزء {khatmah.currentJuz || 1})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>موعد الختم المتوقع:</span>
                      <span>{khatmah.expectedEndDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => onContinueReading(khatmah)}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>متابعة القراءة</span>
                  </button>

                  {!isActive && (
                    <button
                      onClick={() => onSelectActiveKhatmah(khatmah.id)}
                      className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors"
                    >
                      تعيين كنشطة
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* In-app Deletion Confirmation Modal */}
      {khatmahToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white font-serif mb-1">
                تأكيد حذف الختمة
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                هل أنت متأكد من رغبتك في حذف ختمة «<span className="font-semibold text-neutral-900 dark:text-white">{khatmahToDelete.title}</span>»؟
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-950/30 p-2 rounded-xl">
                تنبيه: سيتم مسح سجل التقدم والورد المرتبط بهذه الختمة نهائياً.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  onDeleteKhatmah(khatmahToDelete.id);
                  setKhatmahToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setKhatmahToDelete(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
