import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { Language } from '@global';
import type { HeroState, SetHeroStateFunction } from '../Hero';

export enum StepType {
  Text = 'text',
  Select = 'select'
}

/*

Special character keys:

Typewriter text: [-  -]
Typewriter delete text: [!-  -]
Caret position: *|*
Select text: (- -)

*/

const closeTagDelay = 200;
const tagNewlineDelay = 250;

export default function useAnimationState(
  setState: SetHeroStateFunction,
  setHeaderBoundsVisible: Dispatch<boolean>,
  setHeaderBullets: Dispatch<SetStateAction<string[]>>
): Step[] {
  const steps: Step[] = useMemo(() => {
    const steps: Step[] = [
      {
        text: '<header>',
        view: Language.HTML
      },
      {
        text: '<header>*|*</header>',
        instant: true,
        delay: closeTagDelay,
        onComplete() {
          setHeaderBoundsVisible(true);
        }
      },
      {
        text: `
          <header>
            *|*
          </header>
        `,
        instant: true,
        delay: tagNewlineDelay
      },
      {
        text: `
          <header>
            [-<ul>-]
          </header>
        `
      },
      {
        text: `
          <header>
            <ul>*|*</ul>
          </header>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <header>
            <ul>
              *|*
            </ul>
          </header>
        `,
        instant: true,
        delay: tagNewlineDelay
      },
      {
        text: `
          <header>
            <ul>
              [-<li>-]
            </ul>
          </header>
        `
      },
      {
        text: `
          <header>
            <ul>
              <li>*|*</li>
            </ul>
          </header>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <header>
            <ul>
              <li>[-Software engineer-]</li>
            </ul>
          </header>
        `,
        moveCaretToLineEnd: true,
        onType(text) {
          setHeaderBullets([strip(text)]);
        }
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              [-<li>-]
            </ul>
          </header>
        `,
        delay: 300
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              <li>*|*</li>
            </ul>
          </header>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              <li>[-Interaction designer-]</li>
            </ul>
          </header>
        `,
        moveCaretToLineEnd: true,
        onType(text) {
          setHeaderBullets(t => [t[0], strip(text)]);
        }
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              <li>Interaction designer</li>
              [-<li>-]
            </ul>
          </header>
        `,
        delay: 300
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              <li>Interaction designer</li>
              <li>*|*</li>
            </ul>
          </header>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              <li>Interaction designer</li>
              <li>[-Professional Googler-]</li>
            </ul>
          </header>
        `,
        onType(text) {
          setHeaderBullets(t => [t[0], t[1], strip(text)]);
        }
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              <li>Interaction designer</li>
              <li>[!-Professional Googler-]</li>
            </ul>
          </header>
        `,
        delay: 800,
        minTypingDelay: 30,
        maxTypingDelay: 50,
        onType(text) {
          setHeaderBullets(t => [t[0], t[1], strip(text)]);
        }
      },
      {
        text: `
          <header>
            <ul>
              <li>Software engineer</li>
              <li>Interaction designer</li>
              <li>[-Problem Solver-]</li>
            </ul>
          </header>
        `,
        blockIsComplete: true,
        delay: 300,
        onType(text) {
          setHeaderBullets(t => [t[0], t[1], strip(text)]);
        },
        onComplete() {
          setHeaderBoundsVisible(false);
        }
      },
      {
        text: '<main>'
      },
      {
        text: '<main>*|*</main>',
        instant: true,
        delay: closeTagDelay,
        completeState: { headlineBoundsVisible: true }
      },
      {
        text: `
          <main>
            *|*
          </main>
        `,
        instant: true,
        delay: tagNewlineDelay
      },
      {
        text: `
          <main>
            [-<h1 class="-]
          </main>
        `
      },
      {
        text: `
          <main>
            <h1 class="*|*"
          </main>
        `,
        instant: true,
        delay: 10
      },
      {
        text: `
          <main>
            <h1 class="[-headline-]"
          </main>
        `,
        delay: 300
      },
      {
        text: `
          <main>
            <h1 class="headline">*|*</h1>
          </main>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <main>
            <h1 class="headline">
              *|*
            </h1>
          </main>
        `,
        instant: true,
        delay: tagNewlineDelay
      },
      {
        text: `
          <main>
            <h1 class="headline">
              [-Good ideas need good developers-]
            </h1>
          </main>
        `,
        delay: 500,
        outputText: true,
        onType(headlineText) {
          setState({ headlineText });
        }
      },
      {
        text: '.headline {',
        view: Language.SCSS,
        delay: 500
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
            [-font-size: 3.8rem;-]
          }
        `,
        completeState: { growText: true }
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.8rem;
            [-font-feature-settings: 'salt', 'calt';-]
          }
        `,
        completeState: { alternateGlyphs: true }
      },
      {
        text: `
          <main>
            <h1 class="headline">
              Good ideas need (-good-) developers
            </h1>
          </main>
        `,
        view: Language.HTML,
        forceMouseVisible: true,
        instant: true,
        delay: 0,
        onMouseDown() {
          setState({ selectEmphasis: true });
        }
      },
      {
        text: `
          <main>
            <h1 class="headline">
              Good ideas need *|* developers
            </h1>
          </main>
        `,
        instant: true,
        delay: 700,
        startState: { selectEmphasis: false },
        completeState: { headlineText: 'Good ideas need developers' }
      },
      {
        text: `
          <main>
            <h1 class="headline">
              Good ideas need [-<em>-] developers
            </h1>
          </main>
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
          <main>
            <h1 class="headline">
              Good ideas need <em>*|*</em> developers
            </h1>
          </main>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <main>
            <h1 class="headline">
              Good ideas need <em>[-great-]</em> developers
            </h1>
          </main>
        `,
        delay: 400,
        onType(headlineText) {
          setState({
            headlineText: strip(headlineText)
          });
        }
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.8rem;
            font-feature-settings: 'salt', 'calt';
            [-transform: skewY(-3.5deg);-]
          }
        `,
        view: Language.SCSS,
        completeState: { skewText: true }
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.8rem;
            font-feature-settings: 'salt', 'calt';
            transform: skewY(-3.5deg);
            *|*
          }
        `,
        instant: true
      },
      {
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.8rem;
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
            font-size: 3.8rem;
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
            font-size: 3.8rem;
            font-feature-settings: 'salt', 'calt';
            transform: skewY(-3.5deg);

            em {
              [-color: var(--accent-color);-]
            }
          }
        `,
        delay: tagNewlineDelay,
        completeState: { showSpanColor: true, headlineBoundsVisible: false }
      }
    ];

    // When a top level element or block of code is complete,
    // we store and automatically append it to avoid
    // having to retype the same code for every step
    let currentView: Language = Language.HTML;
    let shouldAddDelay = false;

    const blocks: { [key in Language]?: string } = {
      [Language.HTML]: '',
      [Language.SCSS]: ''
    };

    const newSteps: Step[] = [];

    steps.forEach((step, index) => {
      if (shouldAddDelay && currentView === step.view) {
        step.delay = (step.delay ?? 0) + 300;
      }

      if (step.view) {
        currentView = step.view;
      }

      if (step.text) {
        step.text = (blocks[currentView] ?? '') + step.text.trimStart();

        if (step.blockIsComplete) {
          blocks[currentView] =
            step.text.replace(/[([]!?-|-[)\]]|\*\|\*/g, '') + '\n';
        }
      }

      newSteps.push(step);

      if (step.moveCaretToLineEnd && step.text?.includes('-]')) {
        newSteps.push({
          text: step.text.replace(/\[!?-/, '').replace(/-\](.*)/, '$1*|*'),
          delay: 100
        });
      }

      if (step.blockIsComplete) {
        shouldAddDelay = true;

        newSteps.push({
          text: blocks[currentView] + '*|*',
          instant: true,
          delay: 300
        });

        const nextStep = steps[index + 1];

        if (nextStep?.text && !nextStep.text.match(/\n|[([]-/)) {
          nextStep.text = `[-${nextStep.text}-]`;
        }
      } else {
        shouldAddDelay = false;
      }
    });

    return newSteps;
  }, [setState, setHeaderBoundsVisible, setHeaderBullets]);

  return steps;
}

export type Step = {
  text?: string;
  view?: Language;
  instant?: boolean;
  delay?: number;
  outputText?: boolean;
  type?: StepType;
  minTypingDelay?: number;
  maxTypingDelay?: number;
  moveCaretToLineEnd?: boolean;
  forceMouseVisible?: boolean;
  startState?: Partial<HeroState>;
  completeState?: Partial<HeroState>;
  blockIsComplete?: boolean;
  onStart?(): void;
  onComplete?(): void;
  onType?(text: string): void;
  onMouseDown?(): void;
};

function strip(text: string) {
  return text.replace(/<\/?[^> \s\n]*>?/g, '');
}
