import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const AGE_LABELS = ['0–3 شهور', '3–6 شهور', '6–12 شهر', '1–1.5 سنة'];
const AGE_KEYS = ['0-3', '3-6', '6-12', '12-18'];

function mapChildRow(row, parentName = '—') {
  const ageIdx = row.age_range_index ?? 0;
  return {
    id: row.id,
    name: row.name ?? '—',
    parentId: row.user_id,
    parent: parentName,
    age: AGE_LABELS[ageIdx] ?? `فئة ${ageIdx}`,
    ageKey: AGE_KEYS[ageIdx] ?? '0-3',
    gender: row.gender === 'male' ? 'ذكر' : row.gender === 'female' ? 'أنثى' : '—',
    nutrition: '—',
    sleep: '—',
    physicalActivity: '—',
    curriculumStatus: row.is_active ? 'نشط' : 'متوقف',
    curriculumKey: row.is_active ? 'active' : 'paused',
    behaviorNotes: '',
    specialNeeds: false,
    specialNeedsDetails: '',
    progress: {
      quran: '—',
      math: '—',
      visual: '—',
      emotional: '—',
    },
    publishStatus: 'published',
  };
}

export async function fetchAppProfiles() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const [{ data, error }, childrenRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, role, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('children')
      .select('id, user_id, name, gender, age_range_index, is_active, created_at'),
  ]);

  if (error) return { data: null, error, offline: false };

  const childRows = childrenRes.data ?? [];
  const countByUser = {};
  for (const c of childRows) {
    countByUser[c.user_id] = (countByUser[c.user_id] ?? 0) + 1;
  }

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      name: row.display_name ?? '—',
      email: '—',
      role: row.role,
      status: 'مسجّل',
      plan: '—',
      childrenCount: countByUser[row.id] ?? 0,
      lastActive: new Date(row.created_at).toLocaleDateString('ar-EG'),
      lastActiveKey: 'recent',
      publishStatus: 'published',
    })),
    error: null,
    offline: false,
  };
}

export async function fetchAppChildren() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const [{ data: childRows, error }, { data: profiles }] = await Promise.all([
    supabase
      .from('children')
      .select('id, user_id, name, gender, age_range_index, is_active, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, display_name'),
  ]);

  if (error) return { data: null, error, offline: false };

  const nameById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.display_name ?? '—']),
  );

  return {
    data: (childRows ?? []).map((row) =>
      mapChildRow(row, nameById[row.user_id] ?? '—'),
    ),
    error: null,
    offline: false,
  };
}
