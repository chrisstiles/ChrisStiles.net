import { useState, useEffect, useRef } from 'react';
import styles from './Button.module.scss';
import useIsMounted from '@hooks/useIsMounted';
import { Spinner } from '@elements';
import Link, { type LinkProps } from 'next/link';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';

export function Button({
  className,
  disabled,
  children,
  isLoading,
  ...props
}: ButtonProps) {
  const [disableTransition, setDisableTransition] = useState(!!disabled);
  const disableTransitionTimer = useRef<number>();
  const isMounted = useIsMounted();

  useEffect(() => {
    clearTimeout(disableTransitionTimer.current);

    if (disabled) {
      setDisableTransition(true);
    } else {
      disableTransitionTimer.current = window.setTimeout(() => {
        if (isMounted()) {
          setDisableTransition(false);
        }
      }, 200);
    }
  }, [disabled, isMounted]);

  return (
    <button
      className={classNames(styles.button, className, {
        [styles.noTransition]: disabled || disableTransition,
        [styles.loading]: isLoading
      })}
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

export default Button;

export function LinkButton({ className, children, ...props }: LinkButtonProps) {
  return (
    <Link {...props}>
      <a className={classNames(styles.button, className)}>{children}</a>
    </Link>
  );
}

type ButtonProps = ComponentProps<'button'> & {
  isLoading?: boolean;
};

type LinkButtonProps = LinkProps & {
  className?: string;
  children: ReactNode;
};
