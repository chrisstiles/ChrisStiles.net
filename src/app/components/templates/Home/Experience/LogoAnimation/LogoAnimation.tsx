import {
  memo,
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  type SetStateAction,
  type Dispatch
} from 'react';
import styles from './LogoAnimation.module.scss';
import { useGrid, type GridState } from '@templates/Home';
import useSize from '@hooks/useSize';
import { isSafari } from '@helpers';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { round, shuffle, chunk } from 'lodash';

// TODO Combine column and logo tweens with timeline

const columnEase = BezierEasing(0.18, 0.7, 0.25, 1);
const startThreshold = 0.45;
const showAccentsThreshold = 0.6;
const logoVelocity = 4.8;

export default memo(function LogoAnimation({
  iconFileNames = [],
  setAccentsVisible
}: LogoAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasReachedAccentsThreshold = useRef(false);
  const showAccentsTimer = useRef<number>();

  // We dim the logo animation when it is
  // mostly outside the viewport to prevent it
  // distracting from the hero animation
  // const content = useRef<HTMLDivElement>(null);
  const filterRatio = useRef(0);

  const { ref: wrapper } = useInView({
    fallbackInView: true,
    threshold: observerThresholds,
    onChange: (inView, entry) => {
      if (entry.intersectionRatio >= startThreshold) {
        setIsVisible(true);
      }

      const { top, height } = entry.boundingClientRect;
      const intersectionRatio =
        top < 0 || window.innerHeight <= height ? 1 : entry.intersectionRatio;
      const ratio = round(intersectionRatio, 5);

      if (
        entry.target instanceof HTMLElement &&
        ratio !== filterRatio.current
      ) {
        filterRatio.current = ratio;
        entry.target.style.setProperty('--intersection', ratio.toString());
      }

      if (
        !hasReachedAccentsThreshold.current &&
        ratio >= showAccentsThreshold
      ) {
        clearTimeout(showAccentsTimer.current);

        showAccentsTimer.current = window.setTimeout(() => {
          hasReachedAccentsThreshold.current = true;
          setAccentsVisible(true);
        }, 1300);
      }

      setIsPlaying(inView);
    }
  });

  const gridState = useGrid();
  const content = useRef<HTMLDivElement>(null);
  const [columnState, setColumnState] = useState({
    numCols: 0,
    logoSize: 0,
    logoOffset: 0,
    clipOffset: 0
  });

  const contentRect = useSize(
    content,
    () => {
      if (!content.current || !gridState.columnWidth) {
        return [0, 0, 0];
      }

      const style = getComputedStyle(content.current);
      const numCols = parseInt(style.getPropertyValue('--cols')) || 4;
      const logoOffset = parseInt(style.getPropertyValue('--logo-offset')) || 0;
      const colPadding = parseInt(style.getPropertyValue('--col-padding')) || 0;
      const clipOffset = parseInt(style.getPropertyValue('--clip-offset')) || 0;
      const logoSize = gridState.columnWidth - colPadding * 2;

      setColumnState({ numCols, logoSize, logoOffset, clipOffset });
    },
    [gridState.hasInitialized]
  );

  const icons = useMemo(() => {
    if (!columnState.numCols) return;

    const columnLength = Math.ceil(iconFileNames.length / columnState.numCols);
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

    return icons.map((column, index) => {
      const column2 =
        icons.at(index - Math.floor(columnLength - 1 / 2))?.slice() ?? [];
      return column.concat(shuffle(column2).slice(0, column2.length / 1.5));
    });
  }, [iconFileNames, columnState.numCols]);

  return (
    <div
      ref={wrapper}
      role="presentation"
      aria-hidden="true"
      style={{ '--intersection': filterRatio.current }}
      className={styles.wrapper}
    >
      <div
        ref={content}
        className={styles.content}
      >
        {!!icons?.length &&
          gridState.hasInitialized &&
          icons.map((list, index) => (
            <LogoColumn
              key={index}
              wrapperRect={contentRect}
              logos={list}
              logoSize={columnState.logoSize}
              logoOffset={columnState.logoOffset}
              clipOffset={columnState.clipOffset}
              gridState={gridState}
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
  wrapperRect,
  gridState,
  logos,
  logoSize,
  logoOffset,
  clipOffset,
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
                filter={`url('#${filterId}')`}
                viewBox="0 0 100 100"
              >
                <use href={`#icon-${logo}`} />
              </svg>
            </div>
          );
        });
  }, [logoCount, logos, filterId]);

  const hasInitialAnimation = useRef(false);
  const [hasInitialPosition, setHasInitialPosition] = useState(false);
  const isPlayingRef = useRef(false);
  const animation = useRef<gsap.core.Timeline>(gsap.timeline({ paused: true }));
  const prevLogoTweenDistance = useRef(0);

  if (isPlaying && isVisible && hasInitialPosition) {
    animation.current.play();
  } else if (animation.current.isActive()) {
    animation.current.pause();
  }

  useLayoutEffect(() => {
    if (wrapper.current && wrapperRect) {
      const itemHeight = logoSize + logoOffset;
      const isUp = direction === 'up';
      const delay = 0.5 + index * 0.29;
      const safeSpace = 100;

      if (!hasInitialAnimation.current) {
        const windowWidth = window.innerWidth;
        const colRect = wrapper.current.getBoundingClientRect();
        const colX = isUp ? colRect.left : colRect.right;
        const clipAngle = Math.atan(clipOffset / windowWidth);
        const offset = (windowWidth - colX) * Math.atan(clipAngle);

        const columnTranslate = isUp
          ? colRect.height - itemHeight + 400 + offset
          : -colRect.height - 400 + offset;

        gsap.set(wrapper.current, { y: columnTranslate });

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

        animation.current.to(wrapper.current, {
          y: -safeSpace,
          duration: 1.8,
          ease: columnEase,
          delay,
          onStart() {
            isPlayingRef.current = true;
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
            animation.current.killTweensOf(wrapper.current);
          }
        });
      }

      const tweenDistance = logoCount * itemHeight;

      if (tweenDistance === prevLogoTweenDistance.current) return;

      if (hasInitialAnimation.current) {
        animation.current.killTweensOf(wrapper.current.children);
      }

      gsap.set(wrapper.current.children, {
        y: (i, el: HTMLDivElement) => {
          if (prevLogoTweenDistance.current !== 0) {
            const prevY = gsap.getProperty(el, 'y') as number;
            const y = (prevY / prevLogoTweenDistance.current) * tweenDistance;

            return y % tweenDistance;
          }

          return isUp ? i * itemHeight : wrapperRect.height - i * itemHeight;
        },
        immediateRender: true,
        overwrite: true
      });

      animation.current.to(
        wrapper.current.children,
        {
          y: `+=${tweenDistance}`,
          delay: hasInitialAnimation.current ? 0 : delay,
          duration: round(itemHeight / logoVelocity, 5),
          ease: 'none',
          repeat: -1,
          runBackwards: isUp,
          overwrite: true,
          modifiers: {
            y: gsap.utils.unitize(y => parseFloat(y) % tweenDistance)
          }
        },
        animation.current.time()
      );

      prevLogoTweenDistance.current = tweenDistance;
      hasInitialAnimation.current = true;
      setHasInitialPosition(true);
    }
  }, [
    direction,
    index,
    logoCount,
    logoOffset,
    logoSize,
    clipOffset,
    wrapperRect,
    gridState
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
      <div className={styles.columnWrapper}>
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
  const multiplier = direction === 'up' ? 1.9 : 1.7;
  return !isSafari() ? multiplier : multiplier - 0.5;
}

type LogoAnimationProps = {
  iconFileNames: string[];
  setAccentsVisible: Dispatch<SetStateAction<boolean>>;
};

type LogoColumnProps = {
  wrapperRect: Nullable<DOMRect>;
  gridState: GridState;
  logos: string[];
  logoSize: number;
  logoOffset: number;
  clipOffset: number;
  isVisible: boolean;
  isPlaying: boolean;
  direction?: 'up' | 'down';
  index: number;
};

const observerThresholds = [startThreshold, showAccentsThreshold];

for (let i = 0; i <= 100; i += 0.2) {
  observerThresholds.push(i / 100);
}
