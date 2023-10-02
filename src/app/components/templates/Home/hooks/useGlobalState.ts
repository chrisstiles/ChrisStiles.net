import { useContext, useEffect, useRef } from 'react';
import { HomeTemplateContext, type HomeGlobalState } from '../Home';

export default function useGlobalState(
  handler?: (state: HomeGlobalState) => void
) {
  const state = useContext(HomeTemplateContext);
  const callback = useRef(handler);

  useEffect(() => {
    callback.current = handler;
  }, [handler]);

  useEffect(() => {
    callback.current?.(state);
  }, [state]);

  return state;
}
