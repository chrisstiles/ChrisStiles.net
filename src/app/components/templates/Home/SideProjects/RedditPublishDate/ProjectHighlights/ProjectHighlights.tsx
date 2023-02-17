import { useRef, useState, useEffect, useCallback, memo } from 'react';
import styles from './ProjectHighlights.module.scss';
import { useGlobalState } from '@templates/Home';
import squircleModule from 'css-houdini-squircle/squircle.min.js';
import gsap from 'gsap';
import { useInView } from 'react-intersection-observer';
import { round } from 'lodash';
import classNames from 'classnames';

export default memo(function ProjectHighlights() {
  const wrapper = useRef<any>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const { modalIsOpen } = useGlobalState();
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

        let distance = elements.reduce((offset, el) => {
          const width = el.clientWidth;
          gsap.set(el, { x: offset });

          if (width > maxChildWidth) {
            maxChildWidth = width;
          }

          return offset + width;
        }, 0);

        gsap.set(scroller.current, { left: -maxChildWidth });

        animation.current = gsap.to(elements, {
          x: `+=${distance}`,
          runBackwards: true,
          paused: true,
          ease: 'none',
          repeat: -1,
          duration: round(distance / velocity, 5),
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % distance)
          }
        });

        setHasStarted(true);
      };

      setTimeout(animate, 50);
    };

    init();
  }, []);

  useEffect(() => {
    if (!modalIsOpen && inView) {
      animation.current?.play();
    } else {
      animation.current?.pause();
    }
  }, [modalIsOpen, inView, hasStarted]);

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
      >
        <Highlight
          title="1 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="2 Highlight box title"
          text="Lorem  dolor sit amet, consectetur Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="3 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="4 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="5 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="6 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="7 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="8 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
      </div>
    </div>
  );
});

function Highlight({ title, text }: HighlightProps) {
  return (
    <div className={styles.highlightWrapper}>
      <div className={styles.highlight}>
        <div className={styles.icon} />
        <div>
          <strong className={styles.title}>{title}</strong>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

type HighlightProps = {
  title: string;
  text: string;
};
