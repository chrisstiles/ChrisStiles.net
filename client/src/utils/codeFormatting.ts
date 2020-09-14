// import Prism from 'prismjs';
// import 'prismjs/components/prism-scss';

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
