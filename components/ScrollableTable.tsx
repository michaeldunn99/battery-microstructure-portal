"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

type ScrollableTableProps = {
  label: string;
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
};

export default function ScrollableTable({ label, children, className = "", viewportClassName = "" }: ScrollableTableProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const id = useId();
  const [scroll, setScroll] = useState({ left: 0, max: 0 });

  const measure = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const max = element.clientWidth > 0 ? Math.max(0, element.scrollWidth - element.clientWidth) : 0;
    const left = Math.max(0, Math.min(max, element.scrollLeft));
    setScroll(previous => previous.left === left && previous.max === max ? previous : { left, max });
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const table = element.querySelector("table");
    if (table) observer.observe(table);
    measure();
    return () => observer.disconnect();
  }, [children, measure]);

  const overflowing = scroll.max > 1;
  const moreLeft = scroll.left > 1;
  const moreRight = scroll.left < scroll.max - 1;
  const position = scroll.max > 0 ? Math.round(100 * scroll.left / scroll.max) : 0;

  function move(direction: number) {
    const element = viewport.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.75, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <div data-scrollable-table className={`min-w-0 max-w-full ${className}`}>
      {overflowing && (
        <div className="sticky top-0 z-20 mb-2 rounded-sm border border-zinc-300 bg-paper px-3 py-2 shadow-sm" role="group" aria-label={`Scroll controls: ${label}`}>
          <p id={`${id}-hint`} className="text-xs font-medium leading-5 text-zinc-700">
            {moreRight ? "More columns to the right →" : "← More columns to the left"}
            <span className="ml-2 font-normal text-zinc-500">Scroll or drag the bar.</span>
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => move(-1)} disabled={!moreLeft} aria-controls={`${id}-viewport`} aria-label={`Scroll left: ${label}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-zinc-300 bg-white text-lg text-zinc-800 hover:bg-zinc-100 disabled:cursor-default disabled:opacity-40">←</button>
            <input type="range" min={0} max={100} step={1} value={position} aria-label={`Horizontal scroll position: ${label}`} aria-valuetext={`${position}% across the table`} aria-controls={`${id}-viewport`} onChange={event => viewport.current?.scrollTo({ left: Number(event.target.value) * scroll.max / 100, behavior: "auto" })} className="h-8 min-w-0 flex-1 cursor-ew-resize accent-zinc-600" />
            <button type="button" onClick={() => move(1)} disabled={!moreRight} aria-controls={`${id}-viewport`} aria-label={`Scroll right: ${label}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-zinc-300 bg-white text-lg text-zinc-800 hover:bg-zinc-100 disabled:cursor-default disabled:opacity-40">→</button>
          </div>
        </div>
      )}
      <div className="relative">
        <div ref={viewport} id={`${id}-viewport`} onScroll={measure} role="region" aria-label={label} aria-describedby={overflowing ? `${id}-hint` : undefined} tabIndex={0} className={`max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 [scrollbar-color:#a1a1aa_#f4f4f5] ${viewportClassName}`}>
          {children}
        </div>
        {overflowing && moreLeft && <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-zinc-700/20 to-transparent" />}
        {overflowing && moreRight && <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-zinc-700/20 to-transparent" />}
      </div>
    </div>
  );
}
