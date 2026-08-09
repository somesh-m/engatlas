import React from 'react';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="Software Engineering Concepts, Mapped"
      description="Explore a visual map of software engineering concepts, technologies, algorithms, system design, databases, performance, and their tradeoffs."
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Engineering Atlas',
            url: 'https://engmap.dev/',
            description:
              'A visual map and learning library for software engineering concepts, technologies, and tradeoffs.',
            isPartOf: {'@type': 'WebSite', name: 'Engineering Atlas', url: 'https://engmap.dev/'},
          })}
        </script>
      </Head>
      <main>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.eyebrow}>BUILT ONE TOPIC AT A TIME</p>
            <h1>A map of software engineering.</h1>
            <p className={styles.lead}>
              Explore algorithms, system design, databases, performance, and the technologies
              that connect them. Open any covered topic for practical notes and visual guides.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/atlas">
                Explore the atlas
              </Link>
              {/* <Link className="button button--secondary button--lg" to="/learn/intro">
                Browse articles
              </Link> */}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
