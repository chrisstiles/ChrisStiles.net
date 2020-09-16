import { useMemo } from 'react';
import { Language } from './useHeroAnimation';

/*

Special character keys:

Typewriter text: [-  -]
Caret position: *|*

*/

export default function useAnimationState(
  setState: (value: any, name?: string) => void
): Step[] {
  const steps: Step[] = useMemo(
    () => [
      { view: Language.SCSS, delay: 500 },
      { view: Language.HTML, delay: 500 },
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
            [-Good ideas need great developers-]
          </h1>
        `,
        delay: 500,
        outputText: true,
        onType: (headlineText: string) => {
          setState({ headlineText });
        }
      },
      { view: Language.SCSS, delay: 500 }
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
  onType?(text: string): void;
};
