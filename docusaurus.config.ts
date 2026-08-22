import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'Engineering Atlas',
  tagline: 'A growing map of software engineering concepts and technologies',
  favicon: 'img/favicon.svg',

  url: 'https://engmap.dev',
  baseUrl: '/',
  organizationName: 'somesh-m',
  projectName: 'engmap',

  onBrokenLinks: 'throw',
  trailingSlash: false,

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
        sitemap: {
          ignorePatterns: ['/atlas'],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/engineering-atlas-social.png',
    metadata: [
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
        {to: '/', label: 'Atlas', position: 'left'},
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
            {label: 'Interactive Atlas', to: '/'},
            // {label: 'Content Library', to: '/learn/intro'},
          ],
        },
        {
          title: 'Contribute',
          items: [
            {
              label: 'Edit this page',
              href: 'https://github.com/somesh-m/engatlas',
            },
            {
              label: 'Suggest a topic',
              href: 'https://github.com/somesh-m/engatlas/issues',
            },
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
