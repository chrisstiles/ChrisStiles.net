import { RefObject } from 'react';
import { TabHandle } from '../Editor';
import { Language } from '../useHeroAnimation';
import {
  clickPulseDuration,
  clickColor
} from '../Editor.module.scss';
import gsap from 'gsap';

export default class Mouse {
  constructor(
    mouse: RefObject<HTMLDivElement>,
    htmlTab: RefObject<TabHandle>,
    scssTab: RefObject<TabHandle>
  ) {
    this._mouse = mouse;
    this.tabs = {
      [Language.HTML]: htmlTab,
      [Language.SCSS]: scssTab
    };
  }

  private _mouse: RefObject<HTMLDivElement>;
  private get mouse() {
    return this._mouse?.current ?? null;
  }

  private animation: gsap.core.Tween | null;

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

  private async animateTo(
    el: HTMLElement,
    opts: AnimationOptions = {}
  ) {
    this.show();

    let { duration, onUpdate, onComplete } = opts;

    if (!el) {
      return Promise.reject('Element not found');
    }

    return new Promise(resolve => {
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
        const baseDuration = 0.4;
        const baseDistance = 200;
        const distance = Math.max(
          Math.abs(this.mouse.offsetLeft - x),
          Math.abs(this.mouse.offsetTop - y)
        );

        duration = Math.round(
          (baseDuration * distance) / baseDistance
        );
      }

      this.currentX = x;
      this.currentY = y;

      this.animation = gsap.to(this.mouse, {
        x,
        y,
        duration,
        ease: 'power3.out',
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
  private pulseTimer: ReturnType<typeof setTimeout> = null;
  private mouseDownTimer: ReturnType<typeof setTimeout> = null;
  private hideTimer: ReturnType<typeof setTimeout> = null;
  private async animateClick(
    hideAfterClick = true,
    isDoubleClick = false,
    mouseDownCallback?: () => void
  ) {
    clearTimeout(this.pulseTimer);
    clearTimeout(this.mouseDownTimer);
    clearTimeout(this.hideTimer);
    const className = isDoubleClick ? 'doubleClick' : 'click';

    return new Promise(resolve => {
      gsap.to(this.mouse, {
        scale: 0.8,
        color: clickColor,
        duration: 0.15,
        yoyo: true,
        repeat: isDoubleClick ? 2 : 1,
        onStart: () => {
          this.mouse.classList.add(className);

          if (mouseDownCallback) {
            this.mouseDownTimer = setTimeout(
              mouseDownCallback,
              isDoubleClick ? 400 : 100
            );
          }

          if (hideAfterClick) {
            this.hideTimer = setTimeout(
              () => this.hide(),
              isDoubleClick ? 400 : 250
            );
          }
        },
        onComplete: () => {
          let delay = parseInt(clickPulseDuration);

          if (isDoubleClick) {
            delay *= 2;
          }

          this.pulseTimer = setTimeout(() => {
            if (this.mouse) {
              this.mouse.classList.remove(className);
              this.mouse.style.color = null;
            }
          }, delay);

          resolve();
        }
      });
    });
  }

  async click(hideAfterClick = true, mouseDownCallback?: () => void) {
    return this.animateClick(
      hideAfterClick,
      false,
      mouseDownCallback
    );
  }

  async doubleClick(
    hideAfterClick = true,
    mouseDownCallback?: () => void
  ) {
    return this.animateClick(hideAfterClick, true, mouseDownCallback);
  }

  // Animates mouse to element and clicks it
  async clickElement(el: HTMLElement, opts: AnimationOptions = {}) {
    if (!el) {
      return Promise.reject('Element not found');
    }

    this.show();

    return new Promise(async resolve => {
      await this.animateTo(el, opts);
      await this.click();
      resolve();
    });
  }

  // Animates mouse to a tab and clicks it
  async clickTab(language: Language) {
    const tab = this.getTab(language);

    if (!tab) {
      return Promise.reject('Tab not found');
    }

    const tabRect = tab.el.current.getBoundingClientRect();
    let hasHovered = false;

    return this.clickElement(tab.el.current, {
      onUpdate: () => {
        if (!hasHovered) {
          const mouseRect = this.mouse.getBoundingClientRect();
          const xOverlap =
            mouseRect.left < tabRect.left + tabRect.width &&
            mouseRect.left + mouseRect.width > tabRect.left;

          const yOverlap =
            mouseRect.top < tabRect.top + tabRect.height;

          if (xOverlap && yOverlap) {
            tab.setIsHovered(true);
            hasHovered = true;
          }
        }
      },
      onComplete: () => {
        tab.setIsHovered(false);
      }
    });
  }

  async selectElement(
    el: HTMLElement,
    mouseDownCallback?: () => void
  ) {
    return new Promise(async resolve => {
      await this.animateTo(el);
      await this.doubleClick(true, mouseDownCallback);
      resolve();
    });
  }
}

type AnimationOptions = {
  duration?: number;
  onUpdate?: gsap.Callback;
  onComplete?: gsap.Callback;
};
