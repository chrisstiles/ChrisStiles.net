import styles from './BackgroundAccent.module.scss';
import classNames from 'classnames';

export default function BackgroundAccent({ isVisible }: BackgroundAccentProps) {
  return (
    <>
      <svg
        width="0"
        height="0"
        viewBox="0 0 825 235"
        className={classNames({
          [styles.hidden]: !isVisible
        })}
        aria-hidden="true"
      >
        <svg
          x="-155"
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
              id="accent-path-back"
              d="M819.587.909.683 141.855 4.91 234h825.37L819.587.909Z"
              className={styles.back}
            />
            <path
              id="accent-path-front"
              d="M150.779 148.02 971.348 30.983l7.66 203.021-824.63-.039-3.599-85.945Z"
              className={styles.front}
            />
            <clipPath id="accent-back-clip">
              <use href="#accent-path-back" />
            </clipPath>
            <rect
              id="accent-shape-back"
              clipPath="url(#accent-back-clip)"
              width="100%"
              height="100%"
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
      <Shape />
      <Shape className={styles.right} />
    </>
  );
}

type BackgroundAccentProps = {
  isVisible: boolean;
};

function Shape({ className }: { className?: string }) {
  return (
    <svg
      className={classNames(styles.accent, className)}
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
  );
}
