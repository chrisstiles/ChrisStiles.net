import React from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import styles from './Home.module.scss';

export default function Home() {
  return (
    <Layout>
      <SEO title="Home" />
      <section className={styles.hero}>
        <h1>Chris Stiles</h1>
      </section>
    </Layout>
  );
}
