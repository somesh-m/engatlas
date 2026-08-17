const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const PLUGIN_NAME = 'engineering-atlas-taxonomy';
const VALID_TYPES = new Set([
  'root',
  'category',
  'concept',
  'technology',
  'protocol',
  'algorithm',
  'data-structure',
  'pattern',
]);

function readYaml(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const parsed = YAML.parse(text);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Taxonomy file must contain one YAML object: ${filePath}`);
  }

  return parsed;
}

function resolveIncludes(node, currentDir, includeStack = []) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new Error(`Invalid taxonomy node in ${includeStack.at(-1) ?? 'taxonomy'}`);
  }

  if (node.include) {
    if (typeof node.include !== 'string') {
      throw new Error('Taxonomy include must be a file name string.');
    }

    const includePath = path.resolve(currentDir, node.include);
    if (includeStack.includes(includePath)) {
      throw new Error(`Circular taxonomy include: ${[...includeStack, includePath].join(' -> ')}`);
    }

    const included = readYaml(includePath);
    return resolveIncludes(included, path.dirname(includePath), [...includeStack, includePath]);
  }

  const children = Array.isArray(node.children)
    ? node.children.map((child) => resolveIncludes(child, currentDir, includeStack))
    : [];

  return {...node, children};
}

function flattenTaxonomy(root) {
  const nodes = [];
  const edges = [];
  const ids = new Set();

  function visit(node, parentId) {
    if (typeof node.id !== 'string' || node.id.trim() === '') {
      throw new Error(`Every taxonomy node needs a non-empty "id". Parent: ${parentId ?? 'none'}`);
    }
    if (typeof node.name !== 'string' || node.name.trim() === '') {
      throw new Error(`Taxonomy node "${node.id}" needs a non-empty "name".`);
    }
    if (ids.has(node.id)) {
      throw new Error(`Duplicate taxonomy id: "${node.id}".`);
    }

    const kind = node.type ?? 'category';
    if (!VALID_TYPES.has(kind)) {
      throw new Error(
        `Unknown taxonomy type "${kind}" on "${node.id}". ` +
          `Allowed: ${[...VALID_TYPES].join(', ')}`,
      );
    }

    if (
      node.visualizer !== undefined &&
      (typeof node.visualizer !== 'string' || !node.visualizer.startsWith('/'))
    ) {
      throw new Error(
        `Taxonomy node "${node.id}" visualizer must be a site-relative path beginning with "/".`,
      );
    }

    ids.add(node.id);
    nodes.push({
      id: node.id,
      label: node.name,
      kind,
      ...(node.visualizer ? {visualizer: node.visualizer} : {}),
    });

    if (parentId) {
      edges.push({source: parentId, target: node.id});
    }

    for (const child of node.children ?? []) {
      visit(child, node.id);
    }
  }

  visit(root, undefined);
  return {nodes, edges};
}

function walkFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];

  const output = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...walkFiles(fullPath, extensions));
    } else if (extensions.has(path.extname(entry.name).toLowerCase())) {
      output.push(fullPath);
    }
  }
  return output;
}

function parseFrontMatter(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.startsWith('---')) return {};

  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
  if (!match) return {};

  const value = YAML.parse(match[1]);
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeAtlasIds(frontMatter) {
  if (typeof frontMatter.atlas_id === 'string') return [frontMatter.atlas_id];
  if (Array.isArray(frontMatter.atlas_ids)) {
    return frontMatter.atlas_ids.filter((id) => typeof id === 'string' && id.length > 0);
  }
  return [];
}

function docRoute(filePath, docsDir, frontMatter) {
  if (typeof frontMatter.atlas_route === 'string' && frontMatter.atlas_route.startsWith('/')) {
    return frontMatter.atlas_route;
  }

  let relative = path.relative(docsDir, filePath).replaceAll(path.sep, '/');
  relative = relative.replace(/\.(md|mdx)$/i, '');
  if (relative.endsWith('/index')) relative = relative.slice(0, -'/index'.length);

  return `/learn/${relative}`;
}

function loadContentIndex(docsDir) {
  const index = {};

  for (const filePath of walkFiles(docsDir, new Set(['.md', '.mdx']))) {
    const frontMatter = parseFrontMatter(filePath);
    const atlasIds = normalizeAtlasIds(frontMatter);
    if (atlasIds.length === 0) continue;

    const entry = {
      title:
        typeof frontMatter.title === 'string'
          ? frontMatter.title
          : path.basename(filePath).replace(/\.(md|mdx)$/i, ''),
      description:
        typeof frontMatter.description === 'string' ? frontMatter.description : '',
      doc: docRoute(filePath, docsDir, frontMatter),
    };

    for (const atlasId of atlasIds) {
      if (index[atlasId]) {
        throw new Error(
          `More than one MD/MDX document declares atlas id "${atlasId}". ` +
            `Conflicting file: ${filePath}`,
        );
      }
      index[atlasId] = entry;
    }
  }

  return index;
}

function applyContent(nodes, edges, contentIndex) {
  const children = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    children.get(edge.source)?.push(edge.target);
  }

  const hasCoveredDescendant = new Map();

  function descendantCovered(id, visiting = new Set()) {
    if (hasCoveredDescendant.has(id)) return hasCoveredDescendant.get(id);
    if (visiting.has(id)) return false;

    visiting.add(id);
    let found = false;
    for (const childId of children.get(id) ?? []) {
      if (contentIndex[childId] || descendantCovered(childId, visiting)) {
        found = true;
        break;
      }
    }
    visiting.delete(id);
    hasCoveredDescendant.set(id, found);
    return found;
  }

  return nodes.map((node) => {
    const article = contentIndex[node.id];
    return {
      ...node,
      status: article ? 'covered' : descendantCovered(node.id) ? 'partial' : 'planned',
      summary: article?.description ?? '',
      doc: article?.doc,
    };
  });
}

function validateContentIds(nodes, contentIndex) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const unknown = Object.keys(contentIndex).filter((id) => !nodeIds.has(id));

  if (unknown.length > 0) {
    throw new Error(
      `MD/MDX files reference atlas ids that do not exist in taxonomy: ${unknown.join(', ')}`,
    );
  }
}

module.exports = function engineeringAtlasTaxonomyPlugin(context) {
  const taxonomyDir = path.join(context.siteDir, 'taxonomy');
  const docsDir = path.join(context.siteDir, 'docs');
  const rootFile = path.join(taxonomyDir, 'index.yaml');

  return {
    name: PLUGIN_NAME,

    injectHtmlTags() {
      return {
        postBodyTags: [
          {
            tagName: 'script',
            attributes: {
              type: 'module',
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              'data-cf-beacon': '{"token": "34f86ca0cbe24bd5863e62f7b14eec57"}',
            },
          },
        ],
      };
    },

    getPathsToWatch() {
      return [
        path.join(taxonomyDir, '**/*.yaml'),
        path.join(taxonomyDir, '**/*.yml'),
        path.join(docsDir, '**/*.md'),
        path.join(docsDir, '**/*.mdx'),
      ];
    },

    async loadContent() {
      const root = resolveIncludes(readYaml(rootFile), taxonomyDir, [rootFile]);
      const {nodes, edges} = flattenTaxonomy(root);
      const contentIndex = loadContentIndex(docsDir);

      validateContentIds(nodes, contentIndex);

      return {
        nodes: applyContent(nodes, edges, contentIndex),
        edges,
      };
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
