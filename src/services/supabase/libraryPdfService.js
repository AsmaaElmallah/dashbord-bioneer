import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'library_pdfs';
const PDF_BUCKET = 'library-pdfs';
const COVER_BUCKET = 'library-covers';

export const libraryPdfCategories = [
  { id: 'guide', label: 'أدلة التربية' },
  { id: 'stories', label: 'قصص مصورة' },
  { id: 'activities', label: 'بطاقات وأنشطة' },
];

export const libraryPdfPublishOptions = [
  { id: 'draft', label: 'مسودة' },
  { id: 'review', label: 'قيد المراجعة' },
  { id: 'published', label: 'منشور' },
  { id: 'archived', label: 'مؤرشف' },
];

export function categoryLabel(id) {
  return libraryPdfCategories.find((c) => c.id === id)?.label ?? id;
}

export function publishLabel(id) {
  return libraryPdfPublishOptions.find((p) => p.id === id)?.label ?? id;
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

export function emptyPdfDraft() {
  return {
    id: null,
    title: '',
    category: 'guide',
    tagLabel: '',
    description: '',
    pageCount: '',
    pageLabel: 'صفحة',
    fileSizeBytes: null,
    filePath: null,
    coverUrl: '',
    sortOrder: 0,
    publishStatus: 'draft',
  };
}

export function rowToPdf(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tagLabel: row.tag_label ?? '',
    description: row.description ?? '',
    pageCount: row.page_count ?? '',
    pageLabel: row.page_label ?? 'صفحة',
    fileSizeBytes: row.file_size_bytes ?? null,
    filePath: row.file_path ?? null,
    coverUrl: row.cover_url ?? '',
    sortOrder: row.sort_order ?? 0,
    publishStatus: row.publish_status ?? 'draft',
    updatedAt: row.updated_at,
  };
}

export function pdfToRow(pdf) {
  const pages = Number.parseInt(pdf.pageCount, 10);
  const published = pdf.publishStatus === 'published';
  return {
    id: pdf.id || `pdf_${Date.now()}`,
    title: pdf.title.trim(),
    category: pdf.category,
    tag_label: pdf.tagLabel.trim(),
    description: pdf.description.trim(),
    page_count: Number.isFinite(pages) && pages > 0 ? pages : null,
    page_label: pdf.pageLabel.trim() || 'صفحة',
    file_size_bytes: pdf.fileSizeBytes ?? null,
    file_path: pdf.filePath || null,
    cover_url: pdf.coverUrl?.trim() || null,
    sort_order: Number(pdf.sortOrder) || 0,
    publish_status: pdf.publishStatus,
    published_at: published ? new Date().toISOString() : null,
  };
}

export function validatePdfDraft(pdf) {
  const issues = [];
  if (!pdf.title.trim()) issues.push('العنوان مطلوب.');
  if (pdf.publishStatus === 'published' && !pdf.filePath) {
    issues.push('لا يمكن النشر قبل رفع ملف الـ PDF.');
  }
  return issues;
}

function offline() {
  return !isSupabaseEnabled || !supabase;
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export async function listLibraryPdfs() {
  if (offline()) return { data: null, error: null, offline: true };
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('sort_order')
    .order('created_at');
  return { data: (data ?? []).map(rowToPdf), error, offline: false };
}

export async function upsertLibraryPdf(row) {
  if (offline()) return { data: null, error: new Error('Supabase غير مفعّل'), offline: true };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  return { data: data ? rowToPdf(data) : null, error, offline: false };
}

export async function deleteLibraryPdf(pdf) {
  if (offline()) return { error: new Error('Supabase غير مفعّل'), offline: true };
  const { error } = await supabase.from(TABLE).delete().eq('id', pdf.id);
  if (!error && pdf.filePath) {
    await supabase.storage.from(PDF_BUCKET).remove([pdf.filePath]);
  }
  return { error, offline: false };
}

export async function uploadLibraryPdfFile(file) {
  if (offline()) return { data: null, error: new Error('Supabase غير مفعّل') };
  const path = `${Date.now()}_${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(PDF_BUCKET).upload(path, file, {
    upsert: false,
    contentType: 'application/pdf',
  });
  if (error) return { data: null, error };
  return { data: { path, size: file.size }, error: null };
}

export async function uploadLibraryCover(file) {
  if (offline()) return { data: null, error: new Error('Supabase غير مفعّل') };
  const path = `${Date.now()}_${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) return { data: null, error };
  const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  return { data: { url: data.publicUrl }, error: null };
}

export async function signedPdfUrl(path) {
  if (offline() || !path) return null;
  const { data } = await supabase.storage.from(PDF_BUCKET).createSignedUrl(path, 600);
  return data?.signedUrl ?? null;
}

export function translatePdfError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied') || m.includes('unauthorized')) {
    return 'لا صلاحية — سجّلي الدخول وتأكدي أن دورك admin أو editor في profiles.';
  }
  if (m.includes('bucket not found')) {
    return 'مكان التخزين غير موجود — شغّلي migration مكتبة الـ PDF على Supabase أولاً.';
  }
  if (m.includes('relation') && m.includes('library_pdfs')) {
    return 'جدول library_pdfs غير موجود — شغّلي migration مكتبة الـ PDF أولاً.';
  }
  if (m.includes('library_pdfs_file_check')) {
    return 'ارفعي ملف الـ PDF قبل النشر.';
  }
  if (m.includes('mime') || m.includes('invalid_mime_type')) {
    return 'نوع الملف غير مسموح — PDF للملف، وPNG/JPG/WEBP للغلاف.';
  }
  if (m.includes('exceeded') || m.includes('too large')) {
    return 'حجم الملف أكبر من المسموح (PDF حتى 100 م.ب، الغلاف حتى 5 م.ب).';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي المحاولة.';
  }
  return message;
}
