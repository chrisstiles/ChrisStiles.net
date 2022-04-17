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
