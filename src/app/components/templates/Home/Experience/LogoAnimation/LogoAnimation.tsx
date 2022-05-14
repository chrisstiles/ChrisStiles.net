import { memo, useMemo, useRef, useEffect, useState } from 'react';
import styles from './LogoAnimation.module.scss';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import ResizeObserver from 'resize-observer-polyfill';
import { round, shuffle, chunk } from 'lodash';

const columnEase = BezierEasing(0.06, 0.49, 0.04, 1);
const baseLogoSize = parseInt(styles.logoSize);
const baseLogoOffset = parseInt(styles.logoOffset);
const startThreshold = 0.4;

export default memo(function LogoAnimation({
  iconFileNames = []
}: LogoAnimationProps) {
  const [icons, setIcons] = useState<string[][]>([]);

  useEffect(() => {
    const columnLength = Math.ceil(iconFileNames.length / 3);
    setIcons(chunk(shuffle(iconFileNames), columnLength));
  }, [iconFileNames]);

  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { ref, inView, entry } = useInView({
    fallbackInView: true,
    threshold: [0, startThreshold]
  });

  useEffect(() => {
    if (inView && entry && entry.intersectionRatio >= startThreshold) {
      setIsVisible(true);
    }

    setIsPlaying(inView);
  }, [inView, entry]);

  return (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={styles.wrapper}
    >
      <div className={styles.content}>
        {!!icons?.length &&
          icons.map((list, index) => (
            <LogoColumn
              key={index}
              logos={list}
              isVisible={isVisible}
              isPlaying={isPlaying}
              direction={index % 2 === 0 ? 'down' : 'up'}
              index={index}
            />
          ))}
      </div>
    </div>
  );
});

const LogoColumn = memo(function LogoColumn({
  logos,
  isVisible,
  isPlaying,
  direction = 'down',
  index
}: LogoColumnProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const logoCount = logos?.length ?? 0;
  const filterId = useMemo(() => `blur-filter-${index}`, [index]);
  const blurFilter = useRef<SVGFEGaussianBlurElement>(null);

  const components = useMemo(() => {
    return !logoCount
      ? null
      : logos.map((logo, index) => (
          <div
            key={index}
            className={styles.logo}
            style={{ filter: `url('#${filterId}')` }}
          >
            <svg>
              <use href={`#icon-${logo}`}></use>
            </svg>
          </div>
        ));
  }, [logoCount, logos, filterId]);

  // The distance each logo must animate before wrapping
  const [wrapperSize, setWrapperSize] = useState(0);
  const [hasInitialWrapperSize, setHasInitialWrapperSize] = useState(false);
  const [logoSize, setLogoSize] = useState(baseLogoSize);
  const [logoOffset, setLogoOffset] = useState(baseLogoOffset);

  useEffect(() => {
    const wrapperEl = wrapper.current;
    const observer = new ResizeObserver(([entry]) => {
      setWrapperSize(Math.ceil(entry.contentRect.height));

      const logo = wrapperEl?.firstElementChild as HTMLDivElement;

      if (logo) {
        const style = getComputedStyle(logo);
        const offset =
          parseInt(style.marginBottom) || parseInt(style.marginRight);

        setLogoSize(logo.offsetHeight);
        setLogoOffset(!isNaN(offset) ? offset : 20);
      }

      setHasInitialWrapperSize(true);
    });

    if (wrapperEl) {
      setWrapperSize(Math.ceil(wrapperEl.offsetHeight));
      observer.observe(wrapperEl);
    }

    return () => observer.disconnect();
  }, [logos, logoCount]);

  const hasInitialAnimation = useRef(false);
  const hasStartedLogoAnimation = useRef(false);
  const isPlayingRef = useRef(false);
  const logoTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    isPlayingRef.current =
      isPlaying && isVisible && hasStartedLogoAnimation.current;

    if (isPlayingRef.current) {
      logoTween.current?.play();
    } else {
      logoTween.current?.pause();
    }
  }, [isVisible, isPlaying]);

  useEffect(() => {
    const wrapperEl = wrapper.current;

    if (hasInitialWrapperSize && wrapperEl && logoCount) {
      const size = logoSize + logoOffset;
      gsap.set(wrapperEl.children, { y: i => i * size });

      // Calculate duration based on the
      // number of logos to ensure all
      // columns animate at the same speed
      const velocity = 5.4;
      const distance = logoCount * size;

      logoTween.current = gsap.to(wrapperEl.children, {
        y: () => `+=${distance}`,
        duration: round(size / velocity, 3),
        ease: 'none',
        repeat: -1,
        paused: !isPlayingRef.current,
        runBackwards: direction === 'up',
        modifiers: {
          y: gsap.utils.unitize(y => parseFloat(y) % distance)
        }
      });
    }

    return () => {
      logoTween.current?.kill();
    };
  }, [
    logoCount,
    direction,
    components,
    logoSize,
    logoOffset,
    hasInitialWrapperSize
  ]);

  // Animate column in before starting individual logo animations
  const columnTween = useRef<gsap.core.Tween | null>(null);
  const [hasInitialPosition, setHasInitialPosition] = useState(false);

  useEffect(() => {
    if (
      isVisible &&
      wrapper.current &&
      !hasInitialAnimation.current &&
      wrapperSize
    ) {
      hasInitialAnimation.current = true;

      const height = logoCount * (logoSize + logoOffset);
      const translate =
        direction === 'up'
          ? wrapperSize + (logoSize + logoOffset) * 2
          : -height;

      gsap.set(wrapper.current, { y: Math.round(translate) });
      setHasInitialPosition(true);

      const multiplier = direction === 'up' ? 0.83 : 0.8;
      const minBlur = 0;
      const minBlurThreshold = 0.05;
      const zeroBlurVelocity = 0.07;

      const getValue = gsap.getProperty(wrapper.current);
      const getPosition = () => {
        return {
          x: getValue('x') as number,
          y: getValue('y') as number
        };
      };

      const prevPosition = getPosition();

      let blurX = blurFilter.current?.stdDeviationX ?? {
        baseVal: 0,
        animVal: 0
      };

      let blurY = blurFilter.current?.stdDeviationY ?? {
        baseVal: 0,
        animVal: 0
      };

      let hasInitialPosition = false;
      let hasBlurX = false;
      let hasBlurY = false;
      let hasCompleteBlurX = false;
      let hasCompleteBlurY = false;

      columnTween.current = gsap.to(wrapper.current, {
        y:
          direction === 'down'
            ? 0
            : -height + wrapperSize + (logoSize + logoOffset) * 2,
        duration: 4.2,
        ease: columnEase,
        paused: !isVisible,
        delay: 0.3 + index * 0.25,
        onStart() {
          hasStartedLogoAnimation.current = true;
          isPlayingRef.current = true;
          logoTween.current?.play();
        },
        onUpdate() {
          if (!blurFilter.current || hasCompleteBlurX || hasCompleteBlurY) {
            return;
          }

          const { x, y } = getPosition();

          // Don't add blur on first frame since we don't
          // know the starting velocity yet
          if (!hasInitialPosition) {
            hasInitialPosition = true;
            prevPosition.x = x;
            prevPosition.y = y;
            return;
          }

          const deltaRatio = gsap.ticker.deltaRatio(60);
          const dx = Math.abs(x - prevPosition.x);
          const dy = Math.abs(y - prevPosition.y);

          let vx = dx / deltaRatio;
          let vy = round(dy / deltaRatio, 4);

          if (vx <= zeroBlurVelocity) vx = 0;
          if (vy <= zeroBlurVelocity) vy = 0;

          let bx = vx * multiplier;
          let by = vy * multiplier;

          if ((hasBlurX || hasBlurY) && (vx > 0 || vy > 0)) {
            const progress = this.progress();

            if (progress >= 0.4) {
              const adjustment = progress < 0.7 ? 1 - progress : 0;

              if (hasBlurX && bx <= minBlurThreshold) by *= adjustment;
              if (hasBlurY && by <= minBlurThreshold) by *= adjustment;
            }
          }

          if (hasBlurX && bx === 0) hasCompleteBlurX = true;
          if (hasBlurY && by === 0) hasCompleteBlurY = true;

          if (!hasBlurX && bx !== blurX.baseVal) hasBlurX = true;
          if (!hasBlurY && by !== blurY.baseVal) hasBlurY = true;

          blurX.baseVal = bx && minBlur ? Math.max(bx, minBlur) : bx;
          blurY.baseVal = by && minBlur ? Math.max(by, minBlur) : by;

          prevPosition.x = x;
          prevPosition.y = y;
        },
        onComplete() {
          blurX.baseVal = minBlur;
          blurY.baseVal = minBlur;
        }
      });
    }
  }, [
    direction,
    index,
    isVisible,
    logoCount,
    logoOffset,
    logoSize,
    wrapperSize
  ]);

  return !logoCount ? null : (
    <div className={styles.columnWrapper}>
      <div
        ref={wrapper}
        className={classNames(styles.column, direction, {
          [styles.visible]: isVisible && hasInitialPosition
        })}
      >
        {components}
      </div>
      <svg className={styles.blur}>
        <defs>
          <filter
            id={filterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              ref={blurFilter}
              in="SourceGraphic"
              stdDeviation="0"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
});

type LogoAnimationProps = {
  iconFileNames: string[];
};

type LogoColumnProps = {
  logos: string[];
  isVisible: boolean;
  isPlaying: boolean;
  direction?: 'up' | 'down';
  index: number;
};
