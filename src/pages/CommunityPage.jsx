import { useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { MothersClubManager } from '../components/MothersClubManager';
import { CommunityFeedbackManager } from '../components/CommunityFeedbackManager';
import { CommunityFaqManager } from '../components/CommunityFaqManager';
import {
  commonChildProblems,
  consultationRequests,
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

export function CommunityPage() {
  const [tab, setTab] = useState('complaints');

  return (
    <div className="page-stack">
      <PageHeader title="المجتمع والدعم" />

      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === 'complaints' || tab === 'suggestions') && (
        <CommunityFeedbackManager kind={tab} />
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

      {tab === 'club' && <MothersClubManager />}

      {tab === 'faq' && <CommunityFaqManager />}

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
