import { BookCheck, Pencil, Plus, RefreshCw, Sparkles, ThumbsDown, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { ageBandLabel, libraryAgeBands } from '../data/libraryAgeBands';
import {
  aiProviders,
  deleteAiFeedback,
  deleteKnowledge,
  deleteTimeline,
  emptyAiSettings,
  fetchAiBadFeedback,
  fetchAiUsage,
  fetchKnowledge,
  fetchTimeline,
  indexKnowledge,
  knowledgeCategories,
  loadAiSettings,
  saveAiSettings,
  timelineKinds,
  upsertKnowledge,
  upsertTimeline,
} from '../services/supabase/aiService';

const tabs = [
  ['settings', 'الإعدادات والاستخدام'],
  ['knowledge', 'مكتبة المراجع العلمية'],
  ['timeline', 'جدول إمتى (تطعيمات ومهارات)'],
  ['feedback', 'ردود اتقيمت وحشة'],
];

const fieldStyle = { display: 'grid', gap: 4, fontWeight: 600 };

export function AiPage() {
  const [tab, setTab] = useState('settings');
  return (
    <div className="page-stack">
      <PageHeader title="مساعدة بيانور (الذكاء الاصطناعي)" />
      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'settings' && <SettingsTab />}
      {tab === 'knowledge' && <KnowledgeTab />}
      {tab === 'timeline' && <TimelineTab />}
      {tab === 'feedback' && <FeedbackTab />}
    </div>
  );
}

function SettingsTab() {
  const { showSuccess, showError } = useSnackbar();
  const [settings, setSettings] = useState(emptyAiSettings);
  const [usage, setUsage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAiSettings().then(({ data }) => setSettings(data));
    fetchAiUsage().then(({ data }) => setUsage(data));
  }, []);

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const provider = aiProviders.find((p) => p.id === settings.provider) ?? aiProviders[0];

  const save = async () => {
    setSaving(true);
    const { error } = await saveAiSettings(settings);
    setSaving(false);
    if (error) showError(error.message);
    else showSuccess('اتحفظت إعدادات المساعدة');
  };

  return (
    <>
      <AdminCard>
        <SectionHeader title="الاستخدام" />
        {usage ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <Stat label="أسئلة النهارده" value={usage.todayMessages} hint={`من ${settings.globalLimit} (الحد العام)`} />
            <Stat label="أمهات سألوا النهارده" value={usage.todayUsers} />
            <Stat label="خطط النهارده" value={usage.todayPlans} />
            <Stat label="أسئلة آخر 7 أيام" value={usage.weekMessages} hint={`${usage.weekUsers} أم`} />
          </div>
        ) : (
          <p className="text-caption">جاري التحميل…</p>
        )}
      </AdminCard>

      <AdminCard>
        <SectionHeader title="الإعدادات" />
        <div style={{ display: 'grid', gap: 14, maxWidth: 520 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <input type="checkbox" checked={settings.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            المساعدة شغالة في التطبيق
          </label>
          <label style={fieldStyle}>
            خدمة الذكاء الاصطناعي
            <select
              value={settings.provider}
              onChange={(e) => {
                const next = aiProviders.find((p) => p.id === e.target.value) ?? aiProviders[0];
                set({ provider: next.id, model: next.models[0] });
              }}
            >
              {aiProviders.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          {settings.provider === 'claude' && (
            <p className="text-caption" style={{ color: '#a84848' }}>
              Claude محتاج مفتاح ANTHROPIC_API_KEY في Supabase Secrets ومدفوع حسب الاستخدام.
            </p>
          )}
          <label style={fieldStyle}>
            الموديل
            <select value={settings.model} onChange={(e) => set({ model: e.target.value })}>
              {[...new Set([settings.model, ...provider.models])].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label style={fieldStyle}>
            عدد الأسئلة لكل أم في اليوم
            <input type="number" min="1" dir="ltr" value={settings.dailyLimit} onChange={(e) => set({ dailyLimit: e.target.value })} />
          </label>
          <label style={fieldStyle}>
            الحد العام لكل الأمهات في اليوم (عشان نفضل في الباقة المجانية)
            <input type="number" min="1" dir="ltr" value={settings.globalLimit} onChange={(e) => set({ globalLimit: e.target.value })} />
          </label>
          <label style={fieldStyle}>
            رقم الإسعاف اللي يظهر في التنبيه الأحمر (اتأكدي من الرقم الرسمي في بلد الأمهات)
            <input
              type="tel"
              dir="ltr"
              value={settings.emergencyPhone}
              onChange={(e) => set({ emergencyPhone: e.target.value })}
            />
          </label>
          <div>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={save}>
              {saving ? 'جاري الحفظ…' : 'حفظ'}
            </button>
          </div>
        </div>
      </AdminCard>
    </>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div style={{ background: '#fff8f1', borderRadius: 12, padding: 12 }}>
      <div className="text-caption">{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
      {hint && <div className="text-caption">{hint}</div>}
    </div>
  );
}

const emptyItem = {
  id: null,
  title: '',
  content: '',
  age_bands: [],
  category: 'general',
  source_name: '',
  source_url: '',
  publish_status: 'published',
};

function KnowledgeTab() {
  const { showSuccess, showError, showMock } = useSnackbar();
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [indexing, setIndexing] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await fetchKnowledge();
    if (error) showError(error.message);
    setRows(data);
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const runIndex = async () => {
    setIndexing(true);
    let remaining = 1;
    let rounds = 0;
    while (remaining > 0 && rounds < 5) {
      const { data, error } = await indexKnowledge();
      if (error || data?.status !== 'ok') {
        showError(data?.status === 'not_configured' ? 'لازم تحطي GEMINI_API_KEY في Supabase Secrets الأول' : 'تعذّر تجهيز المراجع، جربي كمان شوية');
        break;
      }
      remaining = data.remaining;
      rounds++;
      if (data.done === 0) break;
    }
    setIndexing(false);
    await load();
    if (remaining === 0) showSuccess('كل المراجع جاهزة للبحث');
  };

  const save = async () => {
    if (editing.title.trim().length < 3 || editing.content.trim().length < 20 || !editing.source_name.trim()) {
      showMock('اكتبي عنوان، ومحتوى (20 حرف على الأقل)، واسم المصدر');
      return;
    }
    setSaving(true);
    const { error } = await upsertKnowledge(editing);
    setSaving(false);
    if (error) {
      showError(error.message);
      return;
    }
    setEditing(null);
    await load();
    await runIndex();
  };

  const remove = async (row) => {
    if (!window.confirm(`حذف المرجع «${row.title}»؟`)) return;
    const { error } = await deleteKnowledge(row.id);
    if (error) showError(error.message);
    else await load();
  };

  const pending = rows.filter((r) => r.needsIndex).length;

  return (
    <>
      <AdminCard>
        <p className="text-caption" style={{ marginTop: 0 }}>
          المساعدة بترد من المراجع دي بس، والمصدر بيظهر للأم تحت الرد. كل معلومة لازم يكون ليها مصدر علمي موثوق (WHO، AAP، CDC،
          NHS، أو أخصائية بيانور). المراجع المبدئية ملخصة من الإرشادات الرسمية — يُفضل الأخصائية تراجعها.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="mock-btn mock-btn--primary" onClick={() => setEditing({ ...emptyItem })}>
            <Plus size={16} /> مرجع جديد
          </button>
          <button type="button" className="mock-btn mock-btn--outline" disabled={indexing} onClick={runIndex}>
            <RefreshCw size={16} /> {indexing ? 'جاري التجهيز…' : 'تجهيز المراجع للبحث'}
          </button>
          {pending > 0 && <StatusBadge tone="warning">{pending} مرجع مش متجهز للبحث</StatusBadge>}
        </div>
      </AdminCard>

      {editing && (
        <AdminCard>
          <SectionHeader title={editing.id ? 'تعديل مرجع' : 'مرجع جديد'} />
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={fieldStyle}>
              العنوان
              <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </label>
            <label style={fieldStyle}>
              المعلومة (مختصرة وواضحة)
              <textarea rows={6} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            </label>
            <div style={fieldStyle}>
              الأعمار
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontWeight: 500 }}>
                {[{ id: 'all', label: 'كل الأعمار' }, ...libraryAgeBands].map((b) => (
                  <label key={b.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={editing.age_bands.includes(b.id)}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          age_bands: e.target.checked
                            ? [...editing.age_bands, b.id]
                            : editing.age_bands.filter((x) => x !== b.id),
                        })
                      }
                    />
                    {b.label}
                  </label>
                ))}
              </div>
            </div>
            <label style={fieldStyle}>
              الموضوع
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {knowledgeCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              اسم المصدر
              <input
                type="text"
                value={editing.source_name}
                placeholder="مثلاً: منظمة الصحة العالمية (WHO) — Breastfeeding"
                onChange={(e) => setEditing({ ...editing, source_name: e.target.value })}
              />
            </label>
            <label style={fieldStyle}>
              رابط المصدر (اختياري)
              <input
                type="url"
                dir="ltr"
                value={editing.source_url ?? ''}
                onChange={(e) => setEditing({ ...editing, source_url: e.target.value })}
              />
            </label>
            <label style={fieldStyle}>
              الحالة
              <select value={editing.publish_status} onChange={(e) => setEditing({ ...editing, publish_status: e.target.value })}>
                <option value="published">منشور (المساعدة تستخدمه)</option>
                <option value="review">مستني مراجعة الأخصائية</option>
                <option value="archived">مخفي</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={save}>
                {saving ? 'جاري الحفظ…' : 'حفظ'}
              </button>
              <button type="button" className="mock-btn mock-btn--outline" onClick={() => setEditing(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </AdminCard>
      )}

      <AdminTableContainer>
        <table className="admin-table">
          <thead>
            <tr>
              <th>المرجع</th>
              <th>الأعمار</th>
              <th>المصدر</th>
              <th>الحالة</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-caption">مفيش مراجع لسه — شغّلي ملف الـ SQL بتاع المكتبة.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.title}</strong>
                    <div className="text-caption" style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>
                      {r.content.slice(0, 220)}
                      {r.content.length > 220 ? '…' : ''}
                    </div>
                  </td>
                  <td className="text-caption">
                    {r.age_bands.map((b) => (b === 'all' ? 'كل الأعمار' : ageBandLabel(b))).join('، ')}
                  </td>
                  <td className="text-caption">
                    {r.source_url ? (
                      <a href={r.source_url} target="_blank" rel="noreferrer">{r.source_name}</a>
                    ) : (
                      r.source_name
                    )}
                  </td>
                  <td>
                    <StatusBadge tone={r.publish_status === 'published' ? 'success' : 'warning'}>
                      {r.publish_status === 'published' ? 'منشور' : r.publish_status === 'review' ? 'مراجعة' : 'مخفي'}
                    </StatusBadge>
                    {r.needsIndex && (
                      <div className="text-caption" style={{ marginTop: 4 }}>مش متجهز للبحث</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 10px' }}
                        onClick={() => setEditing({ ...emptyItem, ...r, source_url: r.source_url ?? '' })}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="mock-btn mock-btn--danger"
                        style={{ padding: '4px 10px' }}
                        onClick={() => remove(r)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableContainer>
    </>
  );
}

const emptyTimelineItem = {
  kind: 'vaccine',
  age_days: 0,
  title: '',
  body: '',
  tipsText: '',
  source_name: '',
  source_url: '',
  publish_status: 'review',
};

function ageDaysLabel(days) {
  if (days === 0) return 'عند الولادة';
  if (days < 60 && days % 7 === 0) return `${days / 7} أسابيع`;
  if (days < 60) return `${days} يوم`;
  return `${Math.round(days / 30.4)} شهر (${days} يوم)`;
}

function TimelineTab() {
  const { showError, showMock } = useSnackbar();
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await fetchTimeline();
    if (error) showError(error.message);
    setRows(data);
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (editing.title.trim().length < 3 || !editing.source_name.trim()) {
      showMock('اكتبي العنوان واسم المصدر');
      return;
    }
    setSaving(true);
    const { error } = await upsertTimeline(editing);
    setSaving(false);
    if (error) {
      showError(error.message);
      return;
    }
    setEditing(null);
    await load();
  };

  const remove = async (row) => {
    if (!window.confirm(`حذف «${row.title}»؟`)) return;
    const { error } = await deleteTimeline(row.id);
    if (error) showError(error.message);
    else await load();
  };

  const reviewCount = rows.filter((r) => r.publish_status === 'review').length;

  return (
    <>
      <AdminCard>
        <p className="text-caption" style={{ marginTop: 0 }}>
          الجدول ده بيظهر لكل أم حسب عمر طفلها بالأيام (تطعيمات، مهارات، أكل). التطعيمات المبدئية متسجلة «مراجعة» ومش بتظهر
          للأمهات — طابقيها مع كارت التطعيم الرسمي لوزارة الصحة وعدّلي الأيام والأسماء، وبعدين غيري الحالة لـ «منشور».
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="mock-btn mock-btn--primary" onClick={() => setEditing({ ...emptyTimelineItem })}>
            <Plus size={16} /> عنصر جديد
          </button>
          {reviewCount > 0 && <StatusBadge tone="warning">{reviewCount} مستني مراجعة</StatusBadge>}
        </div>
      </AdminCard>

      {editing && (
        <AdminCard>
          <SectionHeader title={editing.id ? 'تعديل' : 'عنصر جديد'} />
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={fieldStyle}>
              النوع
              <select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })}>
                {timelineKinds.map((k) => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              العمر بالأيام (الولادة = 0، 6 أسابيع = 42، 9 شهور ≈ 274)
              <input
                type="number"
                min={0}
                max={1100}
                value={editing.age_days}
                onChange={(e) => setEditing({ ...editing, age_days: e.target.value })}
              />
              <span className="text-caption">{ageDaysLabel(Number(editing.age_days) || 0)}</span>
            </label>
            <label style={fieldStyle}>
              العنوان
              <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </label>
            <label style={fieldStyle}>
              التفاصيل
              <textarea rows={3} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            </label>
            <label style={fieldStyle}>
              نصايح (كل نصيحة في سطر)
              <textarea rows={3} value={editing.tipsText} onChange={(e) => setEditing({ ...editing, tipsText: e.target.value })} />
            </label>
            <label style={fieldStyle}>
              اسم المصدر
              <input
                type="text"
                value={editing.source_name}
                onChange={(e) => setEditing({ ...editing, source_name: e.target.value })}
              />
            </label>
            <label style={fieldStyle}>
              رابط المصدر (اختياري)
              <input
                type="url"
                dir="ltr"
                value={editing.source_url ?? ''}
                onChange={(e) => setEditing({ ...editing, source_url: e.target.value })}
              />
            </label>
            <label style={fieldStyle}>
              الحالة
              <select value={editing.publish_status} onChange={(e) => setEditing({ ...editing, publish_status: e.target.value })}>
                <option value="published">منشور (بيظهر للأمهات)</option>
                <option value="review">مستني مراجعة الأخصائية</option>
                <option value="archived">مخفي</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={save}>
                {saving ? 'جاري الحفظ…' : 'حفظ'}
              </button>
              <button type="button" className="mock-btn mock-btn--outline" onClick={() => setEditing(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </AdminCard>
      )}

      <AdminTableContainer>
        <table className="admin-table">
          <thead>
            <tr>
              <th>العمر</th>
              <th>النوع</th>
              <th>العنوان</th>
              <th>الحالة</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-caption">مفيش عناصر لسه — شغّلي ملف الـ SQL بتاع جدول إمتى.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="text-caption">{ageDaysLabel(r.age_days)}</td>
                  <td>{timelineKinds.find((k) => k.id === r.kind)?.label ?? r.kind}</td>
                  <td>
                    <strong>{r.title}</strong>
                    <div className="text-caption" style={{ marginTop: 4 }}>{r.body}</div>
                  </td>
                  <td>
                    <StatusBadge tone={r.publish_status === 'published' ? 'success' : 'warning'}>
                      {r.publish_status === 'published' ? 'منشور' : r.publish_status === 'review' ? 'مراجعة' : 'مخفي'}
                    </StatusBadge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 10px' }}
                        onClick={() =>
                          setEditing({
                            ...emptyTimelineItem,
                            ...r,
                            tipsText: (r.tips ?? []).join('\n'),
                            source_url: r.source_url ?? '',
                          })
                        }
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="mock-btn mock-btn--danger"
                        style={{ padding: '4px 10px' }}
                        onClick={() => remove(r)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableContainer>
    </>
  );
}

function FeedbackTab() {
  const { showError } = useSnackbar();
  const [rows, setRows] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await fetchAiBadFeedback();
    if (error) showError(error.message);
    setRows(data);
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (r) => {
    const { error } = await deleteAiFeedback(r.message_id, r.user_id);
    if (error) showError(error.message);
    else await load();
  };

  if (rows === null) return <p className="text-caption">جاري التحميل…</p>;

  return (
    <AdminCard>
      <SectionHeader title="ردود الأمهات قالوا عليها مش دقيقة" />
      <p className="text-caption">
        راجعي الرد. لو المعلومة ناقصة أو غلط، ضيفي مرجع صح في «مكتبة المراجع» عشان المساعدة ترد صح المرة الجاية.
      </p>
      {rows.length === 0 ? (
        <p className="text-caption">
          <Sparkles size={14} /> مفيش ردود متقيمة وحشة — ممتاز.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {rows.map((r) => (
            <li key={`${r.message_id}_${r.user_id}`} style={{ background: '#fff6f6', borderRadius: 12, padding: 12 }}>
              <div className="text-caption">
                <ThumbsDown size={14} style={{ verticalAlign: 'middle' }} /> السبب: <strong>{r.reason || '—'}</strong> ·{' '}
                {r.created_at?.slice?.(0, 16).replace('T', ' ')}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>سؤال الأم:</strong> {r.question || '—'}
              </div>
              <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
                <strong>رد المساعدة:</strong> {formatAnswer(r.answer)}
              </div>
              <div style={{ marginTop: 8 }}>
                <button type="button" className="mock-btn mock-btn--outline" style={{ padding: '4px 10px' }} onClick={() => resolve(r)}>
                  <BookCheck size={14} /> اتراجع
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

function formatAnswer(raw) {
  if (!raw) return '—';
  try {
    const a = JSON.parse(raw);
    const parts = [a.summary];
    if (a.activity?.title) parts.push(`النشاط: ${a.activity.title} — ${(a.activity.steps ?? []).join(' / ')}`);
    if (a.see_doctor_when) parts.push(`إمتى الدكتور: ${a.see_doctor_when}`);
    if (a.sources?.length) parts.push(`المصادر: ${a.sources.map((s) => s.title).join('، ')}`);
    return parts.filter(Boolean).join('\n');
  } catch {
    return raw;
  }
}
