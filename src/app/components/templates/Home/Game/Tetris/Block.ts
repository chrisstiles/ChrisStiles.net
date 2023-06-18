import TetrisBoard from './TetrisBoard';
import { colors } from './Tetromino';

export default class Block {
  static borderRadius = 6;

  board: TetrisBoard;
  x: number;
  y: number;
  scale = 1;
  opacity = 1;

  private _colorIndex: number;

  constructor(board: TetrisBoard, x: number, y: number, colorIndex: number) {
    this.board = board;
    this.x = x;
    this.y = y;
    this._colorIndex = colorIndex;
  }

  get color() {
    return colors[this._colorIndex];
  }

  draw(x = this.x, y = this.y, isProjection = false) {
    const { ctx, blockSize } = this.board;
    if (!ctx || !blockSize) return;

    const gridLineWidth = this.board.pxToCanvas(1);
    const offset = this.board.pxToCanvas(this.board.offset);
    const strokeWidth = isProjection ? this.board.pxToCanvas(1.6) : 0;
    const size = 1 - gridLineWidth - offset * 2 - strokeWidth * 2;
    const scaledSize = size * this.scale;
    const scaleOffset = (size - scaledSize) / 2;
    const borderRadius = this.board.pxToCanvas(Block.borderRadius) * this.scale;

    ctx.beginPath();
    ctx.roundRect(
      x + gridLineWidth + offset + scaleOffset + strokeWidth,
      y + scaleOffset + strokeWidth,
      scaledSize,
      scaledSize,
      borderRadius
    );

    if (isProjection) {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}
