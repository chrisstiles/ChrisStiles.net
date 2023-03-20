import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { autocompleteLists } from './Autocomplete';
import { sleep } from '@helpers';
import { Language } from '@global';
import type { HeroState, SetHeroStateFunction } from '../Hero';

/*

Special character keys:

Typewriter text: [-  -]
Typewriter delete text: [!-  -]
Caret position: #|#
Select text: (- -)

*/

const closeTagDelay = 200;
const tagNewlineDelay = 250;
const afterAutocompleteDelay = 200;
const typingRegex = /\[-(.*)-\]/;

export const initialView = Language.TypeScript;

export default function useAnimationState({
  setState,
  setHeaderBoundsVisible,
  setHeaderBullets,
  setAccentsVisible,
  setAutocompleteVisible,
  pause
}: AnimationStepsConfig): AnimationSteps {
  const { steps, initialView, baseText }: AnimationSteps = useMemo(() => {
    /*-----------------------------------*/
    /* Animation steps
    /*-----------------------------------*/

    const steps: Step[] = [
      {
        text: 'node ./web/app/init.ts',
        view: Language.Console,
        onType(terminalText) {
          setState({ terminalText });
        }
      },
      {
        delay: 600,
        startState: { showTerminalMessage: true }
      },
      {
        delay: 1200,
        startState: { terminalLoadingComplete: true }
      },
      {
        delay: 600
      },
      {
        view: Language.TypeScript,
        text: `import './styles.scss';#|#`,
        isBaseText: true
      },
      {
        text: `import * as effects from '`
      },
      {
        text: `import * as effects from '#|#'`,
        instant: true,
        delay: 10
      },
      {
        text: `import * as effects from '[-./fancy-effects-]'`,
        delay: 200
      },
      {
        text: `import * as effects from './fancy-effects';\n`,
        instant: true,
        blockIsComplete: true
      },
      {
        text: 'eff',
        delay: 300,
        autocomplete: {
          selectedItem: 'effects',
          items: autocompleteLists.general
        }
      },
      {
        text: 'effects[-.-]',
        delay: afterAutocompleteDelay,
        autocomplete: {
          selectedItem: 'init',
          value: '.init[-();-]',
          items: autocompleteLists.effects
        }
      },
      {
        text: `
          effects.init();
          [-effe-]
        `,
        delay: 300,
        autocomplete: {
          selectedItem: 'effects',
          items: autocompleteLists.general
        }
      },
      {
        text: `
          effects.init();
          effects[-.-]
        `,
        delay: afterAutocompleteDelay,
        autocomplete: {
          selectedItem: 'addFlair',
          value: '.addFlair[-();-]',
          items: autocompleteLists.effects
        },
        onComplete() {
          setAccentsVisible(true);
        }
      },
      {
        view: Language.HTML,
        text: '<header>'
      },
      {
        text: '<header>#|#</header>',
        instant: true,
        delay: closeTagDelay,
        onComplete() {
          setHeaderBoundsVisible(true);
        }
      },
      {
        text: `
          <header>
            #|#
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
            <ul>#|#</ul>
          </header>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <header>
            <ul>
              #|#
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
              <li>#|#</li>
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
          setHeaderBullets([text]);
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
              <li>#|#</li>
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
          setHeaderBullets(t => [t[0], text]);
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
              <li>#|#</li>
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
          setHeaderBullets(t => [t[0], t[1], text]);
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
          setHeaderBullets(t => [t[0], t[1], text]);
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
          setHeaderBullets(t => [t[0], t[1], text]);
        },
        onComplete() {
          setHeaderBoundsVisible(false);
        }
      },
      {
        text: '<main>'
      },
      {
        text: '<main>#|#</main>',
        instant: true,
        delay: closeTagDelay,
        completeState: { headlineBoundsVisible: true }
      },
      {
        text: `
          <main>
            #|#
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
            <h1 class="#|#"
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
            <h1 class="headline">#|#</h1>
          </main>
        `,
        instant: true,
        delay: closeTagDelay
      },
      {
        text: `
          <main>
            <h1 class="headline">
              #|#
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
        view: Language.SCSS,
        text: '.headline {',
        delay: 500
      },
      { text: '.headline {#|#}', instant: true, delay: closeTagDelay },
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
        view: Language.HTML,
        text: `
          <main>
            <h1 class="headline">
              Good ideas need (-good-) developers
            </h1>
          </main>
        `,
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
              Good ideas need #|# developers
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
          setState({ headlineText });
        }
      },
      {
        text: `
          <main>
            <h1 class="headline">
              Good ideas need <em>#|#</em> developers
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
          setState({ headlineText });
        }
      },
      {
        view: Language.SCSS,
        text: `
          .headline {
            font-weight: 800;
            font-size: 3.8rem;
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
            font-size: 3.8rem;
            font-feature-settings: 'salt', 'calt';
            transform: skewY(-3.5deg);
            #|#
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

            em {#|#}
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

    /*-----------------------------------*/
    /* Transform step configuration
    /*-----------------------------------*/

    // When a top level element or block of code is complete,
    // we store and automatically append it to avoid
    // having to retype the same code for every step
    const initialView =
      steps.find(s => s.view && s.view !== Language.Console)?.view ??
      Language.TypeScript;
    let currentView = initialView;
    let shouldAddDelay = false;

    const baseText: { [key in Language]?: string } = {
      [Language.TypeScript]: '',
      [Language.HTML]: '',
      [Language.SCSS]: ''
    };

    const blocks: { [key in Language]?: string } = {
      [Language.TypeScript]: '',
      [Language.HTML]: '',
      [Language.SCSS]: ''
    };

    const newSteps: Step[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      if (shouldAddDelay && currentView === step.view) {
        step.delay = (step.delay ?? 0) + 300;
      }

      if (step.view) {
        currentView = step.view;
      }

      if (step.text) {
        if (step.isBaseText) {
          const text = step.text + '\n';

          baseText[currentView] += text;
          blocks[currentView] += text.replace('#|#', '');
        }

        step.text = (blocks[currentView] ?? '') + step.text.trimStart();

        if (step.blockIsComplete) {
          blocks[currentView] =
            step.text.replace(/[([]!?-|-[)\]]|#\|#/g, '') + '\n';
        }
      }

      if (!step.isBaseText) {
        newSteps.push(step);

        if (step.autocomplete && step.text) {
          if (!step.text.includes('-]')) {
            step.text = `[-${step.text}-]`;
          }

          const autocompleteValue =
            step.autocomplete.value ?? step.autocomplete.selectedItem;
          const hasAdditionalTypedText = autocompleteValue.includes('-]');
          const newText = !hasAdditionalTypedText
            ? autocompleteValue
            : autocompleteValue.replace(typingRegex, '');

          newSteps.push({
            text: step.text.replace(typingRegex, newText),
            instant: true,
            delay: 0
          });

          if (hasAdditionalTypedText) {
            newSteps.push({
              text: step.text.replace(typingRegex, autocompleteValue),
              delay: afterAutocompleteDelay
            });
          }
        }

        if (step.moveCaretToLineEnd && step.text?.includes('-]')) {
          newSteps.push({
            text: step.text.replace(/\[!?-/, '').replace(/-\](.*)/, '$1#|#'),
            delay: 100
          });
        }
      }

      if (step.blockIsComplete || step.isBaseText) {
        shouldAddDelay = true;

        newSteps.push({
          text: blocks[currentView] + '#|#',
          instant: true,
          delay: 300
        });

        const nextStep = steps[i + 1];

        if (nextStep?.text && !nextStep.text.match(/\n|[([]-/)) {
          nextStep.text = `[-${nextStep.text}-]`;
        }
      } else {
        shouldAddDelay = false;
      }
    }

    return { steps: newSteps, initialView, baseText };
  }, [setAccentsVisible, setHeaderBoundsVisible, setHeaderBullets, setState]);

  return { steps, initialView, baseText };
}

type AnimationStepsConfig = {
  setState: SetHeroStateFunction;
  setHeaderBoundsVisible: Dispatch<boolean>;
  setHeaderBullets: Dispatch<SetStateAction<string[]>>;
  setAccentsVisible: Dispatch<boolean>;
  setAutocompleteVisible: Dispatch<boolean>;
  pause: () => void;
};

type AnimationSteps = {
  steps: Step[];
  initialView: Language;
  baseText: { [key in Language]?: string };
};

type AutocompleteConfig = {
  items?: string[];
  selectedItem: string;
  value?: string;
};

export enum StepType {
  Text = 'text',
  Select = 'select'
}

export type Step = {
  text?: string;
  isBaseText?: boolean;
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
  autocomplete?: AutocompleteConfig;
  onStart?(): void;
  onComplete?(): void;
  onType?(text: string): void;
  onMouseDown?(): void;
};
