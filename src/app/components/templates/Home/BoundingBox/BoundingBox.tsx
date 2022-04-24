import { memo, useState, useEffect, useRef } from 'react';
import styles from './BoundingBox.module.scss';
import classNames from 'classnames';

export default memo(function BoundingBox({
  className,
  isVisible = false,
  animateIn = true
}: BoundingBoxProps) {
  const [isSmall, setIsSmall] = useState(!isVisible && animateIn);
  const hasBecomeVisible = useRef(!isSmall);

  useEffect(() => {
    if (isVisible && !hasBecomeVisible.current) {
      hasBecomeVisible.current = true;
      setIsSmall(false);
    }
  }, [isVisible]);

  return (
    <div
      aria-hidden="true"
      className={classNames('bounding-box', styles.box, className, {
        [styles.hidden]: !isVisible,
        [styles.small]: isSmall
      })}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={classNames('handle', styles.handle)}
        />
      ))}
    </div>
  );
});

type BoundingBoxProps = {
  className?: string;
  isVisible: boolean;
  animateIn?: boolean;
};
