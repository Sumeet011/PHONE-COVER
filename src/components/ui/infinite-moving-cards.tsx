"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// 1️⃣ Define the item shape
interface InfiniteMovingCardItem {
  name: string;
  quote: string;
  title: string;
}

// 2️⃣ Define props for the component
interface InfiniteMovingCardsProps {
  items: InfiniteMovingCardItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

// Must stay in sync with the `gap-4` on the track below.
const GAP = 16;

// Speed is px/second instead of a fixed duration, so the marquee moves at the
// same visual pace whether the API returns 2 reviews or 50.
const PX_PER_SECOND = { fast: 120, normal: 60, slow: 30 } as const;

export const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  items,
  direction = "right",
  speed = "fast",
  pauseOnHover = true,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  // How many times `items` is repeated inside the track. Measured from the real
  // card widths so the track always overflows the container — this is what
  // removes the empty space when there are only a few reviews.
  const [repeat, setRepeat] = useState(2);

  const setWidthRef = useRef(0); // width of one full pass of `items` (incl. trailing gap)
  const offsetRef = useRef(0); // how far the track has travelled, in px
  const pausedRef = useRef(false);
  const hoverRef = useRef(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startOffset: number } | null>(null);

  const syncPaused = () => {
    pausedRef.current = dragRef.current !== null || (pauseOnHover && hoverRef.current);
  };

  const measure = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || items.length === 0) return;

    const cards = Array.from(track.children).slice(0, items.length) as HTMLElement[];
    if (cards.length < items.length) return;

    const first = cards[0];
    const last = cards[cards.length - 1];
    const setWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft + GAP;
    if (setWidth <= GAP) return; // not laid out yet

    setWidthRef.current = setWidth;

    // Enough copies to fill the visible area, plus one spare: the track is only
    // ever shifted by at most one pass, so there is always a card ready to slide
    // in on the right (or left) instead of a hole.
    const needed = Math.ceil((container.clientWidth + GAP) / setWidth) + 1;
    setRepeat(Math.min(Math.max(needed, 2), 40));
  }, [items.length]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Re-measure when the container resizes or the cards change width at a
  // breakpoint (w-[350px] -> md:w-[450px]).
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    const firstCard = trackRef.current?.children[0];
    if (firstCard) observer.observe(firstCard);

    return () => observer.disconnect();
  }, [measure]);

  // The loop itself: advance the offset and wrap it into [0, setWidth) so the
  // strip is seamless and never reaches an end.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const sign = direction === "right" ? 1 : -1;
    const pxPerSecond = PX_PER_SECOND[speed];
    let frame = 0;
    let previous = 0;

    const tick = (now: number) => {
      if (!previous) previous = now;
      const elapsed = Math.min(now - previous, 50) / 1000; // clamp tab-switch jumps
      previous = now;

      const setWidth = setWidthRef.current;
      if (setWidth > 0) {
        if (!pausedRef.current) offsetRef.current += sign * pxPerSecond * elapsed;
        const x = -(((offsetRef.current % setWidth) + setWidth) % setWidth);
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [direction, speed, items.length]);

  // Drag handlers — dragging just moves the same offset, so it wraps around
  // infinitely in both directions too.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startOffset: offsetRef.current };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer already released — the drag still works without capture
    }
    syncPaused();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    offsetRef.current = drag.startOffset - (e.clientX - drag.startX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return;
    dragRef.current = null;
    syncPaused();
  };

  const handleMouseEnter = () => {
    hoverRef.current = true;
    syncPaused();
  };

  const handleMouseLeave = () => {
    hoverRef.current = false;
    syncPaused();
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "scroller relative z-20 max-w-7xl touch-pan-y overflow-hidden py-4 select-none cursor-grab active:cursor-grabbing",
        className
      )}
    >
      <ul ref={trackRef} className="flex w-max shrink-0 flex-nowrap gap-4 will-change-transform">
        {Array.from({ length: repeat }).flatMap((_, copy) =>
          items.map((item, index) => (
            <li
              key={`${copy}-${item.name}-${index}`}
              aria-hidden={copy > 0}
              className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-b-0 border-zinc-200 bg-[linear-gradient(180deg,#fafafa,#f5f5f5)] px-8 py-6 md:w-[450px] dark:border-zinc-700 dark:bg-[linear-gradient(180deg,#27272a,#18181b)]"
            >
              <blockquote>
                <div
                  aria-hidden="true"
                  className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                ></div>
                <span className="relative z-20 text-sm leading-[1.6] font-normal text-neutral-800 dark:text-gray-100">
                  {item.quote}
                </span>
                <div className="relative z-20 mt-6 flex flex-row items-center">
                  <span className="flex flex-col gap-1">
                    <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
                      {item.name}
                    </span>
                    <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
                      {item.title}
                    </span>
                  </span>
                </div>
              </blockquote>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
