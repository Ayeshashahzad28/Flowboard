import { useEffect, useRef } from "react";

// Declarative setInterval so the interval always sees fresh closures
// without having to be torn down/recreated every render.
export function useInterval(callback, delayMs) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null || delayMs === undefined) return undefined;
    const id = setInterval(() => callbackRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}
