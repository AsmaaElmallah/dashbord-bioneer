import { useMemo, useState } from 'react';
import { Link2 } from 'lucide-react';
import { ActiveFilters } from '../components/ActiveFilters';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { FilterChips } from '../components/FilterChips';
import { InfoBanner } from '../components/InfoBanner';
import { EmptyState } from '../components/EmptyState';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  libraryMediaItems,
  libraryTabs,
  matchesPublishChip,
  publishFilterChips,
} from '../data/mockData';

const linkTone = {
  سليم: 'success',
  'يحتاج مراجعة': 'warning',
  'معطّل (mock)': 'error',
};

export function LibraryPage() {
  const [tab, setTab] = useState('nature');
  const [selectedId, setSelectedId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterMood, setFilterMood] = useState('all');
  const [filterLink, setFilterLink] = useState('all');
  const [statusChip, setStatusChip] = useState('all');
  const [pageQuery, setPageQuery] = useState('');

  const tabMeta = libraryTabs.find((t) => t.id === tab);

  const tabItems = useMemo(() => {
    const base =
      tab === 'review'
        ? libraryMediaItems.filter((i) => i.categoryId === 'review')
        : libraryMediaItems.filter((i) => i.categoryId === tab);
    const q = pageQuery.trim().toLowerCase();
    return base.filter((item) => {
      if (!matchesPublishChip(item, statusChip)) return false;
      if (filterType !== 'all' && item.itemType !== filterType) return false;
      if (filterMood !== 'all' && item.moodTag !== filterMood) return false;
      if (filterLink !== 'all' && item.linkStatus !== filterLink) return false;
      if (q && !`${item.title} ${item.moodTag} ${item.videoId ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, filterType, filterMood, filterLink, statusChip, pageQuery]);

  const activeFilterItems = useMemo(() => {
    const items = [];
    if (statusChip !== 'all') {
      const chip = publishFilterChips.find((c) => c.id === statusChip);
      items.push({ id: 'chip', label: chip?.label ?? statusChip, onRemove: () => setStatusChip('all') });
    }
    if (pageQuery.trim()) {
      items.push({ id: 'q', label: `بحث: ${pageQuery.trim()}`, onRemove: () => setPageQuery('') });
    }
    if (filterType !== 'all') {
      items.push({ id: 'type', label: filterType === 'video' ? 'فيديو' : 'Playlist', onRemove: () => setFilterType('all') });
    }
    if (filterMood !== 'all') {
      items.push({ id: 'mood', label: `mood: ${filterMood}`, onRemove: () => setFilterMood('all') });
    }
    if (filterLink !== 'all') {
      items.push({ id: 'link', label: filterLink, onRemove: () => setFilterLink('all') });
    }
    return items;
  }, [statusChip, pageQuery, filterType, filterMood, filterLink]);

  const clearAllFilters = () => {
    setStatusChip('all');
    setPageQuery('');
    setFilterType('all');
    setFilterMood('all');
    setFilterLink('all');
  };

  const moods = useMemo(() => {
    const set = new Set(
      libraryMediaItems
        .filter((i) => (tab === 'review' ? i.categoryId === 'review' : i.categoryId === tab))
        .map((i) => i.moodTag),
    );
    return [...set];
  }, [tab]);

  const preview = tabItems.find((i) => i.id === selectedId) ?? tabItems[0] ?? null;

  return (
    <div className="page-stack">
      <PageHeader title="المكتبة والوسائط" />

      <InfoBanner tone="warning">
        لا WebView ولا تحقق YouTube فعلي — إدارة روابط mock من{' '}
        <code>library_media_catalog.dart</code>. خطأ 153 يُعالج بـ Referer في تطبيق Flutter.
      </InfoBanner>

      <div className="tabs">
        {libraryTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => {
              setTab(t.id);
              setSelectedId(null);
            }}
          >
            {t.title}
          </button>
        ))}
      </div>

      <StatCard
        label={tabMeta?.title ?? 'الفئة'}
        value={String(tabItems.length)}
        sub={`من ${libraryMediaItems.filter((i) => (tab === 'review' ? i.categoryId === 'review' : i.categoryId === tab)).length} عنصر`}
      />

      <FilterChips value={statusChip} onChange={setStatusChip} />
      <ActiveFilters items={activeFilterItems} onClearAll={activeFilterItems.length ? clearAllFilters : undefined} />

      <div className="filters-row">
        <input
          type="search"
          className="page-search-input"
          placeholder="بحث في المكتبة (عنوان، mood، videoId…)"
          value={pageQuery}
          onChange={(e) => setPageQuery(e.target.value)}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">كل الأنواع</option>
          <option value="video">فيديو</option>
          <option value="playlist">Playlist</option>
        </select>
        <select value={filterMood} onChange={(e) => setFilterMood(e.target.value)}>
          <option value="all">كل الـ mood</option>
          {moods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={filterLink} onChange={(e) => setFilterLink(e.target.value)}>
          <option value="all">كل حالات الرابط</option>
          <option value="سليم">سليم</option>
          <option value="يحتاج مراجعة">يحتاج مراجعة</option>
          <option value="معطّل (mock)">معطّل (mock)</option>
        </select>
        <MockActionButton action="check">
          <Link2 size={16} style={{ marginLeft: 6, verticalAlign: 'middle' }} />
          فحص الروابط
        </MockActionButton>
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title={`عناصر — ${tabMeta?.title}`} />
          {tabItems.length === 0 ? (
            <EmptyState
              title="لا يوجد محتوى في هذه الفئة"
              description="جرّبي فئة أخرى أو امسحي الفلاتر والبحث — UI فقط."
              compact
            />
          ) : (
          <AdminTableContainer style={{ maxHeight: 400 }}>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>videoId</th>
                  <th>playlistId</th>
                  <th>المدة</th>
                  <th>mood</th>
                  <th>الرابط</th>
                  <th>يظهر عند</th>
                </tr>
              </thead>
              <tbody>
                {tabItems.map((item) => (
                    <tr
                      key={item.id}
                      className={preview?.id === item.id ? 'selected' : ''}
                      onClick={() => setSelectedId(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="text-truncate" style={{ maxWidth: 160 }}>{item.title}</td>
                      <td>
                        <code style={{ fontSize: '0.7rem' }}>{item.videoId ?? '—'}</code>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.65rem' }}>
                          {item.playlistId ? `${item.playlistId.slice(0, 12)}…` : '—'}
                        </code>
                      </td>
                      <td>{item.duration}</td>
                      <td>{item.moodTag}</td>
                      <td>
                        <StatusBadge tone={linkTone[item.linkStatus] ?? 'muted'}>
                          {item.linkStatus}
                        </StatusBadge>
                      </td>
                      <td style={{ fontSize: '0.72rem' }} className="text-break">{item.showsWhen}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </AdminTableContainer>
          )}
        </AdminCard>

        <AdminCard>
          <SectionHeader title="معاينة العنصر" />
          {preview ? (
            <>
              {preview.videoId ? (
                <img
                  className="library-preview-thumb"
                  src={`https://img.youtube.com/vi/${preview.videoId}/hqdefault.jpg`}
                  alt=""
                />
              ) : (
                <div className="math-slide-preview__img">Playlist — بدون thumbnail فيديو</div>
              )}
              <h4 style={{ margin: '0 0 8px' }}>{preview.title}</h4>
              <p>
                <strong>النوع:</strong>{' '}
                {preview.itemType === 'playlist' ? 'Playlist' : 'فيديو YouTube'}
              </p>
              <p>
                <strong>مكان الظهور:</strong> المكتبة &gt; {preview.categoryTitle}
              </p>
              {preview.videoId && (
                <p>
                  <strong>videoId:</strong> <code>{preview.videoId}</code>
                </p>
              )}
              {preview.playlistId && (
                <p>
                  <strong>playlistId:</strong>
                  <br />
                  <code style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>
                    {preview.playlistId}
                  </code>
                </p>
              )}
              <p>
                <strong>المدة:</strong> {preview.duration} — <strong>mood:</strong>{' '}
                {preview.moodTag}
              </p>
              <StatusBadge tone={linkTone[preview.linkStatus] ?? 'muted'}>
                {preview.linkStatus}
              </StatusBadge>
              <p className="text-caption" style={{ marginTop: 10 }}>
                {preview.showsWhen}
              </p>
            </>
          ) : (
            <EmptyState
              title="لا يوجد محتوى في هذه الفئة"
              description="اختر عنصراً من القائمة أو غيّري الفئة."
              compact
            />
          )}
        </AdminCard>
      </div>
    </div>
  );
}
