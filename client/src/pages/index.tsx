import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Link } from 'gatsby';

export default function Home() {
  return (
    <Layout>
      <SEO title="Home" />
      <h1>Testing 3</h1>
      <p>Using typescript</p>
      <Link to="/test">Test Page</Link>
      <p>Test 2</p>
    </Layout>
  );
}
