import React from 'react';
import { Bookmark as BookmarkIcon, Play, BookOpen, Share2, Copy, Volume2 } from 'lucide-react';
import { Ayah } from '../../types';
import { renderTajweedSpans, stripTajweedCodes } from '../../utils/tajweedParser';

interface AyahItemProps {
  ayah: Ayah;
  isActive: boolean;
  isBookmarked: boolean;
  showTajweed: boolean;
  fontSize: number;
  lineSpacing: number;
  fontFamily: string;
  onClick: (ayah: Ayah) => void;
}

// تحويل الأرقام الإنجليزية إلى أرقام مشرقية عربية (١، ٢، ٣)
export function toArabicNumerals(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicDigits[parseInt(d, 10)] || d).join('');
}

export const AyahItem: React.FC<AyahItemProps> = ({
  ayah,
  isActive,
  isBookmarked,
  showTajweed,
  fontSize,
  lineSpacing,
  fontFamily,
  onClick,
}) => {
  // إزالة البسملة من أول الآية الأولى للسور (عدا الفاتحة والتوبة) لأنها تظهر في الترويسة
  let displayText = ayah.text;
  if (ayah.surahNumber !== 1 && ayah.surahNumber !== 9 && ayah.numberInSurah === 1) {
    const basmalahPrefix = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
    const cleanText = stripTajweedCodes(displayText);
    if (cleanText.startsWith(basmalahPrefix)) {
      if (displayText.startsWith(basmalahPrefix)) {
        displayText = displayText.slice(basmalahPrefix.length).trim();
      } else {
        const match = displayText.match(/^بِسْمِ[\s\S]*?مِ\s*/);
        if (match) {
          displayText = displayText.slice(match[0].length).trim();
        }
      }
    }
  }

  const fontStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: lineSpacing,
    fontFamily: fontFamily === 'amiri-quran' ? "'Amiri Quran', 'Amiri', serif" : "'Amiri', serif",
  };

  return (
    <span
      id={`ayah-${ayah.surahNumber}-${ayah.numberInSurah}`}
      onClick={() => onClick(ayah)}
      style={fontStyle}
      className={`inline cursor-pointer transition-all duration-200 rounded-lg px-1.5 py-0.5 relative group ${
        isActive
          ? 'bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-50 ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-sm shadow-emerald-500/20'
          : 'hover:bg-emerald-50/70 dark:hover:bg-neutral-800/60'
      }`}
    >
      {/* Ayah Text */}
      <span className="text-inherit selection:bg-emerald-200 dark:selection:bg-emerald-900">
        {renderTajweedSpans(displayText, showTajweed)}
      </span>

      {/* Ayah End Number Ornament ﴿١﴾ مع مؤشر التلاوة عند التشغيل */}
      <span className={`inline-flex items-center justify-center select-none font-serif mx-1.5 align-middle text-[0.85em] font-normal transition-transform ${
        isActive ? 'text-emerald-700 dark:text-emerald-300 font-bold scale-105' : 'text-emerald-800 dark:text-emerald-400 opacity-90 group-hover:scale-110'
      }`}>
        {isActive && (
          <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline ml-1 animate-pulse" />
        )}
        <span className="text-emerald-700/60 dark:text-emerald-500/60 text-[0.8em]">﴿</span>
        <span className="font-sans text-[0.75em] font-semibold px-0.5">
          {toArabicNumerals(ayah.numberInSurah)}
        </span>
        <span className="text-emerald-700/60 dark:text-emerald-500/60 text-[0.8em]">﴾</span>
      </span>

      {/* Bookmark Badge Icon */}
      {isBookmarked && (
        <span className="inline-block align-middle ml-1 text-amber-500" title="محفوظة في علاماتي">
          <BookmarkIcon className="w-3.5 h-3.5 fill-amber-400 inline" />
        </span>
      )}
    </span>
  );
};
