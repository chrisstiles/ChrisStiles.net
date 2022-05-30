import { useRef, useEffect } from 'react';

export default function useVariableRef<T>(variable: T) {
  const ref = useRef(variable);

  useEffect(() => {
    ref.current = variable;
  }, [variable]);

  return ref;
}
