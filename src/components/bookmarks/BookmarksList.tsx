import React from 'react';
import { Bookmark, Trash2, ArrowLeft, BookOpen, Clock, FileText } from 'lucide-react';
import { Bookmark as BookmarkType } from '../../types';
import { getSurahMeta } from '../../data/surahsMeta';

interface BookmarksListProps {
  bookmarks: BookmarkType[];
  onSelectBookmark: (bookmark: BookmarkType) => void;
  onRemoveBookmark: (id: string) => void;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif mb-1">
          علاماتي المرجعية
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          الآيات والوقفات التدبرية التي قمت بحفظها للرجوع إليها سريعاً.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
            لا توجد علامات محفوظة حتى الآن
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            أثناء قراءة أي آية في المصحف، يمكنك الضغط عليها واختيار «حفظ في علاماتي» لتوثيقها هنا مع خاطرة تدبرية.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(bookmark => {
            const surahMeta = getSurahMeta(bookmark.surahNumber);
            return (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div 
                  onClick={() => onSelectBookmark(bookmark)}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-base text-neutral-900 dark:text-white font-serif group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      سورة {surahMeta.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                      الآية {bookmark.ayahNumber}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      • صفحة {bookmark.pageNumber}
                    </span>
                  </div>

                  {bookmark.note && (
                    <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 mb-2 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{bookmark.note}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <span>فتح الآية في المصحف</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onRemoveBookmark(bookmark.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="حذف العلامة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
