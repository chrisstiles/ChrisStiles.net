import { RefObject } from 'react';
import { TabHandle } from '../Editor';
import { Language } from '../useHeroAnimation';
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
    return this._mouse.current;
  }

  private animation: gsap.core.Tween | null;

  private tabs: { [key in Language]?: RefObject<TabHandle> };
  private getTab(language: Language): TabHandle | null {
    return this.tabs[language]?.current ?? null;
  }

  private show() {
    this.mouse.style.opacity = '1';
  }

  private hide() {
    this.mouse.style.opacity = '0';
  }

  private async animateTo(el?: HTMLElement, duration?: number) {
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
        const baseDuration = 0.7;
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
        ease: 'power4.inOut',
        onComplete: () => {
          this.animation = null;
          resolve();
        }
      });
    });
  }

  // Animates mouse to element and clicks it
  async clickElement(el?: HTMLElement) {
    if (!el) {
      return Promise.reject('Element not found');
    }

    this.show();

    return new Promise(async resolve => {
      await this.animateTo(el);
      this.hide();
      resolve();
    });
  }

  // Animates mouse to a tab and clicks it
  async clickTab(language: Language) {
    const tab = this.getTab(language);

    if (!tab) {
      return Promise.reject('Tab not found');
    }

    return this.clickElement(tab.el.current);
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
