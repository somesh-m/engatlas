import type {Node, Edge} from '@xyflow/react';
import type {Taxonomy} from './types';

const COLUMN_GAP = 230;
const LEVEL_GAP = 190;
const BRANCH_COLORS = ['#d97706', '#0284c7', '#7c3aed', '#059669', '#dc2626'];

export function buildFlowElements(taxonomy: Taxonomy) {
  const children = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  const parentByNode = new Map<string, string>();

  taxonomy.nodes.forEach((node) => {
    children.set(node.id, []);
    incoming.set(node.id, 0);
  });

  taxonomy.edges.forEach((edge) => {
    children.get(edge.source)?.push(edge.target);
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    if (!parentByNode.has(edge.target)) parentByNode.set(edge.target, edge.source);
  });

  const roots = taxonomy.nodes
    .filter((node) => (incoming.get(node.id) ?? 0) === 0)
    .map((node) => node.id);

  const depth = new Map<string, number>();
  const queue = roots.map((id) => ({id, level: 0}));

  while (queue.length) {
    const current = queue.shift()!;
    const oldDepth = depth.get(current.id);

    if (oldDepth !== undefined && oldDepth <= current.level) continue;
    depth.set(current.id, current.level);

    for (const child of children.get(current.id) ?? []) {
      queue.push({id: child, level: current.level + 1});
    }
  }

  const byDepth = new Map<number, string[]>();
  taxonomy.nodes.forEach((node) => {
    const level = depth.get(node.id) ?? 0;
    const list = byDepth.get(level) ?? [];
    list.push(node.id);
    byDepth.set(level, list);
  });

  const nodeById = new Map(taxonomy.nodes.map((node) => [node.id, node]));
  const nodes: Node[] = [];

  Array.from(byDepth.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([level, ids]) => {
      const totalWidth = (ids.length - 1) * COLUMN_GAP;
      ids.forEach((id, index) => {
        const item = nodeById.get(id)!;
        nodes.push({
          id,
          type: 'atlasNode',
          position: {
            x: index * COLUMN_GAP - totalWidth / 2,
            y: level * LEVEL_GAP,
          },
          data: item,
        });
      });
    });

  const edges: Edge[] = taxonomy.edges.map((edge) => {
    const parentId = parentByNode.get(edge.source);
    const siblingSources = (parentId ? children.get(parentId) : roots)?.filter(
      (id) => (children.get(id)?.length ?? 0) > 0,
    ) ?? [edge.source];
    const siblingIndex = Math.max(0, siblingSources.indexOf(edge.source));
    const hasSiblingBranches = siblingSources.length > 1;
    const stepPosition = hasSiblingBranches
      ? 0.25 + (siblingIndex / (siblingSources.length - 1)) * 0.5
      : 0.5;

    return {
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      pathOptions: {stepPosition},
      style: hasSiblingBranches
        ? {
            stroke: BRANCH_COLORS[siblingIndex % BRANCH_COLORS.length],
            strokeWidth: 1.75,
          }
        : undefined,
    };
  });

  return {nodes, edges};
}
