import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import Layout from '@theme/Layout';
import type {Taxonomy} from '../components/Atlas/types';
import styles from './atlas/styles.module.css';

function AtlasLoading() {
  return (
    <div className={styles.loading}>
      Loading interactive atlas…
    </div>
  );
}

export default function AtlasHomePage() {
  const taxonomy = usePluginData('engineering-atlas-taxonomy', undefined, {
    failfast: false,
  }) as Taxonomy | undefined;
  const coveredTopics = (taxonomy?.nodes ?? []).filter((node) => node.doc);

  return (
    <Layout
      title="Interactive Software Engineering Atlas"
      description="Explore an interactive taxonomy of software engineering, from algorithms and system design to databases, performance, cloud, and developer technologies."
      noFooter
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Engineering Atlas',
            alternateName: 'Engineering Map',
            url: 'https://engmap.dev/',
            description:
              'A visual map and learning library for software engineering concepts, technologies, and tradeoffs.',
            inLanguage: 'en',
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Interactive Software Engineering Atlas',
            url: 'https://engmap.dev/',
            description:
              'An interactive taxonomy of software engineering concepts and technologies.',
            isPartOf: {'@type': 'WebSite', name: 'Engineering Atlas', url: 'https://engmap.dev/'},
            hasPart: coveredTopics.map((node) => ({
              '@type': 'LearningResource',
              name: node.label,
              url: `https://engmap.dev${node.doc}`,
            })),
          })}
        </script>
      </Head>
      <main className={styles.main}>
        <BrowserOnly fallback={<AtlasLoading />}>
          {() => {
            // Keep React Flow out of Docusaurus' server-rendering pass.
            const Atlas = require('../components/Atlas/Atlas').default;
            return <Atlas />;
          }}
        </BrowserOnly>
      </main>
      {coveredTopics.length > 0 && (
        <section className={styles.topicIndex} aria-labelledby="topic-index-heading">
          <div className="container">
            <h1 id="topic-index-heading">Software engineering topics</h1>
            <p>
              Browse the interactive map above or jump directly into a written guide.
            </p>
            <ul className={styles.topicList}>
              {coveredTopics.map((node) => (
                <li key={node.id}>
                  <Link to={node.doc!}>{node.label}</Link>
                  {node.summary && <span>{node.summary}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Layout>
  );
}
