import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { assetFiles, assetManagerSummary, assetSections } from '../data/mockData';
import {
  listAdminAssets,
  removeAdminAsset,
  uploadAdminAsset,
} from '../services/supabase/assetsService';

const statusTone = {
  موجود: 'success',
  ناقص: 'error',
  'غير مستخدم': 'muted',
};

export function AssetsPage() {
  const { showMock } = useSnackbar();
  const fileRef = useRef(null);
  const [sectionId, setSectionId] = useState('all');
  const [remoteFiles, setRemoteFiles] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const cloud = isSupabaseEnabled && remoteFiles != null;
  const files = cloud ? remoteFiles : assetFiles;

  const filtered = useMemo(() => {
    if (sectionId === 'all') return files;
    return files.filter((a) => a.sectionId === sectionId || a.kind === sectionId);
  }, [sectionId, files]);

  const reload = async () => {
    if (!isSupabaseEnabled) return;
    setLoading(true);
    const { data, error } = await listAdminAssets('');
    if (data) {
      setRemoteFiles(data);
      setSelectedId(data[0]?.id ?? null);
    }
    if (error) showMock(error.message ?? 'تعذّر تحميل الملفات');
    setLoading(false);
  };

  useEffect(() => {
    if (!isSupabaseEnabled) return undefined;
    reload();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected =
    filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  const summary = cloud
    ? {
        total: remoteFiles.length,
        images: remoteFiles.filter((f) => f.kind === 'image').length,
        audio: remoteFiles.filter((f) => f.kind === 'audio').length,
        video: remoteFiles.filter((f) => f.kind === 'video').length,
      }
    : assetManagerSummary;

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isSupabaseEnabled) {
      showMock('فعّلي Supabase للرفع');
      return;
    }
    setUploading(true);
    const { error } = await uploadAdminAsset(file);
    setUploading(false);
    if (error) {
      showMock(error.message ?? 'تعذّر الرفع');
      return;
    }
    showMock('تم رفع الملف إلى admin-uploads');
    await reload();
  };

  const onDelete = async () => {
    if (!selected?.path || !cloud) {
      showMock();
      return;
    }
    const { error } = await removeAdminAsset(selected.path);
    if (error) {
      showMock(error.message ?? 'تعذّر الحذف');
      return;
    }
    showMock('تم الحذف');
    await reload();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="مدير الأصول"
        extraBadges={cloud ? ['Supabase Storage'] : ['mock data']}
      />

      <InfoBanner tone="info">
        {cloud
          ? 'الملفات من bucket admin-uploads — ارفعي صوراً/صوت/فيديو للاستخدام في المحتوى.'
          : 'عرض mock — فعّلي Supabase لربط Storage الحقيقي.'}
      </InfoBanner>

      <div className="grid-4">
        <StatCard label="الإجمالي" value={String(summary.total ?? files.length)} />
        <StatCard label="صور" value={String(summary.images ?? '—')} />
        <StatCard label="صوت" value={String(summary.audio ?? '—')} />
        <StatCard label="فيديو" value={String(summary.video ?? '—')} />
      </div>

      <div className="filters-row">
        <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="all">كل الأنواع</option>
          {(cloud
            ? [
                ['image', 'صور'],
                ['audio', 'صوت'],
                ['video', 'فيديو'],
                ['file', 'ملفات'],
              ]
            : assetSections.map((s) => [s.id, s.label])
          ).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={onUpload}
          accept="image/*,audio/*,video/*,.json,.pdf"
        />
        <button
          type="button"
          className="mock-btn mock-btn--primary"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={16} /> {uploading ? 'جاري الرفع…' : 'رفع ملف'}
        </button>
        {cloud && (
          <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
            تحديث
          </button>
        )}
      </div>

      {loading && (
        <AdminCard>
          <MockLoading label="جاري تحميل الأصول…" />
        </AdminCard>
      )}

      {!loading && (
        <div className="grid-2">
          <AdminCard>
            <SectionHeader title="الملفات" />
            {filtered.length === 0 ? (
              <EmptyState title="لا ملفات" description="ارفعي ملفاً للبدء" />
            ) : (
              <AdminTableContainer>
                <table className="admin-table admin-table--compact">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>النوع</th>
                      <th>الحجم</th>
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
                        <td>{a.kind}</td>
                        <td>{a.size}</td>
                        <td>
                          <StatusBadge tone={statusTone[a.status] || 'muted'}>
                            {a.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableContainer>
            )}
          </AdminCard>

          <AdminCard className="detail-panel">
            <SectionHeader title="تفاصيل" />
            {selected ? (
              <>
                <p>
                  <strong>{selected.name}</strong>
                </p>
                <p className="text-caption">المسار: {selected.path || selected.id}</p>
                <p className="text-caption">آخر تحديث: {selected.updatedAt || '—'}</p>
                {selected.publicUrl && (
                  <p>
                    <a href={selected.publicUrl} target="_blank" rel="noreferrer">
                      فتح الرابط
                    </a>
                  </p>
                )}
                {cloud && (
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    style={{ marginTop: 12 }}
                    onClick={onDelete}
                  >
                    حذف
                  </button>
                )}
              </>
            ) : (
              <p className="text-caption">اختاري ملفاً</p>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}
