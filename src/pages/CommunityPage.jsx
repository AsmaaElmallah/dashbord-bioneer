import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  commonChildProblems,
  communityFaqItems,
  consultationRequests,
  mothersClubPosts,
  supportTicketColumns,
  supportTickets,
  supportTopics,
} from '../data/mockData';
import {
  fetchClubPosts,
  fetchCommunityFaq,
  fetchCommunityFeedback,
  fetchConsultationRequests,
  publishClubPost,
  publishCommunityFaq,
  updateConsultationStatus,
  updateFeedbackBoardStatus,
  updateFeedbackReply,
  upsertCommunityFaq,
} from '../services/supabase/communityService';

const tabs = [
  ['complaints', 'الشكاوى'],
  ['suggestions', 'الاقتراحات'],
  ['consultations', 'الاستشارات'],
  ['club', 'نادي الأمهات'],
  ['faq', 'الأسئلة الشائعة'],
  ['childProblems', 'مشاكل الأطفال الشائعة'],
];

const postTone = { منشور: 'success', مخفي: 'muted', 'يحتاج مراجعة': 'warning' };
const priorityTone = { عالية: 'error', متوسطة: 'warning', منخفضة: 'info' };
const boardTone = {
  new: 'info',
  in_review: 'warning',
  replied: 'success',
  closed: 'muted',
};

export function CommunityPage() {
  const { showMock } = useSnackbar();
  const [tab, setTab] = useState('complaints');
  const [selectedId, setSelectedId] = useState(null);

  const [faqItems, setFaqItems] = useState([]);
  const [feedbackRows, setFeedbackRows] = useState([]);
  const [consultationRows, setConsultationRows] = useState([]);
  const [clubRows, setClubRows] = useState([]);
  const [cloudReady, setCloudReady] = useState(false);
  const [faqDraft, setFaqDraft] = useState({ question: '', answer: '' });
  const [savingFaq, setSavingFaq] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [consultationNote, setConsultationNote] = useState('');

  const loadCloud = async () => {
    const [faq, feedback, consultations, club] = await Promise.all([
      fetchCommunityFaq(),
      fetchCommunityFeedback(),
      fetchConsultationRequests(),
      fetchClubPosts(),
    ]);
    if (faq.offline) {
      setCloudReady(false);
      return;
    }
    setCloudReady(true);
    if (!faq.error) setFaqItems(faq.data ?? []);
    if (!feedback.error) setFeedbackRows(feedback.data ?? []);
    if (!consultations.error) setConsultationRows(consultations.data ?? []);
    if (!club.error) setClubRows(club.data ?? []);
  };

  useEffect(() => {
    loadCloud();
  }, []);

  const ticketType = tab === 'complaints' ? 'شكوى' : tab === 'suggestions' ? 'اقتراح' : null;

  const filteredTickets = useMemo(() => {
    if (!ticketType) return [];
    return supportTickets.filter((t) => t.type === ticketType);
  }, [ticketType]);

  const selected = supportTickets.find((t) => t.id === selectedId);

  const cloudFeedback = useMemo(() => {
    if (tab === 'complaints') return feedbackRows.filter((r) => r.kind === 'complaint');
    if (tab === 'suggestions') return feedbackRows.filter((r) => r.kind === 'suggestion');
    return [];
  }, [tab, feedbackRows]);

  const selectedCloudFeedback = cloudFeedback.find((r) => r.id === selectedFeedbackId);
  const selectedConsultation = consultationRows.find((r) => r.id === selectedConsultationId);

  useEffect(() => {
    if (tab !== 'complaints' && tab !== 'suggestions') return;
    if (cloudReady) {
      if (cloudFeedback.length === 0) {
        setSelectedFeedbackId(null);
        return;
      }
      setSelectedFeedbackId((prev) =>
        prev && cloudFeedback.some((t) => t.id === prev) ? prev : cloudFeedback[0].id,
      );
      return;
    }
    if (filteredTickets.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && filteredTickets.some((t) => t.id === prev) ? prev : filteredTickets[0].id,
    );
  }, [tab, filteredTickets, cloudReady, cloudFeedback]);

  useEffect(() => {
    setReplyDraft(selectedCloudFeedback?.admin_reply ?? '');
  }, [selectedCloudFeedback?.id, selectedCloudFeedback?.admin_reply]);

  useEffect(() => {
    setConsultationNote(selectedConsultation?.admin_note ?? '');
  }, [selectedConsultation?.id, selectedConsultation?.admin_note]);

  const ticketsByColumn = (col) => filteredTickets.filter((t) => t.boardStatus === col);

  const handleFeedbackReply = async () => {
    if (!selectedFeedbackId || !replyDraft.trim()) {
      showMock('اكتبي رداً');
      return;
    }
    const { error } = await updateFeedbackReply(selectedFeedbackId, {
      adminReply: replyDraft.trim(),
      boardStatus: 'replied',
    });
    if (error) {
      showMock(error.message ?? 'تعذّر حفظ الرد');
      return;
    }
    showMock('تم حفظ الرد');
    await loadCloud();
  };

  const handleFeedbackClose = async () => {
    if (!selectedFeedbackId) return;
    const { error } = await updateFeedbackBoardStatus(selectedFeedbackId, 'closed');
    if (error) {
      showMock(error.message ?? 'تعذّر الإغلاق');
      return;
    }
    showMock('تم إغلاق التذكرة');
    await loadCloud();
  };

  const handleConsultationStatus = async (status) => {
    if (!selectedConsultationId) {
      showMock('اختاري طلباً أولاً');
      return;
    }
    const patch = {
      status,
      adminNote: consultationNote.trim() || undefined,
    };
    if (status === 'scheduled') {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      patch.scheduledAt = d.toISOString();
    }
    const { error } = await updateConsultationStatus(selectedConsultationId, patch);
    if (error) {
      showMock(error.message ?? 'تعذّر التحديث');
      return;
    }
    showMock(`تم تحديث الحالة إلى ${status}`);
    await loadCloud();
  };

  const handleAddFaq = async () => {
    if (!faqDraft.question.trim() || !faqDraft.answer.trim()) {
      showMock('أدخلي السؤال والإجابة');
      return;
    }
    setSavingFaq(true);
    const id = crypto.randomUUID?.() ?? `faq_${Date.now()}`;
    const { error } = await upsertCommunityFaq({
      id,
      question: faqDraft.question.trim(),
      answer: faqDraft.answer.trim(),
      sortOrder: faqItems.length,
      publishStatus: 'منشور',
    });
    if (!error) await publishCommunityFaq(id);
    setSavingFaq(false);
    if (error) {
      showMock(error.message ?? 'تعذّر الحفظ');
      return;
    }
    setFaqDraft({ question: '', answer: '' });
    showMock('تم حفظ ونشر السؤال');
    await loadCloud();
  };

  const handlePublishClub = async (id) => {
    const { error } = await publishClubPost(id);
    if (error) {
      showMock(error.message ?? 'تعذّر النشر');
      return;
    }
    showMock('تم نشر المنشور');
    await loadCloud();
  };

  return (
    <div className="page-stack">
      <PageHeader title="المجتمع والدعم" />
      {cloudReady ? (
        <InfoBanner tone="info">البيانات السحابية مفعّلة — FAQ / الشكاوى / الاستشارات / النادي من Supabase.</InfoBanner>
      ) : (
        <InfoBanner tone="warning">Supabase غير متصل — يظهر المحتوى المحلي كعرض فقط.</InfoBanner>
      )}

      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
              setSelectedId(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === 'complaints' || tab === 'suggestions') && (
        <>
          {cloudReady && (
            <AdminCard>
              <SectionHeader title={`${tab === 'complaints' ? 'شكاوى' : 'اقتراحات'} من التطبيق`} />
              <AdminTableContainer>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الموضوع</th>
                      <th>التفاصيل</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cloudFeedback.length === 0 ? (
                      <tr>
                        <td colSpan={4}>لا رسائل بعد</td>
                      </tr>
                    ) : (
                      cloudFeedback.map((r) => (
                        <tr
                          key={r.id}
                          className={selectedFeedbackId === r.id ? 'selected' : ''}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedFeedbackId(r.id)}
                        >
                          <td style={{ fontWeight: 600 }}>{r.subject}</td>
                          <td style={{ fontSize: '0.88rem' }}>{r.body}</td>
                          <td>
                            <StatusBadge tone={boardTone[r.board_status] ?? 'muted'}>
                              {r.board_status}
                            </StatusBadge>
                          </td>
                          <td>{r.created_at?.slice?.(0, 10) ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </AdminTableContainer>
            </AdminCard>
          )}

          <div className="ticket-board">

            {supportTicketColumns.map((col) => (
              <div key={col} className="ticket-board__column">
                <h4 className="ticket-board__title">{col}</h4>
                {ticketsByColumn(col).length === 0 ? (
                  <p className="ticket-board__empty">
                    {tab === 'complaints' ? 'لا توجد شكاوى' : 'لا توجد اقتراحات'} في «{col}»
                  </p>
                ) : (
                  ticketsByColumn(col).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ticket-board__card${selectedId === t.id ? ' ticket-board__card--selected' : ''}`}
                      onClick={() => setSelectedId(t.id)}
                    >
                      <strong>#{t.id}</strong> {t.title}
                      <span className="text-caption">{t.user}</span>
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>

          <div className="grid-2">
            <AdminCard>
              <SectionHeader title="جدول التذاكر" />
              {filteredTickets.length === 0 ? (
                <EmptyState
                  title={tab === 'complaints' ? 'لا توجد شكاوى' : 'لا توجد اقتراحات'}
                  description="لا تذاكر من هذا النوع في البيانات mock حالياً."
                  compact
                />
              ) : (
              <AdminTableContainer>
                <table className="admin-table admin-table--compact admin-table--cards">
                  <thead>
                    <tr>
                      <th>العنوان</th>
                      <th>النوع</th>
                      <th>المستخدم</th>
                      <th>التاريخ</th>
                      <th>الأولوية</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t) => (
                      <tr
                        key={t.id}
                        className={selectedId === t.id ? 'selected' : ''}
                        onClick={() => setSelectedId(t.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td data-label="العنوان">{t.title}</td>
                        <td data-label="النوع">{t.type}</td>
                        <td data-label="المستخدم">{t.user}</td>
                        <td data-label="التاريخ">{t.date}</td>
                        <td data-label="الأولوية">
                          <StatusBadge tone={priorityTone[t.priority]}>{t.priority}</StatusBadge>
                        </td>
                        <td data-label="الحالة">{t.boardStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableContainer>
              )}
            </AdminCard>

            <AdminCard className="detail-panel">
              <SectionHeader title="تفاصيل التذكرة" />
              {cloudReady && selectedCloudFeedback ? (
                <>
                  <h4 style={{ margin: '0 0 8px' }}>{selectedCloudFeedback.subject}</h4>
                  <p>
                    <strong>النص:</strong>
                    <br />
                    {selectedCloudFeedback.body}
                  </p>
                  <p>
                    <strong>الحالة:</strong>{' '}
                    <StatusBadge tone={boardTone[selectedCloudFeedback.board_status] ?? 'muted'}>
                      {selectedCloudFeedback.board_status}
                    </StatusBadge>
                  </p>
                  <label className="cms-field">
                    رد الإدارة
                    <textarea
                      rows={3}
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder="اكتبي الرد هنا…"
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    <button type="button" className="mock-btn mock-btn--primary" onClick={handleFeedbackReply}>
                      حفظ الرد
                    </button>
                    <button type="button" className="mock-btn mock-btn--outline" onClick={handleFeedbackClose}>
                      إغلاق
                    </button>
                  </div>
                </>
              ) : selected ? (
                <>
                  <h4 style={{ margin: '0 0 8px' }}>
                    #{selected.id} — {selected.title}
                  </h4>
                  <p>
                    <strong>نص الشكوى/الاقتراح:</strong>
                    <br />
                    {selected.body}
                  </p>
                  <p>
                    <strong>بيانات الطفل (mock):</strong> {selected.childMock.name} —{' '}
                    {selected.childMock.age}
                  </p>
                  <p>
                    <strong>رد الإدارة:</strong>
                    <br />
                    {selected.adminReply ?? (
                      <em style={{ color: 'var(--on-surface-variant)' }}>لم يُرد بعد</em>
                    )}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    <MockActionButton>رد</MockActionButton>
                    <MockActionButton variant="outline">إغلاق</MockActionButton>
                    <MockActionButton variant="secondary">تحويل لاستشارة</MockActionButton>
                  </div>
                </>
              ) : (
                <p className="text-caption">اختر تذكرة من اللوحة أو الجدول.</p>
              )}
            </AdminCard>
          </div>
        </>
      )}

      {tab === 'consultations' && (
        <div className="grid-2">
          <AdminCard>
            <SectionHeader title="طلبات الاستشارة من التطبيق" />
            <AdminTableContainer>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الموضوع</th>
                    <th>التفاصيل</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {(cloudReady ? consultationRows : consultationRequests).length === 0 ? (
                    <tr>
                      <td colSpan={4}>لا طلبات بعد</td>
                    </tr>
                  ) : cloudReady ? (
                    consultationRows.map((c) => (
                      <tr
                        key={c.id}
                        className={selectedConsultationId === c.id ? 'selected' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedConsultationId(c.id)}
                      >
                        <td style={{ fontWeight: 600 }}>{c.topic}</td>
                        <td style={{ fontSize: '0.88rem' }}>{c.details}</td>
                        <td>
                          <StatusBadge
                            tone={
                              c.status === 'done'
                                ? 'success'
                                : c.status === 'scheduled'
                                  ? 'info'
                                  : c.status === 'cancelled'
                                    ? 'muted'
                                    : 'warning'
                            }
                          >
                            {c.status}
                          </StatusBadge>
                        </td>
                        <td>{c.created_at?.slice?.(0, 10) ?? '—'}</td>
                      </tr>
                    ))
                  ) : (
                    consultationRequests.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.topic}</td>
                        <td style={{ fontSize: '0.88rem' }}>{c.details ?? c.topic}</td>
                        <td>
                          <StatusBadge tone="muted">{c.status}</StatusBadge>
                        </td>
                        <td>{c.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </AdminTableContainer>
          </AdminCard>

          <AdminCard className="detail-panel">
            <SectionHeader title="سير العمل" />
            {cloudReady && selectedConsultation ? (
              <>
                <h4 style={{ margin: '0 0 8px' }}>{selectedConsultation.topic}</h4>
                <p style={{ fontSize: '0.9rem' }}>{selectedConsultation.details}</p>
                <p>
                  <strong>الحالة الحالية:</strong> {selectedConsultation.status}
                  {selectedConsultation.scheduled_at && (
                    <> — موعد: {String(selectedConsultation.scheduled_at).slice(0, 16)}</>
                  )}
                </p>
                <label className="cms-field">
                  ملاحظة الإدارة
                  <textarea
                    rows={3}
                    value={consultationNote}
                    onChange={(e) => setConsultationNote(e.target.value)}
                    placeholder="ملاحظات داخلية أو رسالة للأم…"
                  />
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    onClick={() => handleConsultationStatus('new')}
                  >
                    جديد
                  </button>
                  <button
                    type="button"
                    className="mock-btn mock-btn--primary"
                    onClick={() => handleConsultationStatus('scheduled')}
                  >
                    جدولة (+يومين)
                  </button>
                  <button
                    type="button"
                    className="mock-btn mock-btn--secondary"
                    onClick={() => handleConsultationStatus('done')}
                  >
                    تم
                  </button>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    onClick={() => handleConsultationStatus('cancelled')}
                  >
                    إلغاء
                  </button>
                </div>
              </>
            ) : (
              <p className="text-caption">
                {cloudReady ? 'اختاري طلباً من الجدول لتحديث حالته.' : 'فعّلي Supabase لإدارة الطلبات.'}
              </p>
            )}
          </AdminCard>
        </div>
      )}

      {tab === 'club' && (
        <AdminCard>
          <SectionHeader title="منشورات نادي الأمهات" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الكاتبة</th>
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cloudReady
                  ? clubRows.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td>{p.author_display_name ?? '—'}</td>
                        <td>
                          <StatusBadge
                            tone={
                              p.publish_status === 'published' ? 'success' : 'warning'
                            }
                          >
                            {p.publish_status}
                          </StatusBadge>
                        </td>
                        <td>
                          {p.publish_status !== 'published' && (
                            <button
                              type="button"
                              className="mock-btn mock-btn--outline"
                              onClick={() => handlePublishClub(p.id)}
                            >
                              نشر
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  : mothersClubPosts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td>{p.author}</td>
                        <td>
                          <StatusBadge tone={postTone[p.status]}>{p.status}</StatusBadge>
                        </td>
                        <td />
                      </tr>
                    ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      )}

      {tab === 'faq' && (
        <AdminCard>
          <SectionHeader title="الأسئلة الشائعة (سحابة)" />
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="السؤال"
              value={faqDraft.question}
              onChange={(e) => setFaqDraft((d) => ({ ...d, question: e.target.value }))}
            />
            <textarea
              rows={3}
              placeholder="الإجابة"
              value={faqDraft.answer}
              onChange={(e) => setFaqDraft((d) => ({ ...d, answer: e.target.value }))}
            />
            <button
              type="button"
              className="btn btn--primary"
              disabled={savingFaq || !cloudReady}
              onClick={handleAddFaq}
            >
              {savingFaq ? 'جاري الحفظ…' : 'حفظ ونشر سؤال'}
            </button>
          </div>
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>السؤال</th>
                  <th>الإجابة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {(cloudReady ? faqItems : communityFaqItems).map((f, i) => (
                  <tr key={f.id ?? i}>
                    <td style={{ fontWeight: 600, maxWidth: 220 }}>{f.question}</td>
                    <td style={{ fontSize: '0.88rem' }}>{f.answer}</td>
                    <td>
                      {cloudReady ? (
                        <StatusBadge
                          tone={f.publishStatus === 'منشور' ? 'success' : 'muted'}
                        >
                          {f.publishStatus}
                        </StatusBadge>
                      ) : (
                        'محلي'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      )}

      {tab === 'childProblems' && (
        <AdminCard>
          <SectionHeader title="مشاكل الأطفال الشائعة + حل المشاكل" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الفئة</th>
                  <th>العنوان</th>
                  <th>المحتوى</th>
                </tr>
              </thead>
              <tbody>
                {supportTopics.map((s, i) => (
                  <tr key={`s-${i}`}>
                    <td>{s.category}</td>
                    <td>{s.title}</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.body}</td>
                  </tr>
                ))}
                {commonChildProblems.map((p, i) => (
                  <tr key={`p-${i}`}>
                    <td>مشاكل شائعة</td>
                    <td>{p.title}</td>
                    <td style={{ fontSize: '0.85rem' }}>{p.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      )}
    </div>
  );
}
