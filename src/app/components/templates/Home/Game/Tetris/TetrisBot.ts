import TetrisBoard from './TetrisBoard';
import Tetromino from './Tetromino';

export default class TetrisBot {
  board: TetrisBoard;
  weights = {
    lines: 50,
    holes: 65,
    bumpiness: 3,
    distanceFromCenter: 1,
    height: 12
  };

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
    const { rows, columns, grid } = this.board;
    const dropPoint = piece.getDropPoint(false);
    const shapeYOffset = piece.shape.findIndex(row => row.some(v => v));
    const shapeY = dropPoint.y + (shapeYOffset === -1 ? 0 : shapeYOffset);

    // To avoid having to clone the board every time
    // we check a position, we check if a coordinate
    // either contains a block on the existing board
    // or if if is inside a given piece's drop point
    const getBlock = (x: number, y: number) => {
      if (grid[y][x]) return grid[y][x];

      if (
        x < dropPoint.x ||
        x >= dropPoint.x + piece.shape[0].length ||
        y < dropPoint.y ||
        y >= dropPoint.y + piece.shape.length
      ) {
        return null;
      }

      // If the block is empty, check if it's part of the current piece
      const shapeX = x - dropPoint.x;
      const shapeY = y - dropPoint.y;

      return piece.shape[shapeY][shapeX];
    };

    const distanceFromCenter = Math.max(
      3,
      Math.abs(dropPoint.x - this.board.columns / 2)
    );

    // Completed rows that will be cleared
    const filledRows = new Array(rows).fill(true);

    // Number of empty spaces below a block
    let holes = 0;

    // Difference in height between two columns
    let bumpiness = 0;

    // for (let x = 0; x < columns - 1; x++) {
    for (let x = 0; x < columns; x++) {
      let height: Nullable<number> = null;
      let nextHeight: Nullable<number> = null;
      let hasEmptySpot = false;

      for (let y = rows - 1; y >= 0; y--) {
        const block = getBlock(x, y);
        const nextBlock = getBlock(x + 1, y);

        if (!block) filledRows[y] = false;

        if (!hasEmptySpot && !block) {
          hasEmptySpot = true;
        } else if (hasEmptySpot && block) {
          holes++;
        }

        if (x < columns - 1) {
          if (height === null && block) {
            height = rows - y;
          }

          if (nextHeight === null && nextBlock) {
            nextHeight = rows - y;
          }
        }
      }

      height ??= 0;
      nextHeight ??= 0;
      bumpiness += Math.abs(height - nextHeight);
    }

    // Number of complete lines
    const lines = filledRows.filter(value => value).length;

    const score =
      lines * this.weights.lines -
      holes * this.weights.holes -
      bumpiness * this.weights.bumpiness -
      distanceFromCenter * this.weights.distanceFromCenter -
      (rows - (shapeY ?? 0)) * this.weights.height;

    return score;
  }
}
