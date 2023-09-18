import TetrisBoard from './TetrisBoard';
import pieces from './pieces';

export default class Block {
  static borderRadius = 7;

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
    return pieces[this._colorIndex].color;
  }

  draw(x = this.x, y = this.y, isProjection = false) {
    const { ctx, blockSize } = this.board;
    if (!ctx || !blockSize) return;

    const gridLineWidth = this.board.pxToCanvas(1);
    const offset = this.board.pxToCanvas(this.board.offset);
    const strokeWidth = isProjection ? this.board.pxToCanvas(2.2) : 0;
    const size = 1 - gridLineWidth - offset * 2 - strokeWidth * 2;
    const scaledSize = size * this.scale;
    const scaleOffset = (size - scaledSize) / 2;
    const borderRadius =
      this.board.pxToCanvas(Block.borderRadius) * this.scale * 2;

    drawSquircle(
      ctx,
      x + gridLineWidth + offset + scaleOffset + strokeWidth,
      y + scaleOffset + strokeWidth,
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

function drawSquircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  borderRadius: number,
  smoothing: number = 2
) {
  const radius = Math.min(borderRadius, size / 2);
  const x0 = x + radius;
  const x1 = x + size - radius;
  const y0 = y + radius;
  const y1 = y + size - radius;
  const k = smoothing * (4 / 3) * (1 - 1 / Math.sqrt(2));

  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.bezierCurveTo(
    x1 + k * radius,
    y,
    x + size,
    y0 - k * radius,
    x + size,
    y0
  );
  ctx.lineTo(x + size, y1);
  ctx.bezierCurveTo(
    x + size,
    y1 + k * radius,
    x1 + k * radius,
    y + size,
    x1,
    y + size
  );
  ctx.lineTo(x0, y + size);
  ctx.bezierCurveTo(x0 - k * radius, y + size, x, y1 + k * radius, x, y1);
  ctx.lineTo(x, y0);
  ctx.bezierCurveTo(x, y0 - k * radius, x0 - k * radius, y, x0, y);
  ctx.closePath();
}
