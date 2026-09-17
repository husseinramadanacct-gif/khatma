import React, { useEffect, useState } from 'react';
import { BookOpen, X, Loader2, Bookmark, Share2 } from 'lucide-react';
import { Ayah, TafsirData } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';
import { TafsirProvider } from '../../services/tafsirProvider';
import { stripTajweedCodes } from '../../utils/tajweedParser';

interface TafsirModalProps {
  ayah: Ayah | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  ayah,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);

  useEffect(() => {
    if (!isOpen || !ayah) return;

    let isMounted = true;
    setLoading(true);

    TafsirProvider.getAyahTafsir(ayah.surahNumber, ayah.numberInSurah)
      .then(data => {
        if (isMounted) {
          setTafsirData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('فشل جلب التفسير:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, ayah]);

  if (!isOpen || !ayah) return null;

  const surahMeta = getSurahMeta(ayah.surahNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
                التفسير الميسر
              </h3>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                سورة {surahMeta.name} — الآية {ayah.numberInSurah}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Verse Display */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 text-center">
            <p className="font-serif text-xl text-emerald-950 dark:text-emerald-100 leading-loose">
              «{stripTajweedCodes(ayah.text)}»
            </p>
          </div>

          {/* Tafsir Content */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-neutral-400">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                بيان المعنى والتفسير:
              </span>
              <span>مجمع الملك فهد لطباعة المصحف الشريف</span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">جاري تحميل التفسير المعتمد...</span>
              </div>
            ) : (
              <div className="text-neutral-800 dark:text-neutral-200 text-base leading-relaxed p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 font-sans">
                {tafsirData?.text || 'يتعذر عرض التفسير حالياً، يرجى المحاولة لاحقاً.'}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-300"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
