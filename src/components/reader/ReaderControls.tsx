import React from 'react';
import { Type, Sun, Moon, Palette, Sliders, X, Check } from 'lucide-react';
import { UserPreferences } from '../../types';
import { TAJWEED_LEGENDS } from '../../utils/tajweedParser';

interface ReaderControlsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  preferences,
  onUpdatePreferences,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
              خيارات عرض المصحف
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm">
          
          {/* 1. Theme Selection (نهاري / ليلي / ورقي دافئ) */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2.5">
              مظهر القراءة
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'نهاري', icon: Sun, bgClass: 'bg-white border-neutral-200 text-neutral-900' },
                { id: 'dark', label: 'ليلي', icon: Moon, bgClass: 'bg-neutral-900 border-neutral-800 text-white' },
                { id: 'sepia', label: 'ورقي دافئ', icon: Palette, bgClass: 'bg-[#f4ecd8] border-[#e2d5b6] text-amber-950' },
              ].map(th => {
                const isSelected = preferences.theme === th.id;
                const Icon = th.icon;
                return (
                  <button
                    key={th.id}
                    onClick={() => onUpdatePreferences({ theme: th.id as any })}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${th.bgClass} ${
                      isSelected ? 'ring-2 ring-emerald-600 font-bold shadow-xs' : 'opacity-80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{th.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font Size Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">
              <span>حجم الخط القرآني</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">{preferences.fontSize} بكسل</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">صغير</span>
              <input
                type="range"
                min="18"
                max="44"
                step="2"
                value={preferences.fontSize}
                onChange={(e) => onUpdatePreferences({ fontSize: parseInt(e.target.value, 10) })}
                className="flex-1 accent-emerald-600"
              />
              <span className="text-base text-neutral-400 font-bold">كبير</span>
            </div>
          </div>

          {/* 3. Line Spacing */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">
              <span>تباعد الأسطر</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">{preferences.lineSpacing}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 1.8, label: 'متقارب' },
                { value: 2.2, label: 'قياسي' },
                { value: 2.7, label: 'متباعد' },
              ].map(ls => (
                <button
                  key={ls.value}
                  onClick={() => onUpdatePreferences({ lineSpacing: ls.value })}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                    preferences.lineSpacing === ls.value
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {ls.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Font Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">
              الخط القرآني
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'amiri-quran', label: 'خط المصحف (الأميري قرآني)' },
                { id: 'amiri', label: 'خط النسخ (أميري قياسي)' },
              ].map(fn => (
                <button
                  key={fn.id}
                  onClick={() => onUpdatePreferences({ fontFamily: fn.id as any })}
                  className={`p-2.5 rounded-xl text-xs border transition-colors ${
                    preferences.fontFamily === fn.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {fn.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Tajweed Colors Toggle & Guide */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-xs text-neutral-900 dark:text-white">
                  ألوان أحكام التجويد
                </div>
                <div className="text-[11px] text-neutral-500">
                  تمييز أحكام الغنة والإدغام والإخفاء والمدود
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.showTajweedColors}
                  onChange={(e) => onUpdatePreferences({ showTajweedColors: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Accessibility Tajweed Color Guide */}
            {preferences.showTajweedColors && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2 text-[11px]">
                <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  دليل ألوان التجويد (مع الوصف النصي للوصول الشامل):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {TAJWEED_LEGENDS.map(leg => (
                    <div key={leg.type} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${leg.colorClass.split(' ')[0].replace('text-', 'bg-')}`} />
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">{leg.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
