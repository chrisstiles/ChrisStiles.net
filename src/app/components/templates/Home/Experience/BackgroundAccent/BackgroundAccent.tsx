import { memo, useEffect, useRef } from 'react';
import styles from './BackgroundAccent.module.scss';
import classNames from 'classnames';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';

const accentEase = BezierEasing(0.13, 0.82, 0.16, 1);

const BackgroundAccentDefinitions = memo(function BackgroundAccentDefinitions({
  isVisible
}: {
  isVisible: boolean;
}) {
  const back = useRef<SVGPathElement>(null);
  const front = useRef<SVGPathElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible) {
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
          rotate: 0,
          duration: 0.8,
          ease: accentEase,
          stagger: 0.13
        }
      );
    }
  }, [isVisible]);

  return (
    <>
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
              id="accent-gradient-back"
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
              id="accent-gradient-front-left"
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
              id="accent-gradient-front-right"
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
              id="accent-path-back"
              d="M819.587.909.683 141.855 4.91 234h825.37L819.587.909Z"
              className={styles.back}
            />
            <path
              ref={front}
              id="accent-path-front"
              d="M150.779 148.02 971.348 30.983l7.66 203.021-824.63-.039-3.599-85.945Z"
              className={styles.front}
            />
            <clipPath id="accent-back-clip">
              <use href="#accent-path-back" />
            </clipPath>
            <use
              id="accent-shape-back"
              href="#accent-path-back"
            />
            <use
              id="accent-shape-front-right"
              href="#accent-path-front"
            />
            <use
              id="accent-shape-front-left"
              href="#accent-path-front"
              clipPath="url(#accent-back-clip)"
            />
          </defs>
        </svg>
      </svg>
    </>
  );
});

export default memo(function BackgroundAccentShape({
  className,
  isVisible,
  position = 'left',
  addDefinitions
}: BackgroundAccentProps) {
  return (
    <div
      className={classNames(styles.wrapper, className, {
        [styles.right]: position === 'right',
        [styles.hidden]: !isVisible
      })}
    >
      {!!addDefinitions && (
        <BackgroundAccentDefinitions isVisible={isVisible} />
      )}
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
            href="#accent-shape-back"
            fill="url(#accent-gradient-back)"
          />
          <use
            href="#accent-shape-front-right"
            fill="url(#accent-gradient-front-right)"
          />
          <use
            href="#accent-shape-front-left"
            fill="url(#accent-gradient-front-left)"
          />
        </svg>
      </svg>
    </div>
  );
});

type BackgroundAccentProps = {
  isVisible: boolean;
  className?: string;
  position?: string;
  addDefinitions?: boolean;
};
