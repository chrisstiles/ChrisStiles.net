import { useMemo } from 'react';
import { Language } from './useHeroAnimation';

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

export default function useAnimationState(
  setState: (value: any, name?: string) => void
): Step[] {
  const steps: Step[] = useMemo(
    () => [
      { text: '<h1>', view: Language.HTML },
      { text: '<h1>*|*</h1>', instant: true, delay: 500 },
      {
        instant: true,
        delay: 500,
        text: `
          <h1>
            *|*
          </h1>
        `
      },
      {
        text: `
          <h1>
            [-Good ideas need good developers-]
          </h1>
        `,
        delay: 500,
        outputText: true,
        onType(headlineText: string) {
          setState({ headlineText });
        }
      },
      {
        text: `
          <h1>
            Good ideas need (-good-) developers
          </h1>
        `,
        onMouseDown() {
          setState({ selectSpan: true });
        }
      },
      {
        text: `
          <h1>
            Good ideas need *|* developers
          </h1>
        `,
        instant: true,
        delay: 700,
        onStart() {
          setState({ selectSpan: false });
        },
        onComplete() {
          setState({ headlineText: 'Good ideas need developers' });
        }
      },
      {
        text: `
          <h1>
            Good ideas need [-<span>-] developers
          </h1>
        `,
        delay: 1650,
        onType(headlineText: string) {
          setState({
            headlineText: stripSpan(headlineText)
          });
        }
      },
      {
        text: `
          <h1>
            Good ideas need <span>*|*</span> developers
          </h1>
        `,
        instant: true,
        delay: 500
      },
      {
        text: `
          <h1>
            Good ideas need <span>[-great-]</span> developers
          </h1>
        `,
        delay: 500,
        onType(headlineText: string) {
          setState({
            headlineText: stripSpan(headlineText)
          });
        }
      },
      {
        view: Language.SCSS,
        delay: 500
      },
      {
        text: 'h1 {'
      },
      { text: 'h1 {*|*}', instant: true, delay: 500 },
      {
        text: `
          h1 {
            [-font-weight: 800;-]
          }
        `,
        onComplete() {
          setState({ boldText: true });
        }
      },
      {
        text: `
          h1 {
            font-weight: 800;
            [-font-size: 3.3em;-]
          }
        `,
        onComplete() {
          setState({ shrinkText: true });
        }
      },
      {
        text: `
          h1 {
            font-weight: 800;
            font-size: 3.3em;
            [-text-transform: uppercase;-]
          }
        `,
        onComplete() {
          setState({ uppercaseText: true });
        }
      },
      {
        text: `
          h1 {
            font-weight: 800;
            font-size: 3.3em;
            text-transform: upprcase;
            [-transform: skewY(-3.5deg);-]
          }
        `,
        onComplete() {
          setState({ skewText: true });
        }
      },
      {
        text: `
          h1 {
            font-weight: 800;
            font-size: 3.3em;
            text-transform: upprcase;
            transform: skewY(-3.5deg);
            *|*
          }
        `,
        instant: true,
        delay: 200
      },
      {
        text: `
          h1 {
            font-weight: 800;
            font-size: 3.3em;
            text-transform: upprcase;
            transform: skewY(-3.5deg);

            [-span {-]
          }
        `
      },
      {
        text: `
          h1 {
            font-weight: 800;
            font-size: 3.3em;
            text-transform: upprcase;
            transform: skewY(-3.5deg);

            span {*|*}
          }
        `,
        instant: true,
        delay: 500
      },
      {
        text: `
          h1 {
            font-weight: 800;
            font-size: 3.3em;
            text-transform: upprcase;
            transform: skewY(-3.5deg);

            span {
              [-color: var(--green);-]
            }
          }
        `,
        onComplete() {
          setState({ showSpanColor: true, showBoundingBox: false });
        }
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
  onStart?(): void;
  onComplete?(): void;
  onType?(text: string): void;
  onMouseDown?(): void;
};

function stripSpan(text: string) {
  return text.replace(/<\/?s?p?a?n?>?/g, '');
}
