import TetrisBoard from './TetrisBoard';

export default class Particle {
  board: TetrisBoard;
  x: number;
  y: number;
  radius: number;
  baseSize: number;
  opacity = 1;
  color = '#fff';

  constructor(
    board: TetrisBoard,
    x: number,
    y: number,
    baseSize: number,
    radius: number,
    opacity = 1,
    color = '#fff'
  ) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.baseSize = baseSize;
    this.radius = radius;
    this.color = color;
    this.opacity = opacity;
  }

  draw() {
    const { ctx } = this.board;
    if (!ctx) return;

    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
