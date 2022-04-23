import { useMemo, useRef } from 'react';
import Prism, { type Grammar } from 'prismjs';
import dedent from 'dedent';
import 'prismjs/components/prism-scss';
import { Language } from '@global';

Prism.languages.insertBefore(Language.JavaScript, 'keyword', {
  this: {
    pattern: /this/,
    lookbehind: true
  }
});

export default function useSyntaxHighlighting(
  language: Language,
  text: string,
  stripIndentation: boolean = true
) {
  const prevLineIndex = useRef(0);

  const [code, lines, currentLineIndex] = useMemo((): [
    string,
    string[],
    number
  ] => {
    const trailingLines = text.match(/\n+$/) ?? [''];
    const code = (stripIndentation ? dedent(text) : text) + trailingLines[0];
    const lines = code.split('\n');

    let highlightedCode = Prism.highlight(code, languages[language], language);

    Object.keys(sharedTokens).forEach((key: keyof Tokens) => {
      const value = sharedTokens[key];
      const pattern = value instanceof RegExp ? value : value.pattern;
      const match = highlightedCode.match(pattern);

      if (match) {
        if (match.length === 1 || pattern.flags.includes('g')) {
          // Replace contents with empty string
          highlightedCode = highlightedCode.replace(pattern, '');
        } else {
          // Replace with matched content
          for (let i = 1; i < match.length; i++) {
            highlightedCode = highlightedCode.replace(pattern, match[i]);
          }
        }
      }
    });

    let currentLineIndex = lines.findIndex(l => l.includes('*|*'));

    if (currentLineIndex < 0) {
      currentLineIndex = prevLineIndex.current;
    }

    prevLineIndex.current = currentLineIndex;

    return [
      highlightedCode.replace('*|*', '<span class="token caret"></span>'),
      lines,
      currentLineIndex
    ];
  }, [language, text, stripIndentation]);

  return { code, lines, currentLineIndex };
}

export { Language };

type Tokens = Grammar & {
  [key: string]: RegExp | { pattern: RegExp };
};

const sharedTokens: Tokens = {
  select: /\(-(.*)-\)/
};

const languages: { [key in Language]: Grammar } = {
  [Language.JavaScript]: Prism.languages.extend(Language.JavaScript, {
    punctuation: {
      pattern: Prism.languages.javascript.punctuation as RegExp,
      inside: {
        semicolon: /;/
      }
    },
    ...sharedTokens
  }),
  [Language.HTML]: Prism.languages.extend(Language.HTML, {
    tag: {
      pattern: /<[^>]+>?/,
      greedy: true,
      inside: {
        tag: {
          pattern: /^<\/?[^\s\/]+>?/,
          inside: {
            punctuation: /^<\/?|>/,
            namespace: /^[^\s>\/:]+:/
          }
        },
        'attr-value': {
          pattern: /(?:"|')[^"']+(?:"|')?/,
          inside: {
            punctuation: [
              {
                pattern: /^=/,
                alias: 'attr-equals'
              },
              /"|'/
            ]
          }
        },
        punctuation: /\/?>|=|'|"/,
        'attr-name': {
          pattern: /[^\s>\/]+[^"']/
        }
      }
    },
    ...sharedTokens
  }),
  [Language.SCSS]: Prism.languages.extend(Language.SCSS, {
    bracket: {
      pattern: /[{}]/,
      inside: {
        open: /{/,
        close: /}/
      }
    },
    parentheses: /[()]/,
    punctuation: /[;:,]/,
    selector: {
      pattern:
        /(?=\S)[^@;{}()]?(?:[^@;{}()\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))|^(?=\S)[.#][^\s]*/,
      inside: {
        prefix: /^[.#:]/,
        'selector-name': /[^.#]([-\w]+)/
      }
    },
    ...sharedTokens
  })
};
