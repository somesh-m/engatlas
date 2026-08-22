import React, {useEffect} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

export default function AtlasRedirectPage() {
  const homeUrl = useBaseUrl('/');

  useEffect(() => {
    window.location.replace(homeUrl);
  }, [homeUrl]);

  return (
    <Layout
      title="Engineering Atlas has moved"
      description="The interactive Engineering Atlas is now available on the homepage."
      noFooter
    >
      <Head>
        <meta name="robots" content="noindex,follow" />
        <meta httpEquiv="refresh" content={`0;url=${homeUrl}`} />
        <link rel="canonical" href="https://engmap.dev/" />
      </Head>
      <main className="container margin-vert--xl">
        <h1>Engineering Atlas has moved</h1>
        <p>
          Continue to the <Link to="/">interactive Engineering Atlas</Link>.
        </p>
      </main>
    </Layout>
  );
}
