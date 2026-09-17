import React, { useState } from 'react';
import { 
  Settings2, ShieldCheck, Database, Volume2, BookOpen, 
  Bell, Info, Trash2, CheckCircle2, Moon, Sun, Palette, AlertTriangle, Check,
  Smartphone, Download, WifiOff, HardDrive
} from 'lucide-react';
import { UserPreferences } from '../../types';
import { VERIFIED_RECITERS } from '../../services/reciterProvider';
import { NotificationService } from '../../services/notificationService';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onClearCache: () => void;
  onOpenAudioDownloadManager?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onClearCache,
  onOpenAudioDownloadManager,
}) => {
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleRequestNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
    if (granted) {
      NotificationService.sendNotification('خاتمة', 'تم تفعيل التنبيهات بنجاح. سنذكرك بوردك اليومي.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif mb-1">
          الإعدادات والخصوصية
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          تخصيص تجربتك القرآنية، والتحكم بالبيانات والتنبيهات.
        </p>
      </div>

      {/* 1. القراءة والمظهر */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
            إعدادات القراءة والمظهر
          </h3>
        </div>

        {/* Theme Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
              سمة التطبيق
            </span>
            <span className="text-xs text-neutral-400">نهاري، ليلي، أو ورقي مريح للعين</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'light', label: 'نهاري', icon: Sun },
              { id: 'dark', label: 'ليلي', icon: Moon },
              { id: 'sepia', label: 'ورقي', icon: Palette },
            ].map(th => (
              <button
                key={th.id}
                onClick={() => onUpdatePreferences({ theme: th.id as any })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  preferences.theme === th.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <th.icon className="w-3.5 h-3.5" />
                <span>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tajweed Switch */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
              ألوان أحكام التجويد
            </span>
            <span className="text-xs text-neutral-400">إظهار ألوان أحكام التجويد في نص الآيات</span>
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
      </div>

      {/* 2. الصوت والتلاوة */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Volume2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
            إعدادات التلاوة والاستماع
          </h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">
            القارئ الافتراضي
          </label>
          <select
            value={preferences.defaultReciterId}
            onChange={(e) => onUpdatePreferences({ defaultReciterId: e.target.value })}
            className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-serif"
          >
            {VERIFIED_RECITERS.map(r => (
              <option key={r.id} value={r.id}>
                {r.arabicName} ({r.style})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2.5 تحميل التلاوات الصوتية للاستماع دون إنترنت */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
              تحميل المصحف الصوتي دون إنترنت
            </h3>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
            تخزين محلي
          </span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          يمكنك تنزيل التلاوة الصوتية لأي قارئ تفضله (سورة بسورة أو المصحف كاملاً 114 سورة أو ورد اليوم) للاستماع أثناء السفر وفي الأماكن التي لا يتوفر بها اتصال بالإنترنت.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenAudioDownloadManager}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>فتح مدير تحميل التلاوات الصوتية</span>
          </button>
        </div>
      </div>

      {/* 3. التنبيهات والورد */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
            التنبيهات وتذكير الورد
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
              إذن التنبيهات على المتصفح
            </span>
            <span className="text-xs text-neutral-400">
              {notificationStatus === 'granted' ? 'التنبيهات مفعلة وتعمل بنجاح' : 'يلزم منح الإذن لتذكيرك بوقت الورد'}
            </span>
          </div>

          {notificationStatus === 'granted' ? (
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مفعل</span>
            </span>
          ) : (
            <button
              onClick={handleRequestNotifications}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              تفعيل التنبيهات
            </button>
          )}
        </div>
      </div>

      {/* 4. الخصوصية وعدم التتبع (Privacy by Design) */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-3xl p-6 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-serif text-base">الخصوصية والأمان (Privacy by Design)</span>
        </div>
        <p className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed font-sans">
          تطبيق «خاتمة» مصمم ليكون ملاذك الآمن وقربتك إلى الله:
        </p>
        <ul className="text-xs text-emerald-900 dark:text-emerald-300/90 space-y-1.5 list-disc list-inside">
          <li>جميع ختماتك ومواضع قراءتك وعلاماتك محفوظة محليًا داخل جهازك فقط.</li>
          <li>لا نقوم بتتبع المستخدمين أو بيع أي بيانات لأي طرف ثالث نهائيًا.</li>
          <li>لا توجد إعلانات أو نوافذ ترويجية أو أدوات تحليل متطفلة.</li>
          <li>يعمل التطبيق بدون الحاجة لإنشاء حساب أو إدخال بريد إلكتروني.</li>
        </ul>
      </div>

      {/* 5. إدارة الذاكرة والتخزين والعمل دون إنترنت */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <HardDrive className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
            التشغيل الكامل دون إنترنت (Offline Mode)
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>مصحف المدينة والتفسير متاحان دون إنترنت بنسبة 100%</span>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              محلي بالكامل
            </span>
          </div>
          <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
            جميع سور القرآن الكريم الـ 114، وصفحات المصحف الشريف الـ 604، ونصوص التفسير الميسر المعتمد، ومحرك البحث القرآني، مدمجة ومحفوظة بالكامل على هاتفك دون الحاجة لأي اتصال بالإنترنت.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
              تفريغ الذاكرة المؤقتة للآيات
            </span>
            <span className="text-xs text-neutral-400">
              مسح الملفات المؤقتة القديمة وإعادة بناء الفهرس
            </span>
            {clearedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <Check className="w-3.5 h-3.5" />
                تم تفريغ الذاكرة المؤقتة بنجاح
              </span>
            )}
          </div>

          <button
            onClick={() => setShowClearModal(true)}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950/40 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>تفريغ الذاكرة</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Cache */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white font-serif mb-1">
                تفريغ الذاكرة المؤقتة
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                هل تريد مسح النصوص والتفاسير المخزنة مؤقتاً؟ لن تتأثر ختماتك أو علاماتك المرجعية.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  onClearCache();
                  setShowClearModal(false);
                  setClearedSuccess(true);
                  setTimeout(() => setClearedSuccess(false), 3000);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm"
              >
                تفريغ الآن
              </button>
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. تطبيق أندرويد والتثبيت السريع */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
            تطبيق أندرويد المستقل (PWA)
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
              تثبيت التطبيق على هاتفك الأندرويد
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
              تشغيل التطبيق كبرنامج مستقل بملء الشاشة مع أيقونة على الشاشة الرئيسية وتخزين كامل دون اتصال
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 shrink-0">
            <Check className="w-3.5 h-3.5" />
            <span>جاهز للتثبيت</span>
          </span>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
          <div className="font-bold">طريقة التثبيت على هاتف أندرويد:</div>
          <div>1. افتح التطبيق في متصفح Chrome أو متصفح سامسونج على هاتفك.</div>
          <div>2. اضغط على قائمة الخيارات الثلاث نقاط (⋮) في أعلى أو أسفل المتصفح.</div>
          <div>3. اضغط على خيار «تثبيت التطبيق» (Install App) أو «إضافة إلى الشاشة الرئيسية».</div>
        </div>
      </div>

      {/* 7. حول التطبيق والمصادر المعتمدة */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="font-bold text-sm text-neutral-900 dark:text-white font-serif">
            حول تطبيق «خاتمة» ومصادره المعتمدة
          </span>
        </div>

        <p className="leading-relaxed">
          «خاتمة» تطبيق قرآني متقن يهدف ليكون رفيقك الأوفى في ختم كتاب الله الكريم وتدبر آياته، بدون إعلانات ولا تشتيت.
        </p>

        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-1">
          <div className="font-bold text-neutral-800 dark:text-neutral-200">المصادر الرقمية المعتمدة:</div>
          <div>• <strong>النص القرآني:</strong> الرسم العثماني المعتمد برواية حفص عن عاصم (مجمع الملك فهد لطباعة المصحف الشريف عبر Al-Quran Cloud).</div>
          <div>• <strong>التفسير:</strong> التفسير الميسر الصادر عن مجمع الملك فهد.</div>
          <div>• <strong>التلاوات الصوتية:</strong> مشروع EveryAyah و Islamic Network لمشاهير قراء العالم الإسلامي.</div>
        </div>

        <div className="text-center text-[11px] text-neutral-400 pt-2 font-mono">
          الإصدار 1.0.0 — تقبل الله منا ومنكم صالح الأعمال
        </div>
      </div>

    </div>
  );
};
