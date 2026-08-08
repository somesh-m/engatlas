export type TaxonomyKind =
  | 'root'
  | 'category'
  | 'concept'
  | 'technology'
  | 'protocol'
  | 'algorithm'
  | 'data-structure'
  | 'pattern';

export type ContentStatus = 'planned' | 'partial' | 'covered';

export type TaxonomyNode = {
  id: string;
  label: string;
  kind: TaxonomyKind;
  status: ContentStatus;
  summary: string;
  doc?: string;
  visualizer?: string;
};

export type TaxonomyEdge = {
  source: string;
  target: string;
};

export type Taxonomy = {
  nodes: TaxonomyNode[];
  edges: TaxonomyEdge[];
};
