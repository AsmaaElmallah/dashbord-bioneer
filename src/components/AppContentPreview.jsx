import { Home, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { InfoBanner } from './InfoBanner';
import { StatusBadge } from './StatusBadge';
import {
  appPreviewTabs,
  getAppPreviewWarnings,
  getContentTypeLabel,
} from '../data/appContentPreview';

function PreviewImage({ preview }) {
  if (preview.imageUrl && preview.imageUrl.startsWith('http')) {
    return <img className="app-preview-phone__img" src={preview.imageUrl} alt="" />;
  }
  if (preview.imageUrl) {
    return (
      <div className="app-preview-phone__img app-preview-phone__img--mock">
        [صورة mock]
      </div>
    );
  }
  return (
    <div className="app-preview-phone__img app-preview-phone__img--empty">لا صورة</div>
  );
}

function HomeTab({ preview }) {
  return (
    <div className="app-preview-screen app-preview-screen--home">
      <p className="app-preview-screen__label">الرئيسية · بيانور</p>
      <div className="app-preview-card app-preview-card--featured">
        <PreviewImage preview={preview} />
        <strong>{preview.title || 'عنوان المحتوى'}</strong>
        <span className="text-caption">{preview.section || '—'}</span>
      </div>
      <div className="app-preview-card app-preview-card--ghost">
        <span className="text-caption">بطاقات أخرى…</span>
      </div>
    </div>
  );
}

function SectionTab({ preview }) {
  return (
    <div className="app-preview-screen app-preview-screen--section">
      <p className="app-preview-screen__label">{preview.section || 'القسم'}</p>
      <div className="app-preview-list">
        <div className="app-preview-list__item app-preview-list__item--active">
          <PreviewImage preview={preview} />
          <div>
            <strong>{preview.title || '—'}</strong>
            <span className="text-caption">{preview.ageLabel || '—'}</span>
          </div>
        </div>
        <div className="app-preview-list__item app-preview-list__item--dim">
          <span className="text-caption">عناصر أخرى في القسم…</span>
        </div>
      </div>
    </div>
  );
}

function DetailTab({ preview }) {
  return (
    <div className="app-preview-screen app-preview-screen--detail">
      <PreviewImage preview={preview} />
      <h4 className="app-preview-detail__title">{preview.title || '—'}</h4>
      {preview.subtitle && <p className="app-preview-detail__subtitle">{preview.subtitle}</p>}
      {preview.bodyPreview && (
        <p className="app-preview-detail__body">{preview.bodyPreview}</p>
      )}
      <div className="app-preview-detail__meta">
        <StatusBadge tone="info">{getContentTypeLabel(preview.contentType)}</StatusBadge>
        <StatusBadge tone="muted">{preview.status || '—'}</StatusBadge>
      </div>
      <p className="text-caption">العمر: {preview.ageLabel || '—'}</p>
      <p className="text-caption">القسم: {preview.section || '—'}</p>
      {preview.placement && <p className="text-caption">الظهور: {preview.placement}</p>}
    </div>
  );
}

export function AppContentPreview({ preview, compact }) {
  const [tab, setTab] = useState('home');
  const warnings = getAppPreviewWarnings(preview);

  return (
    <div className={`app-content-preview${compact ? ' app-content-preview--compact' : ''}`}>
      {!compact && (
        <InfoBanner tone="info">
          AppContentPreview — شكل mock لشاشة Flutter. لا تشغيل تطبيق حقيقي.
        </InfoBanner>
      )}

      {warnings.length > 0 && (
        <div className="app-preview-warnings">
          {warnings.map((w) => (
            <InfoBanner key={w.id} tone="warning">
              {w.message}
            </InfoBanner>
          ))}
        </div>
      )}

      <div className="app-preview-phone">
        <div className="app-preview-phone__bezel">
          <div className="app-preview-phone__status">
            <Smartphone size={12} />
            <span>بيانور</span>
            <span className="app-preview-phone__time">9:41</span>
          </div>
          <div className="app-preview-phone__tabs">
            {appPreviewTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`app-preview-phone__tab${tab === t.id ? ' app-preview-phone__tab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="app-preview-phone__content">
            {tab === 'home' && <HomeTab preview={preview} />}
            {tab === 'section' && <SectionTab preview={preview} />}
            {tab === 'detail' && <DetailTab preview={preview} />}
          </div>
          <div className="app-preview-phone__home-bar" />
        </div>
      </div>

      {!compact && (
        <p className="text-caption app-preview-meta">
          <Home size={12} style={{ verticalAlign: 'middle' }} /> {getContentTypeLabel(preview.contentType)} ·{' '}
          {preview.title || 'بدون عنوان'}
        </p>
      )}
    </div>
  );
}
