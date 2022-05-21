import styles from './Button.module.scss';
import Link, { type LinkProps } from 'next/link';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
//{ className, href, children, ...restProps }
export function Button({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={classNames(styles.button, className)}
      {...props}
    />
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

type LinkButtonProps = LinkProps & {
  className?: string;
  children: ReactNode;
};
