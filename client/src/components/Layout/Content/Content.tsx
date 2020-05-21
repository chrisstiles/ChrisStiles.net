import React from 'react';
import classNames from 'classnames';
import styles from './Content.module.scss';

export default function Content({
  className,
  children,
  style,
  tag: Tag
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

Content.defaultProps = {
  tag: 'div'
};

type ContentProps = {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  tag: keyof JSX.IntrinsicElements;
};
