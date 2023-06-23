import TetrisBoard from './TetrisBoard';
import Block from './Block';
import { shapes } from './pieces';
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
    this.shapeIndex = random(0, shapes.length - 1);

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

  clone() {
    const clone = new Tetromino(this.board);

    clone.shapeIndex = this.shapeIndex;
    clone.shape = this.shape;
    clone.x = this.x;
    clone.y = this.y;
    clone.currentX = this.currentX;
    clone.currentY = this.currentY;
    clone.hasHardDropped = this.hasHardDropped;

    return clone;
  }

  // We cache the drop point to avoid unnecessary calculations
  private _dropPoint: Nullable<DropPoint> = null;

  getDropPoint() {
    if (
      !this.board.isBotPlaying &&
      this._dropPoint &&
      this.x === this._dropPoint.x
    ) {
      return this._dropPoint;
    }

    let y = this.y;

    while (this.board.isValidMove(this.x, y + 1, this.shape)) {
      y++;
    }

    this._dropPoint = { x: this.x, y };

    return this._dropPoint;
  }

  clearCachedDropPoint() {
    this._dropPoint = null;
  }

  draw() {
    const { ctx } = this.board;

    if (!ctx) return;

    const { y: dropY } = this.getDropPoint();

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
        this.clearCachedDropPoint();
        break;
      case 'right':
        x++;
        this.clearCachedDropPoint();
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

    this.board.animate(this, {
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

  rotate(direction: 'right' | 'left', force = false) {
    if (this.hasHardDropped) return false;

    this.clearCachedDropPoint();

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

    // if (this.board.isValidMove(this.x, this.y, shape)) {
    if (force || this.board.isValidMove(this.x, this.y, shape)) {
      this.shape = shape;
      return true;
    }

    return false;
  }

  hardDrop() {
    const { x, y } = this.getDropPoint();

    this.hasHardDropped = true;
    this.currentX = x;
    this.y = y;
    this.currentY = y;
    this.draw();
  }
}

type DropPoint = {
  x: number;
  y: number;
};
