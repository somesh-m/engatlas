import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { usePluginData } from '@docusaurus/useGlobalData';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import AtlasNode from './AtlasNode';
import { buildFlowElements } from './layout';
import type { Taxonomy, TaxonomyNode } from './types';
import styles from './atlas.module.css';

const nodeTypes = { atlasNode: AtlasNode };
const emptyTaxonomy: Taxonomy = { nodes: [], edges: [] };
const miniMapColors = {
  covered: '#34a76f',
  partial: '#e5a11a',
  planned: '#7c8798',
};

function getMiniMapNodeColor(node: Node) {
  const status = (node.data as TaxonomyNode).status;
  return miniMapColors[status] ?? '#7c8798';
}

function ContentDialog({
  node,
  sourcePath,
  contentLabel,
  onClose,
  sandbox,
  hideSiteChrome = false,
}: {
  node: TaxonomyNode;
  sourcePath: string;
  contentLabel: string;
  onClose: () => void;
  sandbox?: string;
  hideSiteChrome?: boolean;
}) {
  const source = useBaseUrl(sourcePath);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleFrameLoad(event: React.SyntheticEvent<HTMLIFrameElement>) {
    const frameDocument = event.currentTarget.contentDocument;
    if (!frameDocument) return;

    if (!frameDocument.documentElement.dataset.atlasEscapeHandler) {
      frameDocument.documentElement.dataset.atlasEscapeHandler = 'true';
      frameDocument.addEventListener('keydown', (frameEvent) => {
        if (frameEvent.key === 'Escape') onClose();
      });
    }

    if (!hideSiteChrome || frameDocument.querySelector('[data-atlas-embed-styles]')) return;

    const styles = frameDocument.createElement('style');
    styles.dataset.atlasEmbedStyles = 'true';
    styles.textContent = `
      .navbar,
      .theme-doc-breadcrumbs,
      .table-of-contents,
      [class*='tableOfContents'],
      footer.footer {
        display: none !important;
      }

      .main-wrapper {
        min-height: 100vh !important;
      }

      html,
      body,
      #__docusaurus,
      .main-wrapper,
      .docs-wrapper,
      [class*='docsWrapper'],
      [class*='docRoot'],
      [class*='docMainContainer'] {
        background: transparent !important;
      }

      [class*='docMainContainer'] > .container {
        width: 100% !important;
        max-width: none !important;
        margin-inline: auto !important;
        padding-inline: clamp(1.25rem, 3.5vw, 2.5rem) !important;
      }

      [class*='docItemCol'],
      [class*='docItemContainer'] {
        width: 100% !important;
        max-width: 960px !important;
        margin-inline: auto !important;
      }

      @media (min-width: 997px) {
        [class*='docMainContainer'] .row > [class*='docItemCol'] {
          flex-basis: 100% !important;
          max-width: 100% !important;
          padding-right: 1rem !important;
        }

        [class*='docMainContainer'] .row > .col--3 {
          display: none !important;
        }
      }

      body {
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif !important;
        font-size: 17px;
        color: color-mix(in srgb, var(--ifm-font-color-base) 88%, transparent);
      }

      .theme-doc-markdown {
        font-size: 1rem;
        line-height: 1.75;
        letter-spacing: -0.008em;
      }

      .theme-doc-markdown h1 {
        max-width: calc(100% - 7rem);
        margin: 0 0 1.5rem;
        color: var(--ifm-heading-color);
        font-size: clamp(2.25rem, 5vw, 3.25rem);
        font-weight: 750;
        line-height: 1.08;
        letter-spacing: -0.045em;
      }

      .theme-doc-markdown h2 {
        margin-top: 2.25rem;
        font-size: 1.65rem;
        letter-spacing: -0.025em;
      }

      .theme-doc-markdown h3 {
        margin-top: 1.75rem;
        font-size: 1.25rem;
        letter-spacing: -0.015em;
      }

      .theme-doc-markdown p,
      .theme-doc-markdown li {
        color: color-mix(in srgb, var(--ifm-font-color-base) 84%, transparent);
      }

      .theme-doc-markdown p {
        margin-bottom: 1.2rem;
      }

      .theme-doc-markdown a {
        color: var(--ifm-color-primary-light);
        font-weight: 600;
        text-decoration-thickness: 1px;
        text-underline-offset: 3px;
      }

      .theme-doc-markdown code {
        border: 1px solid var(--ifm-color-emphasis-300);
        border-radius: 6px;
        background: color-mix(in srgb, var(--ifm-color-emphasis-200) 70%, transparent);
        font-size: 0.88em;
      }

      ::selection {
        background: color-mix(in srgb, var(--ifm-color-primary) 35%, transparent);
      }

      @media (max-width: 600px) {
        .theme-doc-markdown h1 {
          max-width: calc(100% - 4rem);
          font-size: 2rem;
        }
      }
    `;
    frameDocument.head.appendChild(styles);
  }

  return (
    <div
      className={styles.visualizerOverlay}
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.visualizerPanel}>
        <button
          className={styles.visualizerClose}
          type="button"
          onClick={onClose}
          aria-label={`Close ${node.label} ${contentLabel}`}
        >
          Close ×
        </button>
        <iframe
          className={styles.visualizerFrame}
          src={source}
          title={`${node.label} ${contentLabel}`}
          sandbox={sandbox}
          onLoad={handleFrameLoad}
        />
      </div>
    </div>
  );
}

function AtlasCanvas() {
  const { fitView } = useReactFlow();
  const pluginData = usePluginData('engineering-atlas-taxonomy', undefined, {
    failfast: false,
  }) as Taxonomy | undefined;

  const taxonomy = pluginData ?? emptyTaxonomy;
  const taxonomyNodes = Array.isArray(taxonomy.nodes) ? taxonomy.nodes : [];
  const taxonomyEdges = Array.isArray(taxonomy.edges) ? taxonomy.edges : [];
  const [selected, setSelected] = useState<TaxonomyNode | null>(null);
  const [activeVisualizer, setActiveVisualizer] = useState<TaxonomyNode | null>(null);
  const [activeArticle, setActiveArticle] = useState<TaxonomyNode | null>(null);
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string> | null>(null);

  const childrenById = useMemo(() => {
    const children = new Map<string, string[]>();
    taxonomyNodes.forEach((node) => children.set(node.id, []));
    taxonomyEdges.forEach((edge) => children.get(edge.source)?.push(edge.target));
    return children;
  }, [taxonomyNodes, taxonomyEdges]);

  const parentById = useMemo(() => {
    const parents = new Map<string, string>();
    taxonomyEdges.forEach((edge) => {
      if (!parents.has(edge.target)) parents.set(edge.target, edge.source);
    });
    return parents;
  }, [taxonomyEdges]);

  const rootIds = useMemo(() => {
    const targets = new Set(taxonomyEdges.map((edge) => edge.target));
    return taxonomyNodes.filter((node) => !targets.has(node.id)).map((node) => node.id);
  }, [taxonomyNodes, taxonomyEdges]);

  const defaultExpandedIds = useMemo(() => {
    return new Set(rootIds);
  }, [rootIds]);

  const effectiveExpandedIds = expandedIds ?? defaultExpandedIds;

  const visibleTaxonomy = useMemo(() => {
    const visibleIds = new Set<string>();
    const queue = [...rootIds];

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visibleIds.has(id)) continue;

      visibleIds.add(id);
      if (effectiveExpandedIds.has(id)) {
        queue.push(...(childrenById.get(id) ?? []));
      }
    }

    return {
      nodes: taxonomyNodes.filter((node) => visibleIds.has(node.id)),
      edges: taxonomyEdges.filter(
        (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
      ),
    };
  }, [childrenById, effectiveExpandedIds, rootIds, taxonomyEdges, taxonomyNodes]);

  const initial = useMemo(
    () => buildFlowElements(visibleTaxonomy),
    [visibleTaxonomy],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 250 });
    });
    return () => cancelAnimationFrame(frame);
  }, [fitView, initial.nodes]);

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedIds((current) => {
        const next = new Set(current ?? defaultExpandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setSelected(null);
    },
    [defaultExpandedIds],
  );

  const handleOpenVisualizer = useCallback(
    (id: string) => {
      const node = taxonomyNodes.find((item) => item.id === id);
      if (node?.visualizer) setActiveVisualizer(node);
    },
    [taxonomyNodes],
  );

  const matchingIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>();

    const compactQuery = q.replace(/[^a-z0-9]/g, '');

    return new Set(
      taxonomyNodes
        .filter((node) => {
          const searchable =
            `${node.id} ${node.label} ${node.summary ?? ''} ${node.kind}`.toLowerCase();
          return (
            searchable.includes(q) ||
            (compactQuery.length > 0 &&
              searchable.replace(/[^a-z0-9]/g, '').includes(compactQuery))
          );
        })
        .map((node) => node.id),
    );
  }, [query, taxonomyNodes]);

  const hasSearchQuery = query.trim().length > 0;

  useEffect(() => {
    if (!hasSearchQuery) {
      setExpandedIds(null);
      return;
    }

    const next = new Set(defaultExpandedIds);
    matchingIds.forEach((id) => {
      let parentId = parentById.get(id);
      while (parentId) {
        next.add(parentId);
        parentId = parentById.get(parentId);
      }
    });

    setExpandedIds(next);
  }, [defaultExpandedIds, hasSearchQuery, matchingIds, parentById]);

  const selectedPathIds = useMemo(() => {
    if (!selected) return null;

    const children = new Map<string, string[]>();
    taxonomyEdges.forEach((edge) => {
      const targets = children.get(edge.source) ?? [];
      targets.push(edge.target);
      children.set(edge.source, targets);
    });

    const ids = new Set<string>();
    const queue = [selected.id];

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (ids.has(id)) continue;

      ids.add(id);
      queue.push(...(children.get(id) ?? []));
    }

    return ids;
  }, [selected, taxonomyEdges]);

  const visibleNodes = useMemo(
    () =>
      initial.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          hasChildren: (childrenById.get(node.id)?.length ?? 0) > 0,
          expanded: effectiveExpandedIds.has(node.id),
          onToggle: handleToggle,
          onOpenVisualizer: handleOpenVisualizer,
        },
        className:
          (!hasSearchQuery || matchingIds.has(node.id)) &&
            (!selectedPathIds || selectedPathIds.has(node.id))
            ? undefined
            : styles.dimmed,
      })),
    [
      childrenById,
      effectiveExpandedIds,
      handleToggle,
      handleOpenVisualizer,
      hasSearchQuery,
      initial.nodes,
      matchingIds,
      selectedPathIds,
    ],
  );

  const visibleEdges = useMemo(
    () =>
      initial.edges.map((edge) => {
        if (!selectedPathIds) return edge;

        const isSelectedPath =
          selectedPathIds.has(edge.source) && selectedPathIds.has(edge.target);

        return {
          ...edge,
          style: {
            ...edge.style,
            opacity: isSelectedPath ? 1 : 0.1,
            stroke: isSelectedPath ? 'var(--ifm-color-primary)' : edge.style?.stroke,
            strokeWidth: isSelectedPath ? 3 : edge.style?.strokeWidth,
          },
        };
      }),
    [initial.edges, selectedPathIds],
  );

  function handleNodeClick(_: React.MouseEvent, flowNode: Node) {
    const node = flowNode.data as TaxonomyNode;
    setSelected(node);

    if (
      (childrenById.get(node.id)?.length ?? 0) > 0 &&
      !effectiveExpandedIds.has(node.id)
    ) {
      setExpandedIds((current) => {
        const next = new Set(current ?? defaultExpandedIds);
        next.add(node.id);
        return next;
      });
    }
  }

  if (taxonomyNodes.length === 0) {
    return (
      <div className={styles.emptyState}>
        No taxonomy data was loaded. Check <code>taxonomy/index.yaml</code> and the
        Docusaurus console for validation errors.
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.toolbar}>
        <label className={styles.searchLabel}>
          <span>Find a concept or technology</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
            }}
            placeholder="Try Redis, cache, database..."
          />
        </label>
        <div className={styles.legend}>
          <span><i data-status="covered" /> Covered</span>
          <span><i data-status="partial" /> In progress</span>
          <span><i data-status="planned" /> Planned</span>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.canvas}>
          <ReactFlow
            nodes={visibleNodes}
            edges={visibleEdges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            onPaneClick={() => setSelected(null)}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.25}
            maxZoom={1.8}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
          >
            <MiniMap
              className={styles.miniMap}
              position="top-right"
              nodeColor={getMiniMapNodeColor}
              nodeStrokeColor="#dbe5f1"
              nodeStrokeWidth={1.5}
              nodeBorderRadius={8}
              bgColor="#111722"
              maskColor="rgb(2 6 15 / 68%)"
              maskStrokeColor="#60a5fa"
              maskStrokeWidth={1.5}
              pannable
              zoomable
            />
            <Controls showInteractive={false} />
            <Background gap={24} size={1} />
          </ReactFlow>
        </div>

        <aside className={styles.details}>
          {selected ? (
            <>
              <div className={styles.detailsMeta}>
                <span>{selected.kind}</span>
                <span>{selected.status}</span>
              </div>
              <h2>{selected.label}</h2>
              {selected.summary ? (
                <p>{selected.summary}</p>
              ) : (
                <p className={styles.muted}>No article description yet.</p>
              )}
              {selected.doc ? (
                <button
                  className="button button--primary button--block"
                  type="button"
                  onClick={() => setActiveArticle(selected)}
                >
                  Read More
                </button>
              ) : (
                <div className={styles.notReady}>Article not written yet.</div>
              )}
            </>
          ) : (
            <>
              <h2>Select a node</h2>
              <p>
                Click any node to see its type and open its MD/MDX page when one exists.
              </p>
            </>
          )}
        </aside>
      </div>

      {activeVisualizer ? (
        <ContentDialog
          node={activeVisualizer}
          sourcePath={activeVisualizer.visualizer!}
          contentLabel="visualizer"
          onClose={() => setActiveVisualizer(null)}
          sandbox="allow-scripts allow-same-origin"
        />
      ) : null}

      {activeArticle ? (
        <ContentDialog
          node={activeArticle}
          sourcePath={activeArticle.doc!}
          contentLabel="article"
          onClose={() => setActiveArticle(null)}
          hideSiteChrome
        />
      ) : null}
    </div>
  );
}

export default function Atlas() {
  return (
    <ReactFlowProvider>
      <AtlasCanvas />
    </ReactFlowProvider>
  );
}
