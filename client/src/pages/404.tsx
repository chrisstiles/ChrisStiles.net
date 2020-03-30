import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <Layout>
      <SEO title="404: Not found" />
      <h1>
        Page not found
        <span role="img" aria-label="Sad Emoji">
          😖
        </span>
      </h1>
      <p>The page you were looking may have moved</p>
    </Layout>
  );
}
