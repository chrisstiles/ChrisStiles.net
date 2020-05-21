import React from 'react';
import styles from './Editor.module.scss';

export default React.memo(function Editor() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <span className={styles.dots} />
      </div>
      <div className={styles.code}>Code here</div>
      <div className={styles.terminal} />
    </div>
  );
});
