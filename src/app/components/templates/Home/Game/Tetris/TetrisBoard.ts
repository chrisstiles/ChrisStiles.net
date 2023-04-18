import Tetromino, { colors } from './Tetromino';
import { isSSR } from '@helpers';
import gsap from 'gsap';
import type { RefObject } from 'react';

// class Block {
//   x: number;
//   y: number;
//   color: string;

//   constructor(x: number, y: number, color: string) {
//     this.x = x;
//     this.y = y;
//     this.color = color;
//   }
// }

export default class TetrisBoard {
  // piece: Tetromino;
  piece: Nullable<Tetromino> = null;
  isPlaying = false;
  hasStarted = false;
  blockSize = 0;
  columns = 0;
  rows = 6;
  grid: number[][] = [];
  // grid: string[][] = [];
  // grid: Nullable<Block>[][] = [];
  dropInterval = 1100;
  intervalStart = 0;
  elapsedTime = 0;

  private _canvas: RefObject<HTMLCanvasElement>;
  // private _piece: Nullable<Tetromino> = null;
  private _requestId: Nullable<number> = null;
  private _isVisible = false;

  constructor(canvas: RefObject<HTMLCanvasElement>) {
    this._canvas = canvas;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBoardSize = this.setBoardSize.bind(this);
    this.animate = this.animate.bind(this);
    this.drawBlock = this.drawBlock.bind(this);
    this.setNextPiece = this.setNextPiece.bind(this);
    // this.piece = new Tetromino(this);
  }

  get canvas() {
    return this._canvas?.current ?? null;
  }

  get ctx() {
    return this.canvas?.getContext('2d') ?? null;
  }

  get isVisible() {
    return this._isVisible;
  }

  set isVisible(value: boolean) {
    if (value === this._isVisible) return;
    if (!value) {
      this.pause();
    } else if (!this.isPlaying && this.hasStarted) {
      this.play();
    }

    this._isVisible = value;
  }

  init() {
    this.setBoardSize();
    this.grid = this.getEmptyBoard();
    this.piece = this.setNextPiece();
    this.draw();
    window.addEventListener('resize', this.setBoardSize);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  play() {
    // if (!this.hasStarted) {
    //   this.piece = this.setNextPiece();
    //   this.hasStarted = true;
    // }

    this.isPlaying = true;
    this.hasStarted = true;
    this.draw();
    this.animate();
  }

  pause() {
    if (this._requestId) cancelAnimationFrame(this._requestId);
    this.isPlaying = false;
    this._requestId = null;
  }

  reset() {
    this.grid = this.getEmptyBoard();
    this.intervalStart = performance.now();
    this.elapsedTime = 0;
  }

  getEmptyBoard() {
    return Array.from({ length: this.rows }, () =>
      new Array(this.columns).fill(0)
    );
  }

  setNextPiece() {
    this.piece = new Tetromino(this, 4);
    return this.piece;
  }

  // borderRadius = 10;
  // offset = 3;
  borderRadius = 6;
  offset = 1.5;

  drop() {
    if (!this.piece) return;
    if (!this.piece.drop() && this.piece.x === this.piece.currentX) {
      this.freezePiece();
      this.clearLines();

      if (this.piece.y <= 0) {
        this.hasStarted = false;
        return false;
      }

      this.setNextPiece();
    }

    return true;
  }

  freezePiece() {
    const { piece } = this;
    if (!piece) return;

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          this.grid[y + piece.y][x + piece.x] = piece.shapeIndex;
        }
      });
    });
  }

  clearLines() {
    // let lines = 0;

    this.grid.forEach((row, y) => {
      // If every value is greater than zero then we have a full row.
      if (row.every(value => value)) {
        // lines++;

        // Remove the row.
        this.grid.splice(y, 1);

        // Add zero filled row at the top.
        this.grid.unshift(Array(this.columns).fill(null));
      }
    });
  }

  drawBlock(x: number, y: number, color: string) {
    if (!this.ctx) return;
    // console.log('drawBlock', this.blockSize);

    const gridLineWidth = this.pxToCanvas(1);
    const borderRadius = this.pxToCanvas(this.borderRadius);
    // const offset = this.pxToCanvas(3);
    const offset = this.pxToCanvas(this.offset);
    const size = 1 - gridLineWidth - offset * 2;

    this.ctx.beginPath();
    this.ctx.fillStyle = color;

    this.ctx.roundRect(x + gridLineWidth + offset, y, size, size, borderRadius);
    this.ctx.fill();
  }

  draw() {
    if (!this.ctx) return;

    // const ctx = this.ctx;

    this.piece?.draw();
    // this.piece.draw();
    this.grid.forEach((row, y) => {
      // row.forEach((block, x) => {
      // if (!block) return;
      row.forEach((shapeIndex, x) => {
        if (shapeIndex > 0) {
          this.drawBlock(x, y, colors[shapeIndex]);
        }
        // this.drawBlock(x, y, block.color);
        // this.drawBlock(block.x, block.y, block.color);
        // this.drawBlock(block.x, block.y, 'red');
        // ctx.fillStyle = 'red';
        // ctx.fillRect(x, y, 1, 1);
      });
      // row.forEach((value, x) => {
      //   if (!value) return;
      //   ctx.fillStyle = 'red';
      //   ctx.fillRect(x, y, 1, 1);
      //   // if (value > 0) {
      //   //   ctx.fillStyle = 'red';
      //   //   ctx.fillRect(x, y, 1, 1);
      //   // }
      // });
    });
  }

  animate(timestamp = 0) {
    if (!this.isPlaying || !this.ctx) return;

    this.elapsedTime = timestamp - this.intervalStart;

    if (this.elapsedTime > this.dropInterval) {
      this.intervalStart = timestamp;

      if (!this.drop()) {
        console.log('GAME OVER animate()');
        return;
      }
    }

    this.ctx.clearRect(0, 0, this.columns, this.rows);
    this.draw();
    this._requestId = requestAnimationFrame(this.animate);
  }

  setBoardSize() {
    const { canvas, ctx } = this;

    if (isSSR() || !canvas || !canvas.parentElement || !ctx) return;

    const style = getComputedStyle(canvas);
    const numColumns = style.getPropertyValue('--grid-num-columns');
    const numRows = style.getPropertyValue('--grid-num-rows');
    const columnMultiplier = style.getPropertyValue('--column-multiplier');

    this.rows = parseInt(numRows) || 10;
    this.columns = parseInt(numColumns) || 12;
    // this.columns =
    //   (parseInt(numColumns) || 12) * (parseInt(columnMultiplier) || 1);

    const dpr = window.devicePixelRatio || 1;
    // const dpr = 4;
    // const width = canvas.parentElement.offsetWidth || 0;
    const width = canvas.parentElement.offsetWidth - 1;

    this.blockSize = (width / this.columns) * dpr;

    // const height = (this.blockSize / dpr) * this.rows - 3 - this.pxToCanvas(1);
    // const height = (this.blockSize / dpr) * this.rows;
    // const height = (this.blockSize / dpr) * this.rows - 4;
    const height = (this.blockSize / dpr) * this.rows - this.offset - 1;
    // const height =
    //   (this.blockSize / dpr) * this.rows - (gridLineWidth + 3 * dpr);
    const gridLineWidth = this.pxToCanvas(1);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(this.blockSize, this.blockSize - gridLineWidth);

    // this.draw();
  }

  isValidMove(xPos: number, yPos: number, shape: string[][]) {
    return shape.every((row, i) => {
      return row.every((value, j) => {
        if (!value) return true;

        const x = xPos + j;
        const y = yPos + i;

        return this.isOnGrid(x, y) && !this.isOccupied(x, y);
      });
    });
  }

  isOnGrid(x: number, y: number) {
    return x >= 0 && x < this.columns && y <= this.rows;
  }

  isOccupied(x: number, y: number) {
    return !this.grid[y] || !!this.grid[y][x];
    // return !this.grid[y] || this.grid[y][x] !== 0;
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.isVisible || e.metaKey || e.shiftKey || e.ctrlKey) return;

    // Move current tetromino
    if (this.isPlaying && this.piece && movementKeys.includes(e.key)) {
      // if (this.isPlaying && movementKeys.includes(e.key)) {
      e.preventDefault();

      switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
          this.piece.move(this.piece.x - 1, this.piece.y);
          break;
        case 'ArrowRight':
        case 'Right':
          this.piece.move(this.piece.x + 1, this.piece.y);
          break;
        case 'ArrowDown':
        case 'Down':
          // this.piece.move(this.piece.x, this.piece.y + 1);
          this.piece.drop();
          break;
        case 'ArrowUp':
        case 'x':
          this.piece.rotate('right');
          break;
        case 'z':
          this.piece.rotate('left');
      }
    }
  }

  destroy() {
    if (this._requestId) cancelAnimationFrame(this._requestId);
    window.removeEventListener('resize', this.setBoardSize);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  pxToCanvas(num: number) {
    const dpr = window.devicePixelRatio || 1;
    // const dpr = 4;
    return (num / (this.blockSize || 1)) * dpr;
  }
}

const movementKeys = [
  'ArrowLeft',
  'Left',
  'ArrowRight',
  'Right',
  'ArrowDown',
  'Down',
  'ArrowUp',
  'x',
  'z'
];

// const moves = {
//   [KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
//   [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
//   [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
//   [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
//   [KEY.UP]: (p) => board.rotate(p, ROTATION.RIGHT),
//   [KEY.Q]: (p) => board.rotate(p, ROTATION.LEFT)
// };

// export type Coordinate = {
//   x: number;
//   y: number;
// };
