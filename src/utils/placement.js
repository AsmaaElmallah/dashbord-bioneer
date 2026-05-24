import { placementTree } from '../data/placementTree';

function walk(nodes, parentPath, fn) {
  for (const node of nodes) {
    const path = [...parentPath, node];
    fn(node, path);
    if (node.children?.length) walk(node.children, path, fn);
  }
}

export function findPlacementNode(id, nodes = placementTree) {
  let found = null;
  walk(nodes, [], (node, path) => {
    if (node.id === id) found = { node, path };
  });
  return found;
}

export function buildPlacementBreadcrumb(id) {
  const hit = findPlacementNode(id);
  if (!hit) return '—';
  return hit.path.map((n) => n.label).join(' > ');
}

export function buildPlacementPreview(id) {
  const crumb = buildPlacementBreadcrumb(id);
  return crumb === '—' ? 'حدّد مكان الظهور في الشجرة' : `سيظهر في: ${crumb}`;
}

/** للتحذيرات في AgeTargetingPanel — اسم قسم علوي */
export function placementSectionKey(id) {
  const hit = findPlacementNode(id);
  if (!hit) return '';
  const root = hit.path[0];
  const map = {
    exercises: 'الرياضة',
    activities: 'الأنشطة',
    library: 'المكتبة',
    lessons: 'الدروس',
    lesson_quran: 'القرآن',
    lesson_math: 'الحساب',
    lesson_visual: 'التحفيز البصري',
    lesson_emotional: 'الذكاء العاطفي',
    nature_sounds: 'المكتبة',
    calm_music: 'المكتبة',
    lullabies: 'المكتبة',
  };
  if (map[id]) return map[id];
  return map[root?.id] ?? root?.label ?? '';
}

export function filterPlacementTree(query, nodes = placementTree) {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  function filterList(list) {
    const out = [];
    for (const node of list) {
      const labelMatch = node.label.toLowerCase().includes(q);
      const routeMatch = node.routeMock?.toLowerCase().includes(q);
      const screenMatch = node.flutterScreen?.toLowerCase().includes(q);
      const filteredChildren = node.children?.length ? filterList(node.children) : [];

      if (labelMatch || routeMatch || screenMatch || filteredChildren.length) {
        out.push({
          ...node,
          children: filteredChildren.length ? filteredChildren : node.children,
        });
      }
    }
    return out;
  }

  return filterList(nodes);
}

export function flattenPlacementNodes(nodes = placementTree) {
  const flat = [];
  walk(nodes, [], (node, path) => {
    flat.push({ node, path, breadcrumb: path.map((n) => n.label).join(' > ') });
  });
  return flat;
}
