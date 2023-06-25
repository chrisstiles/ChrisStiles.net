import { useState, useEffect, useRef, forwardRef } from 'react';
import styles from './Button.module.scss';
import useIsMounted from '@hooks/useIsMounted';
import { Spinner } from '@elements';
import Link, { type LinkProps } from 'next/link';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, disabled, children, isLoading, theme, ...props },
    ref
  ) {
    const [disableTransition, setDisableTransition] = useState(!!disabled);
    const disableTransitionTimer = useRef<number>();
    const isMounted = useIsMounted();

    useEffect(() => {
      clearTimeout(disableTransitionTimer.current);

      if (disabled) {
        setDisableTransition(true);
      } else {
        disableTransitionTimer.current = window.setTimeout(() => {
          if (isMounted()) setDisableTransition(false);
        }, 200);
      }
    }, [disabled, isMounted]);

    return (
      <button
        ref={ref}
        className={classNames('button', styles.button, className, {
          [styles.noTransition]: disabled || disableTransition,
          [styles.loading]: isLoading,
          [styles.secondary]: theme === 'secondary'
        })}
        onBlur={e => {
          e.target.classList.remove('no-outline');
          props.onBlur?.(e);
        }}
        disabled={disabled}
        {...props}
      >
        {isLoading && (
          <span className={styles.spinnerWrapper}>
            <Spinner />
          </span>
        )}
        <span className={styles.text}>{children}</span>
      </button>
    );
  }
);

export default Button;

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton({ className, children, theme, ...props }, ref) {
    return (
      <Link {...props}>
        <a
          ref={ref}
          className={classNames('button', styles.button, className, {
            [styles.secondary]: theme === 'secondary'
          })}
        >
          {children}
        </a>
      </Link>
    );
  }
);

type ButtonPropsShared = {
  theme?: 'primary' | 'secondary';
};

type ButtonProps = ButtonPropsShared &
  ComponentProps<'button'> & {
    isLoading?: boolean;
  };

type LinkButtonProps = ButtonPropsShared &
  LinkProps & {
    className?: string;
    children: ReactNode;
  };
