import React from 'react';
import Layout from '@layout';
import SEO from '@components/SEO';
import Header from './Header';
import Hero from './Hero';
// import styles from './Home.module.scss';

export default function Home() {
  return (
    <Layout header={<Header />}>
      <SEO title="Home" />
      <Hero />
    </Layout>
  );
}
