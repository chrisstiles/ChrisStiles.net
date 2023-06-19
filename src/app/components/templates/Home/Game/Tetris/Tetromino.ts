import TetrisBoard from './TetrisBoard';
import Block from './Block';
import * as colorVars from '@colors';
import BezierEasing from 'bezier-easing';
import { random } from 'lodash';

const moveEase = BezierEasing(0.16, 0.89, 0.27, 1);

export type Shape = Nullable<Block>[][];

export default class Tetromino {
  board: TetrisBoard;
  shapeIndex: number;
  shape: Shape;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  hasHardDropped = false;

  constructor(board: TetrisBoard) {
    this.board = board;
    this.shapeIndex = random(1, shapes.length - 1);

    const shape = shapes[this.shapeIndex];

    this.x = Math.floor(board.columns / 2 - shape[0].length / 2);
    this.y = 0;
    this.currentX = this.x;
    this.currentY = this.y;

    this.shape = shape.map((row, rowIndex) => {
      return row.map((value, colIndex) => {
        return !value
          ? null
          : new Block(
              board,
              this.x + rowIndex,
              this.y + colIndex,
              this.shapeIndex
            );
      });
    });
  }

  getDropPoint() {
    let y = this.y;

    while (this.board.isValidMove(this.x, y + 1, this.shape)) {
      y++;
    }

    return y;
  }

  draw() {
    const { ctx } = this.board;

    if (!ctx) return;

    const dropY = this.getDropPoint();

    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        const block = this.shape[y][x];
        if (!block) continue;

        block.x = this.x + x;
        block.y = this.y + y;

        if (!this.hasHardDropped && dropY >= this.y) {
          block.draw(this.currentX + x, dropY + y, true);
        }

        const shapeX = this.hasHardDropped ? this.x : this.currentX;
        const shapeY = this.hasHardDropped ? dropY : this.currentY;

        block.draw(shapeX + x, shapeY + y);
      }
    }
  }

  get isAnimating() {
    return (
      !this.hasHardDropped &&
      (this.x !== this.currentX || this.y !== this.currentY)
    );
  }

  move(direction: 'left' | 'right' | 'down') {
    let { x, y } = this;

    switch (direction) {
      case 'left':
        x--;
        break;
      case 'right':
        x++;
        break;
      case 'down':
        y++;
        break;
    }

    if (this.hasHardDropped || !this.board.isValidMove(x, y, this.shape)) {
      return false;
    }

    this.x = x;
    this.y = y;

    this.board.createAnimation(this, {
      currentX: x,
      currentY: y,
      overwrite: false,
      duration: 0.2,
      ease: moveEase
    });

    return true;
  }

  drop() {
    return this.move('down');
  }

  rotate(direction: 'right' | 'left') {
    if (this.hasHardDropped) return false;

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

  hardDrop() {
    this.hasHardDropped = true;
    const y = this.getDropPoint();

    this.currentX = this.x;
    this.y = y;
    this.currentY = y;
    this.draw();
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
