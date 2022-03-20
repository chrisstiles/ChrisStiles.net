import { forwardRef, type ComponentPropsWithRef } from 'react';
import styles from './Content.module.scss';
import classNames from 'classnames';

export default forwardRef<HTMLElement, ContentProps<any>>(function Content(
  { tag: Tag = 'div', className, children, ...props },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={classNames(styles.wrapper, className)}
      {...props}
    >
      {children}
    </Tag>
  );
}) as typeof ContentFunction;

export type ContentProps<T extends keyof JSX.IntrinsicElements> = {
  tag?: T;
} & ComponentPropsWithRef<T>;

declare function ContentFunction<Tag extends keyof JSX.IntrinsicElements>(
  props: ContentProps<Tag>
): JSX.Element;
