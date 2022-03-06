import { useState, useEffect } from 'react';

export default function useHasRendered() {
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    setHasRendered(true);
  }, []);

  return hasRendered;
}
