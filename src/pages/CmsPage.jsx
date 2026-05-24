import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { cmsContentItems, cmsSections } from '../data/mockData';

const statusTone = {
  منشور: 'success',
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
};

export function CmsPage() {
  const [sectionId, setSectionId] = useState('curriculum');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);

  const sectionItems = useMemo(
    () => cmsContentItems.filter((i) => i.sectionId === sectionId),
    [sectionId],
  );

  const selected = sectionItems.find((i) => i.id === selectedId) ?? sectionItems[0] ?? null;

  useEffect(() => {
    if (sectionItems.length > 0) {
      setSelectedId(sectionItems[0].id);
    } else {
      setSelectedId(null);
    }
  }, [sectionId, sectionItems]);

  useEffect(() => {
    if (selected) setDraft({ ...selected });
    else setDraft(null);
  }, [selected?.id]);

  const updateDraft = (field, value) => {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  };

  return (
    <div className="page-stack">
      <PageHeader title="إدارة المحتوى الثابت (CMS)" />

      <InfoBanner tone="info">
        UI فقط — لا rich text editor ولا حفظ. المحتوى من curriculum_about_content و
        how_to_teach_content و parenting_articles و family_rules_screen.
      </InfoBanner>

      <div className="cms-layout">
        <aside className="cms-sidebar">
          {cmsSections.map((s) => (
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
              title={cmsSections.find((s) => s.id === sectionId)?.label ?? 'المحتوى'}
            />
            <AdminTableContainer style={{ maxHeight: 200 }}>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>النوع</th>
                    <th>اللغة</th>
                    <th>آخر تعديل</th>
                    <th>الحالة</th>
                    <th>يظهر عند</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionItems.map((item) => (
                    <tr
                      key={item.id}
                      className={selectedId === item.id ? 'selected' : ''}
                      onClick={() => setSelectedId(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ maxWidth: 160 }}>{item.title}</td>
                      <td>{item.contentType}</td>
                      <td>{item.language}</td>
                      <td>{item.lastModified}</td>
                      <td>
                        <StatusBadge tone={statusTone[item.status]}>{item.status}</StatusBadge>
                      </td>
                      <td style={{ fontSize: '0.72rem' }}>{item.showsWhen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          </AdminCard>

          {draft && (
            <div className="grid-2 cms-editor-row">
              <AdminCard>
                <SectionHeader title="محرر (شكلي)" />
                <label className="cms-field">
                  العنوان
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => updateDraft('title', e.target.value)}
                  />
                </label>
                <label className="cms-field">
                  العنوان الفرعي
                  <input
                    type="text"
                    value={draft.subtitle}
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
                <label className="cms-field">
                  الوسوم (Tags)
                  <input
                    type="text"
                    value={draft.tags.join('، ')}
                    onChange={(e) =>
                      updateDraft(
                        'tags',
                        e.target.value.split(/،|,/).map((t) => t.trim()).filter(Boolean),
                      )
                    }
                  />
                </label>
                <label className="cms-field">
                  الجمهور المستهدف
                  <input
                    type="text"
                    value={draft.targetAudience}
                    onChange={(e) => updateDraft('targetAudience', e.target.value)}
                  />
                </label>
                <label className="cms-field">
                  مكان الظهور
                  <input
                    type="text"
                    value={draft.placement}
                    onChange={(e) => updateDraft('placement', e.target.value)}
                  />
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <MockActionButton action="save">حفظ مسودة</MockActionButton>
                  <MockActionButton variant="outline">معاينة</MockActionButton>
                  <MockActionButton variant="secondary" action="publish">نشر</MockActionButton>
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
                  <p style={{ marginTop: 16, fontSize: '0.8rem' }}>
                    {draft.tags.map((t) => (
                      <span key={t} className="page-header__chip" style={{ marginLeft: 6 }}>
                        #{t}
                      </span>
                    ))}
                  </p>
                  <p className="text-caption" style={{ marginTop: 12 }}>
                    يظهر عند: {draft.showsWhen}
                  </p>
                </article>
              </AdminCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
