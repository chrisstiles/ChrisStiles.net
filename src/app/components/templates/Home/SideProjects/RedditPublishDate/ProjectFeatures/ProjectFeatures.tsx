import {
  useRef,
  useState,
  useEffect,
  useCallback,
  memo,
  type MouseEventHandler
} from 'react';
import styles from './ProjectFeatures.module.scss';
import squircleModule from 'css-houdini-squircle/squircle.min.js';
import gsap from 'gsap';
import ResizeObserver from 'resize-observer-polyfill';
import { useInView } from 'react-intersection-observer';
import { round } from 'lodash';
import classNames from 'classnames';

export default memo(function ProjectFeatures() {
  const wrapper = useRef<any>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const { ref, inView } = useInView({
    fallbackInView: true
  });

  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      wrapper.current = node;
      ref(node);
    },
    [ref]
  );

  useEffect(() => {
    let observer: Nullable<ResizeObserver> = null;

    const init = async () => {
      await import('css-paint-polyfill');
      CSS.paintWorklet.addModule(squircleModule);

      const animate = () => {
        if (!wrapper.current || !scroller.current?.children.length) {
          return;
        }

        const velocity = 30;
        const elements = Array.from(scroller.current.children);
        let maxChildWidth = 0;

        const isRunning = animation.current?.isActive();
        if (isRunning) animation.current?.kill();

        let distance = elements.reduce((offset, el) => {
          const width = el.clientWidth;
          gsap.set(el, {
            x: offset,
            left: -offset
          });

          if (width > maxChildWidth) {
            maxChildWidth = width;
          }

          return offset + width;
        }, 0);

        gsap.set(scroller.current, { left: -maxChildWidth });

        animation.current = gsap.to(elements, {
          x: `+=${distance}`,
          runBackwards: true,
          paused: !isRunning,
          ease: 'none',
          repeat: -1,
          duration: round(distance / velocity, 5),
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % distance)
          }
        });

        setHasStarted(true);
      };

      if (scroller.current) {
        observer = new ResizeObserver(() => {
          if (!animation.current) return;
          animate();
        });

        observer.observe(scroller.current);
      }

      setTimeout(animate, 50);
    };

    init();

    return () => observer?.disconnect();
  }, []);

  if (animation.current && hasStarted) {
    if (inView) {
      animation.current.play();
    } else {
      animation.current.pause();
    }
  }

  const hoverTimer = useRef<number>();

  const handleMouseEvent: MouseEventHandler<HTMLDivElement> = e => {
    clearTimeout(hoverTimer.current);

    const isHovered = e.type === 'mouseenter';
    const delay = isHovered ? 50 : 0;
    const timeScale = isHovered ? 0 : 1;

    hoverTimer.current = window.setTimeout(() => {
      if (!animation.current) return;

      gsap.to(animation.current, {
        timeScale,
        duration: 0.8,
        overwrite: true
      });
    }, delay);
  };

  return (
    <div
      ref={setRefs}
      className={styles.wrapper}
    >
      <div
        ref={scroller}
        className={classNames(styles.scrollWrapper, {
          [styles.hidden]: !hasStarted
        })}
        onMouseEnter={handleMouseEvent}
        onMouseLeave={handleMouseEvent}
      >
        <Feature
          title="1 Feature box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Feature
          title="2 Feature box title"
          text="Lorem  dolor sit amet, consectetur Lorem  dolor sit amet, consectetur"
        />
        <Feature
          title="3 Feature box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Feature
          title="4 Feature box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Feature
          title="5 Feature box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Feature
          title="6 Feature box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Feature
          title="7 Feature box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Feature
          title="8 Feature box title"
          text="Lorem  dolor sit amet, consectetur"
        />
      </div>
    </div>
  );
});

function Feature({ title, text }: FeatureProps) {
  return (
    <div className={styles.featureWrapper}>
      <div className={styles.feature}>
        <div className={styles.icon} />
        <div>
          <strong className={styles.title}>{title}</strong>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

type FeatureProps = {
  title: string;
  text: string;
};
