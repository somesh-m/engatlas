# Engineering Atlas starter

A frontend-only starter for a growing software-engineering taxonomy built with:

- Docusaurus 3.10.2
- React 19
- React Flow (`@xyflow/react`)
- Markdown / MDX
- YAML taxonomy files
- a small local Docusaurus plugin that turns YAML + MDX metadata into the graph

There is no database, API server, authentication layer, or committed generated graph JSON.

## Run it

Requirements: Node.js 20+

```bash
npm install
npm run start
```

Then open the local URL printed by Docusaurus and visit `/atlas`.

## The important separation

```text
taxonomy/*.yaml  -> where things belong
       +
docs/**/*.mdx    -> what covered things mean
       |
       v
local Docusaurus plugin
       |
       v
React Flow nodes + edges
```

React Flow's `nodes[]` / `edges[]` shape is deliberately **not** the authoring format.

## Taxonomy structure

The root file is:

```text
taxonomy/index.yaml
```

It can include large branches:

```yaml
id: software-engineering
name: Software Engineering
type: root
children:
  - include: system-design.yaml
  - include: distributed-systems.yaml
  - include: algorithms.yaml
```

A branch remains easy to read:

```yaml
id: cache
name: Cache
type: concept
children:
  - id: local-cache
    name: Local Cache
    type: concept
  - id: distributed-cache
    name: Distributed Cache
    type: concept
    children:
      - id: redis
        name: Redis
        type: technology
```

Supported starter types are:

- `root`
- `category`
- `concept`
- `technology`
- `protocol`
- `algorithm`
- `data-structure`
- `pattern`

## Connecting an MDX page

The taxonomy does **not** store descriptions, article URLs, or coverage status.

Attach an article using frontmatter:

```mdx
---
title: Redis
atlas_id: redis
description: "An in-memory data structure server often used for caching."
---

# Redis

Your content here.
```

One page may cover multiple taxonomy nodes:

```yaml
atlas_ids: [sql, nosql]
```

The plugin derives the Docusaurus URL from the file path. For example:

```text
docs/technologies/redis.mdx
```

becomes:

```text
/learn/technologies/redis
```

If you ever need a custom atlas link, set:

```yaml
atlas_route: /learn/some/custom/path
```

## Coverage status is automatic

- direct MDX article -> `covered`
- no direct article, but a covered descendant -> `partial`
- no content in that branch yet -> `planned`

So you don't maintain the same state in YAML and MDX.

## Validation

The local plugin fails early for common content mistakes:

- duplicate taxonomy IDs
- missing node IDs or names
- unknown node types
- circular YAML includes
- MDX referring to an atlas ID that doesn't exist
- two MDX files claiming the same atlas ID

During `npm run start`, changes under `taxonomy/` and `docs/` are watched by the Docusaurus plugin.

## Suggested workflow

1. Add or expand a node in `taxonomy/*.yaml`.
2. Pick a node for a LinkedIn infographic.
3. When you cover it, add/update its MDX file with `atlas_id`.
4. Commit and deploy the static Docusaurus build.

The taxonomy can stay tree-shaped initially. Cross-links/relationships can later be added as a separate data layer without rewriting the hierarchy.
