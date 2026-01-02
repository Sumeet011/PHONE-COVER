"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import localFont from "next/font/local";
import Img from "../../../public/images/card.webp";
import { ArrowLeft, ArrowRight } from "lucide-react";
import HorizontalWithProp from "../../components/landingPage/HorizontalWithProp";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?? "https://phone-wraps-backend.onrender.com";
const URL = `${BACKEND_URL}/api/products`;

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

type Drink = {
  id: string;
  name: string;
  image: string;
  price?: number;
  type?: string;
  productsCount?: number;
};

const ProductCard: React.FC<{ drink: Drink; href: string }> = ({ drink, href }) => {
  return (
    <a
      href={href}
      className="group relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[230px] w-[150px] min-[370px]:w-[180px] min-[370px]:h-[270px] md:h-[370px] md:w-[260px] snap-start"
    >
      <div className="relative overflow-hidden rounded-xl h-[300px]">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-3">
        <h2 className="text-base md:text-lg font-semibold leading-tight line-clamp-1">
          {drink.name}
        </h2>
      </div>

      <div className="absolute bottom-3 right-3 w-5 h-5 xl:w-8 xl:h-8 rounded-full bg-white group-hover:bg-lime-400 flex items-center justify-center">
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

export default function HorizontalScrollableCards() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sampleDrinks, setSampleDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    collectionsTitle: "BROWSE ALL COLLECTIONS",
    gamingCollectionsLimit: 1,
    nonGamingCollectionsLimit: 10,
    showGamingSection: true,
    showNonGamingSection: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch site settings and collections in parallel
        const [settingsRes, gamingRes, normalRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/site-settings`),
          fetch(`${BACKEND_URL}/api/collections?type=gaming`),
          fetch(`${BACKEND_URL}/api/collections?type=normal`)
        ]);
        
        // Handle settings
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.success && settingsData.data) {
            setSettings({
              collectionsTitle: settingsData.data.collectionsTitle,
              gamingCollectionsLimit: settingsData.data.gamingCollectionsLimit,
              nonGamingCollectionsLimit: settingsData.data.nonGamingCollectionsLimit,
              showGamingSection: settingsData.data.showGamingSection,
              showNonGamingSection: settingsData.data.showNonGamingSection
            });
          }
        }
        
        if (!gamingRes.ok || !normalRes.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const gamingData = await gamingRes.json();
        const normalData = await normalRes.json();
        
        const gamingCollections = gamingData.items || [];
        const normalCollections = normalData.items || [];
        
        // Use settings to determine how many collections to show
        const gamingToShow = settings.showGamingSection 
          ? gamingCollections.slice(0, settings.gamingCollectionsLimit)
          : [];
        const normalToShow = settings.showNonGamingSection
          ? normalCollections.slice(0, settings.nonGamingCollectionsLimit)
          : [];
        
        const collections = [...gamingToShow, ...normalToShow];
        
        // Map collections to match the Drink type
        const mappedCollections = collections.map((collection: any) => ({
          id: collection._id,
          name: collection.name,
          image: collection.heroImage || collection.image || '/images/card.webp',
          type: collection.type,
          productsCount: collection.Products?.length || 0
        }));
        
        setSampleDrinks(mappedCollections);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch collections");
        setSampleDrinks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollBy = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const cardWidth = 280;
    const scrollAmount = dir === "left" ? -cardWidth * 2 : cardWidth * 2;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full text-white">
        <div className="flex items-center justify-center mb-4">
          <h1 className={`${JersyFont.className} text-[#9AE600] text-3xl min-[260px]:text-4xl min-[310px]:text-5xl sm:text-7xl lg:text-8xl text-center`}>
            {settings.collectionsTitle.toUpperCase()}
          </h1>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-white text-xl">Loading products...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full text-white">
        <div className="flex items-center justify-center mb-4">
          <h1 className={`${JersyFont.className} text-[#9AE600] text-3xl min-[260px]:text-4xl min-[310px]:text-5xl sm:text-7xl lg:text-8xl text-center`}>
            {settings.collectionsTitle.toUpperCase()}
          </h1>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-red-500 text-xl">Error: {error}</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (sampleDrinks.length === 0) {
    return (
      <div className="w-full text-white">
        <div className="flex items-center justify-center mb-4">
          <h1 className={`${JersyFont.className} text-[#9AE600] text-3xl min-[260px]:text-4xl min-[310px]:text-5xl sm:text-7xl lg:text-8xl text-center`}>
            {settings.collectionsTitle.toUpperCase()}
          </h1>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-white text-xl">No products available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center justify-center">
          <h1
            className={`
              ${JersyFont.className} 
              w-full
              text-[#9AE600] 
              text-3xl 
              min-[260px]:text-4xl 
              min-[310px]:text-5xl 
              sm:text-7xl  
              lg:text-8xl
              text-center
            `}
          >
            {settings.collectionsTitle.toUpperCase()}
          </h1>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 min-[250px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 ml-3 sm:ml-20 xl:gap-8 xl:ml-30 xl:mr-30">
          {sampleDrinks.map((drink, index) => (
            <Suspense
              fallback={
                <div className="relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg flex flex-col h-[380px] w-[240px]" />
              }
              key={drink.id}
            >
              <ProductCard
                drink={drink}
                href={drink.type === 'gaming' ? "/gamecollections" : `/All?collection=${drink.id}`}
              />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
}
