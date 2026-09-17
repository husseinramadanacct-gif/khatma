import React, { useState } from 'react';
import { 
  Check, ArrowRight, ArrowLeft, X, Sparkles, Clock, Calendar, 
  BookOpen, Bell, Layers, CheckCircle2 
} from 'lucide-react';
import { Khatmah, PaceType } from '../../types';
import { 
  calculateDailyPages, 
  calculateExpectedDays, 
  calculateExpectedEndDate, 
  TOTAL_PAGES 
} from '../../utils/wirdCalculator';

interface KhatmahWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateKhatmah: (khatmah: Khatmah) => void;
}

export const KhatmahWizard: React.FC<KhatmahWizardProps> = ({
  isOpen,
  onClose,
  onCreateKhatmah,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Title
  const [title, setTitle] = useState<string>('ختمة مباركة');

  // Step 2: Pace Type & Amount
  const [paceType, setPaceType] = useState<PaceType>('days_target');
  const [paceAmount, setPaceAmount] = useState<number>(30); // 30 days default

  // Step 3: Wird Time
  const [reminderTime, setReminderTime] = useState<string>('20:00');

  // Step 4: Reminder Toggle
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);

  // Step 5: Duration preset or custom
  const [durationPreset, setDurationPreset] = useState<number>(30);
  const [customDays, setCustomDays] = useState<number>(30);

  if (!isOpen) return null;

  // الحسابات المحدثة للخطة
  const effectiveDays = paceType === 'days_target' ? durationPreset : calculateExpectedDays(paceType, paceAmount);
  const dailyPages = calculateDailyPages(paceType, paceType === 'days_target' ? durationPreset : paceAmount);
  const startDateStr = new Date().toISOString().split('T')[0];
  const expectedEndDateStr = calculateExpectedEndDate(startDateStr, effectiveDays);

  const handleComplete = () => {
    const newKhatmah: Khatmah = {
      id: 'khatmah_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: title.trim() || 'ختمة مباركة',
      createdAt: new Date().toISOString(),
      startDate: startDateStr,
      expectedEndDate: expectedEndDateStr,
      status: 'active',
      paceType,
      paceAmount: paceType === 'days_target' ? durationPreset : paceAmount,
      reminderTime,
      reminderEnabled,
      totalDays: effectiveDays,
      currentSurah: 1,
      currentAyah: 1,
      currentPage: 1,
      currentJuz: 1,
      readPagesCount: 0,
      totalReadingSessions: 0,
      lastReadAt: new Date().toISOString(),
    };

    onCreateKhatmah(newKhatmah);
    onClose();
    // إعادة تعيين
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Wizard Header with Progress Steps */}
        <div className="p-6 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              {step}/6
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
                إنشاء ختمة جديدة
              </h3>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                الخطوة {step}: {
                  step === 1 ? 'اسم الختمة' :
                  step === 2 ? 'طريقة حساب الورد' :
                  step === 3 ? 'وقت الورد اليومي' :
                  step === 4 ? 'تفعيل التنبيه' :
                  step === 5 ? 'مدة الختمة' : 'ملخص الخطة وتأكيدها'
                }
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1">
          <div 
            className="bg-emerald-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Step Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Title */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200">
                ماذا تحب أن تسمي هذه الختمة؟
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: ختمة رمضان، ختمة التدبر، ختمتي الأولى..."
                className="w-full p-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                autoFocus
              />

              <div className="flex flex-wrap gap-2 pt-2">
                {['ختمة رمضان', 'ختمتي الشهرية', 'ختمة الجمعة', 'ختمة الحفظ والمراجعة'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setTitle(preset)}
                    className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Pace Method */}
          {step === 2 && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                كيف تفضل تحديد وردك اليومي؟
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <button
                  type="button"
                  onClick={() => { setPaceType('days_target'); setPaceAmount(30); }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    paceType === 'days_target'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">بناءً على عدد الأيام (موصى به)</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">تحدد مدة الختمة ويحسب التطبيق وردك تلقائيًا</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaceType('pages'); setPaceAmount(5); }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    paceType === 'pages'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">عدد صفحات محدد</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">تحديد عدد صفحات ثابت يومياً (مثلاً 5 أو 10 صفحات)</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaceType('juz'); setPaceAmount(1); }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    paceType === 'juz'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">جزء كامل يومياً</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">قراءة جزء واحد في اليوم (ختم في 30 يوماً)</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaceType('hizb'); setPaceAmount(1); }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    paceType === 'hizb'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">حزب واحد (نصف جزء)</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">قراءة حزب واحد يومياً (ختم في 60 يوماً)</div>
                </button>

              </div>
            </div>
          )}

          {/* STEP 3: Time of Day */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200">
                ما هو الوقت الأنسب لك لقراءة الورد؟
              </label>
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <Clock className="w-6 h-6 text-emerald-600" />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-transparent text-2xl font-mono font-bold text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { label: 'بعد الفجر', time: '05:30' },
                  { label: 'قبل الظهر', time: '11:30' },
                  { label: 'بعد العصر', time: '16:00' },
                  { label: 'بعد المغرب', time: '18:30' },
                  { label: 'المساء (08:00 م)', time: '20:00' },
                  { label: 'قبل النوم', time: '22:30' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setReminderTime(item.time)}
                    className={`text-xs px-3 py-2 rounded-xl transition-colors ${
                      reminderTime === item.time
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {item.label} ({item.time})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Reminder Toggle */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${reminderEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-neutral-200 text-neutral-500'}`}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-neutral-900 dark:text-white">
                      تفعيل التنبيه اليومي
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      سنرسل لك تذكيراً لطيفاً عند حلول موعد الورد
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-13 h-7 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[3px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {reminderEnabled && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed border border-emerald-200 dark:border-emerald-800/60">
                  🌙 سيتلقى جهازك إشعاراً في الساعة <strong>{reminderTime}</strong> يومياً مع مقدار الورد المتبقي.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Duration */}
          {step === 5 && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200">
                خلال كم يومًا ترغب في إتمام الختمة؟
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { days: 7, label: '7 أيام', desc: '~ 86 صفحة / يوم' },
                  { days: 15, label: '15 يومًا', desc: '~ 40 صفحة / يوم' },
                  { days: 30, label: '30 يومًا', desc: '~ 20 صفحة (جزء/يوم)' },
                  { days: 40, label: '40 يومًا', desc: '~ 15 صفحة / يوم' },
                  { days: 60, label: '60 يومًا', desc: '~ 10 صفحات (حزب/يوم)' },
                ].map(item => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => {
                      setDurationPreset(item.days);
                      setPaceType('days_target');
                      setPaceAmount(item.days);
                    }}
                    className={`p-4 rounded-2xl border text-right transition-all ${
                      durationPreset === item.days && paceType === 'days_target'
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-bold text-base">{item.label}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Summary & Confirm */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>ملخص خطة الختمة</span>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 space-y-3.5 text-sm">
                
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-500 dark:text-neutral-400">اسم الختمة:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-serif">{title}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-500 dark:text-neutral-400">تاريخ البداية:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{startDateStr}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-500 dark:text-neutral-400">تاريخ النهاية المتوقع:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{expectedEndDateStr}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-500 dark:text-neutral-400">مدة الختمة:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{effectiveDays} يوماً</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-500 dark:text-neutral-400">مقدار الورد اليومي:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{dailyPages} صفحات يومياً</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-500 dark:text-neutral-400">موعد التنبيه:</span>
                  <span className="font-mono text-neutral-800 dark:text-neutral-200">
                    {reminderEnabled ? `مفعل (${reminderTime})` : 'معطل'}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Nav */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900">
          
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold flex items-center gap-1.5 transition-colors shadow"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>إنشاء الختمة</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
