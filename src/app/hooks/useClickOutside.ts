// https://usehooks-ts.com/react-hook/use-on-click-outside
import useEventListener from './useEventListener';
import type { RefObject } from 'react';

export default function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void {
  useEventListener(mouseEvent, event => {
    const el = ref?.current;

    if (!el || el.contains(event.target as Node)) {
      return;
    }

    handler(event);
  });
}

type Handler = (event: MouseEvent) => void;
