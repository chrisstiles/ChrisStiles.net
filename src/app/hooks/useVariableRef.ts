import { useRef } from 'react';

export default function useVariableRef<T>(variable: T) {
  const ref = useRef(variable);
  ref.current = variable;
  return ref;
}
