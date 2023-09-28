import TetrisBoard from './TetrisBoard';
import Tetromino from './Tetromino';
import Block from './Block';
import Particle from './Particle';
import pieces from './pieces';
import gsap from 'gsap';
import tinycolor, { TinyColor } from '@ctrl/tinycolor';
import BezierEasing from 'bezier-easing';
import { random } from 'lodash';

export default class Trail {
  board: TetrisBoard;
  piece: Tetromino;
  startY = 0;
  color: TinyColor;

  private _hasRendered = false;
  private _firstBlockIndex = 0;
  private _trailLines: TrailLine[] = [];

  constructor(board: TetrisBoard, piece: Tetromino) {
    this.board = board;
    this.piece = piece;
    this.color = tinycolor(pieces[this.piece.shapeIndex].color)
      .desaturate(10)
      .lighten(8);

    this._firstBlockIndex = piece.shape.findIndex(r => r.some(b => b));
    this.startY = piece.y + Math.max(0, this._firstBlockIndex);

    this.init = this.init.bind(this);
    this.remove = this.remove.bind(this);
  }

  async init() {
    this._hasRendered = true;

    const { ctx } = this.board;
    const numRowsWithBlocks = this.piece.shape.filter(r =>
      r.some(b => b)
    ).length;

    if (!ctx || this.startY + numRowsWithBlocks >= this.board.rows - 1) {
      this.remove();
      return;
    }

    const gridLineWidth = this.board.pxToCanvas(1);
    const offset = this.board.pxToCanvas(this.board.offset);
    const width = 1 - gridLineWidth - offset * 2;
    const borderRadius = this.board.pxToCanvas(Block.borderRadius);

    for (let x = 0; x < this.piece.shape[0].length; x++) {
      for (let y = 0; y < this.piece.shape.length; y++) {
        const block = this.piece.shape[y][x];

        if (block) {
          const x1 = block.x + gridLineWidth + offset;
          const y1 = this.startY;
          const height = block.y - this.startY + borderRadius;

          this._trailLines.push(
            new TrailLine(this.board, x1, y1, width, height, this.color)
          );

          break;
        }
      }
    }

    await Promise.all(this._trailLines.map(t => t.animate()));

    this.remove();
  }

  remove() {
    this._trailLines = [];
    this.board.trails = this.board.trails.filter(t => t !== this);
  }

  draw() {
    if (!this._hasRendered) this.init();
    this._trailLines.forEach(l => l.draw());
  }

  refreshParticleSizes() {
    this._trailLines.forEach(l => l.refreshParticleSizes());
  }
}

class TrailLine {
  board: TetrisBoard;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity = 0.6;
  color: TinyColor;
  gradient?: CanvasGradient;

  private _particles: Particle[] = [];

  constructor(
    board: TetrisBoard,
    x: number,
    y: number,
    width: number,
    height: number,
    color: TinyColor
  ) {
    const minHeight = 3;

    if (height < minHeight) {
      const y2 = y + height;
      const y1 = Math.max(0, y2 - minHeight);

      height = y2 - y1;
      y = y1;
    }

    this.board = board;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    const { ctx } = board;
    if (!ctx) return;

    this.gradient = ctx.createLinearGradient(x, y, x + width, y + height);

    for (let stop = 0; stop <= 1; stop += 0.02) {
      this.gradient.addColorStop(
        stop,
        this.color.setAlpha(gradientEase(stop)).toString()
      );
    }

    const baseNumParticles = 30;
    const baseHeight = 10;
    const numParticles = Math.ceil((baseNumParticles * height) / baseHeight);

    for (let i = 0; i < numParticles; i++) {
      const baseSize = random(1, 3.5, true);
      const radius = this.board.pxToCanvas(baseSize);
      const particleColor = color.brighten(30).toString();
      const y2 = y + height;

      this._particles.push(
        new Particle(
          this.board,
          random(x + radius, x + width - radius, true),
          weightedRandom(y + y2 * 0.2, y2 - radius * 2),
          baseSize,
          radius,
          random(0.1, 0.6),
          particleColor
        )
      );
    }

    this.animate = this.animate.bind(this);
  }

  refreshParticleSizes() {
    this._particles.forEach(p => {
      p.radius = this.board.pxToCanvas(p.baseSize);
    });
  }

  async animate() {
    await Promise.all([
      this.board.animate(this, {
        opacity: 0,
        duration: 0.32,
        ease: BezierEasing(0.04, 0.56, 0.28, 0.97)
      }),
      this.board.animate(this._particles, {
        opacity: 0,
        x: () => `-=${this.board.pxToCanvas(random(-5, 5))}`,
        y: () => `-=${this.board.pxToCanvas(random(70, 15))}`,
        ease: BezierEasing(0.04, 0.56, 0.28, 0.97),
        duration: 0.6
      })
    ]);

    this._particles = [];
  }

  draw() {
    const { ctx } = this.board;
    if (!ctx || !this.gradient) return;

    for (let i = 0; i < this._particles.length; i++) {
      this._particles[i].draw();
    }

    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.globalAlpha = 1;
  }
}

const gradientEase = BezierEasing(0.65, 0.0, 0.35, 1.0);
const particleDistribution = BezierEasing(0.04, 0.55, 0.23, 0.91);

function weightedRandom(
  min: number,
  max: number,
  distribution = particleDistribution
) {
  return gsap.utils.pipe(
    Math.random,
    distribution,
    gsap.utils.mapRange(0, 1, min, max)
  )();
}
