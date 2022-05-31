import { useState, useRef, useEffect, type RefObject } from 'react';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';
import ResizeObserver from 'resize-observer-polyfill';

export default function useSize(
  ref: RefObject<Element>,
  handler?: (e: ResizeObserverEntry) => void
) {
  const [size, setSize] = useState<Nullable<DOMRect>>(null);
  const [isMounted, setIsMounted] = useState(false);
  const callback = useRef(handler);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    callback.current = handler;
  }, [handler]);

  useIsomorphicLayoutEffect(() => {
    if (!isMounted || !ref.current) return;

    setSize(ref.current.getBoundingClientRect());

    const observer = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect);
      callback.current?.(entry);
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, isMounted]);

  return size;
}
