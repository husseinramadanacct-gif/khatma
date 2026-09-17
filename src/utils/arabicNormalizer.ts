/**
 * أداة تسوية وتطبيع النصوص العربية للبحث والمطابقة الذكية
 * دون تغيير النص الأصلي المعروض للمستخدم
 */

// علامات التشكيل وحركات الإعراب
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;

// علامات الوقف والزخارف القرآنية
const STOP_MARKS_REGEX = /[\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC\u06DD\u06DE\u06E9]/g;

// التطويل أو الكشيدة
const TATWEEL_REGEX = /\u0640/g;

/**
 * إزالة التشكيل من النص العربي
 */
export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(TASHKEEL_REGEX, '');
}

/**
 * تسوية أشكال الهمزات والألف والياء والتاء المربوطة
 */
export function normalizeArabicLetters(text: string): string {
  if (!text) return '';
  return text
    // توحيد الألفات بكل أشكالها (أ، إ، آ، ٱ) إلى ألف مجردة (ا)
    .replace(/[إأآٱ]/g, 'ا')
    // تحويل الألف المقصورة (ى) إلى ياء (ي) للبحث
    .replace(/ى/g, 'ي')
    // توحيد التاء المربوطة مع الهاء للبحث المرن (اختياري حسب الرغبة)
    .replace(/ة/g, 'ه')
    // توحيد الهمزة على الواو والياء والسطر
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    // إزالة الكشيدة
    .replace(TATWEEL_REGEX, '')
    // إزالة علامات الوقف
    .replace(STOP_MARKS_REGEX, '');
}

/**
 * الدالة المتكاملة لتطبيع النص العربي لغرض البحث الدقيق
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  const noTashkeel = removeTashkeel(text);
  const normalized = normalizeArabicLetters(noTashkeel);
  // تنظيف المسافات الزائدة
  return normalized.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * فحص ما إذا كان النص القرآني يحتوي على كلمة أو جملة البحث
 */
export function matchesQuery(sourceText: string, query: string): boolean {
  if (!query || !sourceText) return false;
  const normalizedSource = normalizeForSearch(sourceText);
  const normalizedQuery = normalizeForSearch(query);
  return normalizedSource.includes(normalizedQuery);
}

/**
 * استخراج مقتطف (Snippet) مميز حول عبارة البحث
 */
export function extractSnippet(sourceText: string, query: string, maxLength: number = 90): string {
  if (!sourceText) return '';
  const cleanSource = removeTashkeel(sourceText);
  const cleanQuery = removeTashkeel(query).trim();
  
  if (!cleanQuery) return sourceText.slice(0, maxLength) + '...';

  const index = cleanSource.indexOf(cleanQuery);
  if (index === -1) {
    return sourceText.length > maxLength ? sourceText.slice(0, maxLength) + '...' : sourceText;
  }

  const start = Math.max(0, index - 25);
  const end = Math.min(sourceText.length, index + cleanQuery.length + 45);
  
  let snippet = sourceText.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < sourceText.length) snippet = snippet + '...';

  return snippet;
}
