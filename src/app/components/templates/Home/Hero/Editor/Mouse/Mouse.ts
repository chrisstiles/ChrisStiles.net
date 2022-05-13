import { clickPulseDuration, clickColor } from '../Editor.module.scss';
import { sleep } from '@helpers';
import gsap from 'gsap';
import { round } from 'lodash';
import { Language } from '@global';
import type { RefObject } from 'react';
import type { TabHandle } from '../Editor';

export default class Mouse {
  constructor(
    mouse: RefObject<HTMLDivElement>,
    typescriptTab: RefObject<TabHandle>,
    htmlTab: RefObject<TabHandle>,
    scssTab: RefObject<TabHandle>
  ) {
    this._mouse = mouse;
    this.tabs = {
      [Language.TypeScript]: typescriptTab,
      [Language.HTML]: htmlTab,
      [Language.SCSS]: scssTab
    };
  }

  private _mouse: RefObject<HTMLDivElement>;
  private get mouse() {
    return this._mouse?.current ?? null;
  }

  private animation?: gsap.core.Tween | null;

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

  private currentX = 0;
  private currentY = 0;
  private currentEl?: HTMLElement;

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

      const x = Math.round(
        elRect.left +
          elRect.width / 2 -
          mouseRect.left -
          mouseRect.width / 2 +
          this.currentX
      );

      const y = Math.round(
        elRect.top +
          elRect.height / 2 -
          mouseRect.top -
          mouseRect.height / 2 +
          this.currentY
      );

      if (duration === undefined) {
        const baseDuration = 0.3;
        const baseDistance = 250;
        const distance = Math.max(
          Math.abs(this.mouse.offsetLeft - x),
          Math.abs(this.mouse.offsetTop - y)
        );

        duration = round((baseDuration * distance) / baseDistance, 2);
      }

      this.currentX = x;
      this.currentY = y;
      this.currentEl = el;

      this.animation = gsap.to(this.mouse, {
        x,
        y,
        duration,
        delay,
        ease: 'power4.inOut',
        onUpdate,
        onComplete: () => {
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
