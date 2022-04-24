import { memo, useMemo, useRef, useEffect, useState, useId } from 'react';
import styles from './LogoAnimation.module.scss';
import gsap from 'gsap';
import classNames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import { round, shuffle, chunk } from 'lodash';

const baseLogoSize = parseInt(styles.logoSize);
const baseLogoOffset = parseInt(styles.logoOffset);

export default memo(function LogoAnimation({
  iconFileNames = []
}: LogoAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [icons, setIcons] = useState<string[][]>([]);

  useEffect(() => {
    const columnLength = Math.ceil(iconFileNames.length / 3);
    setIcons(chunk(shuffle(iconFileNames), columnLength));
  }, [iconFileNames]);

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
            index={index}
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
  direction = 'down',
  index
}: LogoColumnProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const logoCount = logos?.length ?? 0;

  const id = useId();
  const filterId = useMemo(() => `blur-filter-${id}`, [id]);
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
  }, [logos, logoCount, filterId]);

  // The distance each logo must animate before wrapping
  const [wrapperSize, setWrapperSize] = useState(0);
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
    });

    if (wrapperEl) {
      setWrapperSize(wrapperEl.offsetHeight);
      observer.observe(wrapperEl);
    }

    return () => observer.disconnect();
  }, [logos, logoCount]);

  const hasInitialAnimation = useRef(false);
  const hasStartedLogoAnimation = useRef(false);
  const isPlayingRef = useRef(false);
  const logoTween = useRef<gsap.core.Tween | null>(null);
  const logoVelocity = useRef(5);

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

    if (wrapperEl && logoCount) {
      const size = logoSize + logoOffset;

      gsap.set(wrapperEl.children, { y: i => i * size });

      // Calculate duration based on the
      // number of logos to ensure all
      // columns animate at the same speed
      const baseCount = 10;
      const baseDuration = 30;
      const duration = (baseDuration * logoCount) / baseCount;
      const distance = logoCount * size;

      logoTween.current = gsap.to(wrapperEl.children, {
        y: () => `+=${distance}`,
        duration: round(duration, 3),
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
  }, [logoCount, direction, components, logoSize, logoOffset]);

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

      const multiplier = 0.7;
      const getValue = gsap.getProperty(wrapper.current);
      const getPosition = () => {
        return {
          x: Number(getValue('x')),
          y: Number(getValue('y'))
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

      columnTween.current = gsap.to(wrapper.current, {
        y:
          direction === 'down'
            ? 0
            : -height + wrapperSize + (logoSize + logoOffset) * 2,
        duration: 3.8 - index * 0.51,
        ease: 'expo.out',
        paused: !isVisible,
        delay: index * 0.25,
        onUpdate() {
          const { x, y } = getPosition();

          if (x === prevPosition.x && y === prevPosition.y) {
            return;
          }

          const deltaRatio = gsap.ticker.deltaRatio(60);

          const dx = Math.abs(x - prevPosition.x);
          const dy = Math.abs(y - prevPosition.y);

          const vx = dx / deltaRatio;
          const vy = dy / deltaRatio;

          const startLogoAnimationVelocity = logoVelocity.current + 0.2;
          const canStartLogoAnimation =
            (vx > 0 && vx <= startLogoAnimationVelocity) ||
            (vy > 0 && vy <= startLogoAnimationVelocity);

          if (
            !hasStartedLogoAnimation.current &&
            canStartLogoAnimation &&
            this.progress() >= 0.4
          ) {
            hasStartedLogoAnimation.current = true;
            isPlayingRef.current = true;
            logoTween.current?.play();
          }

          if (!blurFilter.current) {
            return;
          }

          blurX.baseVal = vx * multiplier;
          blurY.baseVal = vy * multiplier;

          prevPosition.x = x;
          prevPosition.y = y;
        },
        onComplete() {
          blurX.baseVal = 0;
          blurY.baseVal = 0;
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
}

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
