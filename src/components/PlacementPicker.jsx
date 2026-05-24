import { ChevronDown, ChevronLeft, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { placementContentNeedLabels } from '../data/placementTree';
import {
  buildPlacementPreview,
  filterPlacementTree,
  findPlacementNode,
} from '../utils/placement';
import { AdminCard } from './AdminCard';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';

const needTone = {
  text: 'info',
  media: 'warning',
  lesson: 'success',
};

function TreeBranch({ node, depth, selectedId, expanded, onToggleExpand, onSelect, defaultExpand }) {
  const hasChildren = node.children?.length > 0;
  const isExpanded = expanded[node.id] ?? defaultExpand;
  const isSelected = selectedId === node.id;

  return (
    <li className="placement-tree__branch">
      <div
        className={`placement-tree__row${isSelected ? ' placement-tree__row--selected' : ''}`}
        style={{ paddingRight: 8 + depth * 14 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="placement-tree__expand"
            aria-expanded={isExpanded}
            onClick={() => onToggleExpand(node.id)}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
          </button>
        ) : (
          <span className="placement-tree__expand placement-tree__expand--leaf" />
        )}
        <button type="button" className="placement-tree__label" onClick={() => onSelect(node.id)}>
          {node.label}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <ul className="placement-tree__children">
          {node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              defaultExpand={defaultExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function PlacementPicker({ value, onChange }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({ lessons: true, library: true });

  const filteredTree = useMemo(() => filterPlacementTree(search), [search]);
  const selected = findPlacementNode(value);
  const preview = buildPlacementPreview(value);
  const defaultExpand = Boolean(search.trim());

  const toggleExpand = (id) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  };

  return (
    <div className="placement-picker">
      <SectionHeader title="مكان الظهور في التطبيق" />
      <p className="text-caption placement-picker__intro">
        اختر موضعاً من شجرة الأقسام (من <code>home_menu_data</code> و<code>AppRoutes</code>) — لا
        routing فعلي، mock فقط.
      </p>

      <label className="cms-field placement-picker__search">
        بحث في الشجرة
        <span className="placement-picker__search-wrap">
          <Search size={16} aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="مثال: تهويدات، قرآن، /home/library"
          />
        </span>
      </label>

      <div className="placement-picker__layout">
        <AdminCard className="placement-picker__tree-wrap">
          <ul className="placement-tree">
            {filteredTree.map((node) => (
              <TreeBranch
                key={node.id}
                node={node}
                depth={0}
                selectedId={value}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                onSelect={onChange}
                defaultExpand={defaultExpand}
              />
            ))}
          </ul>
          {filteredTree.length === 0 && (
            <p className="text-caption">لا نتائج — جرّب كلمة أخرى.</p>
          )}
        </AdminCard>

        <div className="placement-picker__detail">
          {selected ? (
            <>
              <p className="placement-picker__preview">
                <MapPin size={16} />
                <strong>{preview}</strong>
              </p>
              <dl className="placement-picker__meta">
                <div>
                  <dt>Route (mock)</dt>
                  <dd>
                    <code>{selected.node.routeMock}</code>
                  </dd>
                </div>
                {selected.node.flutterScreen && (
                  <div>
                    <dt>شاشة Flutter</dt>
                    <dd>{selected.node.flutterScreen}</dd>
                  </div>
                )}
                <div>
                  <dt>نوع المحتوى المطلوب</dt>
                  <dd className="placement-picker__needs">
                    {selected.node.contentNeeds.map((n) => (
                      <StatusBadge key={n} tone={needTone[n]}>
                        {placementContentNeedLabels[n] ?? n}
                      </StatusBadge>
                    ))}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-caption">اختر عقدة من الشجرة لعرض التفاصيل والمعاينة.</p>
          )}
        </div>
      </div>

      <div className="age-targeting-preview placement-picker__footer-preview">{preview}</div>
    </div>
  );
}