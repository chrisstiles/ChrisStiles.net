import TetrisBoard, { type TetrisGrid } from './TetrisBoard';
import Tetromino from './Tetromino';

export default class TetrisBot {
  board: TetrisBoard;

  constructor(board: TetrisBoard) {
    this.board = board;
  }

  getBestMove() {
    if (!this.board.piece) return;

    const piece = this.board.piece.clone();

    let bestScore = -Infinity;
    const bestMove = { x: 0, y: 0, shape: piece.shape };

    const maxRotations = piece.shapeIndex === 3 ? 1 : 4; // Don't rotate squares
    const startX = piece.x;

    for (let rotation = 0; rotation < maxRotations; rotation++) {
      piece.x = startX;

      // Prefer dropping closer to the center of the
      // board to make the design look more balanced.
      let leftX = piece.x;
      let canMoveLeft = true;

      let rightX = piece.x;
      let canMoveRight = true;

      const checkPosition = (x: number) => {
        piece.x = x;

        const score = this.getScore(piece);

        if (score > bestScore) {
          bestScore = score;
          bestMove.x = piece.x;
          bestMove.y = piece.y;
          bestMove.shape = piece.shape;
        }
      };

      while (canMoveLeft || canMoveRight) {
        if (canMoveLeft) {
          leftX--;
          canMoveLeft = this.board.isValidMove(leftX, piece.y, piece.shape);

          if (canMoveLeft) checkPosition(leftX);
        }

        if (canMoveRight) {
          rightX++;
          canMoveRight = this.board.isValidMove(rightX, piece.y, piece.shape);

          if (canMoveRight) checkPosition(rightX);
        }
      }

      if (maxRotations > 1) piece.rotate('right', true);
    }

    return bestMove;
  }

  getScore(piece: Tetromino) {
    // TODO Make this more efficient so that we don't have to clone the board every time
    const grid = this.board.grid.map(r => r.slice());
    const dropPoint = piece.getDropPoint();
    let shapeY: Nullable<number> = null;

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const gridX = x + dropPoint.x;
          const gridY = y + dropPoint.y;

          grid[gridY][gridX] = value;

          if (shapeY === null) shapeY = gridY;
        }
      });
    });

    // TODO Combine loops to be more efficient
    const lines = this.getLines(grid);
    const holes = this.getHoles(grid);
    const bumpiness = this.getBumpiness(grid);
    const distanceFromCenter = Math.max(
      3,
      Math.abs(dropPoint.x - this.board.columns / 2)
    );

    const score =
      lines * 50 -
      holes * 55 -
      bumpiness * 5 -
      distanceFromCenter -
      (grid.length - (shapeY ?? 0)) * 12;

    return score;
  }

  getLines(grid: TetrisGrid) {
    const { rows } = this.board;
    let lines = 0;

    for (let i = 0; i < rows; i++) {
      if (grid[i].every(value => value)) lines++;
    }

    return lines;
  }

  getHoles(grid: TetrisGrid) {
    // let testHoles = 0;
    // let columnsWithBlocks: { [key: number]: boolean } = {};

    // for (let y = this.board.rows - 1; y >= 0; y--) {
    //   for (let x = 0; x < this.board.columns; x++) {
    //     if (!columnsWithBlocks[x] && !grid[y][x]) {
    //       columnsWithBlocks[x] = true;
    //     } else if (columnsWithBlocks[x] && grid[y][x]) {
    //       testHoles++;
    //     }
    //   }
    // }

    let holes = 0;

    for (let x = 0; x < this.board.columns; x++) {
      let block = false;

      for (let y = this.board.rows - 1; y >= 0; y--) {
        if (!block && !grid[y][x]) {
          block = true;
        } else if (block && grid[y][x]) {
          holes++;
        }
      }
    }

    // console.log(holes, testHoles);

    return holes;
  }

  // Calculate how much the height of each column
  // varies from its neighboring columns. A lower bumpiness
  // value indicates a more even distribution of blocks
  getBumpiness(grid: any) {
    const { columns, rows } = this.board;
    let bumpiness = 0;

    for (let x = 0; x < columns - 1; x++) {
      let height = 0;

      for (let y = rows - 1; y >= 0; y--) {
        if (grid[y][x]) {
          height = rows - y;
          break;
        }
      }

      let nextHeight = 0;

      for (let y = rows - 1; y >= 0; y--) {
        if (grid[y][x + 1]) {
          nextHeight = rows - y;
          break;
        }
      }

      bumpiness += Math.abs(height - nextHeight);
    }

    return bumpiness;
  }
}
