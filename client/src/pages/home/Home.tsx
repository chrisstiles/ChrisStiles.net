import React from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import styles from './Home.module.scss';
import space from './space.jpg';
import classNames from 'classnames';

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
    <React.Fragment>
      <div className={styles.clip}>
        <div className={styles.bgWrapper}>
          <div className={styles.bg} />
        </div>
        <svg width="0" height="0">
          <defs>
            <clipPath id="text-clip">
              <text x="50" y="133" fontWeight="900" fontSize="100px">
                HTML Clip
              </text>
            </clipPath>
          </defs>
        </svg>
      </div>

      <div
        className={classNames(styles.clip, styles.bgAnimation)}
        style={{
          backgroundImage: `url(${space})`,
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'repeat'
        }}
      >
        <svg width="100%" height="100%">
          <defs>
            <mask id="svg-clip">
              <rect x="0" y="0" width="100%" height="100%" fill="#FFF" />
              <text
                x="50"
                y="133"
                fontWeight="900"
                fontSize="100px"
                fill="#000"
              >
                SVG Clip
              </text>
            </mask>
          </defs>

          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="#fff"
            mask="url(#svg-clip)"
          />
        </svg>
      </div>
    </React.Fragment>
  );
}
