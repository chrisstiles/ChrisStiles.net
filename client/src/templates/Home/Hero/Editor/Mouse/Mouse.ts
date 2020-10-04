import { RefObject } from 'react';
import { TabHandle } from '../Editor';
import { Language } from '../useHeroAnimation';
import {
  pulseAnimationDuration,
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
      this.mouse.style.opacity = '1';
    }
  }

  private hide() {
    if (this.isVisible && this.mouse) {
      this.isVisible = false;
      this.mouse.style.opacity = '0';
    }
  }

  private async animateTo(
    el: HTMLElement,
    opts: AnimationOptions = {}
  ) {
    let { duration, onUpdate, onComplete } = opts;

    if (!el) {
      return Promise.reject('Element not found');
    }

    return new Promise(resolve => {
      const currentX = this.mouse.offsetLeft;
      const currentY = this.mouse.offsetTop;

      const x = Math.round(
        el.offsetLeft +
          el.offsetWidth / 2 -
          currentX -
          this.mouse.offsetWidth / 2
      );

      const y = Math.round(
        el.offsetTop +
          el.offsetHeight / 2 -
          currentY -
          this.mouse.offsetHeight / 2
      );

      if (duration === undefined) {
        const baseDuration = 0.4;
        const baseDistance = 200;
        const distance = Math.max(
          Math.abs(currentX - x),
          Math.abs(currentY - y)
        );

        duration = Math.round(
          (baseDuration * distance) / baseDistance
        );
      }

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

  // Fires click animation
  private pulseTimer: ReturnType<typeof setTimeout> = null;

  async click(hideAfterClick = true) {
    clearTimeout(this.pulseTimer);

    return new Promise(resolve => {
      gsap.to(this.mouse, {
        scale: 0.8,
        color: clickColor,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        onStart: () => {
          this.mouse.classList.add('click');

          if (hideAfterClick) {
            gsap.to(this.mouse, {
              opacity: 0,
              duration: 0.15,
              delay: 0.1
            });
          }
        },
        onComplete: () => {
          this.pulseTimer = setTimeout(() => {
            if (this.mouse) {
              this.mouse.classList.remove('click');
              this.mouse.style.color = null;
            }
          }, parseInt(pulseAnimationDuration));

          resolve();
        }
      });
    });
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
}

type AnimationOptions = {
  duration?: number;
  onUpdate?: gsap.Callback;
  onComplete?: gsap.Callback;
};
