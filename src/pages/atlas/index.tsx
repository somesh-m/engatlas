import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

function AtlasLoading() {
  return (
    <div className={styles.loading}>
      Loading interactive atlas…
    </div>
  );
}

export default function AtlasPage() {
  return (
    <Layout
      title="Interactive Atlas"
      description="Explore a growing taxonomy of software engineering concepts and technologies."
      noFooter
    >
      <main className={styles.main}>
        <BrowserOnly fallback={<AtlasLoading />}>
          {() => {
            // Keep React Flow out of Docusaurus' server-rendering pass.
            const Atlas = require('../../components/Atlas/Atlas').default;
            return <Atlas />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
