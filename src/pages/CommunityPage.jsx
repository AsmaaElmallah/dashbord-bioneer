import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  commonChildProblems,
  communityFaqItems,
  consultationRequests,
  mothersClubPosts,
  supportTicketColumns,
  supportTickets,
  supportTopics,
} from '../data/mockData';

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

export function CommunityPage() {
  const [tab, setTab] = useState('complaints');
  const [selectedId, setSelectedId] = useState(null);

  const ticketType = tab === 'complaints' ? 'شكوى' : tab === 'suggestions' ? 'اقتراح' : null;

  const filteredTickets = useMemo(() => {
    if (!ticketType) return [];
    return supportTickets.filter((t) => t.type === ticketType);
  }, [ticketType]);

  const selected = supportTickets.find((t) => t.id === selectedId);

  useEffect(() => {
    if (tab !== 'complaints' && tab !== 'suggestions') return;
    if (filteredTickets.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && filteredTickets.some((t) => t.id === prev) ? prev : filteredTickets[0].id,
    );
  }, [tab, filteredTickets]);

  const ticketsByColumn = (col) => filteredTickets.filter((t) => t.boardStatus === col);

  return (
    <div className="page-stack">
      <PageHeader title="المجتمع والدعم" />

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
              {selected ? (
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
        <AdminCard>
          <SectionHeader title="طلبات الاستشارة" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>النوع</th>
                  <th>المستخدم</th>
                  <th>الموضوع</th>
                  <th>مدفوعة</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {consultationRequests.map((c) => (
                  <tr key={c.id}>
                    <td>{c.type}</td>
                    <td>{c.user}</td>
                    <td>{c.topic}</td>
                    <td>{c.paid ? 'نعم' : 'لا'}</td>
                    <td>
                      <StatusBadge tone="info">{c.status}</StatusBadge>
                    </td>
                    <td>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      )}

      {tab === 'club' && (
        <AdminCard>
          <SectionHeader title="منشورات نادي الأمهات (mock)" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الكاتب</th>
                  <th>الوسم</th>
                  <th>العنوان</th>
                  <th>إعجابات</th>
                  <th>تعليقات</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {mothersClubPosts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.author}</td>
                    <td>{p.tag}</td>
                    <td>{p.title}</td>
                    <td>{p.likes}</td>
                    <td>{p.comments}</td>
                    <td>
                      <StatusBadge tone={postTone[p.status]}>{p.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      )}

      {tab === 'faq' && (
        <AdminCard>
          <SectionHeader title="الأسئلة الشائعة" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>السؤال</th>
                  <th>الإجابة</th>
                </tr>
              </thead>
              <tbody>
                {communityFaqItems.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, maxWidth: 220 }}>{f.question}</td>
                    <td style={{ fontSize: '0.88rem' }}>{f.answer}</td>
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
