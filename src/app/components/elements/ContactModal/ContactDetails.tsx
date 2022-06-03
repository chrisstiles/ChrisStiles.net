import { memo } from 'react';
import styles from './ContactModal.module.scss';
import { H2 } from '@elements';
import classNames from 'classnames';
import type { RefObject } from 'react';

export default memo(function ContactDetails({
  headlineId,
  descriptionId,
  wrapperRef,
  contentRef,
  bgRef,
  circleRef,
  leftBarRef,
  rightBarRef
}: ContactDetailsProps) {
  return (
    <div
      ref={wrapperRef}
      className={styles.detailsWrapper}
    >
      <div className={styles.detailsContent}>
        <div
          ref={contentRef}
          className={styles.details}
        >
          <H2
            className={styles.headline}
            eyebrow="Contact me"
            eyebrowId={headlineId}
          >
            <span id={descriptionId}>
              I&apos;m looking forward to hearing from you
            </span>
          </H2>
        </div>
        <div
          ref={bgRef}
          className={styles.detailsBg}
        />
      </div>
      <div className={styles.detailsTop}>
        <div
          ref={circleRef}
          className={styles.circle}
        />
        <div className={classNames(styles.barWrapper, styles.leftBar)}>
          <div
            ref={leftBarRef}
            className={styles.bar}
          />
        </div>
        <div className={classNames(styles.barWrapper, styles.rightBar)}>
          <div
            ref={rightBarRef}
            className={styles.bar}
          />
        </div>
      </div>
    </div>
  );
});

type ContactDetailsProps = {
  headlineId: string;
  descriptionId: string;
  wrapperRef: RefObject<HTMLDivElement>;
  contentRef: RefObject<HTMLDivElement>;
  bgRef: RefObject<HTMLDivElement>;
  circleRef: RefObject<HTMLDivElement>;
  leftBarRef: RefObject<HTMLDivElement>;
  rightBarRef: RefObject<HTMLDivElement>;
};
