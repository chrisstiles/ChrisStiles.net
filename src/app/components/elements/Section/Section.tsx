import { forwardRef, type ComponentPropsWithRef } from 'react';
import styles from './Section.module.scss';
import { Content } from '@elements';
import classNames from 'classnames';

export default forwardRef<HTMLElement, SectionProps>(function Section(
  { wrapContent = true, className, contentClassName, children, ...props },
  ref
) {
  return (
    <section
      ref={ref}
      className={classNames(styles.wrapper, className)}
      {...props}
    >
      {!wrapContent ? (
        children
      ) : (
        <Content className={contentClassName}>{children}</Content>
      )}
    </section>
  );
});

export type SectionProps = {
  wrapContent?: boolean;
  contentClassName?: string;
  contentTag?: keyof JSX.IntrinsicElements;
} & ComponentPropsWithRef<'section'>;
