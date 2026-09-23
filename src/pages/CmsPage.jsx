import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  CMS_SECTIONS,
  fetchCmsArticles,
  publishCmsArticle,
  upsertCmsArticle,
} from '../services/supabase/cmsService';

const statusTone = {
  منشور: 'success',
  مسودة: 'muted',
  'قيد المراجعة': 'warning',
  مؤرشف: 'muted',
};

function emptyDraft(sectionId) {
  const id = `cms_${sectionId}_${Date.now()}`;
  return {
    id,
    slug: id,
    title: '',
    body: '',
    sectionId,
    sortOrder: 0,
    publishStatus: 'مسودة',
    subtitle: '',
  };
}

export function CmsPage() {
  const { showMock } = useSnackbar();
  const showError = showMock;
  const [sectionId, setSectionId] = useState('parent_culture');
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error, offline } = await fetchCmsArticles();
    setLoading(false);
    if (offline) {
      showError('Supabase غير مفعّل');
      setItems([]);
      return;
    }
    if (error) {
      showError(error.message ?? 'تعذّر تحميل CMS');
      setItems([]);
      return;
    }
    setItems(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const sectionItems = useMemo(
    () => items.filter((i) => i.sectionId === sectionId),
    [items, sectionId],
  );

  useEffect(() => {
    if (sectionItems.length > 0) {
      setSelectedId(sectionItems[0].id);
    } else {
      setSelectedId(null);
      setDraft(null);
    }
  }, [sectionId, sectionItems]);

  useEffect(() => {
    const selected = sectionItems.find((i) => i.id === selectedId) ?? null;
    if (selected) {
      setDraft({ ...selected, subtitle: selected.slug ?? '' });
    }
  }, [selectedId, sectionItems]);

  const updateDraft = (field, value) => {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  };

  const handleNew = () => {
    const d = emptyDraft(sectionId);
    setDraft(d);
    setSelectedId(d.id);
  };

  const handleSave = async () => {
    if (!draft?.title?.trim()) {
      showError('أدخلي عنواناً');
      return;
    }
    setSaving(true);
    const payload = {
      ...draft,
      slug: draft.subtitle?.trim() || draft.slug || draft.id,
      publishStatus: draft.publishStatus || 'مسودة',
    };
    const { error } = await upsertCmsArticle(payload);
    setSaving(false);
    if (error) {
      showError(error.message ?? 'تعذّر الحفظ');
      return;
    }
    showMock('تم الحفظ على السحابة');
    await load();
    setSelectedId(payload.id);
  };

  const handlePublish = async () => {
    if (!draft?.id) return;
    setSaving(true);
    await upsertCmsArticle({ ...draft, publishStatus: 'منشور' });
    const { error } = await publishCmsArticle(draft.id);
    setSaving(false);
    if (error) {
      showError(error.message ?? 'تعذّر النشر');
      return;
    }
    showMock('تم النشر للتطبيق');
    await load();
  };

  return (
    <div className="page-stack">
      <PageHeader title="إدارة المحتوى الثابت (CMS)" />
      <InfoBanner tone="info">
        الأقسام: ثقافة الأمهات · الثقافة الصحية · كيف أدرّس — تُحفظ في جدول cms_articles وتنشر للتطبيق.
      </InfoBanner>

      <div className="cms-layout">
        <aside className="cms-sidebar">
          {CMS_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`cms-sidebar__btn${sectionId === s.id ? ' cms-sidebar__btn--active' : ''}`}
              onClick={() => setSectionId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </aside>

        <div className="cms-main">
          <AdminCard>
            <SectionHeader
              title={CMS_SECTIONS.find((s) => s.id === sectionId)?.label ?? 'المحتوى'}
              action={
                <button type="button" className="btn btn--primary" onClick={handleNew}>
                  مقالة جديدة
                </button>
              }
            />
            {loading ? (
              <p>جاري التحميل من Supabase…</p>
            ) : (
              <AdminTableContainer style={{ maxHeight: 200 }}>
                <table className="admin-table admin-table--compact">
                  <thead>
                    <tr>
                      <th>العنوان</th>
                      <th>Slug</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionItems.length === 0 ? (
                      <tr>
                        <td colSpan={3}>لا مقالات في هذا القسم بعد</td>
                      </tr>
                    ) : (
                      sectionItems.map((item) => (
                        <tr
                          key={item.id}
                          className={selectedId === item.id ? 'selected' : ''}
                          onClick={() => setSelectedId(item.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ maxWidth: 160 }}>{item.title}</td>
                          <td>{item.slug}</td>
                          <td>
                            <StatusBadge tone={statusTone[item.publishStatus]}>
                              {item.publishStatus}
                            </StatusBadge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </AdminTableContainer>
            )}
          </AdminCard>

          {draft && (
            <div className="grid-2 cms-editor-row">
              <AdminCard>
                <SectionHeader title="محرر" />
                <label className="cms-field">
                  العنوان
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => updateDraft('title', e.target.value)}
                  />
                </label>
                <label className="cms-field">
                  العنوان الفرعي / slug
                  <input
                    type="text"
                    value={draft.subtitle ?? draft.slug ?? ''}
                    onChange={(e) => updateDraft('subtitle', e.target.value)}
                  />
                </label>
                <label className="cms-field">
                  المحتوى
                  <textarea
                    rows={8}
                    value={draft.body}
                    onChange={(e) => updateDraft('body', e.target.value)}
                  />
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? 'جاري الحفظ…' : 'حفظ على السحابة'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={saving}
                    onClick={handlePublish}
                  >
                    نشر للتطبيق
                  </button>
                </div>
              </AdminCard>

              <AdminCard className="cms-article-preview">
                <SectionHeader title="معاينة — كما للمستخدم" />
                <article>
                  <h2 style={{ margin: '0 0 8px', fontSize: '1.15rem' }}>{draft.title}</h2>
                  <p
                    style={{
                      margin: '0 0 12px',
                      color: 'var(--on-surface-variant)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {draft.subtitle}
                  </p>
                  <div
                    style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: '0.92rem',
                    }}
                  >
                    {draft.body}
                  </div>
                </article>
              </AdminCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
