import {
  memo,
  type ReactNode,
  type FunctionComponent,
  type RefObject
} from 'react';
import styles from './ContactModal.module.scss';
import * as Icon from './icons';
import { H2 } from '@elements';
import classNames from 'classnames';

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
          <ContactLinks />
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

function ContactLinks() {
  return (
    <ul className={styles.linkWrapper}>
      <ContactMethod
        href="mailto:chris@chrisstiles.dev"
        text="chris@chrisstiles.dev"
        icon={Icon.Email}
        iconLabel="Email"
      />
      <ContactMethod
        href="tel:925-998-4663"
        text="(925) 998-4663"
        icon={Icon.Phone}
        iconLabel="Cal"
      />
      <ContactMethod
        href="https://www.linkedin.com/in/christopherstiles"
        text="Connect on LinkedIn"
        icon={Icon.LinkedIn}
      />
      <ContactMethod
        href="https://github.com/chrisstiles"
        text="Follow me on GitHub"
        icon={Icon.GitHub}
      />
    </ul>
  );
}

function ContactMethod({
  icon: Icon,
  iconLabel,
  href,
  text
}: ContactMethodProps) {
  return (
    <li>
      <a
        href={href}
        className={styles.link}
      >
        <Icon
          className={styles.linkIcon}
          aria-hidden={!iconLabel}
          aria-label={iconLabel}
        />
        {text}
      </a>
    </li>
  );
}

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

type ContactMethodProps = {
  icon: FunctionComponent<any>;
  iconLabel?: string;
  href: string;
  text?: ReactNode;
};
