import React, { useRef, useEffect } from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import styles from './Home.module.scss';
import space from './space.jpg';
import classNames from 'classnames';
import gsap from 'gsap';

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
      <FixedBackground />
    </Layout>
  );
}

function SVGClip() {
  const rectRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    console.log(rectRef.current);
  }, []);

  return (
    <React.Fragment>
      {/* <div className={styles.clip}>

      </div> */}

      <div className={styles.clip}>
        {/* <div className={styles.bgWrapper}>
          <div className={styles.bg} />
        </div> */}
        <svg width="100%" height="300px">
          <defs>
            <mask id="overlay-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="#FFF" />
              <text x="0" y="80" fontWeight="900" fontSize="110px" fill="#000">
                Chris
              </text>

              <text x="0" y="173" fontWeight="900" fontSize="110px" fill="#000">
                Stiles
              </text>

              {/* <rect
                x="700"
                y="10"
                // width="100"
                // height="100"
                className={styles.rectAnimation}
              /> */}
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
            fill="#2a3352"
            // fill="red"
            mask="url(#overlay-mask)"
          />
        </svg>

        {/* <svg width="100%" height="100%" className={styles.overlay}>
          <rect
            width="100%"
            height="100%"
            fill="#2a3352"
            mask="url(#overlay-mask)"
          />
        </svg> */}

        {/* <svg width="100%" height="100%" className={styles.overlay}>
          <rect
            width="100%"
            height="100%"
            fill="#fff"
            mask="url(#overlay-clip)"
          />
        </svg> */}
      </div>

      {/* <div
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

              <rect
                x="700"
                y="10"
                fill="#000"
                width="200px"
                height="500px"
                ref={rectRef}
                className={styles.rectAnimation}
              />
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
      </div> */}
    </React.Fragment>
  );
}

function FixedBackground() {
  return (
    <div className={styles.fixedBgWrapper}>
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="polka-dots"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <rect x="3" y="3" width="2" height="2" fill="#000" />
          </pattern>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#polka-dots)"
        ></rect>
      </svg>
    </div>
  );
}
