import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Foundations',
      items: ['foundations/systems'],
    },
    {
      type: 'category',
      label: 'Data',
      items: ['data/storage', 'data/database', 'data/cache', 'data/sql-vs-nosql'],
    },
    {
      type: 'category',
      label: 'Technologies',
      items: ['technologies/redis'],
    },
  ],
};

export default sidebars;
