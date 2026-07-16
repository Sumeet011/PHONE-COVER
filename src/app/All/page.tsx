'use client';
import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";
import FiltersContent from "../../components/FiltersContent";
import { FaSpinner } from "react-icons/fa";
import Img from "../../../public/images/card.webp";
import Filter from '../../../public/filter.svg'
import config from "../../config";

import Footer from "@/components/homecomponents/Footer";
import localFont from "next/font/local";





type Product = {
  id: number;
  name: string;
  image: string;
  price: number;
  coverprice?: number;
  plateprice?: number;
  Link: string;
  type?: string;
  category?: string;
  material?: string;
  finish?: string;
  design?: {
    type?: string;
  };
};

type FilterState = {
  Type?: string[];
  Material?: string[];
  Finish?: string[];
  "Design Type"?: string[];
  Price?: string[];
};

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

// Type definition for a product
const BACKEND_URL = config.API_BASE_URL;

// ProductCard component
const ProductCard: React.FC<{ product: Product; href: string }> = ({ product, href }) => {
  // Check if product has both cover+plate and plate pricing (swap-wrap type)
  const isTwoOptionProduct = product.type === 'swap-wrap' || product.type === 'gaming' || product.type === 'normal-swap';
  const hasPlatePricing = product.plateprice && product.plateprice > 0;
  const showDualPricing = isTwoOptionProduct && hasPlatePricing;

  return (
    <a
      href={href}
      className="group relative rounded-2xl overflow-hidden  shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col snap-start
        // Mobile (default)
        w-full max-w-[170px] h-[230px]
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
          loading="lazy"
          className="w-full h-full object-contain p-1 sm:p-2"
        />
      </div>

      {/* Text Content */}
      <div className="p-2 sm:p-3 md:p-4 flex-shrink-0">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-tight line-clamp-2 text-white">
          {product.name}
        </h2>
        
          <div className="mt-1 space-y-0.5">
            
      
          <p className="mt-1 text-lime-400 text-sm sm:text-base font-bold">₹{product.coverprice || product.price}</p>
        </div>
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





const ProductsContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [collectionName, setCollectionName] = useState<string>('');
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection');

  useEffect(() => {
    // Cache key for localStorage
    const cacheKey = collectionId ? `products_${collectionId}` : 'products_all_non_gaming';
    const cacheTimeKey = `${cacheKey}_timestamp`;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Fetch specific collection or all non-gaming collections
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        if (cachedData && cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age < CACHE_DURATION) {
            const { products: cachedProducts, name: cachedName } = JSON.parse(cachedData);
            setProducts(cachedProducts);
            setFilteredProducts(cachedProducts);
            setCollectionName(cachedName);
            setLoading(false);
            return;
          }
        }

        let productsToDisplay: any[] = [];
        let collectionTitle = '';
        let selectedCollection: any = null;
        
        if (collectionId) {
          // Parallel fetch for specific collection and all products
          const [collectionRes, productsRes] = await Promise.all([
            fetch(`${BACKEND_URL}/api/collections/${collectionId}`),
            fetch(`${BACKEND_URL}/api/products`)
          ]);

          if (!collectionRes.ok || !productsRes.ok) {
            throw new Error('Failed to fetch data from server');
          }
          
          const [collectionData, productsData] = await Promise.all([
            collectionRes.json(),
            productsRes.json()
          ]);
          
          if (collectionData.success && collectionData.data) {
            const collection = collectionData.data;
            selectedCollection = collection;
            collectionTitle = collection.name || 'Collection';
            
            const productIds = collection.products || collection.Products || [];
            
            if (productIds.length > 0) {
              const allProducts = productsData.items || [];
              
              // Create a Set of product IDs for O(1) lookup
              const productIdSet = new Set(
                productIds.map((id: any) => 
                  typeof id === 'string' ? id : (id._id || id.id)
                )
              );
              
              productsToDisplay = allProducts.filter((product: any) => 
                productIdSet.has(product._id || product.id)
              );
            }
          }
        } else {
          // Parallel fetch for collections and products
          const [collectionsRes, productsRes] = await Promise.all([
            fetch(`${BACKEND_URL}/api/collections`),
            fetch(`${BACKEND_URL}/api/products`)
          ]);

          if (!collectionsRes.ok || !productsRes.ok) {
            throw new Error('Failed to fetch data from server');
          }

          const [collectionsData, productsData] = await Promise.all([
            collectionsRes.json(),
            productsRes.json()
          ]);

          const allCollections = collectionsData.items || [];
          const allProducts = productsData.items || [];
          
          // Filter to get only non-gaming collections
          const nonGamingCollections = allCollections.filter(
            (col: any) => col.type !== 'gaming'
          );
          
          // Create maps for efficient lookup
          const productToCollectionMap = new Map<string, any>();
          const productIdSet = new Set<string>();
          
          nonGamingCollections.forEach((collection: any) => {
            const productIds = collection.products || collection.Products || [];
            productIds.forEach((productId: any) => {
              const id = typeof productId === 'string' ? productId : (productId._id || productId.id);
              if (id) {
                productIdSet.add(id);
                if (!productToCollectionMap.has(id)) {
                  productToCollectionMap.set(id, collection);
                }
              }
            });
          });
          
          // Filter products efficiently
          productsToDisplay = allProducts
            .filter((product: any) => productIdSet.has(product._id || product.id))
            .map((product: any) => ({
              ...product,
              _collection: productToCollectionMap.get(product._id || product.id)
            }));
          
          collectionTitle = '';
        }

        // Helper function to get display price (coverprice)
        const getDisplayPrice = (product: any, collection: any) => {
          // If product has its own coverprice, use it
          if (product.coverprice) return product.coverprice;
          
          // Check collection price for two-option collections
          if (collection && (collection.type === 'gaming' || collection.type === 'swap-wrap' || collection.type === 'normal-swap')) {
            if (collection.price) return collection.price;
          }
          
          // Fallback to product price
          if (product.price) return product.price;
          
          // Default to 0 if no price found
          return 0;
        };

        // Helper function to get plate price
        const getPlatPrice = (product: any, collection: any) => {
          // If product has its own plateprice, use it
          if (product.plateprice) return product.plateprice;
          
          // Check collection plateprice for two-option collections
          if (collection && (collection.type === 'gaming' || collection.type === 'swap-wrap' || collection.type === 'normal-swap')) {
            if (collection.plateprice) return collection.plateprice;
          }
          
          // Default to 0 if no plate price found
          return 0;
        };

        // Map products to the expected format
        const mappedProducts = productsToDisplay.map((product: any) => ({
          id: product._id,
          name: product.name,
          image: (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image) || '/images/card.webp',
          price: getDisplayPrice(product, selectedCollection || product._collection),
          coverprice: getDisplayPrice(product, selectedCollection || product._collection),
          plateprice: getPlatPrice(product, selectedCollection || product._collection),
          Link: `/specific/${product._id}`,
          type: product.type || (selectedCollection || product._collection)?.type,
          category: product.category,
          material: product.material,
          finish: product.finish,
          design: product.design
        }));

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify({ products: mappedProducts, name: collectionTitle }));
        localStorage.setItem(cacheTimeKey, Date.now().toString());

        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
        setCollectionName(collectionTitle);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionId]);

  // Apply filters whenever activeFilters change
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Apply Type filter (gaming/Standard)
    if (activeFilters.Type && activeFilters.Type.length > 0) {
      filtered = filtered.filter((product: any) =>
        activeFilters.Type!.includes(product.type)
      );
    }


    // Apply Material filter
    if (activeFilters.Material && activeFilters.Material.length > 0) {
      filtered = filtered.filter((product: any) =>
        activeFilters.Material!.includes(product.material)
      );
    }

    // Apply Finish filter
    if (activeFilters.Finish && activeFilters.Finish.length > 0) {
      filtered = filtered.filter((product: any) =>
        product.finish && activeFilters.Finish!.includes(product.finish)
      );
    }

    // Apply Design Type filter
    if (activeFilters["Design Type"] && activeFilters["Design Type"].length > 0) {
      filtered = filtered.filter((product: any) =>
        product.design?.type && activeFilters["Design Type"]!.includes(product.design.type)
      );
    }

    // Apply Price filter
    if (activeFilters.Price && activeFilters.Price.length > 0) {
      const priceRange = activeFilters.Price[0];
      filtered = filtered.filter((product: any) => {
        const price = product.price;
        switch (priceRange) {
          case "₹0-₹199":
            return price >= 0 && price <= 199;
          case "₹200-₹399":
            return price >= 200 && price <= 399;
          case "₹400-₹599":
            return price >= 400 && price <= 599;
          case "₹600-₹999":
            return price >= 600 && price <= 999;
          case "₹1000+":
            return price >= 1000;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, activeFilters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  // Use filtered products for rendering
  const drinksToRender = filteredProducts;

  // Dummy email logic (no API)
  const [emailInput, setEmailInput] = useState("");
  const [cooldown, setCooldown] = useState(false);

  const handleGetCoupon = () => {
    if (!emailInput) {
      alert("Please enter your email.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailInput)) {
      alert("Invalid email format.");
      return;
    }

    if (cooldown) {
      alert("Please wait 20 seconds before requesting again.");
      return;
    }

    alert(`🎉 Coupon sent to ${emailInput}`);
    setEmailInput("");
    setCooldown(true);

    setTimeout(() => setCooldown(false), 20000);
  };

  if (loading) {
    return (
      <div className="bg-[#090701] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#9AE600] text-4xl mx-auto mb-4" />
          <p className="text-white text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#090701] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <div className="text-center bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md">
            <h2 className="text-red-500 text-2xl font-bold mb-4">Error Loading Products</h2>
            <p className="text-white mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#9AE600] text-black px-6 py-2 rounded-lg font-semibold hover:bg-lime-500 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#090701] text-white  min-h-screen w-full max-w-full overflow-x-hidden">
      <Navbar />

      <div className="flex flex-col mt-25 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full hidden md:hidden lg:block lg:w-1/5 p-4 space-y-6">
          <FiltersContent onFilterChange={handleFilterChange} />
        </aside>

        

        {/* Modal for filters on small screens */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 h-[80vh] flex justify-center items-center lg:hidden">
            <div className="bg-[#151311] w-[90%] max-h-[80vh] overflow-y-auto p-6 rounded-lg relative">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="absolute top-2 right-3 text-white text-2xl font-bold"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-center">Filters</h2>
              <FiltersContent onFilterChange={handleFilterChange} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="w-full h-full lg:w-4/5 space-y-10">
          {/* Product Grid */}
<div>
  <div className="flex items-center justify-between mb-2 mt-5">
    <div>
      <h2 className={`${JersyFont.className} text-5xl  ml-3 md:ml-7 xl:ml-10`}>
        {collectionName 
          ? collectionName
          : (filteredProducts.length === products.length 
              ? 'All Products' 
              : `Filtered Products (${filteredProducts.length})`)}
      </h2>
    </div>

    {/* Mobile filter toggle */}
    <div className="lg:hidden flex items-center justify-center">
      <div
        onClick={() => setIsFilterOpen(true)}
        className="flex items-center justify-center cursor-pointer w-8 h-8 mr-3 bg-gradient-to-t from-lime-300 to-lime-600 text-black rounded-full"
      >
        <img
          className="w-5 h-5 object-contain"
          src={Filter.src}
          alt="Filter"
        />
      </div>
    </div>
  </div>

  <div className="grid grid-cols-2 ml-3 mr-3 md:ml-7 md:mr-7 xl:ml-10 sm:grid-cols-3 xl:grid-cols-4 gap-6 -mb-8">
    {drinksToRender
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((product) => (
        <ProductCard key={product.id} product={product} href={product.Link} />
      ))}
  </div>
</div>


          {/* Pagination */}
          <div className="flex justify-center mb-8 gap-2">
            {Array.from({ length: Math.ceil(drinksToRender.length / itemsPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentPage(index + 1);
                  // Scroll to top when changing pages
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
                }}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-lime-400 text-black font-bold"
                    : "bg-[#151311] text-white"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </main>
      </div>

      <div className="mb-0">
      <Footer />
    </div>
    </div>
  );
};

const AllProductsPage = () => {
  return (
    <>
    <Suspense fallback={
      <div className="bg-[#090701] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#9AE600] text-4xl mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
    
    </>

  );
};

export default AllProductsPage;