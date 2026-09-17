import React, { useState } from 'react';
import { 
  Play, BookOpen, Copy, Share2, Bookmark as BookmarkIcon, 
  Check, X, Volume2, Sparkles, MessageSquare 
} from 'lucide-react';
import { Ayah } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';
import { stripTajweedCodes } from '../../utils/tajweedParser';

interface AyahActionSheetProps {
  ayah: Ayah | null;
  isOpen: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onPlayAyah: (ayah: Ayah) => void;
  onOpenTafsir: (ayah: Ayah) => void;
  onToggleBookmark: (ayah: Ayah, note?: string) => void;
}

export const AyahActionSheet: React.FC<AyahActionSheetProps> = ({
  ayah,
  isOpen,
  isBookmarked,
  onClose,
  onPlayAyah,
  onOpenTafsir,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  if (!isOpen || !ayah) return null;

  const surahMeta = getSurahMeta(ayah.surahNumber);
  const cleanAyahText = stripTajweedCodes(ayah.text);

  // نسخ الآية مع التخريج
  const handleCopy = () => {
    const textToCopy = `﴿${cleanAyahText}﴾ [سورة ${surahMeta.name} — الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // مشاركة الآية
  const handleShare = async () => {
    const textToShare = `﴿${cleanAyahText}﴾\n[سورة ${surahMeta.name} — الآية ${ayah.numberInSurah}]\nعبر تطبيق «خاتمة»`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${surahMeta.name} — آية ${ayah.numberInSurah}`,
          text: textToShare,
        });
      } catch {
        // تم إلغاء المشاركة
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 transition-all max-h-[90vh] overflow-y-auto">
        
        {/* Header with Surah & Ayah info */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-neutral-900 dark:text-white font-serif">
                سورة {surahMeta.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
                الآية {ayah.numberInSurah}
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              الصفحة {ayah.page} • الجزء {ayah.juz}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verse Preview Snippet */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 mb-5 border border-neutral-100 dark:border-neutral-800 text-center">
          <p className="font-serif text-lg text-emerald-950 dark:text-emerald-100 leading-loose">
            «{cleanAyahText}»
          </p>
        </div>

        {/* Action Grid (استماع، تفسير، نسخ، مشاركة، علامة) */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          
          {/* Play Verse */}
          <button
            onClick={() => {
              onPlayAyah(ayah);
              onClose();
            }}
            className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 font-semibold text-sm transition-colors border border-emerald-200/60 dark:border-emerald-800/60"
          >
            <Play className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
            <span>استماع للآية</span>
          </button>

          {/* Tafsir */}
          <button
            onClick={() => {
              onOpenTafsir(ayah);
              onClose();
            }}
            className="p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-2.5 font-semibold text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>التفسير الميسر</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-2.5 font-semibold text-sm transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الآية'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-2.5 font-semibold text-sm transition-colors"
          >
            <Share2 className="w-4 h-4 text-teal-600" />
            <span>مشاركة الآية</span>
          </button>

        </div>

        {/* Bookmark & Note Section */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (isBookmarked) {
                  onToggleBookmark(ayah);
                } else {
                  setShowNoteInput(!showNoteInput);
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                  : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isBookmarked ? 'إزالة من علاماتي' : 'حفظ في علاماتي'}</span>
            </button>
          </div>

          {/* Optional Note input */}
          {(!isBookmarked && showNoteInput) && (
            <div className="mt-3 space-y-2 animate-in fade-in">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ملاحظة أو خاطرة تدبرية اختيارية..."
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => {
                  onToggleBookmark(ayah, note.trim() || undefined);
                  setShowNoteInput(false);
                  onClose();
                }}
                className="w-full py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors"
              >
                تأكيد حفظ العلامة
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
