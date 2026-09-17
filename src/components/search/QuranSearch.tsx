import React, { useState } from 'react';
import { Search, Loader2, BookOpen, ArrowLeft, X } from 'lucide-react';
import { SearchResult } from '../../types';
import { QuranProvider } from '../../services/quranProvider';
import { normalizeForSearch } from '../../utils/arabicNormalizer';

interface QuranSearchProps {
  onNavigateToAyah: (surahNumber: number, ayahNumber: number, pageNumber: number) => void;
}

export const QuranSearch: React.FC<QuranSearchProps> = ({ onNavigateToAyah }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const list = await QuranProvider.searchQuran(trimmed);
      setResults(list);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // إبراز الكلمة المبحوث عنها داخل النص
  const renderHighlightedSnippet = (text: string, searchWord: string) => {
    if (!searchWord.trim()) return text;
    
    const normSearch = normalizeForSearch(searchWord);
    // تقسيم النص إلى كلمات
    const words = text.split(/\s+/);

    return (
      <span>
        {words.map((w, idx) => {
          const normWord = normalizeForSearch(w);
          const isMatch = normWord.includes(normSearch);
          return (
            <span
              key={idx}
              className={isMatch ? 'bg-amber-200 dark:bg-amber-900/80 text-neutral-950 dark:text-amber-100 font-bold px-1 rounded' : ''}
            >
              {w}{' '}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif mb-1">
          البحث في القرآن الكريم
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          ابحث في جميع آيات الذكر الحكيم، بدون حساسية للتشكيل أو التاء والهاء والألف.
        </p>
      </div>

      {/* Search Bar Input */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتب كلمة أو عبارة قرآنية (مثال: الصابرين، الرحمة، نور)..."
          className="w-full pr-12 pl-24 py-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />

        <div className="absolute top-4 right-4 text-neutral-400">
          <Search className="w-5 h-5" />
        </div>

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
            className="absolute top-4 left-20 p-1 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="absolute top-2.5 left-2.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بحث'}
        </button>
      </form>

      {/* Quick Search Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-400">كلمات مقترحة:</span>
        {['إن مع العسر يسرا', 'الذين آمنوا وتطمئن قلوبهم', 'الحمد لله', 'الجنة', 'الصبر'].map(word => (
          <button
            key={word}
            onClick={() => {
              setQuery(word);
              QuranProvider.searchQuran(word).then(res => {
                setResults(res);
                setHasSearched(true);
              });
            }}
            className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Results Header & Counter */}
      {hasSearched && !loading && (
        <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <span>نتائج البحث: <strong className="text-emerald-700 dark:text-emerald-400">{results.length}</strong> آية مطابقة</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-xs">جاري البحث في آيات المصحف الشريف...</span>
        </div>
      )}

      {/* Results List */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((item, idx) => (
            <div
              key={`${item.surahNumber}-${item.ayahNumber}-${idx}`}
              onClick={() => onNavigateToAyah(item.surahNumber, item.ayahNumber, item.page)}
              className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Surah & Ayah metadata */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-neutral-900 dark:text-white font-serif group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    سورة {item.surahName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                    الآية {item.ayahNumber}
                  </span>
                </div>

                <span className="text-xs font-mono text-neutral-400">
                  صفحة {item.page}
                </span>
              </div>

              {/* Highlighted Verse Text */}
              <p className="font-serif text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {renderHighlightedSnippet(item.text, query)}
              </p>

              <div className="mt-3 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <span>انتقل إلى الآية في المصحف</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {hasSearched && !loading && results.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200 font-serif">
            لم يُعثر على نتائج مطابقة
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            تأكد من كتابة الكلمة بشكل صحيح، أو جرّب البحث بجزء من الكلمة بدون زيادات.
          </p>
        </div>
      )}

    </div>
  );
};
