import { useEffect, useState } from "react";

export function useRotatingStep(length: number, delayMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length === 0) {
      return;
    }

    setIndex((current) => {
      if (current < length) {
        return current;
      }
      return 0;
    });
  }, [length]);

  useEffect(() => {
    if (length <= 1) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIndex((current) => {
        if (length === 0) {
          return current;
        }

        return (current + 1) % length;
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [index, length, delayMs]);

  const selectIndex = (nextIndex: number) => {
    if (length === 0) {
      return;
    }

    const safeIndex = ((nextIndex % length) + length) % length;
    setIndex(safeIndex);
  };

  return {
    index,
    setIndex: selectIndex,
  };
}
