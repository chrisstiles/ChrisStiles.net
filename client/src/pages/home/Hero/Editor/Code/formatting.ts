import Prism from 'prismjs';
import 'prismjs/components/prism-scss';

export function formatCode(code: string, language: string = 'css') {
  if (!code.trim()) {
    return '';
  }

  const firstLine = code.split('\n').filter(c => c)[0];

  if (!firstLine?.trim()) {
    return code;
  }

  const index = firstLine.search(/[^\s\r]/);

  if (index <= 0) {
    return code;
  }

  const arr = new Array(index).fill(' ');
  const regex = new RegExp(arr.join(''), 'g');

  return code.replace(regex, '').trim();
}

let hasAddedHooks = false;

if (!hasAddedHooks) {
  hasAddedHooks = true;

  Prism.hooks.add('after-highlight', function (env) {
    const pre = env.element.parentElement;

    if (
      !pre ||
      !/pre/i.test(pre.nodeName) ||
      !pre.classList.contains('line-numbers')
    ) {
      return;
    }

    const linesNum = 1 + env.code.split('\n').length;
    let lineNumbersWrapper;
    const arr = new Array(linesNum);
    const lines = arr.join('<span></span>');

    lineNumbersWrapper = document.createElement('span');
    lineNumbersWrapper.className = 'line-numbers-rows';
    lineNumbersWrapper.innerHTML = lines;

    if (pre.hasAttribute('data-start')) {
      pre.style.counterReset =
        'linenumber ' +
        (parseInt(pre.getAttribute('data-start'), 10) - 1);
    }

    env.element.appendChild(lineNumbersWrapper);
  });
}
