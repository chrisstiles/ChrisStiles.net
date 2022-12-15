import { isPlainObject, isFunction } from 'lodash';

export function getState(state: any, value: any, name?: string) {
  if (!isPlainObject(state) || (!value && !name)) {
    return state;
  }

  if (isFunction(value)) {
    return value(state);
  }

  if (isPlainObject(value)) {
    return { ...state, ...value };
  }

  if (!name) {
    return state;
  }

  if (Array.isArray(value)) {
    return { ...state, [name]: [...value] };
  }

  return { ...state, [name]: value };
}

export function isSSR() {
  return typeof window === 'undefined' || typeof document === 'undefined';
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getElementIndex(node: Element) {
  return Array.prototype.indexOf.call(node.parentNode?.children ?? [], node);
}

export function stripHtml(text: string) {
  return text.replace(/<\/?[^> \s\n]*>?/g, '');
}

export function isValidDate(d?: Nullable<string | Date>) {
  if (!d) return false;
  const date = new Date(d);
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidURL(url: string) {
  return !!url.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
}

export function preventOrphanedWord(str: string) {
  return str?.replace(/ ([^<> ]*)$/, '\u00A0$1') ?? str;
}

export function isSameUrl<
  A extends { url: URL } | URL | string | null,
  B extends { url: URL } | URL | string | null
>(a?: A, b?: B) {
  if (!a && !b) return true;
  if ((a && !b) || (!a && b)) return false;

  const u1 =
    a instanceof URL
      ? a.href
      : typeof a === 'string'
      ? new URL(a).href
      : a?.url;

  const u2 =
    b instanceof URL
      ? b.href
      : typeof b === 'string'
      ? new URL(b).href
      : b?.url;

  return u1 === u2;
}
