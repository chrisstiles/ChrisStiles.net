import Tetromino from './Tetromino';
import { isSSR } from '@helpers';
import type { RefObject } from 'react';

export default class TetrisBoard {
  isPlaying = false;
  blockSize = 0;
  columns = 0;
  rows = 8;
  grid: number[][] = [];
  startTime = 0;
  elapsedTime = 0;

  private _canvas: RefObject<HTMLCanvasElement>;
  private _piece: Nullable<Tetromino> = null;
  private _requestId: Nullable<number> = null;
  private _isVisible = false;

  constructor(canvas: RefObject<HTMLCanvasElement>) {
    this._canvas = canvas;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBoardSize = this.setBoardSize.bind(this);
    this.animate = this.animate.bind(this);
  }

  get canvas() {
    return this._canvas?.current ?? null;
  }

  get ctx() {
    return this.canvas?.getContext('2d') ?? null;
  }

  get piece() {
    return this._piece ?? null;
  }

  set piece(tetromino) {
    if (tetromino) tetromino.board = this;
    this._piece = tetromino;
    this.draw();
  }

  get isVisible() {
    return this._isVisible;
  }

  set isVisible(value: boolean) {
    if (value === this._isVisible) return;
    if (!value) {
      this.pause();
    } else if (!this.isPlaying) {
      this.play();
    }

    this._isVisible = value;
  }

  init() {
    this.setBoardSize();
    this.grid = this.getEmptyBoard();
    this.draw();
    window.addEventListener('resize', this.setBoardSize);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  play() {
    this.isPlaying = true;
    this.animate();
  }

  pause() {
    if (this._requestId) cancelAnimationFrame(this._requestId);
    this.isPlaying = false;
    this._requestId = null;
  }

  reset() {
    this.grid = this.getEmptyBoard();
    this.startTime = performance.now();
    this.elapsedTime = 0;
  }

  getEmptyBoard() {
    return Array.from({ length: this.rows }, () =>
      new Array(this.columns).fill(0)
    );
  }

  draw() {
    if (!this.ctx) return;

    const ctx = this.ctx;

    this.piece?.draw();
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          ctx.fillStyle = 'red';
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  animate() {
    if (!this.isPlaying || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.columns, this.rows);
    this.draw();
    this._requestId = requestAnimationFrame(this.animate);
  }

  setBoardSize() {
    const { canvas, ctx } = this;

    if (isSSR() || !canvas || !canvas.parentElement || !ctx) return;

    const numColumns =
      getComputedStyle(canvas).getPropertyValue('--grid-num-columns');

    // this.columns = (parseInt(numColumns) || 12) * 2;
    this.columns = parseInt(numColumns) || 12;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.offsetWidth || 0;

    this.blockSize = (width / this.columns) * dpr;

    const height = (this.blockSize / dpr) * this.rows;
    const gridLineWidth = this.pxToCanvas(1);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(this.blockSize, this.blockSize - gridLineWidth);

    this.draw();
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
    return !this.grid[y] || this.grid[y][x] !== 0;
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.isVisible || e.metaKey || e.shiftKey || e.ctrlKey) return;

    // Move current tetromino
    if (this.isPlaying && this.piece && movementKeys.includes(e.key)) {
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
          this.piece.move(this.piece.x, this.piece.y + 1);
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
