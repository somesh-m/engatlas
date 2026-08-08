import React from 'react';
import {Handle, Position, type NodeProps} from '@xyflow/react';
import type {TaxonomyNode} from './types';
import styles from './atlas.module.css';

const statusText = {
  planned: 'Planned',
  partial: 'In progress',
  covered: 'Covered',
};

type AtlasNodeData = TaxonomyNode & {
  hasChildren: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
  onOpenVisualizer: (id: string) => void;
};

export default function AtlasNode({data, selected}: NodeProps) {
  const node = data as AtlasNodeData;

  return (
    <div
      className={`${styles.node} ${selected ? styles.nodeSelected : ''}`}
      data-kind={node.kind}
      data-status={node.status}
    >
      <Handle type="target" position={Position.Top} />
      <div className={styles.nodeTopLine}>
        <span className={styles.kind}>{node.kind}</span>
        <div className={styles.nodeActions}>
          <span className={styles.status}>{statusText[node.status]}</span>
          {node.hasChildren ? (
            <button
              className={`nodrag nopan ${styles.foldButton} ${
                node.expanded ? styles.foldButtonCollapse : styles.foldButtonExpand
              }`}
              type="button"
              aria-label={`${node.expanded ? 'Collapse' : 'Expand'} ${node.label}`}
              aria-expanded={node.expanded}
              title={node.expanded ? 'Collapse branch' : 'Expand branch'}
              onClick={(event) => {
                event.stopPropagation();
                node.onToggle(node.id);
              }}
            >
              {node.expanded ? '−' : '+'}
            </button>
          ) : null}
        </div>
      </div>
      <strong>{node.label}</strong>
      {node.visualizer ? (
        <button
          className={`nodrag nopan ${styles.visualizerButton}`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            node.onOpenVisualizer(node.id);
          }}
        >
          Open visualizer
        </button>
      ) : null}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
