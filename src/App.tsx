import React, { useState, useEffect, useRef } from 'react';
import { 
  ActiveTab, Khatmah, ReadingPosition, UserPreferences, Bookmark, Ayah, Reciter,
  AudioPlaybackScope, WirdListeningTarget
} from './types';
import { StorageService } from './services/storageService';
import { ReciterProvider } from './services/reciterProvider';
import { QuranProvider } from './services/quranProvider';
import { getSurahMeta, getSurahByPage, SURAHS_METADATA } from './data/surahsMeta';
import { calculateTodayWird, checkMissedWird, TOTAL_PAGES } from './utils/wirdCalculator';
import { getPageStart } from './data/quranPagesMeta';
import { NotificationService } from './services/notificationService';
import { Headphones, Play, CheckCircle2, Volume2, Sparkles, BookOpen, Download, AlertCircle } from 'lucide-react';
import { OfflineAudioService } from './services/offlineAudioService';

// Layout Components
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { MiniPlayer } from './components/layout/MiniPlayer';
import { FullAudioPlayer } from './components/audio/FullAudioPlayer';
import { AudioQuranModal } from './components/audio/AudioQuranModal';
import { AudioDownloadManagerModal } from './components/audio/AudioDownloadManagerModal';

// Views & Modules
import { ResumeCard } from './components/home/ResumeCard';
import { TodayWirdCard } from './components/home/TodayWirdCard';
import { KhatmahProgressCard } from './components/home/KhatmahProgressCard';
import { MissedWirdModal } from './components/home/MissedWirdModal';
import { BonusAwardModal } from './components/home/BonusAwardModal';
import { KhatmahWizard } from './components/khatmah/KhatmahWizard';
import { KhatmahList } from './components/khatmah/KhatmahList';
import { KhatmahCompletionModal } from './components/khatmah/KhatmahCompletionModal';
import { QuranReader } from './components/reader/QuranReader';
import { QuranSearch } from './components/search/QuranSearch';
import { BookmarksList } from './components/bookmarks/BookmarksList';
import { SettingsView } from './components/settings/SettingsView';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Application Data States
  const [khatmat, setKhatmat] = useState<Khatmah[]>([]);
  const [activeKhatmahId, setActiveKhatmahId] = useState<string | null>(null);
  const [lastPosition, setLastPosition] = useState<ReadingPosition | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getPreferences());

  // Reader Navigation State
  const [readerSurah, setReaderSurah] = useState<number>(1);
  const [readerAyah, setReaderAyah] = useState<number>(1);
  const [readerPage, setReaderPage] = useState<number>(1);

  // Audio Engine State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSurah, setAudioSurah] = useState<number>(1);
  const [audioAyah, setAudioAyah] = useState<number>(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentRepeatIteration, setCurrentRepeatIteration] = useState<number>(1);
  const [reciter, setReciter] = useState<Reciter>(ReciterProvider.getReciterById(preferences.defaultReciterId));
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);

  // Audio Mode & Range Tracking
  const [audioScope, setAudioScope] = useState<AudioPlaybackScope>('continuous');
  const [wirdListeningTarget, setWirdListeningTarget] = useState<WirdListeningTarget | null>(null);
  const [showAudioQuranModal, setShowAudioQuranModal] = useState<boolean>(false);
  const [showAudioDownloadModal, setShowAudioDownloadModal] = useState<boolean>(false);
  const [isCurrentAudioOffline, setIsCurrentAudioOffline] = useState<boolean>(false);
  const [audioOfflineAlert, setAudioOfflineAlert] = useState<string | null>(null);
  const [wirdCompletedPrompt, setWirdCompletedPrompt] = useState<WirdListeningTarget | null>(null);

  const currentBlobUrlRef = useRef<string | null>(null);

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isMissedWirdOpen, setIsMissedWirdOpen] = useState<boolean>(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState<boolean>(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [completedKhatmah, setCompletedKhatmah] = useState<Khatmah | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Initial Load from Local Storage
  useEffect(() => {
    const loadedKhatmat = StorageService.getKhatmat();
    const loadedActiveId = StorageService.getActiveKhatmahId();
    const loadedLastPos = StorageService.getLastReadingPosition();
    const loadedBookmarks = StorageService.getBookmarks();
    const loadedPrefs = StorageService.getPreferences();
    const onboardingDone = StorageService.isOnboardingCompleted();

    setKhatmat(loadedKhatmat);
    setActiveKhatmahId(loadedActiveId);
    setLastPosition(loadedLastPos);
    setBookmarks(loadedBookmarks);
    setPreferences(loadedPrefs);
    setShowOnboarding(!onboardingDone);

    if (loadedLastPos) {
      setReaderSurah(loadedLastPos.surahNumber);
      setReaderAyah(loadedLastPos.ayahNumber);
      setReaderPage(loadedLastPos.pageNumber);
      setAudioSurah(loadedLastPos.surahNumber);
      setAudioAyah(loadedLastPos.ayahNumber);
    }

    // تطبيق سمة العرض الأولى على عنصر root
    applyThemeClass(loadedPrefs.theme);

    // تذكير القارئ في اليوم التالي إذا قصر في ورد الأمس بلطف وهدوء
    const active = loadedKhatmat.find(k => k.id === loadedActiveId) || loadedKhatmat[0];
    if (active && active.status === 'active') {
      const missedCheck = checkMissedWird(active);
      if (missedCheck.hasMissed) {
        // تأخير ظهور التذكير قليلاً حتى يستقر التطبيق
        setTimeout(() => {
          setIsMissedWirdOpen(true);
        }, 800);
      }
    }
  }, []);

  // دالة تطبيق السمة (Dark, Light, Sepia) على html/body
  const applyThemeClass = (theme: 'light' | 'dark' | 'sepia') => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');
    document.body.classList.remove('dark', 'sepia');
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
      document.body.classList.add('sepia');
    }
  };

  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = StorageService.savePreferences(newPrefs);
    setPreferences(updated);
    if (newPrefs.theme) {
      applyThemeClass(newPrefs.theme);
    }
    if (newPrefs.defaultReciterId) {
      setReciter(ReciterProvider.getReciterById(newPrefs.defaultReciterId));
    }
  };

  // Active Khatmah Derived
  const activeKhatmah = khatmat.find(k => k.id === activeKhatmahId) || khatmat[0] || null;

  // اليومية والورد
  const todayWird = activeKhatmah ? calculateTodayWird(activeKhatmah) : null;

  // 2. Audio Player Logic with Stable State Reference
  const audioStateRef = useRef({
    audioSurah,
    audioAyah,
    reciter,
    repeatCount,
    currentRepeatIteration,
    audioScope,
    wirdListeningTarget,
    playbackRate,
  });

  useEffect(() => {
    audioStateRef.current = {
      audioSurah,
      audioAyah,
      reciter,
      repeatCount,
      currentRepeatIteration,
      audioScope,
      wirdListeningTarget,
      playbackRate,
    };
  });

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      const state = audioStateRef.current;

      // فحص التكرار
      if (state.currentRepeatIteration < state.repeatCount) {
        setCurrentRepeatIteration(c => c + 1);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.warn(e));
        }
        return;
      }

      // الانتقال للآية التالية
      setCurrentRepeatIteration(1);

      // 1. فحص انتهاء الورد اليومي
      if (state.audioScope === 'wird' && state.wirdListeningTarget) {
        const isWirdEnded = 
          (state.audioSurah === state.wirdListeningTarget.endSurah && state.audioAyah >= state.wirdListeningTarget.endAyah) ||
          (state.audioSurah > state.wirdListeningTarget.endSurah);
        
        if (isWirdEnded) {
          setIsPlayingAudio(false);
          setWirdCompletedPrompt(state.wirdListeningTarget);
          return;
        }
      }

      // 2. فحص نمط الآية الواحدة
      if (state.audioScope === 'single') {
        setIsPlayingAudio(false);
        return;
      }

      // 3. الانتقال للآية التالية
      const surahMeta = getSurahMeta(state.audioSurah);
      if (state.audioAyah < surahMeta.numberOfAyahs) {
        const nextAyah = state.audioAyah + 1;
        setAudioAyah(nextAyah);
        playAudioForAyah(state.audioSurah, nextAyah, state.reciter.id);
      } else if (state.audioScope === 'surah') {
        // انتهت السورة في نمط السورة
        setIsPlayingAudio(false);
      } else if (state.audioSurah < 114) {
        // تلاوة متواصلة لكامل المصحف أو انتقال في الورد
        const nextSurah = state.audioSurah + 1;
        setAudioSurah(nextSurah);
        setAudioAyah(1);
        playAudioForAyah(nextSurah, 1, state.reciter.id);
      } else {
        setIsPlayingAudio(false);
      }
    };

    const handleError = async () => {
      const state = audioStateRef.current;
      console.warn('تعذر تحميل الملف الصوتي من الشبكة، جاري الفحص في الذاكرة المحلية...');
      try {
        const localBlob = await OfflineAudioService.getAyahAudioBlob(state.reciter.id, state.audioSurah, state.audioAyah);
        if (localBlob && audioRef.current) {
          const localUrl = URL.createObjectURL(localBlob);
          if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(currentBlobUrlRef.current);
          }
          currentBlobUrlRef.current = localUrl;
          audioRef.current.src = localUrl;
          audioRef.current.play().then(() => {
            setIsPlayingAudio(true);
            setIsCurrentAudioOffline(true);
          }).catch(() => {
            setIsPlayingAudio(false);
          });
          return;
        }
      } catch {
        // متابعة
      }

      if (state.reciter.id === 'alafasy' && audioRef.current) {
        const globalNumber = (state.audioSurah * 10) + state.audioAyah;
        audioRef.current.src = ReciterProvider.getAyahGlobalAudioUrl(globalNumber);
        audioRef.current.play().catch(e => {
          console.warn('تعذر تشغيل الصوت البديل:', e);
          setIsPlayingAudio(false);
        });
      } else {
        setIsPlayingAudio(false);
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setAudioOfflineAlert('أنت في وضع عدم الاتصال وهذه الآية غير مُحمّلة محلياً. يمكنك تنزيل التلاوة من مدير التنزيلات.');
          setTimeout(() => setAudioOfflineAlert(null), 5000);
        }
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, []);

  const playAudioForAyah = async (surah: number, ayah: number, reciterId?: string) => {
    if (!audioRef.current) return;
    const targetReciterId = reciterId || audioStateRef.current.reciter?.id || 'alafasy';

    try {
      // فحص وجود الملف الصوتي محلياً دون اتصال
      const audioSource = await OfflineAudioService.getAyahAudioUrl(targetReciterId, surah, ayah);

      if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }

      if (audioSource.isLocal) {
        currentBlobUrlRef.current = audioSource.url;
        setIsCurrentAudioOffline(true);
      } else {
        setIsCurrentAudioOffline(false);
      }

      audioRef.current.src = audioSource.url;
      audioRef.current.playbackRate = playbackRate;
      await audioRef.current.play();
      setIsPlayingAudio(true);
      setIsMiniPlayerVisible(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('فشل تشغيل الصوت:', err);
        setIsPlayingAudio(false);
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setAudioOfflineAlert('أنت في وضع عدم الاتصال وهذه الآية غير مُحمّلة محلياً. يمكنك تنزيل التلاوة للاستماع دون إنترنت.');
          setTimeout(() => setAudioOfflineAlert(null), 5000);
        }
      }
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        playAudioForAyah(audioSurah, audioAyah, reciter.id);
      } else {
        audioRef.current.play()
          .then(() => setIsPlayingAudio(true))
          .catch(() => playAudioForAyah(audioSurah, audioAyah, reciter.id));
      }
    }
  };

  // تشغيل الورد اليومي بالكامل صوتياً
  const handleListenTodayWird = (mode: 'follow' | 'audio_only' = 'follow', startPageOverride?: number, reciterIdOverride?: string) => {
    if (!todayWird) return;
    const endAyahCount = todayWird.endAyah || getSurahMeta(todayWird.endSurah).numberOfAyahs;
    const effectiveStartPage = startPageOverride || todayWird.startPage;
    const effectiveStartSurah = startPageOverride ? getSurahByPage(startPageOverride).number : todayWird.startSurah;
    const target: WirdListeningTarget = {
      khatmahId: todayWird.khatmahId,
      dayNumber: todayWird.dayNumber,
      startSurah: effectiveStartSurah,
      startAyah: 1,
      endSurah: todayWird.endSurah,
      endAyah: endAyahCount,
      startPage: effectiveStartPage,
      endPage: todayWird.endPage,
      pagesCount: todayWird.pagesCount,
    };
    const targetReciterId = reciterIdOverride || reciter?.id || 'alafasy';
    setWirdListeningTarget(target);
    setAudioScope('wird');
    setAudioSurah(target.startSurah);
    setAudioAyah(target.startAyah);
    playAudioForAyah(target.startSurah, target.startAyah, targetReciterId);
    setIsMiniPlayerVisible(true);

    // إذا اختار المستخدم الاستماع مع متابعة القراءة، ينقله مباشرة للمصحف في الموضع المطلوب
    if (mode === 'follow') {
      setReaderSurah(target.startSurah);
      setReaderAyah(target.startAyah);
      setReaderPage(effectiveStartPage);
      setActiveTab('reader');
    }
  };

  // تشغيل المصحف الصوتي المرتل المخصص
  const handleStartAudioQuran = (config: {
    surahNumber: number;
    ayahNumber: number;
    reciterId: string;
    scope: AudioPlaybackScope;
    followInReader?: boolean;
  }) => {
    const chosenReciter = ReciterProvider.getReciterById(config.reciterId);
    setReciter(chosenReciter);
    handleUpdatePreferences({ defaultReciterId: config.reciterId });
    setAudioScope(config.scope);

    if (config.scope === 'wird') {
      handleListenTodayWird(config.followInReader ? 'follow' : 'audio_only', undefined, config.reciterId);
      return;
    }

    setWirdListeningTarget(null);
    setAudioSurah(config.surahNumber);
    setAudioAyah(config.ayahNumber);
    playAudioForAyah(config.surahNumber, config.ayahNumber, config.reciterId);
    setIsMiniPlayerVisible(true);

    if (config.followInReader) {
      setReaderSurah(config.surahNumber);
      setReaderAyah(config.ayahNumber);
      const startPage = getSurahMeta(config.surahNumber).startPage;
      setReaderPage(startPage);
      setActiveTab('reader');
    }
  };

  const handleNextAyah = () => {
    const surahMeta = getSurahMeta(audioSurah);
    if (audioAyah < surahMeta.numberOfAyahs) {
      const nextAyah = audioAyah + 1;
      setAudioAyah(nextAyah);
      playAudioForAyah(audioSurah, nextAyah, reciter.id);
    } else if (audioSurah < 114) {
      const nextSurah = audioSurah + 1;
      setAudioSurah(nextSurah);
      setAudioAyah(1);
      playAudioForAyah(nextSurah, 1, reciter.id);
    }
  };

  const handlePrevAyah = () => {
    if (audioAyah > 1) {
      const prev = audioAyah - 1;
      setAudioAyah(prev);
      playAudioForAyah(audioSurah, prev, reciter.id);
    } else if (audioSurah > 1) {
      const prevSurah = audioSurah - 1;
      const prevMeta = getSurahMeta(prevSurah);
      setAudioSurah(prevSurah);
      setAudioAyah(prevMeta.numberOfAyahs);
      playAudioForAyah(prevSurah, prevMeta.numberOfAyahs, reciter.id);
    }
  };

  // الانتقال المباشر للمصحف لمتابعة التلاوة الحالية وتقليب الصفحات
  const handleFollowRecitationInReader = () => {
    setReaderSurah(audioSurah);
    setReaderAyah(audioAyah);
    const syncPage = QuranProvider.getPageForAyahSync(audioSurah, audioAyah);
    if (syncPage) {
      setReaderPage(syncPage);
    } else {
      QuranProvider.getPageForAyah(audioSurah, audioAyah).then(p => {
        if (p) setReaderPage(p);
      });
    }
    setActiveTab('reader');
  };

  // 3. Khatmah & Progress Updates
  const handleUpdateKhatmahProgress = (surah: number, ayah: number, page: number, juz: number) => {
    // 1. حفظ الموضع الشامل
    const pos = StorageService.saveLastReadingPosition(surah, ayah, page, juz);
    setLastPosition(pos);

    // 2. تحديث الختمة النشطة
    if (activeKhatmah) {
      const readPages = Math.max(activeKhatmah.readPagesCount, page);
      const isCompleted = surah === 114 && ayah >= 6;
      const todayStr = new Date().toISOString().split('T')[0];

      // حساب ومتابعة تقدم اليوم
      const currentDayProg = activeKhatmah.wirdDayProgress;
      let updatedDayProg = currentDayProg;

      if (todayWird) {
        const startP = (currentDayProg && currentDayProg.date === todayStr) 
          ? currentDayProg.startPage 
          : todayWird.startPage;
        const endP = (currentDayProg && currentDayProg.date === todayStr) 
          ? currentDayProg.endPage 
          : todayWird.endPage;

        const isWirdDone = page >= endP;
        const surplus = page > endP ? (page - endP) : 0;
        const completedToday = Math.max(0, page - startP);

        updatedDayProg = {
          date: todayStr,
          dayNumber: todayWird.dayNumber,
          startPage: startP,
          endPage: endP,
          lastReadPage: page,
          completedPagesCount: completedToday,
          isCompleted: isWirdDone,
          surplusPagesCount: surplus,
        };

        // إذا تجاوز الورد بمقدار صفحة أو أكثر ولم يُمنح وسام اليوم بعد
        if (surplus >= 1) {
          const awards = activeKhatmah.bonusAwards || [];
          const alreadyAwardedToday = awards.some(a => a.date === todayStr);
          if (!alreadyAwardedToday) {
            const newAward = {
              id: 'award-' + Date.now(),
              date: todayStr,
              title: `وسام الهمة العالية (+${surplus} ص)`,
              pagesRead: completedToday,
              pagesTarget: todayWird.pagesCount,
              surplusCount: surplus,
              rewardMessage: `ما شاء الله! قرأت ${surplus} صفحات زيادة عن ورد اليوم المقرّر. بارك الله في وقتك وجهدك وزادك من فضله.`,
              badgeName: 'وسام السابقين بالخيرات',
            };
            activeKhatmah.bonusAwards = [newAward, ...awards];
            setIsBonusModalOpen(true);
          }
        }
      }

      const updatedKhatmah: Khatmah = {
        ...activeKhatmah,
        currentSurah: surah,
        currentAyah: ayah,
        currentPage: page,
        currentJuz: juz,
        readPagesCount: readPages,
        lastReadAt: new Date().toISOString(),
        totalReadingSessions: (activeKhatmah.totalReadingSessions || 0) + 1,
        status: isCompleted ? 'completed' : 'active',
        wirdDayProgress: updatedDayProg,
        bonusAwards: activeKhatmah.bonusAwards,
      };

      StorageService.saveKhatmah(updatedKhatmah);
      setKhatmat(StorageService.getKhatmat());

      // إذا اكتملت الختمة
      if (isCompleted) {
        setCompletedKhatmah(updatedKhatmah);
        setIsCompletionModalOpen(true);
        NotificationService.notifyKhatmahCompleted(updatedKhatmah.title);
      }
    }
  };

  // إنشاء ختمة جديدة
  const handleCreateKhatmah = (newKhatmah: Khatmah) => {
    StorageService.saveKhatmah(newKhatmah);
    StorageService.setActiveKhatmahId(newKhatmah.id);
    setKhatmat(StorageService.getKhatmat());
    setActiveKhatmahId(newKhatmah.id);
    setActiveTab('home');

    if (newKhatmah.reminderEnabled) {
      NotificationService.requestPermission();
    }
  };

  const handleDeleteKhatmah = (id: string) => {
    StorageService.deleteKhatmah(id);
    const updated = StorageService.getKhatmat();
    setKhatmat(updated);
    if (activeKhatmahId === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      StorageService.setActiveKhatmahId(nextId || '');
      setActiveKhatmahId(nextId);
    }
  };

  // 4. Bookmarks Handlers
  const handleAddBookmark = (ayah: Ayah, note?: string) => {
    const updated = StorageService.addBookmark(ayah.surahNumber, ayah.numberInSurah, ayah.page, note);
    setBookmarks(updated);
  };

  const handleRemoveBookmark = (id: string) => {
    const updated = StorageService.removeBookmark(id);
    setBookmarks(updated);
  };

  // الانتقال المباشر للآية في المصحف
  const navigateToAyah = (surahNumber: number, ayahNumber: number, pageNumber: number) => {
    setReaderSurah(surahNumber);
    setReaderAyah(ayahNumber);
    setReaderPage(pageNumber);
    setActiveTab('reader');
  };

  // إكمال الورد اليومي
  const handleToggleTodayWird = () => {
    if (!activeKhatmah || !todayWird) return;
    const isNowCompleted = !todayWird.isCompleted;
    todayWird.isCompleted = isNowCompleted;

    if (isNowCompleted) {
      // نقل الموضع إلى نهاية الورد
      handleUpdateKhatmahProgress(todayWird.endSurah, 1, todayWird.endPage, Math.ceil(todayWird.endPage / 20));
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased transition-colors duration-200">
      
      {/* 1. Universal Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeKhatmah={activeKhatmah}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        isPlayingAudio={isPlayingAudio}
        onOpenPlayer={() => setIsFullPlayerOpen(true)}
        onOpenAudioQuran={() => setShowAudioQuranModal(true)}
        onOpenDownloadManager={() => setShowAudioDownloadModal(true)}
      />

      {/* Offline Audio Alert Toast */}
      {audioOfflineAlert && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto p-3.5 sm:p-4 rounded-2xl bg-amber-900/95 text-white text-xs font-semibold shadow-xl border border-amber-700 backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-300" />
            <span className="leading-relaxed">{audioOfflineAlert}</span>
          </div>
          <button
            onClick={() => {
              setAudioOfflineAlert(null);
              setShowAudioDownloadModal(true);
            }}
            className="px-3 py-1.5 bg-white text-amber-950 hover:bg-amber-100 rounded-xl text-xs font-bold shrink-0 transition-colors"
          >
            تحميل الآن
          </button>
        </div>
      )}

      {/* 2. Primary Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-24 sm:pb-28">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="px-4 py-6 space-y-6">
            
            {/* Resume / Continue Card */}
            <ResumeCard
              activeKhatmah={activeKhatmah}
              lastPosition={lastPosition}
              onResumeReading={(s, a, p) => {
                if (s && a && p) {
                  navigateToAyah(s, a, p);
                } else {
                  // إذا أتم القارئ حتى صفحة معينة (مثلاً صفحة 19)
                  const lastDonePage = activeKhatmah?.readPagesCount || 0;
                  const targetPage = lastDonePage > 0 && lastDonePage < TOTAL_PAGES
                    ? lastDonePage + 1
                    : (activeKhatmah?.currentPage || lastPosition?.pageNumber || 1);
                  const pageRef = getPageStart(targetPage);
                  navigateToAyah(pageRef.surah, pageRef.ayah, targetPage);
                }
              }}
              onStartNewKhatmah={() => setIsWizardOpen(true)}
              onFreeReading={() => {
                navigateToAyah(1, 1, 1);
              }}
            />

            {/* Today's Wird Card (if active khatmah exists) */}
            {activeKhatmah && todayWird && (
              <TodayWirdCard
                khatmah={activeKhatmah}
                todayWird={todayWird}
                reciter={reciter}
                onReadWird={(targetPage) => {
                  const p = targetPage || todayWird.currentProgressPage || todayWird.startPage;
                  const pageRef = getPageStart(p);
                  navigateToAyah(pageRef.surah, pageRef.ayah, p);
                }}
                onListenWird={handleListenTodayWird}
                onToggleComplete={handleToggleTodayWird}
                onOpenBonusModal={() => setIsBonusModalOpen(true)}
                onOpenMissedModal={() => setIsMissedWirdOpen(true)}
              />
            )}

            {/* Audio Quran Quick Hub Card */}
            <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
                    المصحف الصوتي المرتل
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    استمع للقرآن الكريم كاملاً، بالسورة، أو بالورد اليومي بصوت {reciter.arabicName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAudioQuranModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>تشغيل المصحف صوتي</span>
                </button>
                <button
                  onClick={() => setShowAudioDownloadModal(true)}
                  className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-emerald-800 dark:text-emerald-300 font-semibold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 text-xs border border-emerald-300/80 dark:border-emerald-800/80 shadow-xs transition-all"
                  title="تحميل التلاوات للاستماع دون إنترنت"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>تحميل دون نت</span>
                </button>
              </div>
            </div>

            {/* Khatmah Progress Card */}
            {activeKhatmah && (
              <KhatmahProgressCard
                khatmah={activeKhatmah}
                onOpenKhatmatManager={() => setActiveTab('khatmat')}
              />
            )}

            {/* Quick Access to Bookmarks & Settings shortcut */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setActiveTab('search')}
                className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500 text-right transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-white font-serif">البحث في القرآن</div>
                  <div className="text-xs text-neutral-400 mt-0.5">البحث المباشر عن أي كلمة أو آية</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500 text-right transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-white font-serif">علاماتي المحفوظة</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{bookmarks.length} آية محفوظة</div>
                </div>
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: READER */}
        {activeTab === 'reader' && (
          <QuranReader
            initialSurah={readerSurah}
            initialAyah={readerAyah}
            initialPage={readerPage}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            activeAudioAyah={isPlayingAudio ? { surah: audioSurah, ayah: audioAyah } : null}
            onPlayAyah={(ayah) => {
              setAudioSurah(ayah.surahNumber);
              setAudioAyah(ayah.numberInSurah);
              playAudioForAyah(ayah.surahNumber, ayah.numberInSurah, reciter.id);
            }}
            activeKhatmah={activeKhatmah}
            onUpdateKhatmahProgress={handleUpdateKhatmahProgress}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}

        {/* TAB 3: KHATMAT MANAGER */}
        {activeTab === 'khatmat' && (
          <KhatmahList
            khatmat={khatmat}
            activeKhatmahId={activeKhatmahId}
            onSelectActiveKhatmah={(id) => {
              StorageService.setActiveKhatmahId(id);
              setActiveKhatmahId(id);
            }}
            onStartNewKhatmah={() => setIsWizardOpen(true)}
            onDeleteKhatmah={handleDeleteKhatmah}
            onContinueReading={(kh) => {
              StorageService.setActiveKhatmahId(kh.id);
              setActiveKhatmahId(kh.id);
              navigateToAyah(kh.currentSurah || 1, kh.currentAyah || 1, kh.currentPage || 1);
            }}
          />
        )}

        {/* TAB 4: SEARCH */}
        {activeTab === 'search' && (
          <QuranSearch
            onNavigateToAyah={navigateToAyah}
          />
        )}

        {/* TAB 5: BOOKMARKS & SETTINGS */}
        {activeTab === 'bookmarks' && (
          <BookmarksList
            bookmarks={bookmarks}
            onSelectBookmark={(b) => {
              navigateToAyah(b.surahNumber, b.ayahNumber, b.pageNumber);
            }}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onClearCache={() => StorageService.clearQuranCache()}
            onOpenAudioDownloadManager={() => setShowAudioDownloadModal(true)}
          />
        )}

      </main>

      {/* 3. Floating Mini Audio Player (shows when playing) */}
      {isMiniPlayerVisible && (
        <MiniPlayer
          isPlaying={isPlayingAudio}
          surahNumber={audioSurah}
          ayahNumber={audioAyah}
          reciter={reciter}
          scope={audioScope}
          wirdTarget={wirdListeningTarget}
          isOfflineAudio={isCurrentAudioOffline}
          onTogglePlay={toggleAudioPlay}
          onNextAyah={handleNextAyah}
          onPrevAyah={handlePrevAyah}
          onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
          onNavigateToReader={handleFollowRecitationInReader}
          onClose={() => {
            if (audioRef.current) audioRef.current.pause();
            setIsPlayingAudio(false);
            setIsMiniPlayerVisible(false);
          }}
        />
      )}

      {/* 4. Full Audio Player Modal */}
      <FullAudioPlayer
        isOpen={isFullPlayerOpen}
        isPlaying={isPlayingAudio}
        surahNumber={audioSurah}
        ayahNumber={audioAyah}
        totalAyahsInSurah={getSurahMeta(audioSurah).numberOfAyahs}
        reciter={reciter}
        playbackRate={playbackRate}
        repeatCount={repeatCount}
        scope={audioScope}
        wirdTarget={wirdListeningTarget}
        isOfflineAudio={isCurrentAudioOffline}
        onTogglePlay={toggleAudioPlay}
        onNextAyah={handleNextAyah}
        onPrevAyah={handlePrevAyah}
        onNavigateToReader={handleFollowRecitationInReader}
        onSelectReciter={(r) => {
          setReciter(r);
          handleUpdatePreferences({ defaultReciterId: r.id });
          if (isPlayingAudio) {
            playAudioForAyah(audioSurah, audioAyah, r.id);
          }
        }}
        onChangePlaybackRate={(rate) => {
          setPlaybackRate(rate);
          if (audioRef.current) audioRef.current.playbackRate = rate;
        }}
        onChangeRepeatCount={setRepeatCount}
        onChangeScope={setAudioScope}
        onOpenAudioQuranModal={() => setShowAudioQuranModal(true)}
        onOpenDownloadManager={() => setShowAudioDownloadModal(true)}
        onClose={() => setIsFullPlayerOpen(false)}
      />

      {/* 5. Custom Audio Quran Modal */}
      <AudioQuranModal
        isOpen={showAudioQuranModal}
        onClose={() => setShowAudioQuranModal(false)}
        onStartPlayback={handleStartAudioQuran}
        currentReciter={reciter}
        currentReciterId={reciter?.id}
        currentSurahNumber={audioSurah}
        currentScope={audioScope}
        todayWird={todayWird}
        onOpenDownloadManager={() => setShowAudioDownloadModal(true)}
      />

      {/* 5.2 Offline Audio Download Manager Modal */}
      <AudioDownloadManagerModal
        isOpen={showAudioDownloadModal}
        onClose={() => setShowAudioDownloadModal(false)}
        activeReciterId={reciter.id}
        todayWird={todayWird}
        onSelectReciter={(r) => {
          setReciter(r);
          handleUpdatePreferences({ defaultReciterId: r.id });
        }}
      />

      {/* 5.5 Wird Listening Completed Celebration Modal */}
      {wirdCompletedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white font-serif mb-1">
                اكتمل الاستماع لورد اليوم بحمد الله
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                تقبل الله طاعتكم! أتممت الاستماع إلى الورد كاملاً (الصفحات {wirdCompletedPrompt.startPage} — {wirdCompletedPrompt.endPage}).
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  handleToggleTodayWird();
                  setWirdCompletedPrompt(null);
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs"
              >
                تسجيل الورد كمكتمل في الختمة
              </button>
              <button
                onClick={() => setWirdCompletedPrompt(null)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Khatmah Creation Multi-Step Wizard */}
      <KhatmahWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateKhatmah={handleCreateKhatmah}
      />

      {/* 6. Missed Wird Gentle Compensation Modal */}
      {activeKhatmah && (
        <MissedWirdModal
          khatmah={activeKhatmah}
          isOpen={isMissedWirdOpen}
          onClose={() => setIsMissedWirdOpen(false)}
          onApplyCompensation={(updated) => {
            StorageService.saveKhatmah(updated);
            setKhatmat(StorageService.getKhatmat());
          }}
        />
      )}

      {/* 6b. Bonus Award Celebration Modal */}
      {activeKhatmah && todayWird && (
        <BonusAwardModal
          isOpen={isBonusModalOpen}
          onClose={() => setIsBonusModalOpen(false)}
          todayWird={todayWird}
          khatmah={activeKhatmah}
          onContinueReading={() => {
            setIsBonusModalOpen(false);
            const p = todayWird.currentProgressPage || todayWird.endPage;
            const pageRef = getPageStart(p);
            navigateToAyah(pageRef.surah, pageRef.ayah, p);
          }}
        />
      )}

      {/* 7. Khatmah Completion Modal */}
      {completedKhatmah && (
        <KhatmahCompletionModal
          khatmah={completedKhatmah}
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          onStartNewKhatmah={() => {
            setIsCompletionModalOpen(false);
            setIsWizardOpen(true);
          }}
        />
      )}

      {/* 8. Light Peaceful Onboarding */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          StorageService.setOnboardingCompleted();
          setShowOnboarding(false);
        }}
        onStartKhatmahNow={() => {
          StorageService.setOnboardingCompleted();
          setShowOnboarding(false);
          setIsWizardOpen(true);
        }}
      />

      {/* 9. PWA Install Prompt for Android */}
      <PWAInstallPrompt />

      {/* 10. Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      </div>
    </ErrorBoundary>
  );
}
