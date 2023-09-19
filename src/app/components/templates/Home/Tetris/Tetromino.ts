import TetrisBoard, { type Coordinate } from './TetrisBoard';
import Block from './Block';
import { pieces } from './pieces';
import BezierEasing from 'bezier-easing';
import { random } from 'lodash';

const moveEase = BezierEasing(0.16, 0.89, 0.27, 1);

// TODO Replace actual random block with shuffled array of indexes to make it feel more random to player

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
    this.shapeIndex = random(0, pieces.length - 1);

    const { shape } = pieces[this.shapeIndex];

    this.x = Math.floor(board.columns / 2 - shape[0].length / 2);

    const shapeY = this.getShapeY(0, shape);
    this.y = 0 - shapeY;

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

    this.getShapeY = this.getShapeY.bind(this);
  }

  // The y position of the first non-empty row
  getShapeY(
    pieceY: number = this.y ?? 0,
    shape: Shape | string[][] = this.shape
  ) {
    for (let rowY = 0; rowY < shape.length; rowY++) {
      if (shape[rowY].some(value => value)) {
        return rowY + pieceY;
      }
    }

    return pieceY;
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
  private _dropPoint: Nullable<Coordinate> = null;

  getDropPoint(useCached = true) {
    if (
      useCached &&
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

    return this.board.animate(this, {
      currentX: x,
      currentY: y,
      overwrite: false,
      duration: 0.2,
      ease: moveEase
    });
  }

  drop() {
    return this.move('down');
  }

  get maxRotations() {
    return pieces[this.shapeIndex].maxRotations;
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

    if (force || this.board.isValidMove(this.x, this.y, shape)) {
      this.shape = shape;
      return true;
    }

    // Ensure line piece can rotate when it first appears
    if (this.y < 0 && this.board.isValidMove(this.x, 0, shape)) {
      this.shape = shape;
      this.y = 0;
      this.currentY = 0;
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

  // Calculate if this piece's shape
  // is the same as the given shape
  isSameShape(shape: Shape) {
    if (
      this.shape.length !== shape.length ||
      this.shape[0].length !== shape[0].length
    ) {
      return false;
    }

    // Filter empty rows
    const trimRows = (shape: Shape) =>
      shape.filter(row => row.some(value => !!value)).map(row => row.slice());

    const shape1 = trimRows(this.shape);
    const shape2 = trimRows(shape);

    // Return false if the number of rows with blocks is different
    if (shape1.length !== shape2.length) return false;

    // Filter empty columns
    const columns = shape1[0].length;

    let shape1Index = 0;
    let shape2Index = 0;

    while (shape1Index < shape1[0].length && shape2Index < shape2[0].length) {
      if (shape1Index < columns) {
        if (shape1.every(row => !row[shape1Index])) {
          shape1.forEach(row => row.splice(shape1Index, 1));
          shape1Index--;
        }

        shape1Index++;
      }

      if (shape2Index < columns) {
        if (shape2.every(row => !row[shape2Index])) {
          shape2.forEach(row => row.splice(shape2Index, 1));
          shape2Index--;
        }

        shape2Index++;
      }
    }

    return shape1.every((row, rowIndex) => {
      return row.every((value, colIndex) => {
        return !!value === !!shape2[rowIndex][colIndex];
      });
    });
  }
}

export type Shape = Nullable<Block>[][];
