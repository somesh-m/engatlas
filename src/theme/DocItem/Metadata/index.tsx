import React, {type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {PageMetadata} from '@docusaurus/theme-common';

export default function DocItemMetadata(): ReactNode {
  const {metadata, frontMatter, assets} = useDoc();
  const {siteConfig, i18n} = useDocusaurusContext();
  const image = assets.image ?? frontMatter.image;
  const pageUrl = new URL(metadata.permalink, siteConfig.url).toString();
  const homeUrl = new URL(siteConfig.baseUrl, siteConfig.url).toString();
  const fallbackImage = new URL(
    `${siteConfig.baseUrl}img/engineering-atlas-social.png`,
    siteConfig.url,
  ).toString();
  const imageUrl = image ? new URL(image, homeUrl).toString() : fallbackImage;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${pageUrl}#learning-resource`,
    name: metadata.title,
    description: metadata.description,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: imageUrl,
    inLanguage: i18n.currentLocale,
    learningResourceType: 'Reference',
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.title,
      url: homeUrl,
    },
  };

  return (
    <>
      <PageMetadata
        title={metadata.title}
        description={metadata.description}
        keywords={frontMatter.keywords}
        image={image}
      />
      <Head>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>
    </>
  );
}
