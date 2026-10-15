import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

export async function fetchNotificationCampaigns() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }
  const { data, error } = await supabase
    .from('notification_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error, offline: false };

  const STATUS_AR = {
    draft: 'مسودة',
    scheduled: 'مجدول',
    sent: 'مُرسل',
  };

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      status: STATUS_AR[row.status] ?? row.status,
      statusKey: row.status,
      sentAt: row.sent_at
        ? new Date(row.sent_at).toLocaleString('ar-EG')
        : '—',
      audience: 'كل المستخدمين',
      type: 'حملة',
    })),
    error: null,
    offline: false,
  };
}

export async function createAndSendCampaign({ title, body }) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل'), data: null };
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-campaign', {
      body: { title, body },
    });
    if (error) return { error, data: null };

    // Fallback if function not deployed: insert sent campaign directly.
    if (!data?.ok) {
      const { data: inserted, error: insertErr } = await supabase
        .from('notification_campaigns')
        .insert({
          title,
          body,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (insertErr) return { error: insertErr, data: null };
      return { error: null, data: inserted, fallback: true };
    }
    return { error: null, data };
  } catch (e) {
    const { data: inserted, error: insertErr } = await supabase
      .from('notification_campaigns')
      .insert({
        title,
        body,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (insertErr) return { error: insertErr || e, data: null };
    return { error: null, data: inserted, fallback: true };
  }
}

/** Push to one user's devices only (not listed in the app's notifications). */
export async function sendPersonalPush({ userId, title, body, kind }) {
  if (!isSupabaseEnabled || !supabase || !userId) return { error: null, data: null };
  try {
    const { data, error } = await supabase.functions.invoke('send-campaign', {
      body: { user_id: userId, title, body, kind },
    });
    return { error, data };
  } catch (e) {
    return { error: e, data: null };
  }
}

/** Push to the mothers who joined a club group. */
export async function sendGroupPush({ groupId, title, body }) {
  if (!isSupabaseEnabled || !supabase || !groupId) return { error: null, data: null };
  try {
    const { data, error } = await supabase.functions.invoke('send-campaign', {
      body: { group_id: groupId, title, body },
    });
    return { error, data };
  } catch (e) {
    return { error: e, data: null };
  }
}

export async function countDeviceTokens() {
  if (!isSupabaseEnabled || !supabase) {
    return { count: 0, error: null };
  }
  const { count, error } = await supabase
    .from('device_tokens')
    .select('*', { count: 'exact', head: true });
  return { count: count ?? 0, error };
}
