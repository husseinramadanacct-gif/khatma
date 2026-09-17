import React from 'react';

export type TajweedRuleType = 
  | 'ghunnah'            // غنة مشددة
  | 'idgham-ghunnah'     // إدغام بغنة
  | 'idgham-no-ghunnah'  // إدغام بغير غنة
  | 'ikhfaa'             // إخفاء
  | 'iqlab'              // إقلاب
  | 'qalqalah'           // قلقلة
  | 'madd-necessary'     // مد لازم (6 حركات)
  | 'madd-obligatory'    // مد واجب (4-5 حركات)
  | 'madd-permissible'   // مد جائز / عارض (2-4-6 حركات)
  | 'madd-normal'        // مد طبيعي / أصلي (حركتان)
  | 'hamza-wasl'         // همزة وصل
  | 'silent'             // حرف لا ينطق
  | 'normal';

export interface TajweedLegend {
  type: TajweedRuleType;
  name: string;
  colorClass: string;
  bgClass: string;
  description: string;
}

export const TAJWEED_LEGENDS: TajweedLegend[] = [
  { type: 'madd-necessary', name: 'المد اللازم (٦ حركات)', colorClass: 'text-red-700 dark:text-red-400 font-semibold', bgClass: 'bg-red-50 dark:bg-red-950/40', description: 'مد لازم كلمي أو حرفي مثقل ومخفف' },
  { type: 'madd-obligatory', name: 'المد الواجب (٤-٥ حركات)', colorClass: 'text-rose-600 dark:text-rose-400 font-semibold', bgClass: 'bg-rose-50 dark:bg-rose-950/40', description: 'مد متصل واجب' },
  { type: 'madd-permissible', name: 'المد الجائز (٢، ٤، ٦)', colorClass: 'text-orange-600 dark:text-orange-400 font-semibold', bgClass: 'bg-orange-50 dark:bg-orange-950/40', description: 'مد منفصل وعارض للسكون وبدل' },
  { type: 'madd-normal', name: 'المد الطبيعي (حركتان)', colorClass: 'text-blue-600 dark:text-blue-400 font-semibold', bgClass: 'bg-blue-50 dark:bg-blue-950/40', description: 'الألف والواو والياء الساكنة' },
  { type: 'ghunnah', name: 'الغنة والشدة (حركتان)', colorClass: 'text-amber-600 dark:text-amber-400 font-semibold', bgClass: 'bg-amber-50 dark:bg-amber-950/40', description: 'النون والميم المشددتان' },
  { type: 'idgham-ghunnah', name: 'الإدغام بغنة', colorClass: 'text-emerald-700 dark:text-emerald-400 font-semibold', bgClass: 'bg-emerald-50 dark:bg-emerald-950/40', description: 'النون الساكنة أو التنوين في (ينمو)' },
  { type: 'ikhfaa', name: 'الإخفاء الحقيقي والشفوي', colorClass: 'text-green-600 dark:text-green-400 font-semibold', bgClass: 'bg-green-50 dark:bg-green-950/40', description: 'إخفاء النون الساكنة والتنوين والميم' },
  { type: 'iqlab', name: 'الإقلاب', colorClass: 'text-purple-600 dark:text-purple-400 font-semibold', bgClass: 'bg-purple-50 dark:bg-purple-950/40', description: 'قلب النون الساكنة أو التنوين ميماً' },
  { type: 'qalqalah', name: 'القلقلة', colorClass: 'text-sky-600 dark:text-sky-400 font-semibold', bgClass: 'bg-sky-50 dark:bg-sky-950/40', description: 'اضطراب مخرج الحرف في (قطب جد)' },
  { type: 'hamza-wasl', name: 'همزة الوصل والحروف الساقطة', colorClass: 'text-neutral-400 dark:text-neutral-500 font-normal', bgClass: 'bg-neutral-100 dark:bg-neutral-800', description: 'تسقط في درج الكلام ولا تُنطق' },
];

/**
 * تنظيف نصوص التجويد من الرموز البرمجية في حالة الرغبة في عرض النص الأصيل النقي أو البحث
 */
export function stripTajweedCodes(rawText: string): string {
  if (!rawText) return '';
  // إزالة كل رموز [code:id[content] أو [code[content] مع الإبقاء على الحرف القرآني وتشكيله
  return rawText.replace(/\[[a-zA-Z0-9]+(?::\d+)?\[([^\]]+)\]/g, '$1');
}

/**
 * جدول تعريف أحكام التجويد ومطابقتها لترميز المصحف المجود المعتمد
 */
function getTajweedRuleDetails(code: string): { className: string; title: string } {
  switch (code.toLowerCase()) {
    case 'h': // Hamzat ul Wasl
      return { className: 'tajweed-hamza-wasl', title: 'همزة وصل (تسقط وصلاً)' };
    case 's': // Silent
      return { className: 'tajweed-silent', title: 'حرف لا ينطق' };
    case 'l': // Lam Shamsiyyah
      return { className: 'tajweed-lam-shamsiyah', title: 'لام شمسية مدغمة' };
    case 'n': // Normal prolongation (2 vowels)
      return { className: 'tajweed-madd-normal', title: 'مد أصلي / طبيعي (حركتان)' };
    case 'p': // Permissible prolongation (2, 4, 6 vowels)
      return { className: 'tajweed-madd-permissible', title: 'مد جائز (٢ أو ٤ أو ٦ حركات)' };
    case 'm': // Necessary prolongation (6 vowels)
      return { className: 'tajweed-madd-necessary', title: 'مد لازم (٦ حركات)' };
    case 'o': // Obligatory prolongation (4-5 vowels)
      return { className: 'tajweed-madd-obligatory', title: 'مد واجب متصل (٤-٥ حركات)' };
    case 'q': // Qalqalah
      return { className: 'tajweed-qalaqah', title: 'قلقلة (قطب جد)' };
    case 'c': // Ikhfaa Shafawi
      return { className: 'tajweed-ikhfa-shafawi', title: 'إخفاء شفوي' };
    case 'f': // Ikhfaa
      return { className: 'tajweed-ikhfa', title: 'إخفاء بغنة' };
    case 'w': // Idgham Shafawi
      return { className: 'tajweed-idgham-shafawi', title: 'إدغام شفوي بغنة' };
    case 'i': // Iqlab
      return { className: 'tajweed-iqlab', title: 'إقلاب ميماً' };
    case 'a': // Idgham with Ghunnah
      return { className: 'tajweed-idgham-ghunnah', title: 'إدغام بغنة (ينمو)' };
    case 'u': // Idgham without Ghunnah
      return { className: 'tajweed-idgham-no-ghunnah', title: 'إدغام بغير غنة (ل، ر)' };
    case 'd': // Idgham Mutajanisayn
      return { className: 'tajweed-idgham-mutajanisayn', title: 'إدغام متجانسين' };
    case 'b': // Idgham Mutaqaribayn
      return { className: 'tajweed-idgham-mutaqaribayn', title: 'إدغام متقاربين' };
    case 'g': // Ghunnah (2 vowels)
      return { className: 'tajweed-ghunnah', title: 'غنة مشددة (حركتان)' };
    default:
      return { className: 'tajweed-default', title: 'حكم تجويد' };
  }
}

/**
 * تحويل نص التجويد المشفر إلى عناصر React ملونة ومصحوبة ببيانات الوصول (Accessibility)
 */
export function renderTajweedSpans(rawText: string, isEnabled = true): React.ReactNode {
  if (!rawText) return null;
  if (!isEnabled) {
    return stripTajweedCodes(rawText);
  }

  // فحص ما إذا كان النص يحتوي على ترميزات التجويد القياسية مثل [h:1[ٱ] أو [q[ق]
  const regex = /\[([a-zA-Z0-9]+)(?::\d+)?\[([^\]]+)\]/g;
  if (!regex.test(rawText)) {
    return rawText;
  }

  // إعادة تعيين المؤشر
  regex.lastIndex = 0;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let spanKey = 0;

  while ((match = regex.exec(rawText)) !== null) {
    const [fullMatch, code, content] = match;
    const matchIndex = match.index;

    // إضافة النص السابق العادي
    if (matchIndex > lastIndex) {
      parts.push(rawText.substring(lastIndex, matchIndex));
    }

    // تحديد الحكم والتنسيق
    const { className, title } = getTajweedRuleDetails(code);

    parts.push(
      <span
        key={`tj_${spanKey++}_${matchIndex}`}
        className={`tajweed-char ${className}`}
        title={title}
        aria-label={`${content} (${title})`}
      >
        {content}
      </span>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < rawText.length) {
    parts.push(rawText.substring(lastIndex));
  }

  return parts;
}
