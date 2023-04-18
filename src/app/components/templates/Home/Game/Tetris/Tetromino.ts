import TetrisBoard from './TetrisBoard';
import * as colorVars from '@colors';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import { random } from 'lodash';

const moveEase = BezierEasing(0.16, 0.89, 0.27, 1);

export default class Tetromino {
  board: TetrisBoard;
  shapeIndex: number;
  color: string;
  shape: string[][];
  x: number;
  y: number;
  currentX: number;
  currentY: number;

  // static blockIndex = 0;

  constructor(board: TetrisBoard, x: number = 0, y: number = 0) {
    this.board = board;
    // this.shapeIndex = Math.floor(Math.random() * shapes.length - 1) + 1;
    this.shapeIndex = random(1, shapes.length - 1);
    console.log(this.shapeIndex);
    // this.color = colors.greenAccent;
    // this.color =
    //   blockIndex % 2 === 0 ? colors.yellowAccent : colors.greenAccent;
    // this.color = blockColors[Tetromino.blockIndex];
    // console.log(this.color, Tetromino.blockIndex);

    // Tetromino.blockIndex =
    //   Tetromino.blockIndex === blockColors.length - 1
    //     ? 0
    //     : Tetromino.blockIndex + 1;

    // Tetromino.blockIndex++;
    this.shape = shapes[this.shapeIndex];
    this.color = colors[this.shapeIndex];

    // this.shape = [
    //   ['■', '', ''],
    //   ['■', '■', '■'],
    //   ['', '', '']
    // ];

    this.x = x;
    this.y = y;
    this.currentX = this.x;
    this.currentY = this.y;

    // this.drop = this.drop.bind(this);
  }

  draw() {
    const { ctx, blockSize } = this.board;

    if (!ctx || !blockSize) return;

    // ctx.fillStyle = this.color;

    // const gridLineWidth = this.board.pxToCanvas(1);
    // const borderRadius = this.board.pxToCanvas(10);
    // const offset = this.board.pxToCanvas(3);
    // const size = 1 - gridLineWidth - offset * 2;

    // ctx.beginPath();

    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) return;
        this.board.drawBlock(this.currentX + x, this.currentY + y, this.color);

        // const xPos = this.currentX + x + gridLineWidth + offset;
        // const yPos = this.currentY + y;

        // ctx.roundRect(xPos, yPos, size, size, borderRadius);
      });
    });

    // ctx.fill();
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
      // duration: 4,
      ease: moveEase,
      onUpdate: () => {
        if (!this.board.isPlaying) {
          this.board.draw();
        }
      }
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
    ['', '', '■'], // '','' -> 2,'' ; '',1 -> 1,'' ; '',2 -> '',''
    ['■', '■', '■'], // 1,'' -> 2,1 ; 1,1 -> 1,1 ; 1,2 -> '',1
    ['', '', '']
  ], // 2,'' -> 2,2 ; 2,1 -> 1,2 ; 2,2 -> '',2
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
