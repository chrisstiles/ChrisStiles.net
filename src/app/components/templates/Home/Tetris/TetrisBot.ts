import TetrisBoard from './TetrisBoard';
import Tetromino, { type Shape } from './Tetromino';

export default class TetrisBot {
  board: TetrisBoard;
  weights = {
    lines: 50,
    holes: 60,
    bumpiness: 3,
    distanceFromCenter: 1.2,
    height: 10
  };

  constructor(board: TetrisBoard) {
    this.board = board;
  }

  async moveToBestPosition(piece: Tetromino) {
    if (!this.board.isBotPlaying) return false;

    const bestMove = this.getBestMove(piece);
    if (!bestMove) return false;

    const { shape, rotateX } = bestMove;
    const direction = bestMove.x > piece.x ? 'right' : 'left';
    const hasRotateXPosition = rotateX !== null;
    const canRotate = piece.maxRotations > 0 && !piece.isSameShape(shape);

    let { x } = piece;
    let isDoneMoving = x === bestMove.x;
    let isDoneRotating = !canRotate && !hasRotateXPosition;

    // Ensure full preview label is on screen for a moment
    // before hard dropping and moving to the next piece
    const canHardDrop = (async () => {
      await this.board.preview.isDoneTyping;
      await this.board.wait(260);
    })();

    while (
      this.board.isBotPlaying &&
      this.board.piece === piece &&
      (!isDoneRotating || !isDoneMoving)
    ) {
      const isAtRotateX = !hasRotateXPosition || x === rotateX;

      if (!isDoneRotating && isAtRotateX) {
        piece.rotate('right');
        await this.board.wait(50, 70);
        isDoneRotating = piece.isSameShape(shape);
      }

      if (!isDoneMoving) {
        const didMove = piece.move(direction);
        await this.board.wait(45, 70);

        x = piece.x;
        isDoneMoving = x === bestMove.x && isAtRotateX;

        // Wait until final move animation completes
        if ((isDoneMoving || this.board.isPaused) && didMove) await didMove;
        if (!didMove && isDoneRotating) break;
      }
    }

    await canHardDrop;

    if (hasRotateXPosition) await this.board.wait(50, 70);

    if (this.board.isBotPlaying && this.board.piece === piece) {
      this.board.hardDrop();
    }
  }

  getBestMove(piece: Tetromino) {
    piece = piece.clone();

    if (piece.shapeIndex === 0) {
      piece.y = 0;
      piece.currentY = 0;
    }

    let bestScore = -Infinity;

    const startX = piece.x;
    const bestMove: BestScore = {
      x: 0,
      y: 0,
      shape: piece.shape,
      rotateX: null
    };

    const canRotate = piece.maxRotations > 0;

    // If the piece can't rotate from its initial position,
    // we try to find x positions where it can rotate
    const shouldRecheckRotation =
      canRotate && !piece.rotate('right', false, true);

    for (let rotation = 0; rotation <= piece.maxRotations; rotation++) {
      piece.x = startX;

      // Prefer dropping closer to the center of the
      // board to make the design look more balanced
      let leftX = piece.x;
      let canMoveLeft = true;

      let rightX = piece.x;
      let canMoveRight = true;

      const updateBestScore = (
        score: number,
        piece: Tetromino,
        rotateX: Nullable<number> = null
      ) => {
        bestScore = score;
        bestMove.x = piece.x;
        bestMove.y = piece.y;
        bestMove.shape = piece.shape.slice();
        bestMove.rotateX = rotateX;
        bestMove.score = score;
      };

      const checkPosition = (x: number) => {
        piece.x = x;

        const score = this.getScore(piece);

        if (shouldRecheckRotation) {
          const { shape } = piece;
          let bestRotatedScore = -Infinity;

          for (let rotation = 0; rotation < piece.maxRotations; rotation++) {
            if (!piece.rotate('right')) break;

            const rotatedScore = this.getScore(piece);

            if (rotatedScore > bestRotatedScore) {
              bestRotatedScore = rotatedScore;
            }
          }

          if (bestRotatedScore > score) {
            updateBestScore(bestRotatedScore, piece, x);
            piece.shape = shape;

            return;
          }

          piece.shape = shape;
        }

        if (score > bestScore) {
          updateBestScore(score, piece);
        }
      };

      checkPosition(piece.x);

      while (canMoveLeft || canMoveRight) {
        if (!this.board.isBotPlaying) return;

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

      if (canRotate) piece.rotate('right', true);
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

    // Difference in heights between columns
    let bumpiness = 0;

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
    const bottomOffset = rows - 1 - shapeY;

    const score =
      lines * this.weights.lines -
      holes * (this.weights.holes - bottomOffset * 2) -
      bumpiness * this.weights.bumpiness -
      distanceFromCenter * this.weights.distanceFromCenter -
      bottomOffset * this.weights.height;

    return score;
  }
}

type BestScore = {
  x: number;
  y: number;
  shape: Shape;
  rotateX: Nullable<number>;
  score?: number;
};
