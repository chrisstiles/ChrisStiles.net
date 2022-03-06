import { useLayoutEffect, useEffect } from 'react';
import { isSSR } from '@helpers';

const useIsomorphicLayoutEffect = isSSR() ? useEffect : useLayoutEffect;

export default useIsomorphicLayoutEffect;