import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { libraryAgeBands } from '../data/libraryAgeBands';
import { ClubPostsModeration } from '../components/ClubPostsModeration';
import { ClubReportsPanel } from '../components/ClubReportsPanel';
import {
  ensureClubAgeCategories,
  fetchClubPosts,
  fetchCommunityFaq,
  fetchCommunityFeedback,
  fetchConsultationRequests,
  publishCommunityFaq,
  updateConsultationStatus,
  updateFeedbackBoardStatus,
  updateFeedbackReply,
  upsertClubPost,
  upsertCommunityFaq,
} from '../services/supabase/communityService';

const tabs = [
  ['complaints', 'الشكاوى'],
  ['suggestions', 'الاقتراحات'],
  ['consultations', 'الاستشارات'],
  ['club', 'نادي الأمهات'],
  ['faq', 'الأسئلة الشائعة'],
];

const boardTone = {
  new: 'info',
  in_review: 'warning',
  replied: 'success',
  closed: 'muted',
};

export function CommunityPage() {
  const { showMock } = useSnackbar();
  const [tab, setTab] = useState('complaints');

  const [faqItems, setFaqItems] = useState([]);
  const [feedbackRows, setFeedbackRows] = useState([]);
  const [consultationRows, setConsultationRows] = useState([]);
  const [clubRows, setClubRows] = useState([]);
  const [clubDraft, setClubDraft] = useState({ title: '', body: '', categoryId: libraryAgeBands[0].id });
  const [savingClub, setSavingClub] = useState(false);
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
      ensureClubAgeCategories(),
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

  const cloudFeedback = useMemo(() => {
    if (tab === 'complaints') return feedbackRows.filter((r) => r.kind === 'complaint');
    if (tab === 'suggestions') return feedbackRows.filter((r) => r.kind === 'suggestion');
    return [];
  }, [tab, feedbackRows]);

  const selectedCloudFeedback = cloudFeedback.find((r) => r.id === selectedFeedbackId);
  const selectedConsultation = consultationRows.find((r) => r.id === selectedConsultationId);

  useEffect(() => {
    if (tab !== 'complaints' && tab !== 'suggestions') return;
    if (cloudFeedback.length === 0) {
      setSelectedFeedbackId(null);
      return;
    }
    setSelectedFeedbackId((prev) =>
      prev && cloudFeedback.some((t) => t.id === prev) ? prev : cloudFeedback[0].id,
    );
  }, [tab, cloudFeedback]);

  useEffect(() => {
    setReplyDraft(selectedCloudFeedback?.admin_reply ?? '');
  }, [selectedCloudFeedback?.id, selectedCloudFeedback?.admin_reply]);

  useEffect(() => {
    setConsultationNote(selectedConsultation?.admin_note ?? '');
  }, [selectedConsultation?.id, selectedConsultation?.admin_note]);

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

  const handleAddClubPost = async () => {
    if (!clubDraft.title.trim() || !clubDraft.body.trim()) {
      showMock('اكتبي العنوان والنص');
      return;
    }
    if (!clubDraft.categoryId) {
      showMock('اختاري عمر البيبي');
      return;
    }
    setSavingClub(true);
    const { error } = await upsertClubPost(clubDraft);
    setSavingClub(false);
    if (error) {
      showMock(error.message ?? 'تعذّر حفظ المنشور');
      return;
    }
    setClubDraft({ title: '', body: '', categoryId: libraryAgeBands[0].id });
    showMock('تم نشر المناقشة في نادي الأمهات');
    await loadCloud();
  };

  return (
    <div className="page-stack">
      <PageHeader title="المجتمع والدعم" />
      {cloudReady ? (
        <InfoBanner tone="info">الشكاوى والاستشارات ونادي الأمهات والأسئلة من التطبيق مباشرة.</InfoBanner>
      ) : (
        <InfoBanner tone="warning">السحابة غير متصلة — لا تظهر رسائل حقيقية حتى يتم الاتصال.</InfoBanner>
      )}

      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === 'complaints' || tab === 'suggestions') && (
        <>
          {!cloudReady ? (
            <EmptyState
              title={tab === 'complaints' ? 'لا شكاوى' : 'لا اقتراحات'}
              description="اتصلي بقاعدة البيانات لعرض رسائل الأمهات."
            />
          ) : (
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

          {cloudReady && (
            <AdminCard className="detail-panel">
              <SectionHeader title="تفاصيل الرسالة" />
              {selectedCloudFeedback ? (
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
              ) : (
                <p className="text-caption">اختاري رسالة من الجدول.</p>
              )}
            </AdminCard>
          )}
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
                  {consultationRows.length === 0 ? (
                    <tr>
                      <td colSpan={4}>لا طلبات بعد</td>
                    </tr>
                  ) : (
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
          <p className="text-caption" style={{ margin: '4px 0 12px' }}>
            أسئلة الأمهات من التطبيق بتوصل هنا «مستنية مراجعة» ومش بتظهر لحد غير لما تنشريها. تقدري كمان تكتبي مناقشة
            باسم فريق بيانور وتنشر على طول.
          </p>
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="عنوان المناقشة"
              value={clubDraft.title}
              onChange={(e) => setClubDraft((d) => ({ ...d, title: e.target.value }))}
            />
            <textarea
              rows={3}
              placeholder="نص المناقشة"
              value={clubDraft.body}
              onChange={(e) => setClubDraft((d) => ({ ...d, body: e.target.value }))}
            />
            <label className="cms-field">
              عمر البيبي
              <select
                value={clubDraft.categoryId}
                onChange={(e) => setClubDraft((d) => ({ ...d, categoryId: e.target.value }))}
              >
                {libraryAgeBands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn btn--primary"
              disabled={savingClub || !cloudReady}
              onClick={handleAddClubPost}
            >
              {savingClub ? 'جاري النشر…' : 'نشر مناقشة'}
            </button>
          </div>
          <ClubReportsPanel notify={showMock} onChanged={loadCloud} />
          <ClubPostsModeration rows={clubRows} onChanged={loadCloud} notify={showMock} />
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
                {faqItems.map((f, i) => (
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

    </div>
  );
}
