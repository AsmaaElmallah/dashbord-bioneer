import { useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  settingsAppInfo,
  settingsIntegrations,
  settingsLanguages,
  settingsPermissionMatrix,
  settingsPermissions,
  settingsPublishStates,
  settingsRoles,
  settingsSections,
} from '../data/mockData';

export function SettingsPage() {
  const [section, setSection] = useState('general');
  const [general, setGeneral] = useState({
    appName: settingsAppInfo.appName,
    version: settingsAppInfo.version,
    defaultLang: 'ar',
    rtl: true,
    maintenance: false,
  });

  return (
    <div className="page-stack">
      <PageHeader title="إعدادات لوحة التحكم" />

      <InfoBanner tone="warning">
        لا Auth ولا حفظ ولا Backend — كل الحقول والصلاحيات للعرض والتخطيط فقط (UI فقط).
      </InfoBanner>

      <div className="cms-layout">
        <aside className="cms-sidebar">
          {settingsSections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`cms-sidebar__btn${section === s.id ? ' cms-sidebar__btn--active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </aside>

        <div className="cms-main">
          {section === 'general' && (
            <AdminCard>
              <SectionHeader title="إعدادات التطبيق العامة" />
              <label className="cms-field">
                اسم التطبيق
                <input
                  type="text"
                  value={general.appName}
                  onChange={(e) => setGeneral((g) => ({ ...g, appName: e.target.value }))}
                />
              </label>
              <label className="cms-field">
                الإصدار
                <input type="text" value={general.version} readOnly />
              </label>
              <label className="cms-field">
                اللغة الافتراضية
                <select
                  value={general.defaultLang}
                  onChange={(e) => setGeneral((g) => ({ ...g, defaultLang: e.target.value }))}
                >
                  {settingsLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <input
                  type="checkbox"
                  checked={general.rtl}
                  onChange={(e) => setGeneral((g) => ({ ...g, rtl: e.target.checked }))}
                />
                RTL مفعّل (التطبيق واللوحة)
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={general.maintenance}
                  onChange={(e) => setGeneral((g) => ({ ...g, maintenance: e.target.checked }))}
                />
                وضع الصيانة (mock)
              </label>
              <MockActionButton style={{ marginTop: 16 }} action="save">حفظ (UI فقط)</MockActionButton>
            </AdminCard>
          )}

          {section === 'languages' && (
            <AdminCard>
              <SectionHeader title="اللغات" />
              <AdminTableContainer>
                <table className="admin-table admin-table--compact">
                  <thead>
                    <tr>
                      <th>اللغة</th>
                      <th>الكود</th>
                      <th>مفعّلة</th>
                      <th>افتراضية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settingsLanguages.map((l) => (
                      <tr key={l.code}>
                        <td>{l.name}</td>
                        <td>{l.code}</td>
                        <td>{l.enabled ? 'نعم' : 'لا'}</td>
                        <td>{l.default ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableContainer>
            </AdminCard>
          )}

          {section === 'roles' && (
            <AdminCard>
              <SectionHeader title="الأدوار ومصفوفة الصلاحيات" />
              <p className="text-caption">الأدوار: {settingsRoles.join(' · ')}</p>
              <AdminTableContainer style={{ marginTop: 12 }}>
                <table className="admin-table admin-table--compact">
                  <thead>
                    <tr>
                      <th>الدور</th>
                      {settingsPermissions.map((p) => (
                        <th key={p}>{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {settingsRoles.map((role) => (
                      <tr key={role}>
                        <td style={{ fontWeight: 700 }}>{role}</td>
                        {settingsPermissions.map((perm) => (
                          <td key={perm} style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              defaultChecked={settingsPermissionMatrix[role]?.[perm]}
                              readOnly
                              title="UI فقط — للعرض"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableContainer>
            </AdminCard>
          )}

          {section === 'publish' && (
            <AdminCard>
              <SectionHeader title="حالات النشر" />
              <ul style={{ margin: 0, paddingRight: 20 }}>
                {settingsPublishStates.map((s) => (
                  <li key={s.id} style={{ marginBottom: 12 }}>
                    <strong>{s.label}</strong> — {s.desc}
                  </li>
                ))}
              </ul>
            </AdminCard>
          )}

          {section === 'integrations' && (
            <AdminCard>
              <SectionHeader title="التكاملات المستقبلية" />
              {settingsIntegrations.map((int) => (
                <div
                  key={int.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(196,181,253,0.25)',
                  }}
                >
                  <span>{int.name}</span>
                  <StatusBadge tone="muted">{int.status}</StatusBadge>
                </div>
              ))}
            </AdminCard>
          )}

          {section === 'version' && (
            <AdminCard>
              <SectionHeader title="معلومات النسخة" />
              <p>
                <strong>التطبيق:</strong> {settingsAppInfo.appName} — {settingsAppInfo.version}
              </p>
              <p>
                <strong>لوحة التحكم:</strong> {settingsAppInfo.build}
              </p>
              <p>
                <strong>Flutter SDK:</strong> {settingsAppInfo.flutterSdk}
              </p>
              <p className="text-caption" style={{ marginTop: 12 }}>
                من pubspec.yaml — لا يُحدَّث تلقائياً من هنا.
              </p>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
