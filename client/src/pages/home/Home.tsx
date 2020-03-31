import React from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import styles from './Home.module.scss';

export default function Home() {
  return (
    <Layout>
      <SEO title="Home" />
      <section className={styles.hero}>
        <div className={styles.content}>
          {/* <h1>Chris Stiles</h1> */}
          <SVGClip />
        </div>
      </section>
    </Layout>
  );
}

function SVGClip() {
  return (
    <div className={styles.clip}>
      <div className={styles.bgWrapper}>
        <div className={styles.bg} />
      </div>
      <svg viewBox="0 0 900 500">
        <defs>
          <clipPath id="text-clip">
            <text x="50" y="133" fontWeight="900" fontSize="100px">
              Chris Stiles
            </text>
            {/* <rect x="100" y="400" width="250" height="250" /> */}
          </clipPath>
        </defs>

        {/* <rect
          className={styles.rect}
          x="0"
          y="0"
          width="900"
          height="500"
          clipPath="url(#text-clip)"
        /> */}
      </svg>
    </div>
  );
}
