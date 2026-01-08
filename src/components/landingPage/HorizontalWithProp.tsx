"use client";

import React, { useRef } from "react";
import localFont from "next/font/local";
import { ArrowLeft, ArrowRight } from "lucide-react";

// It's good practice to export types that are used as props
export type Drink = {
  id: number;
  name: string;
  image: string; // The image source will be a string
  price: number;
};

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

// 1. Define the props for the main component
type HorizontalScrollableCardsProps = {
  drinks: Drink[];
};

// ======================= Product Card (Child Component) =======================
const ProductCard: React.FC<{ drink: Drink }> = ({ drink }) => {
  return (
    <a
      href={`/drinks/${drink.id}`}
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[290px] w-[200px] snap-start"
      style={{ background: 'linear-gradient(to top, #1a1816 0%, #1a1816 30%, transparent 70%)' }}
    >
      <div className="relative overflow-hidden rounded-xl h-[300px]">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-full object-contain"
        />
        <p className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/60 px-2 py-1 rounded">
          ₹{drink.price}
        </p>
      </div>

      <div className="mt-3">
        <h2 className="text-base md:text-lg font-semibold leading-tight line-clamp-1">
          {drink.name}
        </h2>
      </div>

      <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white group-hover:bg-lime-400 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 17l10-10M7 7h10v10"
          />
        </svg>
      </div>
    </a>
  );
};

// ======================= Main Scrollable Component =======================
export default function HorizontalScrollableCards({ drinks }: HorizontalScrollableCardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    // Estimate card width (260px) + gap (16px) for a more accurate scroll
    const cardWidth = 260 + 16;
    const scrollAmount = dir === "left" ? -cardWidth * 2 : cardWidth * 2;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="w-full text-white">

      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={() => scrollBy("left")}
          className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors duration-300"
          aria-label="Scroll left"
        >
          <ArrowLeft className="text-white" />
        </button>
        <button
          onClick={() => scrollBy("right")}
          className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors duration-300"
          aria-label="Scroll right"
        >
          <ArrowRight className="text-white" />
        </button>
        
        {/* Horizontal scroll container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-2"
          style={{ scrollSnapType: "x mandatory" }}
          role="list"
        >
          {/* 3. Map over the 'drinks' prop */}
          {drinks.map((d) => (
            <div role="listitem" key={d.id} className="snap-start">
              <ProductCard drink={d} />
            </div>
          ))}
          <style jsx>{`
            /* Hide scrollbar for Chrome, Safari and Opera */
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            /* Hide scrollbar for IE, Edge and Firefox */
            .no-scrollbar {
              -ms-overflow-style: none; /* IE and Edge */
              scrollbar-width: none; /* Firefox */
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}