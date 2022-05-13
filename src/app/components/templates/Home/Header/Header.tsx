import { memo, type ReactNode } from 'react';
import styles from './Header.module.scss';
import BoundingBox from '../BoundingBox';
import Content from '@elements/Content';
import Logo from '@images/logo.svg';

export default function Header({ bullets, showBoundingBox }: HeaderProps) {
  return (
    <Content
      tag="header"
      className={styles.header}
    >
      <Logo
        className={styles.logo}
        aria-label="Chris Stiles"
      />
      <div
        className={styles.itemsWrapper}
        aria-label="Software engineer, interaction designer, problem solver"
      >
        {!!bullets.length && (
          <ul
            aria-hidden="true"
            className={styles.items}
          >
            {bullets.map((text, index) => (
              <Bullet key={index}>
                {text}
                <BoundingBox
                  className={styles.box}
                  isVisible={showBoundingBox && index === bullets.length - 1}
                  animateIn={index > 0}
                />
              </Bullet>
            ))}
          </ul>
        )}
        {!bullets.length && (
          <BoundingBox
            className={styles.box}
            isVisible={showBoundingBox}
          />
        )}
      </div>
    </Content>
  );
}

const Bullet = memo(function Bullet({ children }: BulletProps) {
  return <li>{children}</li>;
});

type HeaderProps = {
  bullets: string[];
  showBoundingBox: boolean;
};

type BulletProps = {
  children: ReactNode;
};
