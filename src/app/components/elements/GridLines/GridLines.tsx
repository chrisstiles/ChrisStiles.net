import { memo, forwardRef, type HTMLProps } from 'react';
import styles, { maxGridCols } from './GridLines.module.scss';
import { Content, Line } from '@elements';
import classNames from 'classnames';

export const numColumns = parseInt(maxGridCols);

const GridLines = memo(
  forwardRef<HTMLDivElement, GridLinesProps>(
    (
      {
        className,
        dashColor = 'var(--grid-line-color)',
        solidColor = 'var(--grid-line-color)',
        showSubGrid
      },
      ref
    ) => {
      const lines = Array.from({ length: numColumns }, (_, index) => (
        <div
          key={index}
          className={classNames('grid-line', styles.line)}
        >
          {index === 0 && (
            <Line
              color={solidColor}
              className={styles.solid}
              isSolid
            />
          )}
          <Line color={dashColor} />
          {showSubGrid && (
            <Line
              color={dashColor}
              className={styles.subLine}
              isSolid
            />
          )}
        </div>
      ));

      return (
        <div
          className={classNames(styles.wrapper, className)}
          role="presentation"
        >
          <Content
            className={classNames('grid-lines-wrapper', styles.linesWrapper)}
          >
            <Grid ref={ref}>{lines}</Grid>
          </Content>
        </div>
      );
    }
  )
);

GridLines.displayName = 'GridLines';

const Grid = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(styles.grid, className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

type GridLinesProps = {
  className?: string;
  dashColor?: string;
  solidColor?: string;
  showSubGrid?: boolean;
};

export { GridLines as default, Grid };
