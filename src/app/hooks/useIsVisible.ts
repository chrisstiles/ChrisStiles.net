import { useSyncExternalStore } from 'react';
import {
  useInView,
  type IntersectionOptions
} from 'react-intersection-observer';

function subscribe(callback: (event: Event) => void) {
  document.addEventListener('visibilitychange', callback);

  return () => {
    document.removeEventListener('visibilitychange', callback);
  };
}

export default function useIsVisible({
  isVisibleOnServer = false,
  ...intersectionOpts
}: IsVisibleOptions = {}) {
  const { inView, ...inViewData } = useInView({
    fallbackInView: true,
    ...intersectionOpts
  });

  const documentIsVisible = useSyncExternalStore(
    subscribe,
    () => document.visibilityState === 'visible',
    () => isVisibleOnServer
  );

  return {
    inView,
    documentIsVisible,
    isVisible: inView && documentIsVisible,
    ...inViewData
  };
}

type IsVisibleOptions = IntersectionOptions & {
  isVisibleOnServer?: boolean;
};
