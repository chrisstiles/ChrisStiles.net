import Prism from 'prismjs';
import 'prismjs/components/prism-scss';

export function formatCode(code: string) {
  if (!code?.trim()) {
    return '';
  }

  const firstLine = code.split('\n').filter(c => c)[0];
  console.log(firstLine);

  if (!firstLine?.trim()) {
    return code;
  }

  const index = firstLine.search(/[^\s\r]/);

  if (index <= 0) {
    return code;
  }

  const arr = new Array(index).fill('  ');
  const regex = new RegExp(arr.join(''), 'g');

  return code.replace(regex, '').trim();
}

// Template literal tag for formatting HTML
export function html(
  strings: TemplateStringsArray,
  ...values: string[]
) {
  const tags: string[] = [];

  const test = strings
    .map((str, i) => {
      return str + (values[i] || '');
    })
    .join('')
    .trim()
    .split(/\r\n|\r|\n/)
    .map(str => {
      str = str.trim();
      if (!str) return '';

      if (tags.length) {
        const currentTag = tags[tags.length - 1];
        const regex = new RegExp(`</[ ]*${currentTag}[ ]*>`);

        if (str.match(regex)) {
          tags.pop();
        }

        const indents = new Array(tags.length + 1).join('  ');
        str = indents + str;
      }

      const tag = str.match(/<[^/]*>/);

      if (tag) {
        const tagName = tag[0]
          .trim()
          .split(' ')[0]
          .replace(/[<>]/g, '');
        const regex = new RegExp(`</[ ]*${tagName}[ ]*>`);

        if (!str.match(regex)) {
          tags.push(tagName.trim());
        }
      }

      return str;
    })
    .join('\n');

  return test;
}

// Init Prism highlighting
let hasAddedHooks = false;

if (!hasAddedHooks) {
  hasAddedHooks = true;

  // Add cursor caret, this can be added to a specific
  // line and will default to displaying at the end of the string
  const caretString = '*|*';

  Prism.hooks.add('before-highlight', env => {
    env.hasSetCaretPosition = env.code.includes(caretString);
  });

  Prism.hooks.add('before-insert', env => {
    if (env.hasSetCaretPosition) {
      env.element.classList.remove('has-caret');
      env.highlightedCode = env.highlightedCode.replace(
        caretString,
        '<span class="caret"></span>'
      );
    } else {
      env.element.classList.add('has-caret');
    }
  });
}
