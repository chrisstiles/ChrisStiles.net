import TetrisBoard from './TetrisBoard';

export default class Particle {
  board: TetrisBoard;
  x: number;
  y: number;
  r: number;
  opacity = 1;
  color = '#fff';

  constructor(
    board: TetrisBoard,
    x: number,
    y: number,
    r: number,
    opacity = 1,
    color = '#fff'
  ) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.opacity = opacity;
  }

  draw() {
    const { ctx } = this.board;
    if (!ctx) return;

    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
