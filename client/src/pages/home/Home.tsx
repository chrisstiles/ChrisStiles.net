import React, { useRef, useEffect } from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import styles from './Home.module.scss';
import space from './space.jpg';
import classNames from 'classnames';
import gsap from 'gsap';

export default function Home() {
  return (
    <React.Fragment>
      <Layout>
        <SEO title="Home" />
        <section className={styles.hero}>
          <div className={styles.content}>
            <h1>Chris Stiles</h1>
            <SVGClip />
          </div>
        </section>
      </Layout>
      <FixedBackground />
    </React.Fragment>
  );
}

function SVGClip() {
  const rectRef = useRef<SVGRectElement>(null);

  // useEffect(() => {
  //   console.log(rectRef.current);
  // }, []);

  // console.log('Here');

  return (
    <React.Fragment>
      <div className={styles.clip}>
        <svg width="100%" height="300px">
          <defs>
            <mask id="overlay-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="#FFF" />
              <text x="0" y="80" fontWeight="900" fontSize="110px" fill="#000">
                Chris Stiles
              </text>
            </mask>

            <clipPath id="overlay-clip">
              <text x="50" y="133" fontWeight="900" fontSize="100px">
                Overlay Clip
              </text>
            </clipPath>
          </defs>

          <rect
            width="100%"
            height="100%"
            x="0"
            y="0"
            fill={styles.bgColor}
            mask="url(#overlay-mask)"
          />
        </svg>
      </div>
    </React.Fragment>
  );
}

function FixedBackground() {
  return (
    <div className={styles.fixedBgWrapper}>
      <svg width="0" height="0">
        <defs>
          <pattern
            id="polka-dots"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.8" fill={styles.dotColor} />
          </pattern>
        </defs>
      </svg>

      <svg width="100%" height="100%">
        <rect x="0" y="0" width="100%" height="100%" fill="url(#polka-dots)" />
      </svg>
    </div>
  );
}
