import { useEffect, useMemo, useState } from 'react';

import { Upload } from 'lucide-react';

import { AdminCard } from '../components/AdminCard';

import { AdminTableContainer } from '../components/AdminTableContainer';

import { EmptyState } from '../components/EmptyState';

import { InfoBanner } from '../components/InfoBanner';

import { MockActionButton } from '../components/MockActionButton';

import { MockLoading } from '../components/MockLoading';

import { PageHeader } from '../components/PageHeader';

import { SectionHeader } from '../components/SectionHeader';

import { StatCard } from '../components/StatCard';

import { StatusBadge } from '../components/StatusBadge';

import {

  assetFiles,

  assetManagerSummary,

  assetSections,

} from '../data/mockData';



const statusTone = {

  موجود: 'success',

  ناقص: 'error',

  'غير مستخدم': 'muted',

};



const previewLabel = {

  image: 'معاينة صورة',

  audio: 'معاينة صوت',

  video: 'معاينة فيديو',

  file: 'ملف / manifest',

};



export function AssetsPage() {

  const [sectionId, setSectionId] = useState('all');

  const [selectedId, setSelectedId] = useState(assetFiles[0]?.id ?? null);

  const [loading, setLoading] = useState(false);



  const filtered = useMemo(() => {

    if (sectionId === 'all') return assetFiles;

    return assetFiles.filter((a) => a.sectionId === sectionId);

  }, [sectionId]);



  useEffect(() => {

    setLoading(true);

    const t = window.setTimeout(() => setLoading(false), 600);

    return () => window.clearTimeout(t);

  }, [sectionId]);



  const selected = assetFiles.find((a) => a.id === selectedId) ?? filtered[0] ?? null;



  const summary = assetManagerSummary;



  return (

    <div className="page-stack">

      <PageHeader title="إدارة الملفات والأصول" />



      <InfoBanner tone="warning">

        فيديوهات onboarding غير موجودة حالياً إلا <code>.gitkeep</code> في{' '}

        <code>assets/videos/</code>.

      </InfoBanner>

      <InfoBanner tone="warning">

        ملفات mp3 للقرآن غير موجودة حالياً — الموجود{' '}

        <code>half_hizb_manifest.json</code> فقط تحت{' '}

        <code>assets/audio/quran/</code>.

      </InfoBanner>



      <div className="grid-4">

        <StatCard label={summary.images.label} value={String(summary.images.count)} sub={summary.images.note} />

        <StatCard label={summary.audio.label} value={String(summary.audio.count)} sub={summary.audio.note} />

        <StatCard label={summary.videos.label} value={String(summary.videos.count)} sub={summary.videos.note} />

        <StatCard label={summary.manifests.label} value={String(summary.manifests.count)} sub={summary.manifests.note} />

      </div>

      <StatCard

        label={summary.missing.label}

        value={String(summary.missing.count)}

        sub={summary.missing.note}

      />



      <div className="asset-upload-mock">

        <Upload size={32} strokeWidth={1.5} />

        <p style={{ margin: '8px 0 0', fontWeight: 700 }}>اسحب الملفات هنا</p>

        <p className="text-caption">رفع وهمي — لا يعمل فعلياً (UI فقط)</p>

        <MockActionButton variant="outline" action="save" style={{ marginTop: 12 }}>

          رفع ملف (mock)

        </MockActionButton>

      </div>



      <div className="grid-2">

        <AdminCard>

          <SectionHeader title="جدول الأصول" />

          <div className="filters-row" style={{ marginBottom: 12 }}>

            <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>

              <option value="all">كل الأقسام</option>

              {assetSections.map((s) => (

                <option key={s.id} value={s.id}>

                  {s.label}

                </option>

              ))}

            </select>

            <MockActionButton variant="outline" action="check">

              فحص الملفات الناقصة

            </MockActionButton>

          </div>

          {loading ? (

            <MockLoading label="جاري تحميل قائمة الأصول…" />

          ) : filtered.length === 0 ? (

            <EmptyState

              title="لا توجد ملفات مرفوعة"

              description={

                sectionId === 'uploads'

                  ? 'لم يُرفع أي ملف بعد — الرفع mock فقط.'

                  : 'لا أصول في هذا القسم — جرّبي قسمًا آخر.'

              }

            />

          ) : (

            <AdminTableContainer style={{ maxHeight: 360 }}>

              <table className="admin-table admin-table--compact">

                <thead>

                  <tr>

                    <th>الاسم</th>

                    <th>النوع</th>

                    <th>المسار</th>

                    <th>الحجم</th>

                    <th>مرتبط بـ</th>

                    <th>الحالة</th>

                  </tr>

                </thead>

                <tbody>

                  {filtered.map((a) => (

                    <tr

                      key={a.id}

                      className={selected?.id === a.id ? 'selected' : ''}

                      onClick={() => setSelectedId(a.id)}

                      style={{ cursor: 'pointer' }}

                    >

                      <td>{a.name}</td>

                      <td>{a.type}</td>

                      <td>

                        <code className="cell-path">{a.path}</code>

                      </td>

                      <td>{a.size}</td>

                      <td style={{ fontSize: '0.75rem' }} className="text-break">{a.linkedTo}</td>

                      <td>

                        <StatusBadge tone={statusTone[a.status]}>{a.status}</StatusBadge>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </AdminTableContainer>

          )}

          <p className="text-caption" style={{ marginTop: 8 }}>

            أقسام: {assetSections.map((s) => s.label).join(' · ')}

          </p>

        </AdminCard>



        <AdminCard>

          <SectionHeader title="معاينة الأصل" />

          {selected ? (

            <>

              <div className="asset-preview-box">

                {previewLabel[selected.previewKind]}

              </div>

              <p>

                <strong>{selected.name}</strong> ({selected.type})

              </p>

              <p>

                <code className="cell-path text-break">{selected.path}</code>

              </p>

              <p>

                <strong>الحجم:</strong> {selected.size}

              </p>

              <p className="text-break">

                <strong>الربط:</strong> {selected.linkedTo}

              </p>

              <StatusBadge tone={statusTone[selected.status]}>{selected.status}</StatusBadge>

            </>

          ) : (

            <EmptyState

              title="لا توجد ملفات مرفوعة"

              description="اختر قسم «ملفات مرفوعة» أو ملفاً من الجدول."

              compact

            />

          )}

          <p className="text-caption" style={{ marginTop: 16 }}>

            أدوات المشروع: <code>tools/export_math_slides.ps1</code>،{' '}

            <code>tools/rebuild_curriculum_manifest.ps1</code>

          </p>

        </AdminCard>

      </div>

    </div>

  );

}


