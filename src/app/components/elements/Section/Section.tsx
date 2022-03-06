import { forwardRef, type ComponentPropsWithRef } from 'react';
import { Content } from '@elements';

export default forwardRef<HTMLElement, SectionProps>(function Section(
  { wrapContent = true, contentClassName, children, ...props },
  ref
) {
  return (
    <section
      ref={ref}
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
