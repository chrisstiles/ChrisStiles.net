import TetrisBoard from './TetrisBoard';
import Tetromino, { colors } from './Tetromino';
import Block from './Block';
import tinycolor, { TinyColor } from '@ctrl/tinycolor';
import BezierEasing from 'bezier-easing';

export default class Trail {
  board: TetrisBoard;
  piece: Tetromino;
  opacity = 0.6;
  startY = 0;
  color: TinyColor;

  private _hasRendered = false;

  constructor(board: TetrisBoard, piece: Tetromino) {
    this.board = board;
    this.piece = piece;
    this.color = tinycolor(colors[this.piece.shapeIndex]).desaturate(10);

    const firstBlockIndex = piece.shape.findIndex(r => r.some(b => b));

    this.startY = piece.y + Math.max(0, firstBlockIndex);
  }

  async init() {
    this._hasRendered = true;

    const numRowsWithBlocks = this.piece.shape.filter(r =>
      r.some(b => b)
    ).length;

    if (this.startY + numRowsWithBlocks >= this.board.rows - 1) {
      this.remove();
      return;
    }

    await gsap.to(this, {
      opacity: 0,
      duration: 0.25
    });

    this.remove();
  }

  remove() {
    this.board.trails = this.board.trails.filter(t => t !== this);
  }

  draw() {
    const { ctx, blockSize } = this.board;

    if (!ctx || !blockSize) return;

    if (!this._hasRendered) this.init();

    ctx.globalAlpha = this.opacity;

    const gridLineWidth = this.board.pxToCanvas(1);
    const offset = this.board.pxToCanvas(this.board.offset);

    for (let x = 0; x < this.piece.shape[0].length; x++) {
      for (let y = 0; y < this.piece.shape.length; y++) {
        const block = this.piece.shape[y][x];

        if (block) {
          const x1 = block.x + gridLineWidth + offset;
          const y1 = this.startY;
          const width = 1 - gridLineWidth - offset * 2;
          const height =
            block.y - this.startY + this.board.pxToCanvas(Block.borderRadius);

          const gradient = ctx.createLinearGradient(
            x1,
            y1,
            x1 + width,
            y1 + height
          );

          for (let stop = 0; stop <= 1; stop += 0.02) {
            gradient.addColorStop(
              stop,
              this.color.setAlpha(gradientEase(stop)).toString()
            );
          }

          ctx.fillStyle = gradient;

          ctx.fillRect(x1, y1, width, height);

          break;
        }
      }
    }

    ctx.globalAlpha = 1;
  }
}

const gradientEase = BezierEasing(0.65, 0.0, 0.35, 1.0);
