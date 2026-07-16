"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import localFont from "next/font/local";
import Img from "../../../public/images/card.webp";
import { ArrowLeft, ArrowRight } from "lucide-react";
import HorizontalWithProp from "../landingPage/HorizontalWithProp";
import config from "@/config";


const BACKEND_URL = config.API_BASE_URL;
const URL = `${BACKEND_URL}/api/products`;


// Font Setup
const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

// Type definition for a product
type Product = {
  id: string;
  name: string;
  image: string;
  price?: number;
  type?: string;
  productsCount?: number;
};

// ProductCard component
const ProductCard: React.FC<{ product: Product; href: string }> = ({ product, href }) => {
  return (
    <a
      href={href}
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col snap-start
        // Mobile (default)
        w-full max-w-[140px] h-[240px]
        // Small mobile (min-width: 375px)
        xs:max-w-[160px] xs:h-[220px]
        // Mobile landscape / Small tablets (min-width: 480px)
        sm:max-w-[180px] sm:h-[250px]
        // Tablets (min-width: 768px)
        md:max-w-[200px] md:h-[280px]
        // Large tablets (min-width: 1024px)
        lg:max-w-[220px] lg:h-[310px]
        // Desktop (min-width: 1280px)
        xl:max-w-[240px] xl:h-[340px]
        // Large desktop (min-width: 1536px)
        2xl:max-w-[260px] 2xl:h-[360px]"
      style={{ background: 'linear-gradient(to top, #1a1816 0%, #1a1816 25%, transparent 65%)' }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-xl flex-1">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-1 sm:p-2"
        />
      </div>

      {/* Text Content */}
      <div className="p-2 sm:p-3 md:p-4 flex-shrink-0">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-tight line-clamp-2 text-white">
          {product.name}
        </h2>
      </div>

      {/* Arrow Icon */}
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 
                      w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 
                      rounded-full bg-white group-hover:bg-lime-400 
                      flex items-center justify-center transition-colors duration-300">
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-black"
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sampleDrinks, setSampleDrinks] = useState<Product[]>([]);
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
        
        
        // Fetch featured products, site settings and all collections in parallel
        const [featuredRes, settingsRes, collectionsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/featured-home-products?activeOnly=true&limit=2`),
          fetch(`${BACKEND_URL}/api/site-settings`),
          fetch(`${BACKEND_URL}/api/collections`)
        ]);
        
        
        // Handle featured products (first 2 special products)
        let featured: Product[] = [];
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          console.log('Featured data:', featuredData);
          if (featuredData.success && featuredData.data) {
            featured = featuredData.data.slice(0, 2).map((product: any) => ({
              id: product._id,
              name: product.name,
              image: (product.images && product.images.length > 0 ? product.images[0] : product.image) || '/images/card.webp',
              type: 'featured',
              price: product.price
            }));
          }
        }
        setFeaturedProducts(featured);
        
        // Handle settings
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          console.log('Settings data:', settingsData);
          if (settingsData.success && settingsData.data) {
            setSettings({
              collectionsTitle: settingsData.data.collectionsTitle || "BROWSE ALL COLLECTIONS",
              gamingCollectionsLimit: settingsData.data.gamingCollectionsLimit || 1,
              nonGamingCollectionsLimit: settingsData.data.nonGamingCollectionsLimit || 10,
              showGamingSection: settingsData.data.showGamingSection ?? true,
              showNonGamingSection: settingsData.data.showNonGamingSection ?? true
            });
          }
        }
        
        if (!collectionsRes.ok) {
          console.error('Collections fetch failed with status:', collectionsRes.status);
          const errorText = await collectionsRes.text();
          console.error('Error response:', errorText);
          throw new Error('Failed to fetch collections');
        }
        
        const collectionsData = await collectionsRes.json();
        console.log('Collections data received:', collectionsData);
        const allCollections = collectionsData.items || collectionsData.data || [];
        console.log('Collections array:', allCollections);
        
        // Filter out gaming collections (show only swap-wrap and normal type collections)
        const nonGamingCollections = allCollections.filter((col: any) => col.type !== 'gaming');
        
        // Only show standard (non-gaming) collections
        const normalToShow = settings.showNonGamingSection
          ? nonGamingCollections.slice(0, settings.nonGamingCollectionsLimit)
          : [];
        
        console.log('Collections to show:', normalToShow.length);
        
        // Map collections to match the Drink type
        const mappedCollections = normalToShow.map((collection: any) => ({
          id: collection._id,
          name: collection.name,
          image: collection.heroImage || collection.image || '/images/card.webp',
          type: collection.type,
          productsCount: collection.products?.length || 0
        }));
        
        console.log('Featured products loaded:', featured.length);
        console.log('Standard collections loaded:', mappedCollections.length);
        console.log('Mapped collections:', mappedCollections);
        setSampleDrinks(mappedCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
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
        <div className="grid grid-cols-1 min-[250px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 ml-10 mr-3 sm:ml-30 sm:mr-20  xl:ml-30 xl:mr-30">
          {/* Featured Products (First 2) */}
          {featuredProducts.map((product, index) => (
            <Suspense
              fallback={
                <div className="relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg flex flex-col h-[380px] w-[240px]" />
              }
              key={`featured-${product.id}`}
            >
              <ProductCard
                product={product}
                href={`${index === 0 ? '/gamecollections' : '/custom-designer'}`}
              />
            </Suspense>
          ))}
          
          {/* Standard Collections */}
          {sampleDrinks.map((product, index) => (
            <Suspense
              fallback={
                <div className="relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg flex flex-col h-[380px] w-[240px]" />
              }
              key={product.id}
            >
              <ProductCard
                product={product}
                href={`/All?collection=${product.id}`}
              />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
}
