import TetrisBoard from './TetrisBoard';
import Block from './Block';
import * as colorVars from '@colors';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import { random } from 'lodash';

const moveEase = BezierEasing(0.16, 0.89, 0.27, 1);

export type Shape = Nullable<Block>[][];

export default class Tetromino {
  board: TetrisBoard;
  shapeIndex: number;
  // color: string;
  // shape: string[][];
  // shape: Nullable<Block>[][];
  shape: Shape;
  x: number;
  y: number;
  currentX: number;
  currentY: number;

  constructor(board: TetrisBoard, x: number = 0, y: number = 0) {
    this.board = board;
    // this.shapeIndex = Math.floor(Math.random() * shapes.length - 1) + 1;
    this.shapeIndex = random(1, shapes.length - 1);
    // this.shapeIndex = 1;
    // this._projectionColor = tinycolor(colors[this.shapeIndex]).setAlpha(0.5).toString();
    // this.shape = shapes[this.shapeIndex];
    // this.color = colors[this.shapeIndex];

    this.shape = shapes[this.shapeIndex].map((row, rowIndex) => {
      return row.map((value, colIndex) => {
        if (!value) return null;

        // const block = new Block(board, x + rowIndex, y + colIndex, this.color);
        const block = new Block(
          board,
          x + rowIndex,
          y + colIndex,
          this.shapeIndex
        );

        return block;

        // return !value
        //   ? null
        //   : new Block(board, x + rowIndex, y + colIndex, this.color);
      });
    });

    this.x = x;
    this.y = y;
    this.currentX = this.x;
    this.currentY = this.y;

    // this.drop = this.drop.bind(this);
  }

  getDropPoint() {
    if (!this.board) -1;

    // let y = this.board.rows;

    // while (y > this.y && !this.board.isValidMove(this.x, y, this.shape)) {
    //   y--;
    // }

    let y = this.y;

    while (this.board.isValidMove(this.x, y + 1, this.shape)) {
      y++;
    }

    return y;
  }

  draw() {
    const { ctx, blockSize } = this.board;

    if (!ctx || !blockSize) return;

    const dropY = this.getDropPoint();

    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        const block = this.shape[y][x];
        if (!block) continue;

        block.x = this.x + x;
        block.y = this.y + y;

        if (dropY >= this.y) {
          // block.draw(this.currentX + x, dropY + y, 'rgba(255, 255, 255, 0.1)');
          block.draw(this.currentX + x, dropY + y, true);
        }

        block.draw(this.currentX + x, this.currentY + y);

        // block.x = this.currentX + x;
        // block.y = this.currentY + y;
        // block.draw();
      }
    }
  }

  get isAnimating() {
    return this.x !== this.currentX || this.y !== this.currentY;
  }

  move(x: number, y: number) {
    if (!this.board.isValidMove(x, y, this.shape)) return false;

    this.x = x;
    this.y = y;

    gsap.to(this, {
      currentX: x,
      currentY: y,
      overwrite: false,
      duration: 0.2,
      ease: moveEase
    });

    return true;
  }

  drop() {
    return this.move(this.x, this.y + 1);
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
      return true;
    }

    return false;
  }
}

export const colors = [
  'transparent',
  colorVars.greenAccent,
  colorVars.yellowAccent,
  colorVars.redAccent,
  '#EE1FF2',
  '#FD640F',
  '#3D50FF',
  '#8840FF'
];

export const shapes = [
  [],
  [
    ['', '', '', ''],
    ['■', '■', '■', '■'],
    ['', '', '', ''],
    ['', '', '', '']
  ],
  [
    ['■', '', ''],
    ['■', '■', '■'],
    ['', '', '']
  ],
  [
    ['', '', '■'],
    ['■', '■', '■'],
    ['', '', '']
  ],
  [
    ['■', '■'],
    ['■', '■']
  ],
  [
    ['', '■', '■'],
    ['■', '■', ''],
    ['', '', '']
  ],
  [
    ['', '■', ''],
    ['■', '■', '■'],
    ['', '', '']
  ],
  [
    ['■', '■', ''],
    ['', '■', '■'],
    ['', '', '']
  ]
];
