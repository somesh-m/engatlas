import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Foundations',
      link: {
        type: 'generated-index',
        slug: '/foundations',
        description: 'Core concepts for reasoning about software systems and their design.',
      },
      items: ['foundations/systems'],
    },
    {
      type: 'category',
      label: 'Data',
      link: {
        type: 'generated-index',
        slug: '/data',
        description: 'Storage, databases, caching, and data-modeling concepts.',
      },
      items: ['data/storage', 'data/database', 'data/cache', 'data/sql-vs-nosql'],
    },
    {
      type: 'category',
      label: 'Technologies',
      link: {
        type: 'generated-index',
        slug: '/technologies',
        description: 'Software technologies and the engineering problems they solve.',
      },
      items: ['technologies/redis'],
    },
    {
      type: 'category',
      label: 'Performance',
      link: {
        type: 'generated-index',
        slug: '/performance',
        description: 'Concepts for understanding and improving software performance.',
      },
      items: [
        'performance/cache-coherency',
        'performance/cache-line-bouncing',
        'performance/false-sharing',
      ],
    },
    {
      type: 'category',
      label: 'Algorithms',
      link: {
        type: 'generated-index',
        slug: '/algorithms',
        description: 'Algorithmic techniques, data structures, and revision guides.',
      },
      items: [
        'algorithms/binary-search-on-answer',
        'algorithms/heapify',
        'algorithms/inorder',
        'algorithms/ivf',
        'algorithms/kmeansclustering',
        'algorithms/levelorder',
        'algorithms/postorder',
        'algorithms/prefixmatching',
        'algorithms/prefixsum',
        'algorithms/preorder',
        'algorithms/two-pointers',
      ],
    },
  ],
};

export default sidebars;
