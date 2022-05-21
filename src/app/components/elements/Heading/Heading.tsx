import { type FunctionComponent, type HTMLAttributes } from 'react';
import styles from './Heading.module.scss';

const Heading: FunctionComponent<HeadingComponentProps> = ({
  tag: Tag,
  eyebrow,
  eyebrowSeparator = ':',
  children,
  ...rest
}) => {
  return !children ? null : (
    <Tag {...rest}>
      {eyebrow && (
        <>
          <span className={styles.eyebrow}>
            {eyebrow}
            {eyebrowSeparator && <span className="sr">{eyebrowSeparator}</span>}
          </span>
        </>
      )}
      {children}
    </Tag>
  );
};

export const H1 = (p: HeadingProps) => <Heading {...p} tag="h1" />;
export const H2 = (p: HeadingProps) => <Heading {...p} tag="h2" />;
export const H3 = (p: HeadingProps) => <Heading {...p} tag="h3" />;
export const H4 = (p: HeadingProps) => <Heading {...p} tag="h4" />;
export const H5 = (p: HeadingProps) => <Heading {...p} tag="h5" />;
export const H6 = (p: HeadingProps) => <Heading {...p} tag="h6" />;


type HeadingProps = {
  eyebrow?: string;
  eyebrowSeparator?: string | null;
} & HTMLAttributes<HTMLInputElement>;

type HeadingComponentProps = HeadingProps & {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}