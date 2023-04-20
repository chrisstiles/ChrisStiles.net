import Tetromino, { type Shape } from './Tetromino';
import Block from './Block';
import { isSSR } from '@helpers';
import gsap from 'gsap';
import type { RefObject } from 'react';

export default class TetrisBoard {
  piece: Nullable<Tetromino> = null;
  isPlaying = false;
  hasStarted = false;
  // TODO Set the default number of rows and columns
  columns = 0;
  rows = 6;
  blockSize = 0;
  offset = 1.5;
  grid: Nullable<Block>[][] = [];
  dropInterval = 1100;
  intervalStart = 0;
  elapsedTime = 0;

  private _canvas: RefObject<HTMLCanvasElement>;
  private _requestId: Nullable<number> = null;
  private _isVisible = false;
  private _animatingRows: Nullable<Block>[][] = [];

  constructor(canvas: RefObject<HTMLCanvasElement>) {
    this._canvas = canvas;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBoardSize = this.setBoardSize.bind(this);
    this.animate = this.animate.bind(this);
    this.setNextPiece = this.setNextPiece.bind(this);

    // TESTING
    if (!isSSR()) {
      (<any>window).board = this;
      (<any>window).gsap = gsap;
    }
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

  get isAnimating() {
    return (
      this.isPlaying || this.piece?.isAnimating || this._animatingRows.length
    );
  }

  init() {
    this.setBoardSize();
    this.grid = this.getEmptyBoard();
    this.setNextPiece();
    this.draw();
    window.addEventListener('resize', this.setBoardSize);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  play() {
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
    // TESTING
    // const b = Array.from({ length: this.rows }, () =>
    //   new Array(this.columns).fill(null)
    // );

    // for (let i = 4; i < this.columns; i++) {
    //   b[this.rows - 2][i] = new Block(this, i, this.rows - 2, 1);
    //   b[this.rows - 1][i] = new Block(this, i, this.rows - 1, 1);
    // }

    // return b;
    // END TESTING

    return Array.from({ length: this.rows }, () =>
      new Array(this.columns).fill(null)
    );
  }

  setNextPiece() {
    this.piece = new Tetromino(this, 0);
  }

  animate(timestamp = 0) {
    if (!this.isAnimating || !this.ctx) return;

    if (this.isPlaying) {
      this.elapsedTime = timestamp - this.intervalStart;

      if (this.piece?.hasHardDropped || this.elapsedTime >= this.dropInterval) {
        this.intervalStart = timestamp;
        // this.intervalStart = this.piece?.hasHardDropped
        //   ? timestamp + 300
        //   : timestamp;

        if (!this.drop()) {
          this.isPlaying = false;
          console.log('GAME OVER animate()');

          if (!this.isAnimating) return;
        }
      }
    }

    this.ctx.clearRect(0, 0, this.columns, this.rows);
    this.draw();
    this._requestId = requestAnimationFrame(this.animate);
  }

  drop() {
    if (!this.piece) return;

    if (!this.piece.drop() && this.piece.x === this.piece.currentX) {
      this.freezePiece();
      this.clearCompletedRows();

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
          this.grid[y + piece.y][x + piece.x] = value;
        }
      });
    });
  }

  clearCompletedRows() {
    const newGrid: Nullable<Block>[][] = [];
    let clearCount = 0;

    // Loop through rows in reverse, and shift incomplete rows
    // down by the number of completed rows below it
    for (let rowIndex = this.rows - 1; rowIndex >= 0; rowIndex--) {
      const row = this.grid[rowIndex];

      // Row is complete and should be cleared
      if (row.every(value => value)) {
        clearCount++;
        this.clearRow(row);
        continue;
      }

      // Shift row down if necessary
      if (clearCount > 0) {
        this.shiftRow(row, clearCount);
      }

      newGrid.push(row);
    }

    this.grid = newGrid
      .concat(
        Array.from({ length: clearCount }, () =>
          new Array(this.columns).fill(null)
        )
      )
      .reverse();
  }

  async animateRow(row: Nullable<Block>[], vars: gsap.TweenVars) {
    this._animatingRows.push(row);

    await gsap.to(
      row.filter(b => b),
      vars
    );

    const animations = gsap.getTweensOf(row);

    if (!animations.some(tween => tween.isActive())) {
      this._animatingRows = this._animatingRows.filter(r => r !== row);
    }
  }

  clearRow(row: Nullable<Block>[]) {
    this.animateRow(row, {
      scale: 0,
      duration: 0.3,
      stagger: 0.02
    });
  }

  shiftRow(row: Nullable<Block>[], numLines: number) {
    if (!row.some(block => !!block)) return;

    this.animateRow(row, {
      y: `+=${numLines}`,
      duration: 0.4,
      delay: 0.02 * this.columns - 0.05,
      ease: 'bounce.out'
    });
  }

  draw() {
    if (!this.ctx) return;

    this.piece?.draw();

    const rows = this.grid.concat(this._animatingRows);

    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < this.columns; x++) {
        rows[y][x]?.draw();
      }
    }
  }

  setBoardSize() {
    const { canvas, ctx } = this;

    if (isSSR() || !canvas || !canvas.parentElement || !ctx) return;

    const style = getComputedStyle(canvas);
    const numColumns = style.getPropertyValue('--grid-num-columns');
    const numRows = style.getPropertyValue('--grid-num-rows');

    this.rows = parseInt(numRows) || 10;
    this.columns = parseInt(numColumns) || 12;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.offsetWidth - 1;

    this.blockSize = (width / this.columns) * dpr;

    const height = (this.blockSize / dpr) * this.rows - this.offset - 1;
    const gridLineWidth = this.pxToCanvas(1);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(this.blockSize, this.blockSize - gridLineWidth);
  }

  isValidMove(xPos: number, yPos: number, shape: Shape) {
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
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.isVisible || e.metaKey || e.shiftKey || e.ctrlKey) return;

    // Move current tetromino
    if (
      this.isPlaying &&
      this.piece &&
      !this.piece.hasHardDropped &&
      movementKeys.includes(e.key)
    ) {
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
          this.piece.drop();
          break;
        case 'ArrowUp':
        case 'x':
          this.piece.rotate('right');
          break;
        case 'z':
          this.piece.rotate('left');
        case ' ':
          this.piece.hardDrop();
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
  'z',
  ' '
];
