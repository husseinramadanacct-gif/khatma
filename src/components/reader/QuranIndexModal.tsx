import React, { useState } from 'react';
import { Search, X, BookOpen, Layers, FileText } from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMeta';
import { normalizeForSearch } from '../../utils/arabicNormalizer';

interface QuranIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah: (surahNumber: number) => void;
  onSelectPage: (pageNumber: number) => void;
}

export const QuranIndexModal: React.FC<QuranIndexModalProps> = ({
  isOpen,
  onClose,
  onSelectSurah,
  onSelectPage,
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'pages'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // تصفية السور بالبحث السريع المعياري
  const filteredSurahs = SURAHS_METADATA.filter(s => {
    if (!searchQuery.trim()) return true;
    const query = normalizeForSearch(searchQuery);
    const nameNorm = normalizeForSearch(s.name);
    return nameNorm.includes(query) || s.number.toString() === query.trim();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white font-serif">
              فهرس القرآن الكريم
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (السور / الأجزاء / الصفحات) */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 px-4">
          {[
            { id: 'surahs', label: 'السور (١١٤)', icon: BookOpen },
            { id: 'juz', label: 'الأجزاء (٣٠)', icon: Layers },
            { id: 'pages', label: 'الصفحات (٦٠٤)', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          
          {/* TAB 1: SURAHS */}
          {activeTab === 'surahs' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم السورة أو رقمها..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredSurahs.map(surah => (
                  <div
                    key={surah.number}
                    onClick={() => {
                      onSelectSurah(surah.number);
                      onClose();
                    }}
                    className="py-3 px-2 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono">
                        {surah.number}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-neutral-900 dark:text-white font-serif">
                          سورة {surah.name}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية
                        </div>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                        ص {surah.startPage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: JUZ */}
          {activeTab === 'juz' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(juzNum => {
                const startPage = (juzNum - 1) * 20 + 2 > 604 ? 604 : (juzNum === 1 ? 1 : (juzNum - 1) * 20 + 2);
                return (
                  <button
                    key={juzNum}
                    onClick={() => {
                      onSelectPage(startPage);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-right transition-colors"
                  >
                    <div className="font-bold text-sm text-neutral-900 dark:text-white font-serif">
                      الجزء {juzNum}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                      يبدأ من ص {startPage}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: PAGES QUICK JUMP */}
          {activeTab === 'pages' && (
            <div>
              <p className="text-xs text-neutral-500 mb-3">
                اختر رقم الصفحة من مصحف المدينة المنورة (١ - ٦٠٤):
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {Array.from({ length: 604 }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      onSelectPage(pageNum);
                      onClose();
                    }}
                    className="py-2 rounded-xl text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
