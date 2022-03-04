import React from 'react';
import classNames from 'classnames';
import styles from './Content.module.scss';

export default function Content({
  className,
  children,
  style,
  tag: Tag = 'div'
}: ContentProps) {
  return (
    <Tag
      className={classNames(styles.wrapper, className)}
      style={style}
    >
      {children}
    </Tag>
  );
}

export function Section(props: ContentProps) {
  return (
    <Content
      tag="section"
      {...props}
    />
  );
}

type ContentProps = {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
};
