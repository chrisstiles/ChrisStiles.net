import { useMemo } from 'react';
import Prism, { type Grammar } from 'prismjs';
import dedent from 'dedent';
import 'prismjs/components/prism-scss';
import { Language } from '@global';

export default function useSyntaxHighlighting(
  language: Language,
  text: string,
  stripIndentation: boolean = true
) {
  const [code, lines] = useMemo((): [string, string[]] => {
    const code = stripIndentation ? dedent(text) : text;
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

    return [highlightedCode, lines];
  }, [language, text, stripIndentation]);

  return { code, lines };
}

export { Language };

type Tokens = Grammar & {
  [key: string]: RegExp | { pattern: RegExp };
};

const sharedTokens: Tokens = {
  caret: /\*\|\*/g,
  select: /\(-(.*)-\)/
};

const languages: { [key in Language]: Grammar } = {
  [Language.JavaScript]: Prism.languages.extend(Language.JavaScript, {
    punctuation: /[{}[\](),.:]/,
    keyword:
      /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
    semicolon: /;/g,
    this: /this/,
    ...sharedTokens
  }),
  [Language.HTML]: Prism.languages.extend(Language.HTML, sharedTokens),
  [Language.SCSS]: Prism.languages.extend(Language.SCSS, sharedTokens)
};
