import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'Engineering Atlas',
  tagline: 'A growing map of software engineering concepts and technologies',
  favicon: 'img/favicon.svg',

  headTags: [
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Engineering Atlas',
        alternateName: 'Engineering Map',
        url: 'https://engmap.dev/',
        description:
          'A visual map and learning library for software engineering concepts, technologies, and tradeoffs.',
        inLanguage: 'en',
      }),
    },
  ],

  url: 'https://engmap.dev',
  baseUrl: '/',
  organizationName: 'somesh-m',
  projectName: 'engmap',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: ['./plugins/engineering-atlas-taxonomy'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'learn',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/engineering-atlas-social.png',
    metadata: [
      {
        name: 'keywords',
        content:
          'software engineering, system design, algorithms, databases, performance, engineering concepts',
      },
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Engineering Atlas',
      items: [
        {to: '/atlas', label: 'Atlas', position: 'left'},
        // {to: '/learn/intro', label: 'Learn', position: 'left'},
        {
          href: 'https://github.com/somesh-m/engatlas',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Explore',
          items: [
            {label: 'Interactive Atlas', to: '/atlas'},
            // {label: 'Content Library', to: '/learn/intro'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Engineering Map.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
