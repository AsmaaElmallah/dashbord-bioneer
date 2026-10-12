import { Check, Flag, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  deleteClubComment,
  deleteClubPost,
  fetchClubReports,
  rejectClubPost,
  resolveClubReport,
} from '../services/supabase/communityService';

/** بلاغات الأمهات على منشورات أو ردود النادي. */
export function ClubReportsPanel({ notify, onChanged }) {
  const [reports, setReports] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await fetchClubReports();
    if (!error) setReports(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (report, action, message) => {
    setBusyId(report.id);
    const { error } = await action();
    if (!error) await resolveClubReport(report.id);
    setBusyId(null);
    if (error) {
      notify(error.message ?? 'تعذّر التنفيذ');
      return;
    }
    notify(message);
    await load();
    await onChanged();
  };

  if (reports.length === 0) return null;

  return (
    <div
      style={{
        border: '1px solid #f0c4c4',
        background: '#fff6f6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 8 }}>
        <Flag size={16} color="#c0392b" /> بلاغات محتاجة مراجعة ({reports.length})
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
        {reports.map((r) => {
          const comment = r.mothers_club_comments;
          const post = r.mothers_club_posts;
          const busy = busyId === r.id;
          return (
            <li key={r.id} style={{ background: '#fff', borderRadius: 10, padding: 10 }}>
              <div className="text-caption">
                السبب: <strong>{r.reason}</strong> · {r.created_at?.slice?.(0, 16).replace('T', ' ')}
              </div>
              <div style={{ margin: '6px 0', whiteSpace: 'pre-wrap' }}>
                {comment ? (
                  <>
                    <span className="text-caption">رد من {comment.author_display_name || 'أم'}: </span>
                    {comment.body}
                  </>
                ) : post ? (
                  <>
                    <span className="text-caption">منشور من {post.author_display_name || 'أم'}: </span>
                    <strong>{post.title}</strong> — {post.body?.slice(0, 200)}
                  </>
                ) : (
                  <span className="text-caption">المحتوى اتحذف خلاص.</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {comment && (
                  <button
                    type="button"
                    className="mock-btn mock-btn--danger"
                    style={{ padding: '4px 10px' }}
                    disabled={busy}
                    onClick={() => act(r, () => deleteClubComment(comment.id), 'الرد اتحذف')}
                  >
                    <Trash2 size={14} /> حذف الرد
                  </button>
                )}
                {!comment && post && (
                  <>
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      style={{ padding: '4px 10px' }}
                      disabled={busy}
                      onClick={() => act(r, () => rejectClubPost(post.id), 'المنشور اتخفى')}
                    >
                      إخفاء المنشور
                    </button>
                    <button
                      type="button"
                      className="mock-btn mock-btn--danger"
                      style={{ padding: '4px 10px' }}
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm('حذف المنشور نهائياً؟')) act(r, () => deleteClubPost(post.id), 'المنشور اتحذف');
                      }}
                    >
                      <Trash2 size={14} /> حذف
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  style={{ padding: '4px 10px' }}
                  disabled={busy}
                  onClick={() => act(r, async () => ({ error: null }), 'البلاغ اتقفل من غير تغيير')}
                >
                  <Check size={14} /> مفيش مشكلة
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
