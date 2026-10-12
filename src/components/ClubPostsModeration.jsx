import { BadgeCheck, Check, MessageCircle, Pin, PinOff, Trash2, X } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { AdminTableContainer } from './AdminTableContainer';
import { StatusBadge } from './StatusBadge';
import { libraryAgeBands } from '../data/libraryAgeBands';
import {
  addExpertReply,
  clubAgeLabel,
  clubImageUrl,
  deleteClubComment,
  deleteClubPost,
  fetchClubComments,
  fetchProfileNames,
  publishClubPost,
  rejectClubPost,
  setClubPostCategory,
  setClubPostPinned,
} from '../services/supabase/communityService';

const statusView = {
  published: { tone: 'success', label: 'منشور' },
  review: { tone: 'warning', label: 'مستني مراجعة' },
  draft: { tone: 'warning', label: 'مستني مراجعة' },
  archived: { tone: 'muted', label: 'مرفوض' },
};

const filters = [
  ['review', 'مستني مراجعة'],
  ['published', 'منشور'],
  ['archived', 'مرفوض'],
  ['all', 'الكل'],
];

const isPending = (p) => p.publish_status === 'review' || p.publish_status === 'draft';

/** جدول منشورات نادي الأمهات: مراجعة أسئلة الأمهات، العمر، والردود. */
export function ClubPostsModeration({ rows, onChanged, notify }) {
  const pendingCount = rows.filter(isPending).length;
  const [filter, setFilter] = useState(pendingCount > 0 ? 'review' : 'all');
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [realNames, setRealNames] = useState({});
  const [expertDraft, setExpertDraft] = useState('');
  const [expertName, setExpertName] = useState('أخصائية بيانور');
  const [sendingExpert, setSendingExpert] = useState(false);

  useEffect(() => {
    const ids = rows.filter((p) => p.is_anonymous).map((p) => p.author_id);
    fetchProfileNames(ids).then(setRealNames);
  }, [rows]);

  const sendExpertReply = async (post) => {
    if (expertDraft.trim().length < 2) {
      notify('اكتبي الرد الأول');
      return;
    }
    if (post.publish_status !== 'published') {
      notify('انشري المنشور الأول عشان تقدري تردي عليه');
      return;
    }
    setSendingExpert(true);
    const { error } = await addExpertReply(post.id, expertDraft, expertName);
    setSendingExpert(false);
    if (error) {
      notify(error.message ?? 'تعذّر إرسال الرد');
      return;
    }
    setExpertDraft('');
    notify('رد الأخصائية اتنشر ✓ والأم هيوصلها تحديث');
    await loadComments(post.id);
    await onChanged();
  };

  const visible = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'review') return rows.filter(isPending);
    return rows.filter((p) => p.publish_status === filter);
  }, [rows, filter]);

  const run = async (id, action, okMessage) => {
    setBusyId(id);
    const { error } = await action();
    setBusyId(null);
    if (error) {
      notify(error.message ?? 'تعذّر التنفيذ');
      return;
    }
    if (okMessage) notify(okMessage);
    await onChanged();
  };

  const loadComments = async (postId) => {
    setLoadingComments(true);
    const { data, error } = await fetchClubComments(postId);
    setLoadingComments(false);
    if (error) notify('تعذّر تحميل الردود — اتأكدي إن SQL نادي الأمهات اتشغّل');
    setComments(data);
  };

  const toggleComments = async (postId) => {
    if (openId === postId) {
      setOpenId(null);
      return;
    }
    setOpenId(postId);
    setComments([]);
    setExpertDraft('');
    await loadComments(postId);
  };

  const removeComment = async (postId, commentId) => {
    if (!window.confirm('حذف الرد ده؟')) return;
    const { error } = await deleteClubComment(commentId);
    if (error) {
      notify(error.message ?? 'تعذّر حذف الرد');
      return;
    }
    await loadComments(postId);
    await onChanged();
  };

  return (
    <>
      <div className="tabs" style={{ marginBottom: 12 }}>
        {filters.map(([id, label]) => (
          <button key={id} type="button" className={`tab ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
            {label}
            {id === 'review' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
      </div>

      <AdminTableContainer>
        <table className="admin-table">
          <thead>
            <tr>
              <th>السؤال</th>
              <th>الكاتبة</th>
              <th>العمر</th>
              <th>تفاعل</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6}>{filter === 'review' ? 'مفيش أسئلة مستنية مراجعة 👌' : 'مفيش منشورات هنا'}</td>
              </tr>
            ) : (
              visible.map((p) => {
                const status = statusView[p.publish_status] ?? { tone: 'muted', label: p.publish_status };
                const busy = busyId === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr>
                      <td style={{ maxWidth: 340 }}>
                        <div style={{ fontWeight: 700 }}>
                          {p.is_pinned && <Pin size={14} style={{ verticalAlign: 'middle', marginInlineEnd: 4 }} />}
                          {p.title}
                          {p.has_expert_reply && (
                            <BadgeCheck size={14} color="#1e6b3a" style={{ verticalAlign: 'middle', marginInlineStart: 4 }} />
                          )}
                        </div>
                        <div className="text-caption" style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>
                          {p.body?.length > 280 ? `${p.body.slice(0, 280)}…` : p.body}
                        </div>
                        {clubImageUrl(p.image_storage_path) && (
                          <a href={clubImageUrl(p.image_storage_path)} target="_blank" rel="noreferrer">
                            <img
                              src={clubImageUrl(p.image_storage_path)}
                              alt="صورة السؤال"
                              style={{ marginTop: 6, maxWidth: 180, maxHeight: 120, borderRadius: 8, objectFit: 'cover' }}
                            />
                          </a>
                        )}
                        <div className="text-caption" style={{ marginTop: 4 }}>{p.created_at?.slice?.(0, 16).replace('T', ' ')}</div>
                      </td>
                      <td>
                        {p.is_anonymous ? (
                          <>
                            <StatusBadge tone="muted">بدون اسم</StatusBadge>
                            <div className="text-caption" title="ظاهر للإدارة بس">
                              {realNames[p.author_id] ? `(${realNames[p.author_id]})` : ''}
                            </div>
                          </>
                        ) : (
                          (p.author_display_name ?? '—')
                        )}
                      </td>
                      <td>
                        <select
                          value={p.category_id && clubAgeLabel(p.category_id) ? p.category_id : ''}
                          onChange={(e) => run(p.id, () => setClubPostCategory(p.id, e.target.value))}
                        >
                          <option value="">بدون عمر</option>
                          {libraryAgeBands.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        ❤️ {p.likes_count ?? 0} · 💬 {p.comments_count ?? 0}
                      </td>
                      <td>
                        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {p.publish_status !== 'published' && (
                            <button
                              type="button"
                              className="mock-btn mock-btn--primary"
                              style={{ padding: '4px 10px' }}
                              disabled={busy}
                              onClick={() => run(p.id, () => publishClubPost(p.id), 'اتنشر للأمهات')}
                            >
                              <Check size={14} /> نشر
                            </button>
                          )}
                          {p.publish_status !== 'archived' && (
                            <button
                              type="button"
                              className="mock-btn mock-btn--outline"
                              style={{ padding: '4px 10px' }}
                              disabled={busy}
                              onClick={() => run(p.id, () => rejectClubPost(p.id), 'اترفض ومش هيظهر للأمهات')}
                            >
                              <X size={14} /> {p.publish_status === 'published' ? 'إخفاء' : 'رفض'}
                            </button>
                          )}
                          <button
                            type="button"
                            className="mock-btn mock-btn--outline"
                            style={{ padding: '4px 10px' }}
                            onClick={() => toggleComments(p.id)}
                          >
                            <MessageCircle size={14} /> الردود
                          </button>
                          {p.publish_status === 'published' && (
                            <button
                              type="button"
                              className="mock-btn mock-btn--outline"
                              style={{ padding: '4px 10px' }}
                              disabled={busy}
                              title={p.is_pinned ? 'إلغاء التثبيت' : 'يظهر أول حاجة في النادي'}
                              onClick={() =>
                                run(
                                  p.id,
                                  () => setClubPostPinned(p.id, !p.is_pinned),
                                  p.is_pinned ? 'اتلغى التثبيت' : 'اتثبّت فوق في النادي 📌',
                                )
                              }
                            >
                              {p.is_pinned ? <PinOff size={14} /> : <Pin size={14} />} {p.is_pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                            </button>
                          )}
                          <button
                            type="button"
                            className="mock-btn mock-btn--danger"
                            style={{ padding: '4px 10px' }}
                            disabled={busy}
                            onClick={() => {
                              if (window.confirm('حذف المنشور نهائياً مع كل ردوده؟')) {
                                run(p.id, () => deleteClubPost(p.id), 'اتحذف');
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {openId === p.id && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--surface-muted, #faf6f1)' }}>
                          {loadingComments ? (
                            <span className="text-caption">جاري تحميل الردود…</span>
                          ) : comments.length === 0 ? (
                            <span className="text-caption">مفيش ردود على المنشور ده.</span>
                          ) : (
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                              {comments.map((c) => (
                                <li key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    {c.is_expert && (
                                      <BadgeCheck size={14} color="#1e6b3a" style={{ verticalAlign: 'middle', marginInlineEnd: 4 }} />
                                    )}
                                    <strong style={c.is_expert ? { color: '#1e6b3a' } : undefined}>
                                      {c.author_display_name || 'أم'}
                                    </strong>
                                    <span className="text-caption"> · {c.created_at?.slice?.(0, 16).replace('T', ' ')}</span>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{c.body}</div>
                                  </div>
                                  <button
                                    type="button"
                                    className="mock-btn mock-btn--outline"
                                    style={{ padding: '4px 8px' }}
                                    onClick={() => removeComment(p.id, c.id)}
                                    aria-label="حذف الرد"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                          {p.publish_status === 'published' && (
                            <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
                              <strong style={{ color: '#1e6b3a' }}>
                                <BadgeCheck size={14} style={{ verticalAlign: 'middle' }} /> رد الأخصائية
                              </strong>
                              <input
                                type="text"
                                value={expertName}
                                onChange={(e) => setExpertName(e.target.value)}
                                placeholder="الاسم اللي يظهر (مثلاً: د. سارة — أخصائية تغذية)"
                              />
                              <textarea
                                rows={3}
                                value={expertDraft}
                                onChange={(e) => setExpertDraft(e.target.value)}
                                placeholder="اكتبي الرد… هيظهر أول رد وعليه علامة «رد الأخصائية ✓»"
                              />
                              <div>
                                <button
                                  type="button"
                                  className="mock-btn mock-btn--primary"
                                  disabled={sendingExpert}
                                  onClick={() => sendExpertReply(p)}
                                >
                                  {sendingExpert ? 'جاري النشر…' : 'نشر رد الأخصائية'}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </AdminTableContainer>
    </>
  );
}
