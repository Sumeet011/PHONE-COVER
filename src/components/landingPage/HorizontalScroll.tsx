"use client";

import React, { useRef, useState, useEffect } from "react";
import localFont from "next/font/local";
import Img from "../../../public/images/card.webp";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://phone-wraps-backend.onrender.com";

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

type Drink = {
  id: string;
  name: string;
  image: string;
  price: number;
  type?: string;
  category?: string;
  material?: string;
  finish?: string;
  design?: {
    type?: string;
  };
};

const ProductCard: React.FC<{ drink: Drink }> = ({ drink }) => {
  return (
    <a
      href={`/specific/${drink.id}`}
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[290px] w-[200px] snap-start"
      style={{ background: 'linear-gradient(to top, #1a1816 0%, #1a1816 30%, transparent 70%)' }}
    >
      <div className="relative overflow-hidden rounded-xl h-[290px]">
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
    </a>
  );
};

export default function HorizontalScrollableCards() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerRef1 = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [currentIndex1, setCurrentIndex1] = useState(1);
  const [products, setProducts] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    productsTitle: "BROWSE ALL PRODUCTS",
    productsPerRow: 41,
    productsRows: 2
  });

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all collections
        const collectionsRes = await fetch(`${BACKEND_URL}/api/collections`);
        const collectionsData = await collectionsRes.json();
        const allCollections = collectionsData.items || [];
        
        // Filter out gaming collections
        const normalCollections = allCollections.filter((col: any) => col.type !== 'gaming');

        // Fetch all products
        const productsRes = await fetch(`${BACKEND_URL}/api/products`);
        const productsData = await productsRes.json();
        const allProducts = productsData.items || [];

        // Get all product IDs from the collections
        const collectionProductIds = new Set<string>();
        normalCollections.forEach((collection: any) => {
          if (collection.Products && Array.isArray(collection.Products)) {
            collection.Products.forEach((productId: any) => {
              const id = typeof productId === 'string' ? productId : productId._id || productId.id;
              collectionProductIds.add(id);
            });
          }
        });

        // Filter products that are in the collections
        const filteredProductsList = allProducts.filter((product: any) => 
          collectionProductIds.has(product._id || product.id)
        );

        // Map products to match the Drink type expected by the component
        const mappedProducts = filteredProductsList.map((product: any) => ({
          id: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          type: product.type,
          category: product.category,
          material: product.material,
          finish: product.finish,
          design: product.design
        }));

        setProducts(mappedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/site-settings`);
        const data = await response.json();
        if (data.success && data.data) {
          setSettings({
            productsTitle: data.data.productsTitle || "BROWSE ALL PRODUCTS",
            productsPerRow: data.data.productsPerRow || 41,
            productsRows: data.data.productsRows || 2
          });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
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
                <ProductCard drink={d} />
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
        <button className="bg-[#9AE600] text-black font-bold py-2 mt-2 px-4 rounded-full hover:bg-green-600 transition duration-300">
          See All
        </button>
      </div>
    </div>
  );
}
