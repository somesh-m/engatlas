import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="Engineering Atlas"
      description="A growing map of software engineering concepts, technologies and tradeoffs."
    >
      <main>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.eyebrow}>BUILT ONE TOPIC AT A TIME</p>
            <h1>A map of software engineering.</h1>
            <p className={styles.lead}>
              Explore the taxonomy, then open the notes and infographics behind each covered node.
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
