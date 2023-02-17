import { useRef, useEffect, memo } from 'react';
import styles from './ProjectHighlights.module.scss';
import gsap from 'gsap';
import { round } from 'lodash';

export default memo(function ProjectHighlights() {
  const wrapper = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!wrapper.current || !scroller.current?.children.length) return;

    const velocity = 25;
    const elements = Array.from(scroller.current.children);

    const distance = elements.reduce((offset, el) => {
      gsap.set(el, { x: offset });
      return offset + el.clientWidth;
    }, 0);

    animation.current = gsap.to(scroller.current.children, {
      x: `+=${distance}`,
      runBackwards: true,
      ease: 'none',
      repeat: -1,
      duration: round(distance / velocity, 5),
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % distance)
      }
    });
  }, []);

  return (
    <div
      ref={wrapper}
      className={styles.wrapper}
    >
      <div
        ref={scroller}
        className={styles.scrollWrapper}
      >
        <Highlight
          title="1 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
        />
        <Highlight
          title="2 Highlight box title"
          text="Lorem  dolor sit amet, consectetur"
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
