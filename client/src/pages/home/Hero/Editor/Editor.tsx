import React from 'react';
import Code from './Code';
import styles from './Editor.module.scss';

export default React.memo(function Editor() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <span className={styles.dots} />
      </div>
      <div className={styles.code}>
        <Code
          language="html"
          content={`
            <h1>
              Good ideas need great developers
            </h1>
          `}
        />
        <Code
          language="scss"
          content={`
            h1 {
              color: #fff;

              span {
                color: red;
              }
            }
          `}
        />
      </div>
      <div className={styles.terminal} />
    </div>
  );
});
