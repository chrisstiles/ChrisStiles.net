import Tetromino, { type Shape } from './Tetromino';
import Block from './Block';
import Trail from './Trail';
import TetrisBot from './TetrisBot';
import { isSSR, sleep } from '@helpers';
import gsap from 'gsap';
import type { RefObject } from 'react';

// TODO Implement scoring system
// TODO Speed up game as score increases

export default class TetrisBoard {
  piece: Nullable<Tetromino> = null;
  bot: TetrisBot;
  isBotPlaying = false;
  isGameActive = false;
  isPaused = false;
  // TODO Set the default number of rows and columns
  columns = 0;
  rows = 6;
  blockSize = 0;
  offset = 1.8;
  grid: TetrisGrid = [];
  clearedRows = 0;
  dropInterval = 1100;
  intervalStart = 0;
  elapsedTime = 0;

  private _canvas: RefObject<HTMLCanvasElement>;
  private _isDestroyed = false;
  private _hasInitialized = false;
  private _isVisible = false;
  private _animations: Set<gsap.core.Tween> = new Set();
  private _animatingRows: Nullable<Block>[][] = [];
  private _requestId: Nullable<number> = null;

  constructor(canvas: RefObject<HTMLCanvasElement>) {
    this._canvas = canvas;
    this.bot = new TetrisBot(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBoardSize = this.setBoardSize.bind(this);
    this.tick = this.tick.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.hardDrop = this.hardDrop.bind(this);
    this.animate = this.animate.bind(this);
    this.setNextPiece = this.setNextPiece.bind(this);

    // TESTING
    // TODO Remove testing code
    // if (!isSSR()) {
    //   (<any>window).board = this;
    //   (<any>window).gsap = gsap;
    //   (<any>window).animations = this._animations;
    // }
  }

  get canvas() {
    return this._canvas?.current ?? null;
  }

  get ctx() {
    return this.canvas?.getContext('2d') ?? null;
  }

  get isPlaying() {
    return this.isGameActive && !this.isPaused;
  }

  get isVisible() {
    return this._isVisible;
  }

  set isVisible(value: boolean) {
    if (value === this._isVisible) return;

    if (!value) {
      this.pause(!this.isGameActive);
    } else if (this.isGameActive && this.isPaused) {
      this.play();
    }

    this._isVisible = value;
  }

  get isAnimating() {
    return (
      !this._isDestroyed &&
      !!(
        this.isPlaying ||
        this._animations.size ||
        this.piece?.isAnimating ||
        this._animatingRows.length ||
        this.trails.length
      )
    );
  }

  init() {
    if (this._hasInitialized) return;

    this._hasInitialized = true;
    this._isDestroyed = false;

    this.setBoardSize();

    window.addEventListener('resize', this.setBoardSize);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  play() {
    if (!this.isGameActive && !this.isPaused) {
      this.reset();
    }

    this.isGameActive = true;
    this.isPaused = false;

    this.draw();
    this.tick();

    this._animations.forEach(animation => animation.play(null, false));
  }

  async pause(finishAnimations = false) {
    this.isPaused = true;

    if (finishAnimations) {
      await this.waitUntilAnimationsComplete();
    } else {
      this._animations.forEach(animation => animation.pause());
    }

    // Don't cancel animation frame if game was
    // unpaused while waiting for animations to finish
    if (this.isPaused && this._requestId) {
      cancelAnimationFrame(this._requestId);
      this._requestId = null;
    }
  }

  async gameOver() {
    console.log('GAME OVER');
    this.piece = null;
    this.isGameActive = false;
    this.isPaused = false;

    await this.waitUntilAnimationsComplete(300);

    if (this._requestId) {
      cancelAnimationFrame(this._requestId);
      this._requestId = null;
    }
  }

  reset() {
    this.grid = this.getEmptyBoard();
    this.setNextPiece();
    this.intervalStart = performance.now();
    this.clearedRows = 0;
    this.elapsedTime = 0;
  }

  getEmptyBoard() {
    // TESTING
    // const b = Array.from({ length: this.rows }, () =>
    //   new Array(this.columns).fill(null)
    // );

    // b[this.rows - 2][0] = new Block(this, 0, this.rows - 2, 2);
    // // b[this.rows - 2][1] = new Block(this, 1, this.rows - 2, 2);
    // b[this.rows - 1][0] = new Block(this, 0, this.rows - 1, 3);

    // for (let i = 4; i < this.columns; i++) {
    //   b[this.rows - 2][i + 2] = new Block(this, i + 2, this.rows - 2, 0);
    //   b[this.rows - 1][i] = new Block(this, i, this.rows - 1, 0);
    // }

    // return b;
    // END TESTING

    return Array.from({ length: this.rows }, () =>
      new Array(this.columns).fill(null)
    );
  }

  setNextPiece() {
    const piece = new Tetromino(this);

    if (!this.isValidMove(piece.x, piece.y, piece.shape)) {
      this.gameOver();
      return;
    }

    this.piece = piece;

    if (this.isBotPlaying) {
      const move = this.bot.getBestMove();
      console.log(move);

      if (move) {
        this.piece.x = move.x;
        this.piece.currentX = move.x;
        this.piece.shape = move.shape;
        setTimeout(this.hardDrop, 250);
      }
    }
  }

  tick(timestamp = 0) {
    if (!this.isAnimating || !this.ctx) return;

    if (this.isPlaying) {
      this.elapsedTime = timestamp - this.intervalStart;

      if (this.piece?.hasHardDropped || this.elapsedTime >= this.dropInterval) {
        this.intervalStart = timestamp;

        if (!this.drop()) {
          this.gameOver();
        }
      }
    }

    this.draw();
    this._requestId = requestAnimationFrame(this.tick);
  }

  drop() {
    if (!this.piece) return;

    if (!this.piece.drop() && this.piece.x === this.piece.currentX) {
      this.freezePiece();
      this.clearCompletedRows();

      if (this.piece.y <= 0) return false;

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

  animate(target: gsap.TweenTarget, vars: gsap.TweenVars) {
    // GSAP seems to have weird behavior with promises,
    // so instead we manually resolve one in onComplete
    return new Promise<void>(resolve => {
      const animation = gsap.to(target, {
        immediateRender: true,
        ...vars,
        onComplete: () => {
          requestAnimationFrame(() => {
            vars.onComplete?.();
            this._animations.delete(animation);
            resolve();
          });
        }
      });

      this._animations.add(animation);
    });
  }

  async waitUntilAnimationsComplete(delay = 0) {
    const pendingAnimations: gsap.core.Tween[] = [];

    this._animations.forEach(animation => {
      if (!animation.isActive()) {
        animation.progress(1, false);
      } else {
        pendingAnimations.push(animation);
      }
    });

    await Promise.all(pendingAnimations);
    if (delay) await sleep(delay);
  }

  async animateRow(row: Nullable<Block>[], vars: gsap.TweenVars) {
    this._animatingRows.push(row);

    await this.animate(
      row.filter(b => b),
      vars
    );

    const animations = gsap.getTweensOf(row);

    if (!animations.some(tween => tween.isActive())) {
      this._animatingRows = this._animatingRows.filter(r => r !== row);
    }
  }

  clearRow(row: Nullable<Block>[]) {
    this.clearedRows++;
    this.animateRow(row, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      stagger: 0.013
    });
  }

  shiftRow(row: Nullable<Block>[], numLines: number) {
    if (!row.some(block => !!block)) return;

    this.animateRow(row, {
      y: `+=${numLines}`,
      duration: 0.4,
      delay: 0.013 * this.columns - 0.05,
      ease: 'bounce.out'
    });
  }

  draw() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.columns, this.rows);
    this.trails.forEach(t => t.draw());
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

    this.draw();
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

  trails: Trail[] = [];

  hardDrop() {
    if (!this.piece || this.piece.hasHardDropped) return;

    const { x, y } = this.piece.getDropPoint();

    if (y > 1 && this.isValidMove(x, y, this.piece.shape)) {
      this.trails.push(new Trail(this, this.piece));
    }

    this.piece.hardDrop();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (
      this.isBotPlaying ||
      !this.isVisible ||
      e.metaKey ||
      e.shiftKey ||
      e.ctrlKey
    ) {
      return;
    }

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
          this.piece.move('left');
          break;
        case 'ArrowRight':
        case 'Right':
          this.piece.move('right');
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
          break;
        case ' ':
          this.hardDrop();
          break;
      }
    }
  }

  destroy() {
    this._isDestroyed = true;
    this._hasInitialized = false;
    this._animations.forEach(animation => animation.kill());
    this._animations.clear();
    this._animatingRows = [];
    this.trails = [];

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

export type TetrisGrid = Nullable<Block>[][];
