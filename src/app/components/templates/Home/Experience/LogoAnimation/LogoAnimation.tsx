import {
  memo,
  useMemo,
  useRef,
  useEffect,
  useState,
  type SetStateAction,
  type Dispatch
} from 'react';
import styles from './LogoAnimation.module.scss';
import { useGlobalState } from '@templates/Home';
import { isSafari } from '@helpers';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import ResizeObserver from 'resize-observer-polyfill';
import { round, shuffle, chunk } from 'lodash';

const columnCount = 4;
const columnEase = BezierEasing(0.11, 0.98, 0.32, 1);
const baseLogoSize = parseInt(styles.logoSize);
const baseLogoOffset = parseInt(styles.logoOffset);
const startThreshold = 0.45;
const showAccentsThreshold = 0.6;
const logoVelocity = 4.8;

export default memo(function LogoAnimation({
  iconFileNames = [],
  setAccentsVisible
}: LogoAnimationProps) {
  const [icons, setIcons] = useState<string[][]>([]);

  useEffect(() => {
    const columnLength = Math.ceil(iconFileNames.length / columnCount);
    const icons = chunk(shuffle(iconFileNames), columnLength);
    if (!icons.length) return;

    const firstColumn = icons[0];
    const lastColumn = icons.at(-1);

    if (lastColumn && lastColumn.length < firstColumn.length) {
      const diff = firstColumn.length - lastColumn.length;
      icons[icons.length - 1] = lastColumn.concat(
        shuffle(firstColumn.slice(0, diff))
      );
    }

    setIcons(
      icons.map((column, index) => {
        const column2 =
          icons.at(index - Math.floor(columnLength - 1 / 2))?.slice() ?? [];
        return column.concat(shuffle(column2).slice(0, column2.length / 1.5));
      })
    );
  }, [iconFileNames]);

  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { modalIsOpen } = useGlobalState();
  const { ref, inView, entry } = useInView({
    fallbackInView: true,
    threshold: [0, startThreshold, showAccentsThreshold]
  });

  useEffect(() => {
    let showAccentsTimer: number;

    if (inView && entry) {
      if (entry.intersectionRatio >= startThreshold) {
        setIsVisible(true);
      }

      if (!modalIsOpen && entry.intersectionRatio >= showAccentsThreshold) {
        showAccentsTimer = window.setTimeout(() => {
          setAccentsVisible(true);
        }, 1300);
      }
    }

    setIsPlaying(inView);

    return () => clearTimeout(showAccentsTimer);
  }, [modalIsOpen, inView, entry, setAccentsVisible]);

  // We dim the logo animation when it is
  // mostly outside the viewport to prevent it
  // distracting from the hero animation
  const content = useRef<HTMLDivElement>(null);
  const filterTween = useRef<gsap.core.Tween | null>(null);
  const filterProgress = useRef(0);

  const { ref: sentinel, entry: sentinelEntry } = useInView({
    fallbackInView: true,
    threshold: observerThresholds
  });

  useEffect(() => {
    if ('IntersectionObserver' in window && content.current) {
      gsap.set(content.current, {
        filter: 'saturate(0.2) brightness(0.7) opacity(0.3)'
      });

      filterTween.current = gsap.to(content.current, {
        filter: 'saturate(1) brightness(1) opacity(1)',
        duration: 2,
        paused: true,
        ease: 'linear',
        immediateRender: true
      });
    }
  }, []);

  useEffect(() => {
    if (filterTween.current && sentinelEntry) {
      const ratio =
        sentinelEntry.boundingClientRect.top < 0
          ? 1
          : sentinelEntry.intersectionRatio;

      if (ratio !== filterProgress.current) {
        filterProgress.current = sentinelEntry.intersectionRatio;
        filterTween.current.progress(sentinelEntry.intersectionRatio, true);
      }
    }
  }, [sentinelEntry]);

  return (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      style={{ '--column-count': columnCount }}
      className={styles.wrapper}
    >
      <div
        ref={content}
        className={styles.content}
      >
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
      <div
        ref={sentinel}
        className={styles.sentinel}
      />
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
      : logos.map((logo, index) => {
          return (
            <div
              key={index}
              className={styles.logo}
            >
              <svg
                className={styles.icon}
                style={{ filter: `url('#${filterId}')` }}
              >
                <use href={`#icon-${logo}`} />
              </svg>
            </div>
          );
        });
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
      const distance = logoCount * size;

      logoTween.current = gsap.to(wrapperEl.children, {
        y: `+=${distance}`,
        duration: round(size / logoVelocity, 5),
        ease: 'none',
        repeat: -1,
        paused: !isPlayingRef.current,
        immediateRender: true,
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

      const multiplier = getMultiplier(direction);
      const getValue = gsap.getProperty(wrapper.current);
      const getPosition = () => {
        return {
          x: getValue('x') as number,
          y: getValue('y') as number
        };
      };

      const prevPosition = getPosition();

      let blurX = 0;
      let blurY = 0;
      let hasInitialPosition = false;
      let hasBlurX = false;
      let hasBlurY = false;
      let hasCompleteBlurX = false;
      let hasCompleteBlurY = false;

      columnTween.current = gsap.to(wrapper.current, {
        y:
          direction === 'down'
            ? 0
            : Math.round(-height + wrapperSize + (logoSize + logoOffset) * 2),
        duration: 3.2,
        ease: columnEase,
        paused: !isVisible,
        delay: 0.5 + index * 0.32,
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

          const deltaRatio = gsap.ticker.deltaRatio();
          const dx = Math.floor(Math.abs(x - prevPosition.x));
          const dy = Math.floor(Math.abs(y - prevPosition.y));
          const bx = Math.max(dx / deltaRatio - logoVelocity, 0) * multiplier;
          const by = Math.max(dy / deltaRatio - logoVelocity, 0) * multiplier;

          if (hasBlurX && bx === 0) hasCompleteBlurX = true;
          if (hasBlurY && by === 0) hasCompleteBlurY = true;

          if (!hasBlurX && bx !== blurX) hasBlurX = true;
          if (!hasBlurY && by !== blurY) hasBlurY = true;

          blurX = bx;
          blurY = by;

          blurFilter.current.setAttribute('stdDeviation', `${bx},${by}`);

          prevPosition.x = x;
          prevPosition.y = y;
        },
        onComplete() {
          blurFilter.current?.setAttribute('stdDeviation', '0,0');
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

  const blurElement = useMemo(() => {
    return (
      <svg
        className={styles.blur}
        width="0"
        height="0"
      >
        <defs>
          <filter
            id={filterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolation="sRGB"
          >
            <feGaussianBlur
              ref={blurFilter}
              className="test"
              in="SourceGraphic"
              stdDeviation="0,0"
              colorInterpolationFilters="sRGB"
            />
          </filter>
        </defs>
      </svg>
    );
  }, [filterId]);

  return (
    <>
      <div
        className={styles.columnWrapper}
        // style={{ filter: !isSafari() ? `url('#${filterId}')` : undefined }}
      >
        <div
          ref={wrapper}
          className={classNames(styles.column, direction, {
            [styles.visible]: isVisible && hasInitialPosition
          })}
        >
          {components}
        </div>
        {blurElement}
      </div>
    </>
  );
});

function getMultiplier(direction: 'up' | 'down') {
  const multiplier = direction === 'up' ? 1.7 : 1.5;
  return !isSafari() ? multiplier : multiplier - 0.5;
}

type LogoAnimationProps = {
  iconFileNames: string[];
  setAccentsVisible: Dispatch<SetStateAction<boolean>>;
};

type LogoColumnProps = {
  logos: string[];
  isVisible: boolean;
  isPlaying: boolean;
  direction?: 'up' | 'down';
  index: number;
};

const observerThresholds = [startThreshold, showAccentsThreshold];

for (let i = 0; i <= 100; i += 0.2) {
  observerThresholds.push(i / 100);
}
