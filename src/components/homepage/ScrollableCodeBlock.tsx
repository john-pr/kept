"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Wraps a horizontally-scrollable <pre> and shows a right-edge fade while there's more
 * content to scroll to — so cut-off lines on narrow viewports have a visible affordance
 * instead of silently truncating with no cue. The fade disappears once scrolled to the end,
 * or if the content fits without scrolling at all.
 */
export function ScrollableCodeBlock({ children }: { children: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;

    const updateFade = () => {
      const isScrollable = el.scrollWidth > el.clientWidth;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setShowFade(isScrollable && !atEnd);
    };

    updateFade();
    el.addEventListener("scroll", updateFade);
    window.addEventListener("resize", updateFade);
    return () => {
      el.removeEventListener("scroll", updateFade);
      window.removeEventListener("resize", updateFade);
    };
  }, []);

  return (
    <div className="relative">
      <pre
        ref={preRef}
        className="overflow-x-auto px-5 py-4.5 font-mono text-[0.8rem] leading-relaxed text-[#d4d4dc]"
      >
        {children}
      </pre>
      {showFade && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0d0d13] to-transparent"
        />
      )}
    </div>
  );
}
