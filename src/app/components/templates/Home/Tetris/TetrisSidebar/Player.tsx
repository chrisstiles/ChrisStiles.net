import styles from './TetrisSidebar.module.scss';
import SidebarHeading from './SidebarHeading';
// import { human } from './icons';
// import classNames from 'classnames';
import Image from 'next/image';
import type { TetrisSidebarProps } from './TetrisSidebar';

export default function Player({ isBotPlaying }: TetrisSidebarProps) {
  // console.log(human);
  return (
    <section className={styles.playerSection}>
      <SidebarHeading label="Player" />
      {/* <div className={classNames(styles.box, styles.playerBox)}> */}
      <div className={styles.box}>
        <div className={styles.playerIconWrapper}>
          <div className={styles.playerIcon}>
            <Image
              // src={human}
              // className={styles.playerIcon}
              src={`/images/${isBotPlaying ? 'robot' : 'human'}-emoji.png`}
              alt=""
              width={20}
              height={20}
              // width="20"
              // height="20"
            />
          </div>
        </div>
        {isBotPlaying ? 'ChrisBot 3000' : 'Player 1'}
      </div>
    </section>
  );
}
