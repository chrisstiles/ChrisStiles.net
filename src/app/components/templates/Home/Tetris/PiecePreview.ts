import TetrisBoard from './TetrisBoard';
import Tetromino from './Tetromino';
import pieces from './pieces';
import { random, shuffle } from 'lodash';
import gsap from 'gsap';

export default class PiecePreview {
  board: TetrisBoard;
  piece: Tetromino;
  label: string;
  currentLabel = '';
  isTyping = false;
  isDoneTyping = Promise.resolve();
  initialDelay = 300;
  minTypingDelay = 30;
  maxTypingDelay = 50;

  constructor(board: TetrisBoard, piece: Tetromino) {
    this.board = board;
    this.piece = piece;
    this.label = labels[labelIndex % labels.length];
    labelIndex++;

    this.typeLabel = this.typeLabel.bind(this);
  }

  get shape() {
    return pieces[this.piece.shapeIndex].shape;
  }

  get color() {
    return pieces[this.piece.shapeIndex].color;
  }

  private finishTyping: Nullable<() => void> = null;

  typeLabel() {
    this.finishTyping?.();

    this.isDoneTyping = new Promise<void>(async resolve => {
      let callback: gsap.core.Tween;

      const finishTyping = () => {
        this.isTyping = false;
        this.finishTyping = null;
        callback?.kill();
        resolve();
      };

      this.finishTyping = finishTyping.bind(this);

      const shouldCancel = () => {
        return !this.board.isGameOver && this.board.piece !== this.piece;
      };

      if (this.currentLabel === this.label || shouldCancel()) {
        return finishTyping();
      }

      this.isTyping = true;

      if (this.initialDelay) await this.board.wait(this.initialDelay);

      for (let i = 0; i < this.label.length; i++) {
        const delay = random(this.minTypingDelay, this.maxTypingDelay) / 1000;

        callback = gsap.delayedCall(delay, () => {
          if (shouldCancel()) return finishTyping();

          this.currentLabel = this.label.slice(0, i + 1);
          this.board.emitChange();
        });

        this.board.timeline.add(callback, this.board.timeline.time());
        await callback.then();
      }

      finishTyping();
    });

    return this.isDoneTyping;
  }
}

const labels = shuffle([
  'optimized',
  'cross-browser',
  'accessible',
  'fast',
  'easy to use',
  'beautiful',
  'responsive',
  'secure',
  'scalable',
  'reliable',
  'maintainable',
  'compliant',
  'monitored',
  'efficient',
  'professional'
]);

let labelIndex = 0;
