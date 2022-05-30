import {
  useEffect,
  useRef,
  type EffectCallback,
  type DependencyList
} from 'react';

export default function useEffectAfterMount(
  callback: EffectCallback,
  deps: DependencyList = []
) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    if (callback) {
      return callback();
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
