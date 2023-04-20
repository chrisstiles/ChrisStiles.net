import Tetromino, { type Shape } from './Tetromino';
import Block from './Block';
import { isSSR } from '@helpers';
import gsap from 'gsap';
import type { RefObject } from 'react';

export default class TetrisBoard {
  // piece: Tetromino;
  piece: Nullable<Tetromino> = null;
  isPlaying = false;
  hasStarted = false;
  // TODO Set the default number of rows and columns
  columns = 0;
  rows = 6;
  blockSize = 0;
  // borderRadius = 6;
  offset = 1.5;
  // grid: number[][] = [];
  // grid: string[][] = [];
  grid: Nullable<Block>[][] = [];
  dropInterval = 1100;
  intervalStart = 0;
  elapsedTime = 0;

  private _canvas: RefObject<HTMLCanvasElement>;
  // private _piece: Nullable<Tetromino> = null;
  private _requestId: Nullable<number> = null;
  private _isVisible = false;
  // private _tweens: gsap.core.Tween[] = [];

  private _animatingRows: Nullable<Block>[][] = [];
  // private _animatingBlocks: Block[] = [];

  constructor(canvas: RefObject<HTMLCanvasElement>) {
    this._canvas = canvas;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBoardSize = this.setBoardSize.bind(this);
    this.animate = this.animate.bind(this);
    // this.drawBlock = this.drawBlock.bind(this);
    this.setNextPiece = this.setNextPiece.bind(this);

    // TESTING
    if (!isSSR()) (<any>window).board = this;
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
    return this.piece;
  }

  drop() {
    if (!this.piece) return;
    // if (!this.piece.drop() && this.piece.x === this.piece.currentX) {
    if (!this.piece.drop() && !this.piece.isAnimating) {
      this.freezePiece();
      this.clearCompletedRows();
      // console.log('After', cloneDeep(this.grid));

      // const firstBlockIndex = this.piece.shape.findIndex(row => {
      //   return row.some(block => block);
      // });

      // if (this.piece.y - Math.max(0, firstBlockIndex) <= 0) {
      //   this.hasStarted = false;
      //   return false;
      // }
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
          // this.grid[y + piece.y][x + piece.x] = piece.shapeIndex;
          this.grid[y + piece.y][x + piece.x] = value;
        }
      });
    });
  }

  // freezePiece() {
  //   const { piece } = this;
  //   if (!piece) return;

  //   piece.shape.forEach((row, y) => {
  //     row.forEach((value, x) => {
  //       if (value) {
  //         this.grid[y + piece.y][x + piece.x] = piece.shapeIndex;
  //       }
  //     });
  //   });
  // }

  clearCompletedRows() {
    // let lines = 0;
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
        // for (let colIndex = 0; colIndex < this.columns; colIndex++) {
        //   const block = row[colIndex];

        //   if (block) {
        //     block.y += clearCount;
        //   }
        // }
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

    // this.grid.forEach((row, y) => {
    //   // If every value is greater than zero then we have a full row.
    //   if (row.every(value => value)) {
    //     // lines++;

    //     // Remove the row.
    //     this.grid.splice(y, 1);

    //     // Add zero filled row at the top.
    //     this.grid.unshift(Array(this.columns).fill(null));
    //   }
    // });
  }

  async animateRow(row: Nullable<Block>[], vars: gsap.TweenVars) {
    // const blocks = row.filter((b): b is Block => !b);

    // if (!blocks.length) return;

    // this._animatingBlocks = this._animatingBlocks.concat(blocks);
    // await gsap.to(blocks, vars);

    // const animations = gsap.getTweensOf(blocks);
    // console.log(animations);

    // if (!animations.some(tween => tween.isActive())) {
    //   this._animatingBlocks = this._animatingBlocks.filter(b => b !== row);
    // }

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
    // console.log('clearRow', row);
    // row[0] = null;
    this.animateRow(row, {
      scale: 0,
      duration: 0.3,
      stagger: 0.03
    });

    // this.animateRow(row, {
    //   y: '+=0.1',
    //   duration: 4
    // });

    // setTimeout(() => {
    //   this.animateRow(row, {
    //     y: '+=0.2',
    //     duration: 4
    //   });
    // }, 300);
  }

  shiftRow(row: Nullable<Block>[], numLines: number) {
    // console.log(row);
    if (!row.some(block => !!block)) return;

    this.animateRow(row, {
      y: `+=${numLines}`,
      duration: 0.5,
      delay: 0.3
    });
  }

  // drawBlock(x: number, y: number, color: string) {
  //   if (!this.ctx) return;
  //   // console.log('drawBlock', this.blockSize);

  //   const gridLineWidth = this.pxToCanvas(1);
  //   const borderRadius = this.pxToCanvas(this.borderRadius);
  //   // const offset = this.pxToCanvas(3);
  //   const offset = this.pxToCanvas(this.offset);
  //   const size = 1 - gridLineWidth - offset * 2;

  //   this.ctx.beginPath();
  //   this.ctx.fillStyle = color;

  //   this.ctx.roundRect(x + gridLineWidth + offset, y, size, size, borderRadius);
  //   this.ctx.fill();
  // }

  draw() {
    if (!this.ctx) return;

    this.piece?.draw();

    const rows = this.grid.concat(this._animatingRows);

    // for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      // TESTING
      // if (rowIndex < this.rows) {
      //   const y = Math.max(
      //     this.pxToCanvas(0.5),
      //     rowIndex - this.pxToCanvas(this.offset)
      //   );
      //   this.ctx.beginPath();
      //   // console.log(rowIndex % 2 === 0 ? 'red' : 'yellow');
      //   this.ctx.strokeStyle = rowIndex % 2 === 0 ? 'red' : 'yellow';
      //   this.ctx.moveTo(0, y);
      //   this.ctx.lineTo(this.columns, y);
      //   this.ctx.lineWidth = this.pxToCanvas(1);
      //   this.ctx.stroke();
      // }
      // END TESTING

      for (let colIndex = 0; colIndex < this.columns; colIndex++) {
        // this.grid[rowIndex][colIndex]?.draw();
        rows[rowIndex][colIndex]?.draw();
      }
    }
  }

  // draw() {
  //   if (!this.ctx) return;

  //   // const ctx = this.ctx;

  //   this.piece?.draw();
  //   // this.piece.draw();
  //   this.grid.forEach((row, y) => {
  //     // row.forEach((block, x) => {
  //     // if (!block) return;
  //     row.forEach((shapeIndex, x) => {
  //       if (shapeIndex > 0) {
  //         this.drawBlock(x, y, colors[shapeIndex]);
  //       }
  //       // this.drawBlock(x, y, block.color);
  //       // this.drawBlock(block.x, block.y, block.color);
  //       // this.drawBlock(block.x, block.y, 'red');
  //       // ctx.fillStyle = 'red';
  //       // ctx.fillRect(x, y, 1, 1);
  //     });
  //     // row.forEach((value, x) => {
  //     //   if (!value) return;
  //     //   ctx.fillStyle = 'red';
  //     //   ctx.fillRect(x, y, 1, 1);
  //     //   // if (value > 0) {
  //     //   //   ctx.fillStyle = 'red';
  //     //   //   ctx.fillRect(x, y, 1, 1);
  //     //   // }
  //     // });
  //   });
  // }
  get isAnimating() {
    // return this.isPlaying || this.piece?.isAnimating || this._tweens.length;
    return (
      this.isPlaying || this.piece?.isAnimating || this._animatingRows.length
    );
  }

  animate(timestamp = 0) {
    // console.log(this.isPlaying, this.piece?.isAnimating, this._animatingRows);
    // console.log('animate');
    // if (!this.isPlaying || !this.ctx) return;
    if (!this.isAnimating || !this.ctx) return;

    if (this.isPlaying) {
      this.elapsedTime = timestamp - this.intervalStart;

      if (this.elapsedTime > this.dropInterval) {
        this.intervalStart = timestamp;

        if (!this.drop()) {
          this.isPlaying = false;
          console.log('GAME OVER animate()');

          if (!this.isAnimating) return;
        }
      }
    }

    // console.log('Animate');

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
    // const columnMultiplier = style.getPropertyValue('--column-multiplier');

    this.rows = parseInt(numRows) || 10;
    this.columns = parseInt(numColumns) || 12;

    // this.rows = 4;
    // this.columns = 8;

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

  // isValidMove(xPos: number, yPos: number, shape: string[][]) {
  //   return shape.every((row, i) => {
  //     return row.every((value, j) => {
  //       if (!value) return true;

  //       const x = xPos + j;
  //       const y = yPos + i;

  //       return this.isOnGrid(x, y) && !this.isOccupied(x, y);
  //     });
  //   });
  // }

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
    // const dpr = window.devicePixelRatio || 1;
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
