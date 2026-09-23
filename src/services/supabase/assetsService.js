import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const BUCKET = 'admin-uploads';

function kindFromMime(mime, name) {
  if (mime?.startsWith('image/')) return 'image';
  if (mime?.startsWith('audio/')) return 'audio';
  if (mime?.startsWith('video/')) return 'video';
  const lower = (name || '').toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) return 'image';
  if (/\.(mp3|m4a|wav|ogg)$/.test(lower)) return 'audio';
  if (/\.(mp4|webm|mov)$/.test(lower)) return 'video';
  return 'file';
}

export async function listAdminAssets(prefix = '') {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const { data, error } = await supabase.storage.from(BUCKET).list(prefix || '', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) return { data: null, error, offline: false };

  const files = (data ?? [])
    .filter((f) => f.name && f.id)
    .map((f) => {
      const path = prefix ? `${prefix}/${f.name}` : f.name;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return {
        id: path,
        name: f.name,
        path,
        sectionId: prefix || 'root',
        kind: kindFromMime(f.metadata?.mimetype, f.name),
        status: 'موجود',
        size: f.metadata?.size
          ? `${Math.round(Number(f.metadata.size) / 1024)} KB`
          : '—',
        updatedAt: f.updated_at
          ? new Date(f.updated_at).toLocaleDateString('ar-EG')
          : '—',
        publicUrl: pub?.publicUrl ?? null,
      };
    });

  return { data: files, error: null, offline: false };
}

export async function uploadAdminAsset(file, folder = '') {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل'), data: null };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]+/g, '_');
  const path = folder ? `${folder}/${Date.now()}_${safeName}` : `${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) return { error, data: null };
  return { error: null, data: { path } };
}

export async function removeAdminAsset(path) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل') };
  }
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { error };
}
