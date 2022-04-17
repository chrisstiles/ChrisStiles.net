import { memo, useMemo, useRef, useEffect, useState } from 'react';
import styles, { logoSize, logoOffset } from './LogoAnimation.module.scss';
import { getElementIndex } from '@helpers';
import gsap from 'gsap';
import classNames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import { round } from 'lodash';

export default memo(function LogoAnimation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const delay = 1000;
    const timer = window.setTimeout(() => setIsVisible(true), delay);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={styles.wrapper}
    >
      <div className={styles.content}>
        {icons.map((list, index) => (
          <LogoColumn
            key={index}
            logos={list}
            isVisible={isVisible}
            isPlaying={true}
            direction={index % 2 === 0 ? 'down' : 'up'}
          />
        ))}
      </div>
    </div>
  );
});

function LogoColumn({
  logos,
  isVisible,
  isPlaying,
  direction = 'down'
}: LogoColumnProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const logoCount = logos?.length ?? 0;

  const components = useMemo(() => {
    return !logoCount
      ? null
      : logos.map((logo, index) => (
          <div
            key={index}
            className={styles.logo}
          >
            {logo}
          </div>
        ));
  }, [logos, logoCount]);

  // The distance each logo must animate before wrapping
  const [wrapperSize, setWrapperSize] = useState(0);

  useEffect(() => {
    const wrapperEl = wrapper.current;
    const observer = new ResizeObserver(([entry]) => {
      setWrapperSize(entry.contentRect.height);
    });

    if (wrapperEl) {
      setWrapperSize(wrapperEl.offsetHeight);
      observer.observe(wrapperEl);
    }

    return () => observer.disconnect();
  }, [logos, logoCount]);

  const isPlayingRef = useRef(isPlaying);
  const logoTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying && isVisible;

    if (isPlaying) {
      logoTween.current?.play();
    } else {
      logoTween.current?.pause();
    }
  }, [isVisible, isPlaying]);

  useEffect(() => {
    const wrapperEl = wrapper.current;

    if (wrapperEl && logoCount && wrapperSize) {
      const offset = parseInt(logoOffset);
      const size = parseInt(logoSize) + offset;

      gsap.set(wrapperEl.children, { y: i => i * size });

      // Calculate duration based on the
      // number of logos to ensure all
      // columns animate at the same speed
      const baseCount = 10;
      const baseDuration = 30;
      const duration = (baseDuration * logoCount) / baseCount;
      const distance = logoCount * size;

      logoTween.current = gsap.to(wrapperEl.children, {
        y: `+=${distance}`,
        duration: round(duration, 3),
        ease: 'none',
        repeat: -1,
        paused: !isPlayingRef.current || !isVisible,
        runBackwards: direction === 'up',
        modifiers: {
          y: gsap.utils.unitize(y => parseFloat(y) % distance)
        }
      });
    }

    return () => {
      logoTween.current?.kill();
    };
  }, [wrapperSize, logoCount, direction, isVisible, components]);

  const hasInitialAnimation = useRef(false);
  const columnTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (isVisible && wrapper.current && !hasInitialAnimation.current) {
      hasInitialAnimation.current = true;

      const index = Math.max(0, getElementIndex(wrapper.current));
      const height = logoCount * (parseInt(logoSize) + parseInt(logoOffset));
      const translate = direction === 'up' ? height : -height - wrapperSize;

      columnTween.current = gsap.fromTo(
        wrapper.current,
        { y: Math.round(translate) },
        {
          y: 0,
          duration: 3.2,
          ease: 'expo.inOut',
          paused: !isVisible,
          delay: index * 0.2
        }
      );
    }
  }, [direction, isVisible, logoCount, wrapperSize]);

  useEffect(() => {
    if (isVisible) {
      columnTween.current?.play();
    }
  }, [isVisible]);

  return !logoCount ? null : (
    <div
      ref={wrapper}
      className={classNames(styles.column, direction, {
        [styles.visible]: isVisible
      })}
    >
      {components}
    </div>
  );
}

type LogoColumnProps = {
  logos: string[];
  isVisible: boolean;
  isPlaying: boolean;
  direction?: 'up' | 'down';
};

const icons = [
  ['1', '2', '3', '4', '5', '6', '7'],
  ['8', '9', '10', '11', '12', '13', '14'],
  ['15', '16', '17', '18', '19', '20', '21']
];
