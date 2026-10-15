"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Becomes true the first time the element approaches the viewport, then stays true.
 * Used to defer 3D chunks and canvases until they are actually needed.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(rootMargin = "240px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}

/** True only after client hydration. Prevents server/client markup mismatch for persisted state. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
