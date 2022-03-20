import { useMemo } from 'react';
import { Language } from '@global';
import type { HeroState, SetHeroStateFunction } from '../Hero';

export enum StepType {
  Text = 'text',
  Select = 'select'
}

/*

Special character keys:

Typewriter text: [-  -]
Caret position: *|*
Select text: (- -)

*/

const closeTagDelay = 200;
const tagNewlineDelay = 250;

export default function useAnimationState(
  setState: SetHeroStateFunction
): Step[] {
  const steps: Step[] = useMemo(
    () => [
      {
        text: '<h1 class="headline">',
        view: Language.HTML
      },
      {
        text: '<h1 class="headline">*|*</h1>',
        instant: true,
        delay: closeTagDelay,
        startState: { showBoundingBox: true }
      },
      {
        instant: true,
        delay: tagNewlineDelay,
        text: `
          <h1 class="headline">
            *|*
          </h1>
        `
      },
      {
        text: `
          <h1 class="headline">
            [-Good ideas need good developers-]
          </h1>
        `,
        delay: 500,
        outputText: true,
        onType(headlineText) {
          setState({ headlineText });
        }
      },
      {
        text: `
          <h1 class="headline">
            Good ideas need (-good-) developers
          </h1>
        `,
        onMouseDown() {
          setState({ selectEmphasis: true });
        }
      },
      {
        text: `
          <h1 class="headline">
            Good ideas need *|* developers
          </h1>
        `,
        instant: true,
        delay: 700,
        startState: { selectEmphasis: false },
        completeState: { headlineText: 'Good ideas need developers' }
      },
      {
        text: `
          <h1 class="headline">
            Good ideas need [-<em>-] developers
          </h1>
        `,
        delay: 950,
        onType(headlineText) {
          setState({
            headlineText: strip(headlineText)
          });
        }
      },
      {
        text: `
          <h1 class="headline">
            Good ideas need <em>*|*</em> developers
          </h1>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <h1 class="headline">
            Good ideas need <em>[-great-]</em> developers
          </h1>
        `,
        delay: 400,
        onType(headlineText) {
          setState({
            headlineText: strip(headlineText)
          });
        }
      },
      {
        view: Language.SCSS,
        delay: 500
      },
      {
        text: '.headline {'
      },
      { text: '.headline {*|*}', instant: true, delay: closeTagDelay },
      {
        text: `
          .headline {
            [-font-weight: 800;-]
          }
        `,
        delay: tagNewlineDelay,
        completeState: { boldText: true }
      },
      {
        text: `
          .headline {
            font-weight: 800;
            [-font-size: 3.3rem;-]
          }
        `,
        completeState: { shrinkText: true }
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.3rem;
            [-font-feature-settings: 'salt', 'calt';-]
          }
        `,
        completeState: { alternateGlyphs: true }
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.3rem;
            font-feature-settings: 'salt', 'calt';
            [-transform: skewY(-3.5deg);-]
          }
        `,
        completeState: { skewText: true }
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.3rem;
            font-feature-settings: 'salt', 'calt';
            transform: skewY(-3.5deg);
            *|*
          }
        `,
        instant: true,
        delay: 200
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.3rem;
            font-feature-settings: 'salt', 'calt';
            transform: skewY(-3.5deg);

            [-em {-]
          }
        `
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.3rem;
            font-feature-settings: 'salt', 'calt';
            transform: skewY(-3.5deg);

            em {*|*}
          }
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.3rem;
            font-feature-settings: 'salt', 'calt';
            transform: skewY(-3.5deg);

            em {
              [-color: var(--accent-color);-]
            }
          }
        `,
        delay: tagNewlineDelay,
        completeState: { showSpanColor: true, showBoundingBox: false }
      }
    ],
    [setState]
  );

  return steps;
}

export type Step = {
  text?: string;
  view?: Language;
  instant?: boolean;
  delay?: number;
  outputText?: boolean;
  type?: StepType;
  startState?: Partial<HeroState>;
  completeState?: Partial<HeroState>;
  onStart?(): void;
  onComplete?(): void;
  onType?(text: string): void;
  onMouseDown?(): void;
};

function strip(text: string) {
  return text.replace(/<\/?[^> \s\n]*>?/g, '');
}
