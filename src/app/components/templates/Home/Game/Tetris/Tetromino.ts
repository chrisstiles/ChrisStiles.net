import TetrisBoard from './TetrisBoard';
import * as colors from '@colors';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';

const moveEase = BezierEasing(0.16, 0.89, 0.27, 0.99);

export default class Tetromino {
  board: TetrisBoard;
  color: string;
  shape: string[][];
  x: number;
  y: number;
  currentX: number;
  currentY: number;

  constructor(board: TetrisBoard) {
    this.board = board;
    this.color = colors.greenAccent;
    this.shape = [
      ['', '', ''],
      ['■', '■', '■'],
      ['■', '', '']
    ];

    this.x = 0;
    this.y = 0;
    this.currentX = this.x;
    this.currentY = this.y;
  }

  draw() {
    const { ctx, blockSize } = this.board;

    if (!ctx || !blockSize) return;

    ctx.fillStyle = this.color;

    const gridLineWidth = this.board.pxToCanvas(1);
    const borderRadius = this.board.pxToCanvas(10);
    const offset = this.board.pxToCanvas(3);
    const size = 1 - gridLineWidth - offset * 2;

    ctx.beginPath();

    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) return;

        const xPos = this.currentX + x + gridLineWidth + offset;
        const yPos = this.currentY + y;

        ctx.roundRect(xPos, yPos, size, size, borderRadius);
      });
    });

    ctx.fill();
  }

  move(x: number, y: number) {
    if (!this.board.isValidMove(x, y, this.shape)) return;

    this.x = x;
    this.y = y;

    gsap.to(this, {
      currentX: x,
      currentY: y,
      overwrite: false,
      duration: 0.2,
      ease: moveEase
    });
  }

  rotate(direction: 'right' | 'left') {
    const shape = Array.from(this.shape, row => row.slice());

    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        const p1 = shape[x][y];
        const p2 = shape[y][x];

        shape[x][y] = p2;
        shape[y][x] = p1;
      }
    }

    if (direction === 'right') {
      shape.forEach(row => row.reverse());
    } else {
      shape.reverse();
    }

    if (this.board.isValidMove(this.x, this.y, shape)) {
      this.shape = shape;
    }
  }
}
