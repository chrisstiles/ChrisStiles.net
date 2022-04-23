import { memo } from 'react';
import styles from './Header.module.scss';
import Content from '@elements/Content';
import Logo from '@images/logo.svg';

export default function Header({ bullets }: HeaderProps) {
  return (
    <Content
      tag="header"
      className={styles.header}
    >
      <Logo
        className={styles.logo}
        aria-label="Chris Stiles"
      />
      {!!bullets.length && (
        <ul className={styles.items}>
          {bullets.map((text, index) => (
            <Bullet
              key={index}
              text={text}
            />
          ))}
        </ul>
      )}
    </Content>
  );
}

const Bullet = memo(function Bullet({ text }: { text: string }) {
  return <li>{text}</li>;
});

type HeaderProps = {
  bullets: string[];
};
