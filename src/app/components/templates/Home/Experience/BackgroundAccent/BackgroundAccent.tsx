import { memo, useEffect, useRef } from 'react';
import styles from './BackgroundAccent.module.scss';
import classNames from 'classnames';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';

const accentEase = BezierEasing(0.13, 0.82, 0.16, 1);

const BackgroundAccentDefinitions = memo(function BackgroundAccentDefinitions({
  isVisible,
  position = 'left',
  delay = 0
}: BackgroundAccentDefinitionsProps) {
  const back = useRef<SVGPathElement>(null);
  const front = useRef<SVGPathElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible && !hasAnimated.current) {
      gsap.set([back.current, front.current], {
        rotate: 16,
        transformOrigin: 'left bottom'
      });
    }

    if (isVisible && !hasAnimated.current && back.current && front.current) {
      hasAnimated.current = true;
      gsap.fromTo(
        [back.current, front.current],
        { rotate: 16 },
        {
          delay,
          rotate: 0,
          duration: 1.2,
          ease: accentEase,
          stagger: 0.25
        }
      );
    }
  }, [isVisible, delay]);

  return (
    <svg
      width="0"
      height="0"
      viewBox="0 0 825 235"
      aria-hidden="true"
    >
      <svg
        x="-155"
        width="980"
        height="235"
        viewBox="0 0 980 235"
        fill="none"
      >
        <defs>
          <linearGradient
            id={`${position}-accent-gradient-back`}
            gradientTransform="rotate(-20)"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="45%"
              stopColor="#aef7e6"
            />
            <stop
              offset="100%"
              stopColor="#cffff3"
            />
          </linearGradient>
          <linearGradient
            id={`${position}-accent-gradient-front-left`}
            gradientTransform="rotate(-25)"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="30%"
              stopColor="#d28ba0"
            />
            <stop
              offset="100%"
              stopColor="#fe6c95"
            />
          </linearGradient>
          <linearGradient
            id={`${position}-accent-gradient-front-right`}
            gradientTransform="rotate(-25)"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="70%"
              stopColor="#AC4F6A"
            />
            <stop
              offset="90%"
              stopColor="#dd124a"
            />
          </linearGradient>
          <path
            ref={back}
            id={`${position}-accent-path-back`}
            d="M819.587.909.683 141.855 4.91 234h825.37L819.587.909Z"
            className={styles.back}
          />
          <path
            ref={front}
            id={`${position}-accent-path-front`}
            d="M150.779 148.02 971.348 30.983l7.66 203.021-824.63-.039-3.599-85.945Z"
            className={styles.front}
          />
          <clipPath id={`${position}-accent-back-clip`}>
            <use href={`#${position}-accent-path-back`} />
          </clipPath>
          <use
            id={`${position}-accent-shape-back`}
            href={`#${position}-accent-path-back`}
          />
          <use
            id={`${position}-accent-shape-front-right`}
            href={`#${position}-accent-path-front`}
          />
          <use
            id={`${position}-accent-shape-front-left`}
            href={`#${position}-accent-path-front`}
            clipPath={`url(#${position}-accent-back-clip)`}
          />
        </defs>
      </svg>
    </svg>
  );
});

export default memo(function BackgroundAccentShape({
  className,
  isVisible,
  position = 'left',
  delay = 0
}: BackgroundAccentProps) {
  return (
    <div
      className={classNames(styles.wrapper, className, {
        [styles.right]: position === 'right',
        [styles.hidden]: !isVisible
      })}
    >
      <BackgroundAccentDefinitions
        position={position}
        isVisible={isVisible}
        delay={delay}
      />
      <svg
        className={styles.accent}
        viewBox="0 0 825 235"
        aria-hidden="true"
      >
        <svg
          x="-155"
          viewBox="0 0 980 235"
          fill="none"
        >
          <use
            href={`#${position}-accent-shape-back`}
            fill={`url(#${position}-accent-gradient-back)`}
          />
          <use
            href={`#${position}-accent-shape-front-right`}
            fill={`url(#${position}-accent-gradient-front-right)`}
          />
          <use
            href={`#${position}-accent-shape-front-left`}
            fill={`url(#${position}-accent-gradient-front-left)`}
          />
        </svg>
      </svg>
    </div>
  );
});

type BackgroundAccentDefinitionsProps = {
  isVisible: boolean;
  position?: 'left' | 'right';
  delay?: number;
};

type BackgroundAccentProps = {
  isVisible: boolean;
  className?: string;
  position?: 'left' | 'right';
  delay?: number;
};
