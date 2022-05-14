import {
  clickPulseDuration,
  clickColor,
  initialMouseX,
  initialMouseY
} from '../Editor.module.scss';
import { sleep } from '@helpers';
import gsap from 'gsap';
import { round } from 'lodash';
import BezierEasing from 'bezier-easing';
import { Language } from '@global';
import type { RefObject } from 'react';
import type { TabHandle } from '../Editor';

const mouseEase = BezierEasing(0.6, 0.01, 0.2, 1);

export default class Mouse {
  constructor(
    mouse: RefObject<HTMLDivElement>,
    typescriptTab: RefObject<TabHandle>,
    htmlTab: RefObject<TabHandle>,
    scssTab: RefObject<TabHandle>
  ) {
    this._mouse = mouse;
    this.updatePosition = this.updatePosition.bind(this);
    this.tabs = {
      [Language.TypeScript]: typescriptTab,
      [Language.HTML]: htmlTab,
      [Language.SCSS]: scssTab
    };
  }

  private animation?: gsap.core.Tween | null;
  private _mouse: RefObject<HTMLDivElement>;
  private get mouse() {
    return this._mouse?.current ?? null;
  }

  private tabs: {
    [key in Language]?: RefObject<TabHandle>;
  };

  private getTab(language: Language): TabHandle | null {
    return this.tabs[language]?.current ?? null;
  }

  private isVisible = false;

  private show() {
    if (!this.isVisible && this.mouse) {
      this.isVisible = true;
      this.mouse.style.opacity = '0.85';
    }
  }

  private hide() {
    if (this.isVisible && this.mouse) {
      this.isVisible = false;
      this.mouse.style.opacity = '0';
    }
  }

  private currentEl?: HTMLElement;
  private position = { left: 0, top: 0, x: 0, y: 0 };
  private hasSetInitialPosition = false;

  private getValue:
    | null
    | ((property: string, unit?: string) => string | number) = null;

  private getPosition(left?: number, top?: number) {
    if (!this.getValue) {
      this.getValue = gsap.getProperty(this.mouse);
    }

    left ??= this.getValue('left') as number;
    top ??= this.getValue('top') as number;

    return {
      left,
      top,
      x: this.getValue('x') as number,
      y: this.getValue('y') as number
    };
  }

  private updatePosition(left?: number, top?: number) {
    this.position = this.getPosition(left, top);
  }

  private async animateTo(el: HTMLElement, opts: AnimationOptions = {}) {
    this.show();

    if (this.animation) {
      this.animation.invalidate();
      this.animation = null;
    }

    let { duration, onUpdate, onComplete, delay } = opts;

    if (!el) {
      return Promise.reject('Element not found');
    }

    return new Promise<void>(async resolve => {
      const shouldAnimate = el !== this.currentEl;

      if (!this.mouse || !shouldAnimate) {
        if (!shouldAnimate) {
          await sleep(150);
        }

        if (onComplete) {
          onComplete();
        }

        resolve();
        return;
      }

      const mouseRect = this.mouse.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      if (!this.hasSetInitialPosition) {
        const parent = this.mouse.parentElement;

        if (parent) {
          this.hasSetInitialPosition = true;
          this.position.x = Math.round(
            parent.offsetWidth * (parseFloat(initialMouseX) / 100)
          );
          this.position.y = Math.round(
            parent.offsetHeight * (parseFloat(initialMouseY) / 100)
          );

          gsap.set(this.mouse, {
            x: this.position.x,
            y: this.position.y
          });
        }
      }

      const left = Math.round(
        elRect.left +
          elRect.width / 2 -
          mouseRect.left -
          mouseRect.width / 2 +
          this.position.left
      );

      const top = Math.round(
        elRect.top +
          elRect.height / 2 -
          mouseRect.top -
          mouseRect.height / 2 +
          this.position.top
      );

      gsap.set(this.mouse, {
        left,
        top,
        x: this.position.x + this.position.left - left,
        y: this.position.y + this.position.top - top
      });

      this.updatePosition();

      if (duration === undefined) {
        const baseDuration = 0.4;
        const baseDistance = 170;
        console.log(this.position);

        const distance = Math.max(
          Math.abs(this.position.x),
          Math.abs(this.position.y)
        );

        duration = round((baseDuration * distance) / baseDistance, 2);
      }

      this.currentEl = el;
      const updatePosition = this.updatePosition;

      this.animation = gsap.to(this.mouse, {
        x: 0,
        y: 0,
        duration,
        delay,
        ease: mouseEase,
        onUpdate() {
          updatePosition(left, top);

          if (onUpdate) {
            onUpdate();
          }
        },
        onComplete: () => {
          updatePosition(left, top);

          this.animation = null;

          if (onComplete) {
            onComplete();
          }

          resolve();
        }
      });
    });
  }

  play() {
    if (this.animation) {
      this.show();
      this.animation.play();
    }
  }

  pause() {
    this.animation?.pause();
    this.hide();
  }

  // Fires click animation
  private pulseTimer?: number;
  private mouseDownTimer?: number;
  private hideTimer?: number;

  private async animateClick(
    hideAfterClick = true,
    isDoubleClick = false,
    mouseDownCallback?: () => void
  ) {
    clearTimeout(this.pulseTimer);
    clearTimeout(this.mouseDownTimer);
    clearTimeout(this.hideTimer);

    const className = isDoubleClick ? 'doubleClick' : 'click';

    return new Promise<void>(resolve => {
      gsap.to(this.mouse, {
        keyframes: [
          { scale: 1 },
          { scale: isDoubleClick ? 0.88 : 0.78 },
          { scale: 1 }
        ],
        color: clickColor,
        duration: isDoubleClick ? 0.22 : 0.26,
        repeat: isDoubleClick ? 1 : 0,

        onStart: () => {
          if (!this.mouse) {
            resolve();
            return;
          }

          this.mouse.classList.add(className);

          if (mouseDownCallback) {
            this.mouseDownTimer = window.setTimeout(
              mouseDownCallback,
              isDoubleClick ? 400 : 100
            );
          }

          if (hideAfterClick) {
            this.hideTimer = window.setTimeout(
              () => this.hide(),
              isDoubleClick ? 400 : 380
            );
          }
        },
        onComplete: () => {
          let delay = parseInt(clickPulseDuration);

          if (isDoubleClick) {
            delay *= 2;
          }

          this.pulseTimer = window.setTimeout(() => {
            if (this.mouse) {
              this.mouse.classList.remove(className);
              this.mouse.style.color = '';
            }
          }, delay);

          resolve();
        }
      });
    });
  }

  async click(hideAfterClick = true, mouseDownCallback?: () => void) {
    return this.animateClick(hideAfterClick, false, mouseDownCallback);
  }

  async doubleClick(hideAfterClick = true, mouseDownCallback?: () => void) {
    return this.animateClick(hideAfterClick, true, mouseDownCallback);
  }

  // Animates mouse to element and clicks it
  async clickElement(el: HTMLElement, opts: AnimationOptions = {}) {
    if (!el) {
      return Promise.reject('Element not found');
    }

    this.show();

    return new Promise<void>(async resolve => {
      await this.animateTo(el, opts);
      await this.click(opts.hideOnComplete);
      resolve();
    });
  }

  // Animates mouse to a tab and clicks it
  // async clickTab(language: Language, hideOnComplete = true) {
  async clickTab(language: Language, opts: AnimationOptions = {}) {
    const tab = this.getTab(language);

    if (!tab?.el.current) {
      return Promise.reject('Tab not found');
    }

    const tabRect = tab.el.current.getBoundingClientRect();
    let hasHovered = false;

    return this.clickElement(tab.el.current, {
      ...opts,
      onUpdate: () => {
        if (opts.onUpdate) {
          opts.onUpdate();
        }

        if (!hasHovered && this.mouse) {
          const mouseRect = this.mouse.getBoundingClientRect();
          const xOverlap =
            mouseRect.left < tabRect.left + tabRect.width &&
            mouseRect.left + mouseRect.width > tabRect.left;

          const yOverlap = mouseRect.top < tabRect.top + tabRect.height;

          if (xOverlap && yOverlap) {
            tab.setIsHovered(true);
            hasHovered = true;
          }
        }
      },
      onComplete: () => {
        if (opts.onComplete) {
          opts.onComplete();
        }

        tab.setIsHovered(false);
      }
    });
  }

  async selectElement(el: HTMLElement, mouseDownCallback?: () => void) {
    return new Promise<void>(async resolve => {
      await this.animateTo(el);
      await this.doubleClick(true, mouseDownCallback);
      resolve();
    });
  }
}

type AnimationOptions = {
  duration?: number;
  delay?: number;
  hideOnComplete?: boolean;
  onUpdate?: gsap.Callback;
  onComplete?: gsap.Callback;
};
