import React from 'react';
import { SurahMeta } from '../../types';

interface SurahHeaderProps {
  surah: SurahMeta;
}

export const SurahHeader: React.FC<SurahHeaderProps> = ({ surah }) => {
  const showBasmalah = surah.number !== 1 && surah.number !== 9;

  return (
    <div className="w-full my-6 select-none">
      
      {/* Decorative Traditional Surah Frame */}
      <div className="relative border-2 border-emerald-800/30 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 dark:from-emerald-950/40 dark:via-neutral-900 dark:to-emerald-950/40 rounded-2xl p-5 text-center shadow-xs">
        
        {/* Subtle geometric corners */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-700/60" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-700/60" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-700/60" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-700/60" />

        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
          </span>
          
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 dark:text-emerald-100 tracking-wide">
            سورة {surah.name}
          </h2>

          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
            {surah.numberOfAyahs} آيات
          </span>
        </div>

        <div className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 font-mono">
          ترتيبها: {surah.number} • الجزء: {surah.juzNumber} • تبدأ من صفحة: {surah.startPage}
        </div>

      </div>

      {/* The Noble Basmalah */}
      {showBasmalah && (
        <div className="text-center my-6 py-2">
          <p className="font-serif text-2xl sm:text-3xl text-emerald-900 dark:text-emerald-200 tracking-widest selection:bg-transparent">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

    </div>
  );
};
