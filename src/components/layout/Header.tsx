import React, { useState, useEffect } from 'react';
import { BookOpen, Moon, Sun, Sparkles, Bell, Volume2, Headphones, Clock, Download } from 'lucide-react';
import { ActiveTab, Khatmah, UserPreferences } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeKhatmah: Khatmah | null;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  isPlayingAudio: boolean;
  onOpenPlayer: () => void;
  onOpenAudioQuran: () => void;
  onOpenDownloadManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  activeKhatmah,
  preferences,
  onUpdatePreferences,
  isPlayingAudio,
  onOpenPlayer,
  onOpenAudioQuran,
  onOpenDownloadManager,
}) => {
  // الوقت الفعلي المباشر المتوافق تلقائياً مع إعدادات هاتف وجهاز المستخدم (12h/24h والموقع الزمني)
  const [currentTime, setCurrentTime] = useState<string>(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date());
    } catch {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  });

  useEffect(() => {
    const updateTime = () => {
      try {
        setCurrentTime(
          new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date())
        );
      } catch {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    onUpdatePreferences({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-sm shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-emerald-950 dark:text-emerald-50 font-serif">
              خاتمة
            </span>
            <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80 -mt-1 font-medium">
              رفيقك في ختم القرآن
            </span>
          </div>
        </div>

        {/* Active Khatmah Pill & Live Device Time */}
        {activeKhatmah ? (
          <div 
            onClick={() => onSelectTab('khatmat')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-medium text-emerald-900 dark:text-emerald-200 cursor-pointer hover:bg-emerald-100/70 transition-colors shadow-xs"
            title={`الوقت الفعلي: ${currentTime} • الختمة: ${activeKhatmah.title} (${activeKhatmah.readPagesCount || 0} صفحة)`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {activeKhatmah.title} ({activeKhatmah.readPagesCount || 0} صفحة)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">•</span>
            <span 
              className="flex items-center gap-1 font-mono font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full text-xs"
              title="الوقت الفعلي حسب إعدادات التليفون أو الجهاز"
            >
              <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" />
              {currentTime}
            </span>
          </div>
        ) : (
          <div 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-medium text-emerald-900 dark:text-emerald-200 shadow-xs"
            title="الوقت الفعلي حسب إعدادات التليفون أو الجهاز"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400 font-sans">الوقت الفعلي:</span>
            <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-200">{currentTime}</span>
          </div>
        )}

        {/* Top Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Real-Time Clock Badge */}
          <div 
            className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/70 text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-200"
            title="الوقت الفعلي حسب إعدادات التليفون أو الجهاز"
          >
            <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{currentTime}</span>
          </div>
          {/* Audio Quran Quick Launcher */}
          <button
            onClick={onOpenAudioQuran}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800/80 transition-colors"
            title="المصحف الصوتي المرتل"
          >
            <Headphones className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">المصحف الصوتي</span>
          </button>

          {/* Download Audio Quran Offline Button */}
          {onOpenDownloadManager && (
            <button
              onClick={onOpenDownloadManager}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 transition-colors"
              title="تحميل التلاوات للاستماع دون إنترنت"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">تحميل دون نت</span>
            </button>
          )}

          {isPlayingAudio && (
            <button
              onClick={onOpenPlayer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 text-xs font-medium animate-pulse"
              title="مشغل التلاوة النشط"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">جاري الاستماع</span>
            </button>
          )}

          {/* Theme Quick Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={preferences.theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
            aria-label="تبديل الوضع النهاري والليلي"
          >
            {preferences.theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            )}
          </button>

          {/* Quick Search Shortcut */}
          <button
            onClick={() => onSelectTab('search')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'search'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="البحث في القرآن الكريم"
          >
            <span className="text-xs font-medium sm:hidden">بحث</span>
            <span className="hidden sm:inline text-xs font-medium px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              بحث في القرآن
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
