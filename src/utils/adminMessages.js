/** رسائل واجهة نظيفة — بدون مصطلحات mock / UI فقط للمستخدم */

export function cleanToast(text) {
  if (!text) return '';
  return String(text)
    .replace(/\s*—\s*UI فقط\s*/gi, '')
    .replace(/\s*\(mock\)\s*/gi, '')
    .replace(/\s*mock\s*/gi, ' ')
    .replace(/\s*—\s*محفوظ في المتصفح\s*/gi, '')
    .trim();
}
