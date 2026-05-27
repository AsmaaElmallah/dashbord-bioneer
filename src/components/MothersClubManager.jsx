import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { InfoBanner } from './InfoBanner';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { mothersClubPosts as mockPosts } from '../data/mockData';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  PUBLISH_STATUS_LABEL,
  PUBLISH_STATUS_TONE,
  deleteClubPost,
  fetchAllClubPosts,
  fetchClubCategories,
  translateMothersClubError,
  updateClubPostStatus,
  uploadClubPostImage,
  upsertStaffClubPost,
} from '../services/supabase/mothersClubService';
import { ImageFilePick } from './ImageFilePick';

const statusFilters = [
  ['all', 'الكل'],
  ['review', 'للمراجعة'],
  ['published', 'منشور'],
  ['archived', 'مخفي'],
];

const emptyDraft = () => ({
  title: '',
  body: '',
  tag: '',
  categoryId: '',
  authorDisplayName: 'فريق بيانور',
  imageFile: null,
});

export function MothersClubManager() {
  const { needsLogin } = useAuth();
  const { showMock, showSuccess, showError } = useSnackbar();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const useRemote = isSupabaseEnabled;

  const reload = useCallback(async () => {
    if (!useRemote) {
      setPosts(
        mockPosts.map((p) => ({
          ...p,
          publishStatus:
            p.status === 'منشور'
              ? 'published'
              : p.status === 'مخفي'
                ? 'archived'
                : 'review',
          body: '',
          categoryId: null,
          createdAt: null,
        })),
      );
      return;
    }

    setLoading(true);
    const [{ data: postRows, error: postErr }, { data: catRows }] = await Promise.all([
      fetchAllClubPosts(),
      fetchClubCategories(),
    ]);
    setLoading(false);

    if (postErr) {
      showError(translateMothersClubError(postErr.message));
      return;
    }

    setPosts(postRows ?? []);
    setCategories(catRows ?? []);
    setSelectedId((prev) =>
      prev && postRows?.some((p) => p.id === prev) ? prev : postRows?.[0]?.id ?? null,
    );
  }, [useRemote, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return posts;
    return posts.filter((p) => p.publishStatus === statusFilter);
  }, [posts, statusFilter]);

  const selected = posts.find((p) => p.id === selectedId);

  const runAction = async (label, fn) => {
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    if (!useRemote) {
      showMock(`${label} — mock فقط`);
      return;
    }
    setSaving(true);
    const { error } = await fn();
    setSaving(false);
    if (error) {
      showError(translateMothersClubError(error.message));
      return;
    }
    showSuccess(label);
    await reload();
  };

  const publishSelected = () =>
    runAction('تم النشر', () => updateClubPostStatus(selectedId, 'published'));

  const hideSelected = () =>
    runAction('تم الإخفاء', () => updateClubPostStatus(selectedId, 'archived'));

  const sendToReview = () =>
    runAction('أُعيد للمراجعة', () => updateClubPostStatus(selectedId, 'review'));

  const deleteSelected = () => {
    if (!selectedId || !window.confirm('حذف المنشور نهائياً؟')) return;
    runAction('تم الحذف', () => deleteClubPost(selectedId));
  };

  const saveNewPost = async () => {
    if (!draft.title.trim() || draft.body.trim().length < 10) {
      showError('أدخلي عنواناً ونصاً كافياً.');
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    if (!useRemote) {
      showMock('حفظ المنشور — mock');
      return;
    }

    setSaving(true);
    const postId = crypto.randomUUID();
    let imagePath = null;

    if (draft.imageFile) {
      const { path, error: upErr } = await uploadClubPostImage(draft.imageFile, postId);
      if (upErr) {
        setSaving(false);
        showError(translateMothersClubError(upErr.message));
        return;
      }
      imagePath = path;
    }

    const { error } = await upsertStaffClubPost({
      id: postId,
      title: draft.title,
      body: draft.body,
      tag: draft.tag,
      categoryId: draft.categoryId || null,
      authorDisplayName: draft.authorDisplayName,
      publishStatus: 'published',
      imageStoragePath: imagePath,
    });
    setSaving(false);

    if (error) {
      showError(translateMothersClubError(error.message));
      return;
    }

    showSuccess('تم نشر المنشور');
    setDraft(emptyDraft());
    setShowForm(false);
    await reload();
  };

  return (
    <>
      {!useRemote && (
        <InfoBanner>
          Supabase غير مفعّل — يُعرض mock. أضيفي VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.
        </InfoBanner>
      )}

      <div className="tabs" style={{ marginBottom: 12 }}>
        {statusFilters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${statusFilter === id ? 'active' : ''}`}
            onClick={() => setStatusFilter(id)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="tab"
          style={{ marginInlineStart: 'auto' }}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'إلغاء' : '+ منشور من الإدارة'}
        </button>
      </div>

      {showForm && (
        <AdminCard style={{ marginBottom: 16 }}>
          <SectionHeader title="منشور جديد (ينشر مباشرة)" />
          <div className="form-grid">
            <label>
              العنوان
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </label>
            <label>
              الوسم
              <input
                value={draft.tag}
                onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}
                placeholder="#تغذية_الطفل"
              />
            </label>
            <label>
              الكاتب (ظاهر للأمهات)
              <input
                value={draft.authorDisplayName}
                onChange={(e) => setDraft((d) => ({ ...d, authorDisplayName: e.target.value }))}
              />
            </label>
            {categories.length > 0 && (
              <label>
                التصنيف
                <select
                  value={draft.categoryId}
                  onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="span-2">
              النص
              <textarea
                rows={4}
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              />
            </label>
            {useRemote && (
              <div className="span-2">
                <ImageFilePick
                  label="صورة المنشور (اختياري)"
                  file={draft.imageFile}
                  onPick={(file) => setDraft((d) => ({ ...d, imageFile: file }))}
                />
              </div>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn--primary" disabled={saving} onClick={saveNewPost}>
              {saving ? 'جاري الحفظ…' : 'نشر الآن'}
            </button>
          </div>
        </AdminCard>
      )}

      <div className="grid-2">
        <AdminCard>
          <SectionHeader
            title={useRemote ? 'منشورات نادي الأمهات (Supabase)' : 'منشورات نادي الأمهات (mock)'}
          />
          {loading ? (
            <p className="text-caption">جاري التحميل…</p>
          ) : filtered.length === 0 ? (
            <EmptyState title="لا منشورات" description="لا توجد منشورات بهذا الفلتر." compact />
          ) : (
            <AdminTableContainer>
              <table className="admin-table admin-table--compact admin-table--cards">
                <thead>
                  <tr>
                    <th>الكاتب</th>
                    <th>الوسم</th>
                    <th>العنوان</th>
                    <th>♥</th>
                    <th>💬</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className={selectedId === p.id ? 'selected' : ''}
                      onClick={() => setSelectedId(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td data-label="الكاتب">{p.author}</td>
                      <td data-label="الوسم">{p.tag || '—'}</td>
                      <td data-label="العنوان">{p.title}</td>
                      <td data-label="إعجابات">{p.likes}</td>
                      <td data-label="تعليقات">{p.comments}</td>
                      <td data-label="الحالة">
                        <StatusBadge tone={PUBLISH_STATUS_TONE[p.publishStatus] ?? 'info'}>
                          {PUBLISH_STATUS_LABEL[p.publishStatus] ?? p.status}
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
          <SectionHeader title="تفاصيل المنشور" />
          {selected ? (
            <>
              <h4 style={{ margin: '0 0 8px' }}>{selected.title}</h4>
              <p className="text-caption" style={{ marginBottom: 8 }}>
                {selected.author} · {selected.tag || 'بدون وسم'}
                {selected.imageStoragePath ? ' · 📷 صورة' : ''}
              </p>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {selected.body || '(لا نص في mock)'}
              </p>
              <p className="text-caption" style={{ marginTop: 8 }}>
                {selected.likes} إعجاب · {selected.comments} تعليق
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {selected.publishStatus !== 'published' && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={saving}
                    onClick={publishSelected}
                  >
                    نشر
                  </button>
                )}
                {selected.publishStatus === 'published' && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={saving}
                    onClick={hideSelected}
                  >
                    إخفاء
                  </button>
                )}
                {selected.publishStatus !== 'review' && (
                  <button
                    type="button"
                    className="btn btn--outline"
                    disabled={saving}
                    onClick={sendToReview}
                  >
                    مراجعة
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--outline"
                  disabled={saving}
                  onClick={deleteSelected}
                >
                  حذف
                </button>
                <button type="button" className="btn btn--ghost" disabled={loading} onClick={reload}>
                  تحديث
                </button>
              </div>
            </>
          ) : (
            <p className="text-caption">اختر منشوراً من الجدول.</p>
          )}
        </AdminCard>
      </div>
    </>
  );
}
