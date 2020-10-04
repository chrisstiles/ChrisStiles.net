export default function formatCode(code: string, language: string) {
  code = code.trim();

  if (language === 'html') {
    return html(code);
  } else {
    return scss(code);
  }
}

function scss(str: string) {
  let selectorCount = 0;

  return str
    .split(/\r\n|\r|\n/)
    .map(str => {
      str = str.trim();

      if (str.includes('}')) {
        selectorCount--;
      }

      const indents = new Array(selectorCount + 1).join('  ');
      str = indents + str;

      if (str.includes('{')) {
        selectorCount++;
      }

      return str;
    })
    .join('\n');
}

function html(str: string) {
  const tags: string[] = [];

  return str
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
}
