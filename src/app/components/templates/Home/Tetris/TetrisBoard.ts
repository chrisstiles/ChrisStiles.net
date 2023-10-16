import Tetromino, { type Shape } from './Tetromino';
import Block from './Block';
import Trail from './Trail';
import TetrisBot from './TetrisBot';
import PiecePreview from './PiecePreview';
import { isSSR, sleep } from '@helpers';
import { random, uniqueId } from 'lodash';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import type { RefObject } from 'react';

// TODO Add UI for game controls
// TODO Add music and sound effects

export default class TetrisBoard {
  piece: Nullable<Tetromino> = null;
  preview: PiecePreview;
  pieceQueue: Tetromino[];
  bot: TetrisBot;
  isBotPlaying = true;
  isGameActive = false;
  isGameOver = false;
  isPaused = false;
  columns = 24;
  rows = 12;
  linesPerLevel = 5;
  blockSize = 0;
  blockRadius = 0;
  blockStrokeWidth = 2.2;
  offset = 1.8;
  gridLineWidth = 1;
  grid: TetrisGrid = [];
  trails: Trail[] = [];
  timeline = gsap.timeline({ autoRemoveChildren: true });
  level = 1;
  score = 0;
  clearedLines = 0;
  intervalStart = 0;
  elapsedTime = 0;

  private _state: GameState;
  private _listeners = new Set<() => void>();
  private _canvas: RefObject<HTMLCanvasElement>;
  private _hasInitialized = false;
  private _hasStarted = false;
  private _isClearingBoard = false;
  private _isVisible = false;
  private _isDestroyed = false;
  private _clearedRowsAtCurrentLevel = 0;
  private _animatingRows: Nullable<Block>[][] = [];
  private _numQueuedPieces: number;

  constructor(canvas: RefObject<HTMLCanvasElement>, numQueuedPieces = 3) {
    this._canvas = canvas;
    this.bot = new TetrisBot(this);
    this._numQueuedPieces = numQueuedPieces;

    this.subscribe = this.subscribe.bind(this);
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.emitChange = this.emitChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBoardSize = this.setBoardSize.bind(this);
    this.tick = this.tick.bind(this);
    this.startNewGame = this.startNewGame.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.hardDrop = this.hardDrop.bind(this);
    this.animate = this.animate.bind(this);
    this.wait = this.wait.bind(this);
    this.setNextPiece = this.setNextPiece.bind(this);

    // Have to manually assign state so Typescript doesn't complain
    this._state = this.setState();

    this.pieceQueue = Array.from(
      { length: numQueuedPieces },
      (_, i) => new Tetromino(this, i === 0)
    );

    this.preview = new PiecePreview(this, this.nextPiece);

    // TESTING
    // TODO Remove testing code
    if (!isSSR()) {
      (<any>window).game = this;
      (<any>window).gsap = gsap;
    }
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

  get nextPiece() {
    return this.pieceQueue[0];
  }

  get hasInitialized() {
    return this._hasInitialized;
  }

  get hasStarted() {
    return this._hasStarted;
  }

  set isVisible(value: boolean) {
    if (value === this._isVisible) return;

    if (!value && !this._isClearingBoard) {
      this.toggleTicker(false);
    }

    if (value && (this.isAnimating || this.isGameActive) && !this.isPaused) {
      this.toggleTicker(true);
    }

    this._isVisible = value;
  }

  get isAnimating() {
    return (
      !this._isDestroyed &&
      !!(
        this.isPlaying ||
        this._isClearingBoard ||
        (this.timeline.isActive() && !this.timeline.paused()) ||
        (this.piece?.isAnimating && !this._isClearingBoard) ||
        this._animatingRows.length ||
        this.trails.length
      )
    );
  }

  get isClearingBoard() {
    return this._isClearingBoard;
  }

  get dropInterval() {
    const index = Math.min(this.level - 1, dropIntervals.length - 1);
    return dropIntervals[index] / 1000;
  }

  subscribe(listener: () => void) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  getState() {
    return this._state;
  }

  setState(state: Partial<GameState> = {}) {
    this._state = {
      ...this._state,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isGameOver: this.isGameOver,
      isGameActive: this.isGameActive,
      isBotPlaying: this.isBotPlaying,
      score: this.score,
      level: this.level,
      clearedLines: this.clearedLines,
      linesUntilNextLevel: this.linesUntilNextLevel,
      linesPerLevel: this.linesPerLevel,
      preview: this.preview,
      pieceQueue: this.pieceQueue,
      ...state
    };

    return this._state;
  }

  emitChange() {
    this.setState();
    this._listeners.forEach(callback => callback());
  }

  init() {
    if (this._hasInitialized) return;

    this._hasInitialized = true;
    this._isDestroyed = false;

    this.timeline = gsap.timeline({ autoRemoveChildren: true });
    this.setBoardSize();

    window.addEventListener('resize', this.setBoardSize);
    window.addEventListener('keydown', this.handleKeyDown, { capture: true });
  }

  async startNewGame(isBotPlaying = false) {
    this.isBotPlaying = isBotPlaying;
    this.isGameActive = true;

    if (this._isClearingBoard) return;

    this.isGameActive = false;

    if (!this.isBotPlaying) this.canvas?.focus();

    await this.wipeBoard();

    this.reset(false);
    this.play();

    if (!this.isVisible) {
      this.timeline.pause();
      gsap.ticker.remove(this.tick);
    }
  }

  async wipeBoard() {
    this._isClearingBoard = true;

    // Ensure animations get drawn to canvas
    this.toggleTicker(true);

    this.timeline.getTweensOf(this.piece).forEach(a => a.kill());

    const board = this.grid.slice().map(row => row.slice());

    // Add blocks from piece's shape to board
    if (this.piece) {
      this.piece.shape.forEach((row, y) => {
        row.forEach((block, x) => {
          if (!this.piece) return;

          const blockX = this.piece.x + x;
          const blockY = this.piece.y + y;

          if (block && blockY >= 0) {
            this.timeline.killTweensOf(block);
            board[blockY][blockX] = block;
          }
        });
      });

      this.piece.hasCleared = true;
    }

    // TODO Could probably optimize/combine a few of these loops
    const emptyColumns = (board[0] || []).map((_, i) => board.some(r => r[i]));

    const grid = board
      .map((row, y) => {
        // Remove empty columns
        row = row.filter((_, i) => emptyColumns[i]);

        // Add hidden blocks to remaining empty spaces
        return row.some(value => !!value)
          ? row.map((block, x) => block ?? new Block(this, x, y, null))
          : null;
      })
      .filter(row => row);

    if (grid.length) {
      const blocks = grid.flat();
      const vars: gsap.TweenVars = {
        immediateRender: true,
        stagger: {
          each: 0.035,
          from: [0, grid.length - 1],
          grid: [grid.length, grid[0]?.length ?? 0]
        }
      };

      await Promise.all([
        this.animate(blocks, {
          scale: 0.2,
          duration: 0.35,
          ease: blockEaseOut,
          ...vars
        }),
        this.animate(blocks, {
          opacity: 0,
          duration: 0.25,
          delay: 0.03,
          ...vars
        })
      ]);
    }

    this._isClearingBoard = false;
  }

  play() {
    this._hasStarted = true;

    const hasActiveGame = this.isGameActive;

    this.isGameActive = true;
    this.isPaused = false;

    if (!hasActiveGame && !this.isPaused && !this._isClearingBoard) {
      this.reset();
    }

    this.draw();
    this.toggleTicker(true);

    if (!this.isBotPlaying) this.canvas?.focus();

    this.emitChange();
  }

  async pause(finishAnimations = false) {
    this.isPaused = true;
    this.emitChange();

    if (finishAnimations) {
      await this.waitUntilAnimationsComplete();
    }

    // Don't cancel animation frame if game was
    // unpaused while waiting for animations to finish
    if (this.isPaused) this.toggleTicker(false);
  }

  async gameOver() {
    console.log('GAME OVER');

    this.isGameOver = true;
    this.piece = null;
    this.isGameActive = false;
    this.isPaused = false;

    this.emitChange();

    await this.waitUntilAnimationsComplete(300);

    if (!this.isGameActive && !this._isClearingBoard) {
      this.toggleTicker(false);
    }
  }

  reset(emitChange = true) {
    this.isGameOver = false;
    this.grid = this.getEmptyBoard();
    this.setNextPiece(false, true);
    this.intervalStart = gsap.ticker.time;
    this.level = 1;
    this.score = 0;
    this.clearedLines = 0;
    this._clearedRowsAtCurrentLevel = 0;
    this.elapsedTime = 0;

    if (emitChange) this.emitChange();
  }

  private getEmptyBoard() {
    return Array.from({ length: this.rows }, () =>
      new Array(this.columns).fill(null)
    );
  }

  private async setNextPiece(
    shouldEmitChange = true,
    shouldResetPieceQueue = false
  ) {
    if (shouldResetPieceQueue) {
      this.pieceQueue = Array.from(
        { length: this._numQueuedPieces },
        (_, i) => new Tetromino(this, i === 0)
      );
    }

    const piece = this.pieceQueue.shift() ?? new Tetromino(this);
    this.pieceQueue.push(new Tetromino(this));

    if (!this.isValidMove(piece.x, piece.y, piece.shape)) {
      this.setGameOverPiece(piece);
      this.gameOver();

      return;
    }

    this.piece = piece;
    this.preview = new PiecePreview(this, piece);

    if (shouldEmitChange) this.emitChange();

    this.preview.typeLabel();

    if (this.isBotPlaying && this.isGameActive) {
      await this.wait(Math.min(this.dropInterval * 1000 * 0.18, 20));
      this.bot.moveToBestPosition(piece);
    }
  }

  private tick(timestamp = 0) {
    if (!this.isAnimating || !this.ctx) {
      gsap.ticker.remove(this.tick);
      return;
    }

    if (this.isPlaying && !this.isClearingBoard) {
      const hasHardDropped = this.piece?.hasHardDropped;

      this.elapsedTime = timestamp - this.intervalStart;

      if (hasHardDropped || this.elapsedTime >= this.dropInterval) {
        this.intervalStart = timestamp;
        if (!this.drop()) this.gameOver();
      }
    }

    this.draw();
  }

  private toggleTicker(isActive: boolean) {
    if (isActive) {
      this.intervalStart = gsap.ticker.time - this.elapsedTime;

      this.timeline.play();
      gsap.ticker.add(this.tick);
    } else {
      this.timeline.pause();
      gsap.ticker.remove(this.tick);
    }
  }

  private drop() {
    if (!this.piece) return;

    if (!this.piece.drop() && this.piece.x === this.piece.currentX) {
      this.freezePiece();
      this.clearCompletedLines();

      if (this.piece.getShapeY() <= 0) return false;

      this.setNextPiece();
    }

    return true;
  }

  private freezePiece() {
    const { piece } = this;
    if (!piece) return;

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        const blockX = piece.x + x;
        const blockY = piece.y + y;

        if (value && blockY >= 0 && !this.grid[blockY][blockX]) {
          this.grid[blockY][blockX] = value;
        }
      });
    });
  }

  get linesUntilNextLevel() {
    return this.linesPerLevel - this._clearedRowsAtCurrentLevel;
  }

  private clearCompletedLines() {
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

    this.updateScore(clearCount);
  }

  private updateScore(clearedLines: number) {
    if (this.piece) {
      this.score += this.piece.hasHardDropped ? 2 : 1;
    }

    this.clearedLines += clearedLines;
    this._clearedRowsAtCurrentLevel += clearedLines;

    switch (clearedLines) {
      case 1:
        this.score += 100 * this.level;
        break;
      case 2:
        this.score += 300 * this.level;
        break;
      case 3:
        this.score += 500 * this.level;
        break;
      case 4:
        this.score += 800 * this.level;
        break;
    }

    if (this._clearedRowsAtCurrentLevel >= this.linesPerLevel) {
      this.level = Math.min(this.level + 1, 999);
      this._clearedRowsAtCurrentLevel -= this.linesPerLevel;
    }

    this.emitChange();
  }

  // GSAP seems to have weird behavior with promises,
  // so instead we manually resolve one in onComplete
  animate(target: gsap.TweenTarget, vars: gsap.TweenVars) {
    return new Promise<boolean>(resolve => {
      this.timeline.to(
        target,
        {
          immediateRender: true,
          ...vars,
          onComplete: () => {
            requestAnimationFrame(() => {
              vars.onComplete?.();
              resolve(true);
            });
          }
        },
        this.timeline.time()
      );
    });
  }

  // If a references to the actual gsap tween is needed,
  // this method returns one and adds it to the timeline
  addAnimation(target: gsap.TweenTarget, vars: gsap.TweenVars) {
    vars.id ??= uniqueId('game-animation-');

    this.animate(target, vars);

    return this.timeline.getById(String(vars.id));
  }

  wait(minDelay: number, maxDelay?: number) {
    return sleep(random(minDelay, maxDelay ?? minDelay), false, this.timeline);
  }

  private async waitUntilAnimationsComplete(delay = 0) {
    const pendingAnimations: gsap.core.Tween[] = [];

    this.timeline.getChildren(true, true, false).forEach(animation => {
      if (!(animation instanceof gsap.core.Tween)) return;
      if (!animation.isActive()) {
        animation.progress(1, false);
      } else {
        pendingAnimations.push(animation);
      }
    });

    await Promise.all(pendingAnimations);

    if (delay) await this.wait(delay);
  }

  private async animateRow(row: Nullable<Block>[], vars: gsap.TweenVars) {
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

  private clearRow(row: Nullable<Block>[]) {
    this.animateRow(row, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      stagger: 0.013
    });
  }

  private shiftRow(row: Nullable<Block>[], numLines: number) {
    if (!row.some(block => !!block)) return;

    this.animateRow(row, {
      y: `+=${numLines}`,
      duration: 0.4,
      delay: 0.013 * this.columns - 0.05,
      ease: 'bounce.out'
    });
  }

  private draw() {
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

  private getFirstRowWithBlocks() {
    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
      if (this.grid[rowIndex].some(value => value)) {
        return rowIndex;
      }
    }

    return null;
  }

  private setGameOverPiece(piece: Tetromino) {
    const topRow = this.getFirstRowWithBlocks() ?? 0;
    const shapeHeight = piece.shape.filter(row =>
      row.some(value => !!value)
    ).length;

    piece.y = topRow - shapeHeight;
    piece.currentY = piece.y;

    this.piece = piece;

    this.freezePiece();
    this.draw();
  }

  private setBoardSize() {
    const { canvas, ctx } = this;

    if (isSSR() || !canvas || !canvas.parentElement || !ctx) return;

    const style = getComputedStyle(canvas);
    const numRows = style.getPropertyValue('--game-rows');
    const numCols = style.getPropertyValue('--game-cols');
    const blocksPerColumn = style.getPropertyValue('--blocks-per-col');
    const blockOffset = style.getPropertyValue('--block-offset');
    const blockRadius = style.getPropertyValue('--block-border-radius');
    const strokeWidth = style.getPropertyValue('--block-stroke-width');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.offsetWidth;

    this.rows = parseInt(numRows) || 10;
    this.columns = (parseInt(numCols) || 12) * (parseInt(blocksPerColumn) || 1);
    this.blockSize = (width / this.columns) * dpr;
    this.blockRadius = this.pxToCanvas(parseFloat(blockRadius) || 0);
    this.offset = this.pxToCanvas(parseFloat(blockOffset) || 1.8);
    this.blockStrokeWidth = this.pxToCanvas(parseFloat(strokeWidth) || 2.2);
    this.gridLineWidth = this.pxToCanvas(1);

    const height = (this.blockSize / dpr) * this.rows;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(this.blockSize, this.blockSize);

    this.trails.forEach(t => t.refreshParticleSizes());

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

  hardDrop() {
    if (!this.piece || this.piece.hasHardDropped) return;

    const { x, y } = this.piece.getDropPoint();

    if (y > 1 && this.isValidMove(x, y, this.piece.shape)) {
      this.trails.push(new Trail(this, this.piece));
    }

    this.piece.hardDrop();
    this.draw();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (
      !this.isVisible ||
      e.metaKey ||
      e.shiftKey ||
      e.ctrlKey ||
      !keymap.includes(e.key)
    ) {
      return;
    }

    // Movement keys
    if (
      this.isPlaying &&
      !this.isBotPlaying &&
      this.piece &&
      !this.piece.hasHardDropped
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

    // Game controls
    if (this.isGameActive) {
      switch (e.key) {
        case 'p':
          if (this.isPlaying) {
            this.pause();
          } else {
            this.play();
          }
          break;
      }
    }
  }

  destroy() {
    this._isDestroyed = true;
    this._hasInitialized = false;
    this._animatingRows = [];
    this.trails = [];
    this._listeners.clear();
    this.timeline.getChildren(true, true, true).forEach(a => a.kill());
    this.timeline.kill();
    this.grid = this.getEmptyBoard();

    window.removeEventListener('resize', this.setBoardSize);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  pxToCanvas(num: number) {
    const dpr = window.devicePixelRatio || 1;
    return (num / (this.blockSize || 1)) * dpr;
  }
}

const keymap = [
  'ArrowLeft',
  'Left',
  'ArrowRight',
  'Right',
  'ArrowDown',
  'Down',
  'ArrowUp',
  'x',
  'z',
  ' ',
  'p'
];

const blockEaseOut = BezierEasing(0.48, -0.52, 0, 0.98);

const dropIntervals = [
  1100, 800, 720, 630, 550, 470, 380, 300, 220, 130, 100, 80, 80, 80, 70, 70,
  70, 50, 50, 50, 40, 35
];

export type TetrisGrid = Nullable<Block>[][];

export type Coordinate = {
  x: number;
  y: number;
};

type GameState = {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isGameActive: boolean;
  isBotPlaying: boolean;
  level: number;
  score: number;
  clearedLines: number;
  linesUntilNextLevel: number;
  linesPerLevel: number;
  preview: PiecePreview;
  pieceQueue: Tetromino[];
};
