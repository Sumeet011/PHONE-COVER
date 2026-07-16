"use client";

import React, { useRef, useState, useEffect } from "react";
import localFont from "next/font/local";
import Img from "../../../public/images/card.webp";
import config from "@/config";

const BACKEND_URL = config.API_BASE_URL;

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  type?: string;
  showInBrowseAll?: boolean;
  category?: string;
  material?: string;
  finish?: string;
  link?: string;
  design?: {
    type?: string;
  };
};

// ProductCard component
const ProductCard: React.FC<{ product: Product; href: string }> = ({ product, href }) => {
  return (
    <a
      href={href}
      className="group relative rounded-2xl overflow-hidden  shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col snap-start
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
      <div className="relative overflow-hidden rounded-xl  flex-1">
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
  const containerRef1 = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [currentIndex1, setCurrentIndex1] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    productsTitle: "BROWSE ALL PRODUCTS",
    productsPerRow: 41,
    productsRows: 2
  });

  // Log backend URL on component mount
  useEffect(() => {
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        //console.log("Fetching products from:", `${BACKEND_URL}/api/products`);
        
        const productsRes = await fetch(`${BACKEND_URL}/api/products`);
        
        if (!productsRes.ok) {
          throw new Error(`Products API returned ${productsRes.status}: ${productsRes.statusText}`);
        }
        
        const productsData = await productsRes.json();
        //console.log("Products API response:", productsData);
        const allProducts = productsData.items || productsData.data || [];
        //console.log("Total products fetched:", allProducts.length);

        // Products to Be Shown in Horizontal Scroll (filter out gaming products)
        const filteredProductsList = allProducts.filter((product: any) => 
          product.type !== 'gaming' && product.showInBrowseAll !== false
        );
        //console.log("Non-gaming products:", filteredProductsList.length);

        // Map products to match the Product type expected by the component
        const mappedProducts = filteredProductsList.map((product: any) => ({
          id: product._id || product.id,
          name: product.name || 'Unnamed Product',
          image: (product.images && product.images.length > 0 ? product.images[0] : product.image) || '/images/card.webp',
          price: product.coverprice || product.price || 0,
          type: product.type,
          showInBrowseAll: product.showInBrowseAll,
          link: `/specific/${product._id || product.id}`,
          category: product.category,
          material: product.material,
          finish: product.finish,
          design: product.design
        }));

        //console.log("Mapped products:", mappedProducts.length);
        setProducts(mappedProducts);
        setLoading(false);
      } catch (error) {
        //console.error('Error fetching products:', error);
        //console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        //console.log("Fetching settings from:", `${BACKEND_URL}/api/site-settings`);
        const response = await fetch(`${BACKEND_URL}/api/site-settings`);
        //console.log("Settings Response Status:", response.status);
        
        if (!response.ok) {
          //console.warn("Settings API failed, using defaults");
          return;
        }
        
        const data = await response.json();
        //console.log("Settings Data:", data);
        
        if (data.success && data.data) {
          setSettings({
            productsTitle: data.data.productsTitle || "BROWSE ALL PRODUCTS",
            productsPerRow: data.data.productsPerRow || 41,
            productsRows: data.data.productsRows || 2
          });
          /*console.log("Settings updated:", {
            productsTitle: data.data.productsTitle,
            productsPerRow: data.data.productsPerRow,
            productsRows: data.data.productsRows
          });*/
        }
      } catch (error) {
        //console.error('Error fetching site settings:', error);
        //console.warn("Using default settings");
      }
    };

    fetchSettings();
  }, []);

  const setupScrollHandler = (
    container: HTMLDivElement | null,
    setter: (value: number) => void,
    itemCount: number
  ) => {
    if (!container) return;

    const handleScroll = () => {
  if (!container) return;

  const scrollLeft = container.scrollLeft;
  const containerWidth = container.offsetWidth;
  const scrollWidth = container.scrollWidth;

  // approximate last visible card
  const cardWidth = scrollWidth / itemCount;
  const lastVisibleIndex = Math.ceil((scrollLeft + containerWidth) / cardWidth);

  setter(Math.min(Math.max(lastVisibleIndex, 1), itemCount));
};


    handleScroll();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  };

  // Get products to display based on settings
  const displayProducts = products.slice(0, settings.productsPerRow);
  
  // Create array of row refs
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [rowIndices, setRowIndices] = useState<number[]>([]);

  // Initialize row indices
  useEffect(() => {
    setRowIndices(Array(settings.productsRows).fill(1));
  }, [settings.productsRows]);

  // Setup scroll handlers for all rows
  useEffect(() => {
    const cleanups: Array<(() => void) | undefined> = [];
    
    rowRefs.current.forEach((ref, index) => {
      if (ref) {
        const cleanup = setupScrollHandler(ref, (value) => {
          setRowIndices(prev => {
            const newIndices = [...prev];
            newIndices[index] = value;
            return newIndices;
          });
        }, displayProducts.length);
        cleanups.push(cleanup);
      }
    });

    return () => {
      cleanups.forEach(cleanup => cleanup && cleanup());
    };
  }, [displayProducts.length, settings.productsRows]);

  if (loading) {
    return (
      <div className="w-full text-white flex justify-center items-center py-20">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full text-white flex justify-center items-center py-20">
        <div className="text-xl">No products found</div>
      </div>
    );
  }

  return (
    <div className={`w-full text-white`}>
      <div className="flex items-center justify-center mb-4">
        
<h1
         className={`
    ${JersyFont.className} 
    w-full          /* makes it take full width */
    text-[#9AE600] 
    text-3xl 
    min-[260px]:text-4xl 
    min-[310px]:text-5xl 
    sm:text-7xl  
    lg:text-8xl
    text-center     /* optional: centers the text horizontally */
  `}>
          {settings.productsTitle}
        </h1>

      </div>

      {/* Render rows dynamically based on productsRows setting */}
      {Array.from({ length: settings.productsRows }).map((_, rowIndex) => (
        <div key={rowIndex} className="relative">
          {/* Horizontal scroll container */}
          <div
            ref={(el) => { rowRefs.current[rowIndex] = el; }}
            className="flex grid-cols-2 ml-3 mr-0 md:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-8 xl:ml-30 xl:mr-30 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 py-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded"
            style={{ scrollSnapType: "x mandatory" }}
            role="list"
          >
            {displayProducts.map((d) => (
              <div role="listitem" key={`row${rowIndex}-${d.id}`} className="snap-start">
                <ProductCard product={d} href={d.link || `/specific/${d.id}`} />
              </div>
            ))}
            <style jsx>{`
              /* Hide scrollbar for Chrome, Safari and Opera */
              .no-scrollbar::-webkit-scrollbar {
                display: none;
                width: 0;
                height: 0;
              }

              /* Hide scrollbar for IE, Edge and Firefox */
              .no-scrollbar {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
              }
            `}</style>
          </div>

          {/* Scroll Position Indicator */}
          <div className="flex justify-center mt-2">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-400 font-medium">
              {rowIndices[rowIndex] || 1} / {displayProducts.length}
            </div>
          </div>
        </div>
      ))}

      <div className="w-full flex justify-center items-center  ">
        <a href="/All" className="bg-[#9AE600] text-black font-bold py-2 mt-5 px-4 rounded-full hover:bg-green-600 transition duration-300 inline-block">
          See All
        </a>
      </div>
    </div>
  );
}
