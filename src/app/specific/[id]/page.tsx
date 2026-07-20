'use client'
import React, { useState, useEffect, useMemo ,useRef} from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/navbar/Navbar";
import { DropdownButton } from "@/components/ui/dropdown-button-upward";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { ToastContainer, toast } from 'react-toastify';
import Footer from "@/components/homecomponents/Footer";
import config from '@/config';
import localFont from "next/font/local";
// Default placeholder image
const Img = { src: '/images/card1.webp' };
const BACKEND_URL=config.API_BASE_URL;

const BASE_URL = `${BACKEND_URL}/api`;

type Product = {
  _id?: string;
  id?: number;
  name: string;
  images: string[];
  price: number;
  type?: string;
  flavor?: string;
  packSize?: string;
  description?: string;
};

type Drink = Product & {
  coverprice?: number;
  plateprice?: number;
  collections?: any[];
};

type AddOnProduct = {
  id: string;
  name: string;
  subtitle: string;
  details: string[];
  colors: string[];
  price: number;
  oldPrice: number;
  image: string;
};

type ModelOption = {
  value: string;
  label: string;
  disabled?: boolean;
  stock?: {
    backCovers: number;
    aluminumSheets: number;
  };
};

type BrandOption = {
  value: string;
  label: string;
};

const JersyFont = localFont({
  src: "../../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
  variable: "--font-jersey",
});


const ProductCard: React.FC<{ product: Product; href: string }> = ({ product, href }) => {
  return (
   <a
  href={href}
  className="mr-4 group relative rounded-2xl overflow-hidden shadow-lg 
  hover:shadow-xl transition-transform transform hover:scale-105 duration-300 
  flex flex-col
  h-[230px] w-[150px] 
  min-[370px]:w-[180px] min-[370px]:h-[270px]
  min-[730px]:h-[350px] min-[730px]:w-[230px]
  snap-start"
  style={{ background: 'linear-gradient(to top, #1a1816 0%, #1a1816 25%, transparent 65%)' }}
>

      <div className="relative overflow-hidden rounded-xl h-[350px]">
        <img
          src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : Img.src}
          alt={product.name}
          className="w-full h-full object-contain"
        />
        <p className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/60 px-2 py-1 rounded">
          ₹{(product as any).coverprice || product.price || 0}
        </p>
      </div>

      <div className="mt-3">
        <h2 className={`${JersyFont.className} text-base md:text-lg ml-3 mb-5 font-semibold leading-tight line-clamp-1 tracking-wide`}>
          {product.name}
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

const addOnProducts: AddOnProduct[] = [
  {
    id: "addon-red-crossbody-lanyard-cord",
    name: "Red Crossbody Phone Lanyard - Cord",
    subtitle: "Soft cord finish with polished metal hooks for daily carry.",
    details: ["Adjustable crossbody fit", "Quick-release clip", "Matte hardware"],
    colors: ["#b80f22", "#243548", "#8f7751", "#69885d", "#dd8a3e"],
    price: 1199,
    oldPrice: 1699,
    image: "/images/mobile.webp",
  },
  {
    id: "addon-beige-green-crossbody-lanyard-cord",
    name: "Beige-Green Crossbody Phone Lanyard - Cord",
    subtitle: "Neutral woven cord with warm accents and low-profile clips.",
    details: ["Lightweight build", "Comfort weave", "Everyday styling"],
    colors: ["#b6aa8a", "#234f39", "#8a4d27", "#f0b35d"],
    price: 1199,
    oldPrice: 1699,
    image: "/images/card2.webp",
  },
  {
    id: "addon-grey-utility-crossbody-strap",
    name: "Grey Crossbody Utility Phone Lanyard - Strap",
    subtitle: "Utility strap with subtle contrast hardware and durable webbing.",
    details: ["Utility-grade strap", "Fast clip-on system", "Reinforced edge finish"],
    colors: ["#b9b9b9", "#5e754e", "#d18b1b", "#2d93c4", "#a71c31", "#161616"],
    price: 999,
    oldPrice: 1499,
    image: "/images/card3.webp",
  },
];

const ProductDetails = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const rightSectionRef = useRef<HTMLDivElement>(null);
  const productSectionRef = useRef<HTMLDivElement>(null);

  // State for product data
  const [product, setProduct] = useState<Drink | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Drink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  // Dropdown states
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [extraPlates, setExtraPlates] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Suggested products state
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [selectedSuggested, setSelectedSuggested] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingAddOnId, setAddingAddOnId] = useState<string | null>(null);

  // Phone brands state
  const [phonebrand, setPhonebrand] = useState<BrandOption[]>([]);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, ModelOption[]>>({});
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true);
  const [stockInfo, setStockInfo] = useState<Record<string, Record<string, { backCovers: number; aluminumSheets: number }>>>({});

  // Fetch phone brands from API
  useEffect(() => {
    const fetchPhoneBrands = async () => {
      try {
        setLoadingBrands(true);
        
        // Check cache first
        const cacheKey = 'phone_brands_with_stock';
        const cacheTimeKey = 'phone_brands_timestamp';
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for brand/stock data
        
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        if (cachedData && cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age < CACHE_DURATION) {
            const { brands, models, stock } = JSON.parse(cachedData);
            setPhonebrand(brands);
            setModelsByBrand(models);
            setStockInfo(stock);
            setLoadingBrands(false);
            return;
          }
        }
        
        const response = await fetch(`${BASE_URL}/phone-brands?activeOnly=true`);
        const data = await response.json();

        if (data.success) {
          const brands: BrandOption[] = data.data.map((brand: any) => ({
            value: brand.brandName,
            label: brand.brandName
          }));

          const models: Record<string, ModelOption[]> = {};
          const stock: Record<string, Record<string, { backCovers: number; aluminumSheets: number }>> = {};
          
          data.data.forEach((brand: any) => {
            const brandName = brand.brandName;
            stock[brandName] = {};
            
            models[brandName] = brand.models.map((model: any) => {
              const backCovers = model.backCoversCount || model.backcoverscount || 0;
              const aluminumSheets = model.aluminumSheetsCount || model.alimunumsheetscount || 0;
              
              // Store stock info
              stock[brandName][model.modelName] = {
                backCovers,
                aluminumSheets
              };
              
              // Disable if both stock counts are 0
              const hasStock = backCovers > 0 || aluminumSheets > 0;
              
              return {
                value: model.modelName,
                label: `${model.modelName}${!hasStock ? ' (Out of Stock)' : ''}`,
                disabled: !hasStock,
                stock: { backCovers, aluminumSheets }
              };
            });
          });

          // Cache the results
          localStorage.setItem(cacheKey, JSON.stringify({ brands, models, stock }));
          localStorage.setItem(cacheTimeKey, Date.now().toString());

          setPhonebrand(brands);
          setModelsByBrand(models);
          setStockInfo(stock);
        }
      } catch (error) {
        console.error('Failed to fetch phone brands:', error);
        // Fallback to default brands
        setPhonebrand([
          { value: "apple", label: "Apple" },
          { value: "samsung", label: "Samsung" },
        ]);
        setModelsByBrand({
          apple: [{ value: "iphone-15", label: "iPhone 15" }],
          samsung: [{ value: "galaxy-s23", label: "Galaxy S23" }],
        });
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchPhoneBrands();
  }, []);

  //Page Right scroll 
  useEffect(() => {
  const section = productSectionRef.current;
  const right = rightSectionRef.current;

  if (!section || !right) return;

  const handleWheel = (e: WheelEvent) => {
    if (window.innerWidth < 1024) return;

    const rect = section.getBoundingClientRect();

    // Section is currently occupying the top of the viewport
    const inView = rect.top <= 0 && rect.bottom > 0;
    if (!inView) return; // let the page scroll normally

    const atTop = right.scrollTop <= 0;
    const atBottom =
      right.scrollTop + right.clientHeight >= right.scrollHeight - 1;

    const scrollingDown = e.deltaY > 0;
    const scrollingUp = e.deltaY < 0;

    if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
      // Right panel still has room to scroll in this direction — lock the page
      e.preventDefault();
      right.scrollTop += e.deltaY;
    }
    // else: right panel is exhausted in this direction, do nothing —
    // the browser's default scroll will move the page naturally
  };

  section.addEventListener("wheel", handleWheel, { passive: false });

  return () => section.removeEventListener("wheel", handleWheel);
}, [loading,product]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check cache first
        const cacheKey = `product_${productId}`;
        const cacheTimeKey = `product_${productId}_timestamp`;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        if (cachedData && cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age < CACHE_DURATION) {
            const { product, related, suggested } = JSON.parse(cachedData);
            setProduct(product);
            setRelatedProducts(related);
            setSuggestedProducts(suggested);
            setLoading(false);
            return;
          }
        }
        
        // Parallel fetch for better performance - include collections
        const [productRes, allProductsRes, suggestedRes, collectionsRes] = await Promise.all([
          fetch(`${BASE_URL}/products/${productId}`),
          fetch(`${BASE_URL}/products`),
          fetch(`${BASE_URL}/suggested-products?activeOnly=true`),
          fetch(`${BASE_URL}/collections`)
        ]);
        
        if (!productRes.ok) {
          throw new Error(`HTTP error! status: ${productRes.status}`);
        }
        
        const [result, allProductsResult, suggestedData, collectionsData] = await Promise.all([
          productRes.json(),
          allProductsRes.json(),
          suggestedRes.json(),
          collectionsRes.json()
        ]);
        
        // Handle different response structures
        let productData;
        if (result.success && result.data) {
          productData = result.data;
        } else if (result.data) {
          productData = result.data;
        } else {
          productData = result;
        }
        
        // Get all collections
        let allCollections = [];
        if (collectionsData.success && collectionsData.items) {
          allCollections = collectionsData.items;
        } else if (collectionsData.data) {
          allCollections = collectionsData.data;
        } else if (Array.isArray(collectionsData)) {
          allCollections = collectionsData;
        }
        
        // Find collections that contain this product
        const productCollections = allCollections.filter((col: any) => {
          const products = col.products || col.Products || [];
          return products.some((p: any) => {
            const pId = typeof p === 'string' ? p : (p._id || p.id);
            return pId?.toString() === productId?.toString();
          });
        });
        
        // Attach collections to product data with pricing info
        if (productCollections.length > 0) {
          productData.collections = productCollections;
          console.log('Found collections for product:', productCollections);
          
          // Find two-option collection (gaming/swap-wrap/normal-swap)
          const twoOptionCollection = productCollections.find((col: any) => 
            col.type === 'gaming' || col.type === 'swap-wrap' || col.type === 'normal-swap'
          );
          
          if (twoOptionCollection) {
            // Override product pricing with collection pricing if not set
            if (!productData.coverprice && twoOptionCollection.price) {
              productData.coverprice = twoOptionCollection.price;
            }
            if (!productData.plateprice && twoOptionCollection.plateprice) {
              productData.plateprice = twoOptionCollection.plateprice;
            }
            console.log('Applied collection pricing:', {
              coverprice: productData.coverprice,
              plateprice: productData.plateprice
            });
          }
        }
        
        let allProducts = [];
        if (allProductsResult.success && allProductsResult.items) {
          allProducts = allProductsResult.items;
        } else if (allProductsResult.data) {
          allProducts = allProductsResult.data;
        } else if (Array.isArray(allProductsResult)) {
          allProducts = allProductsResult;
        }

        // Get the product type to filter related products
        const currentProductType = productData.type;

        // Filter related products: same type, exclude current product
        const related = allProducts.filter((p: any) => {
          // Exclude current product
          if ((p._id || p.id)?.toString() === productId?.toString()) {
            return false;
          }
          
          // If current product has no type, exclude gaming and custom-designer only
          if (!currentProductType) {
            return p.type !== 'gaming' && p.type !== 'custom-designer';
          }
          
          // Only include products with the exact same type as current product
          return p.type === currentProductType;
        });
        
        // Map collection pricing to related products
        const relatedProductsList = related.slice(0, 4).map((relatedProd: any) => {
          const relatedProdId = relatedProd._id || relatedProd.id;
          
          // Find collections containing this related product
          const relatedCollections = allCollections.filter((col: any) => {
            const products = col.products || col.Products || [];
            return products.some((p: any) => {
              const pId = typeof p === 'string' ? p : (p._id || p.id);
              return pId?.toString() === relatedProdId?.toString();
            });
          });
          
          if (relatedCollections.length > 0) {
            // Find two-option collection
            const twoOptionCollection = relatedCollections.find((col: any) => 
              col.type === 'gaming' || col.type === 'swap-wrap' || col.type === 'normal-swap'
            );
            
            if (twoOptionCollection) {
              // Apply collection pricing if not set at product level
              return {
                ...relatedProd,
                coverprice: relatedProd.coverprice || twoOptionCollection.price,
                plateprice: relatedProd.plateprice || twoOptionCollection.plateprice,
                price: relatedProd.price || twoOptionCollection.price
              };
            }
          }
          
          return relatedProd;
        });
        
        // Process suggested products with collection pricing
        let suggestedProductsList = (suggestedData.success && suggestedData.data) ? suggestedData.data : [];
        
        // Map collection pricing to suggested products
        suggestedProductsList = suggestedProductsList.map((suggestedProd: any) => {
          const suggestedProdId = suggestedProd._id || suggestedProd.id;
          
          // Find collections containing this suggested product
          const suggestedCollections = allCollections.filter((col: any) => {
            const products = col.products || col.Products || [];
            return products.some((p: any) => {
              const pId = typeof p === 'string' ? p : (p._id || p.id);
              return pId?.toString() === suggestedProdId?.toString();
            });
          });
          
          if (suggestedCollections.length > 0) {
            // Find two-option collection
            const twoOptionCollection = suggestedCollections.find((col: any) => 
              col.type === 'gaming' || col.type === 'swap-wrap' || col.type === 'normal-swap'
            );
            
            if (twoOptionCollection) {
              // Apply collection pricing if not set at product level
              return {
                ...suggestedProd,
                coverprice: suggestedProd.coverprice || twoOptionCollection.price,
                plateprice: suggestedProd.plateprice || twoOptionCollection.plateprice,
                price: suggestedProd.price || twoOptionCollection.price
              };
            }
          }
          
          return suggestedProd;
        });
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify({
          product: productData,
          related: relatedProductsList,
          suggested: suggestedProductsList
        }));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
        
        setProduct(productData);
        setRelatedProducts(relatedProductsList);
        setSuggestedProducts(suggestedProductsList);
        
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);
  
  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?._id]);

  // Handlers
  const handleBrandSelect = (option: BrandOption) => {
    setSelectedBrand(option.value);
    setSelectedModel("");
  };

  const handleModelSelect = (option: ModelOption) => {
    // Don't allow selection if disabled (out of stock)
    if (option.disabled) {
      toast.warning("⚠️ This model is currently out of stock", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setSelectedModel(option.value);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleExtraPlatesChange = (newExtraPlates: number) => {
    setExtraPlates(newExtraPlates);
  };
  // Get backcover + plates price - from product or from collection
  const coverPlatePriceValue = useMemo(() => {
    if (!product) return 0;
    
    // First priority: Check product's coverprice
    if ((product as any).coverprice) return (product as any).coverprice;
    
    // Second priority: Check if product belongs to a two-option collection
    if ((product as any).collections && Array.isArray((product as any).collections)) {
      const twoOptionCollection = (product as any).collections.find((col: any) => 
        col.type === 'gaming' || col.type === 'swap-wrap' || col.type === 'normal-swap'
      );
      if (twoOptionCollection?.price) {
        return twoOptionCollection.price;
      }
    }
    
    // Third priority: Fallback to product.price
    if (product.price) return product.price;
    
    return 0;
  }, [product]);

  // Get plate price - from product or from collection
  const platePriceValue = useMemo(() => {
    if (!product) return 0;
    
    // First priority: Check product's plateprice
    if ((product as any).plateprice) return (product as any).plateprice;
    
    // Second priority: Check if product belongs to a two-option collection
    if ((product as any).collections && Array.isArray((product as any).collections)) {
      const twoOptionCollection = (product as any).collections.find((col: any) => 
        col.type === 'gaming' || col.type === 'swap-wrap' || col.type === 'normal-swap'
      );
      if (twoOptionCollection?.plateprice) {
        return twoOptionCollection.plateprice;
      }
    }
    
    return 0;
  }, [product]);

  // Check if product has two-option cart (gaming or swap-wrap)
  const isTwoOptionProduct = useMemo(() => {
    if (!product) return false;

    const normalizedType = (product.type || '').toLowerCase();

    // 'other' products should never show cover+plates UI.
    if (normalizedType === 'other') {
      return false;
    }

    const allowedTwoOptionTypes = ['gaming', 'swap-wrap', 'normal-swap'];
    
    // First priority: Check product type directly
    if (allowedTwoOptionTypes.includes(normalizedType)) {
      return true;
    }
    
    // Second priority: Check if product belongs to a two-option collection
    if ((product as any).collections && Array.isArray((product as any).collections)) {
      const hasTwoOptionCollection = (product as any).collections.some((col: any) => 
        allowedTwoOptionTypes.includes((col?.type || '').toLowerCase())
      );
      if (hasTwoOptionCollection) return true;
    }
    
    // Third priority: Only allow price-based fallback for non-'other' types.
    if (coverPlatePriceValue > 0 && platePriceValue > 0) {
      return true;
    }
    
    return false;
  }, [product, coverPlatePriceValue, platePriceValue]);
  
  // Image carousel handlers
  const productImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [Img.src];
  }, [product]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      // Swipe left - next image
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous image
      handlePrevImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (productImages.length <= 1) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => 
          prev === 0 ? productImages.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => 
          prev === productImages.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productImages.length]);

  const toggleSuggestedProduct = (productId: string) => {
    // Just toggle checkbox state, don't add to cart yet
    setSelectedSuggested((prev) => {
      const newSet = new Set(prev);
      if (prev.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddOnAddToCart = async (addOnProduct: AddOnProduct) => {
    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : localStorage.getItem('userId');

    if (!userId) {
      toast.error("Please log in to add accessories", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const loadingToast = toast.loading(`Adding ${addOnProduct.name}...`, {
      position: "top-right",
    });

    setAddingAddOnId(addOnProduct.id);

    try {
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "User-Id": userId,
        },
        body: JSON.stringify({
          userId,
          type: 'product',
          productId: addOnProduct.id,
          productRef: 'Product',
          productName: addOnProduct.name,
          collectionName: addOnProduct.name,
          collectionType: 'accessory',
          productOption: 'accessory',
          price: addOnProduct.price,
          quantity: 1,
          selectedBrand: 'Accessory',
          selectedModel: addOnProduct.name,
          productImage: addOnProduct.image,
          image: addOnProduct.image,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add accessory to cart');
      }

      toast.success(`✅ ${addOnProduct.name} added to cart`, {
        position: "top-right",
        autoClose: 2500,
      });
    } catch (error: any) {
      console.error('Error adding accessory to cart:', error);
      toast.error(`❌ ${error?.message || 'Unable to add accessory'}`, {
        position: "top-right",
        autoClose: 3500,
      });
    } finally {
      toast.dismiss(loadingToast);
      setAddingAddOnId(null);
    }
  };

  const handleAddToCart = async (product: Drink) => {
    // Validate selections
    if (!selectedBrand || !selectedModel) {
      toast.error("⚠️ Please select brand and model first!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Check stock availability one more time before adding to cart
    const modelStock = stockInfo[selectedBrand]?.[selectedModel];
    if (modelStock) {
      const hasStock = (modelStock.backCovers > 0 || modelStock.aluminumSheets > 0);
      if (!hasStock) {
        toast.error("❌ Selected model is out of stock", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
    }

    // Show loading toast
    const loadingToast = toast.loading("Adding to cart...", {
      position: "top-right",
    });

    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : localStorage.getItem('userId');

    try {
      // Store only the extra plates here; bundle quantity already covers the cover+plates units.
      const extraPlateQuantity = isTwoOptionProduct ? extraPlates : 0;
      
      // Determine product option based on what's being added
      let productOption = 'none';
      if (isTwoOptionProduct) {
        if (quantity > 0 && extraPlateQuantity > 0) {
          productOption = 'cover+plates';
        } else if (quantity > 0) {
          productOption = 'cover-only'; 
        } else if (extraPlateQuantity > 0) {
          productOption = 'plates-only';
        }
      } else {
        productOption = 'cover-only';
      }

      console.log('Product option details:', {
        quantity,
        extraPlates, 
        extraPlateQuantity,
        productOption,
        isTwoOptionProduct
      });

      // Get the product image to send with cart item
      const productImage = Array.isArray(product.images) && product.images.length > 0 
        ? product.images[0] 
        : productImages[0] || '/images/card1.webp';

      // Prepare cart item
      const cartItem = {
        userId: userId,
        // This route adds a single product. Keep type as product even for swap-wrap/gaming
        // so order processing does not mis-handle product IDs as collection IDs.
        type: 'product',
        productId: product._id || product.id,
        productRef: "Product",
        price: isTwoOptionProduct ? coverPlatePriceValue : (coverPlatePriceValue || (product as any).coverprice || product.price || 0),
        quantity: quantity,
        selectedBrand: selectedBrand,
        selectedModel: selectedModel,
        productName: product.name,
        collectionName: product.name, // Add collection name for two-option products
        collectionType: isTwoOptionProduct ? (product.type || 'swap-wrap') : (product.type || undefined), // Set collection type for all products
        productOption: productOption,
        plateQuantity: extraPlateQuantity,
        platePrice: platePriceValue,
        // Send image data directly to ensure it's available in cart
        productImage: productImage,
        image: productImage
      };

      console.log("Adding to cart:", cartItem);


      // Add main product
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "User-Id": userId ? userId : "",
        },
        body: JSON.stringify(cartItem)
      });
      const result = await response.json();
      console.log("Add to cart result:", result);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to add to cart");
      }
      
      if (result.success) {
        let successCount = 1;
        let failedCount = 0;

        // Add selected suggested products
        if (selectedSuggested.size > 0) {
          const suggestedPromises = Array.from(selectedSuggested).map(async (productId) => {
            const product = suggestedProducts.find(p => p._id === productId);
            if (!product) return { success: false };

            try {
              const suggestedResponse = await fetch(`${BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Id': userId
                },
                body: JSON.stringify({
                  userId: userId,
                  type: 'suggested',
                  productId: product._id,
                  quantity: 1,
                  price: product.price
                })
              });
              return await suggestedResponse.json();
            } catch (error) {
              return { success: false };
            }
          });

          const suggestedResults = await Promise.all(suggestedPromises);
          suggestedResults.forEach(res => {
            if (res.success) successCount++;
            else failedCount++;
          });
        }

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Success notification
        if (successCount > 1) {
          toast.success(`✅ ${successCount} items added to cart!`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          // Better success message for two-option products
          const message = isTwoOptionProduct && extraPlates > 0
            ? `✅ ${quantity}x ${product.name} (${quantity + extraPlates} plates total) added to cart!`
            : `✅ ${quantity}x ${product.name} added to cart!`;
            
          toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        if (failedCount > 0) {
          toast.warning(`⚠️ ${failedCount} suggested items failed to add`, {
            position: "top-right",
            autoClose: 3000,
          });
        }

        // Clear selected suggested products after successful add
        setSelectedSuggested(new Set());
      }
      
    } catch (error: any) {
      // Dismiss loading toast on error
      toast.dismiss(loadingToast);
      
      console.error("Error adding to cart:", error);
      const errorMessage = error?.message || "Network error. Please try again.";
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#090701] text-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-white text-2xl">Loading product...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="bg-[#090701] text-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-red-500 text-2xl">
            {error || "Product not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#090701] text-white overflow-hidden min-h-screen flex flex-col">
      <Navbar />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <main className="mx-auto flex-1 w-full">



      <div className="overflow-hidden w-full mx-auto mt-25 py-12 pb-0 ">

        <div  ref={productSectionRef} className="flex flex-col items-center lg:items-start lg:flex-row gap-10 lg:h-screen lg:overflow-hidden">
  {/* Image Section with Carousel */}
  <div className="w-full min-[480px]:w-[80%] sm:max-w-[45%]  sm:min-w-[45%] min-[768px]:min-h-[85vh] sm:max-h-[85vh] p-6 rounded-md flex flex-col gap-4 
    lg:h-screen ">
    {/* Main Image Display */}
    <div 
      className="relative  rounded-xl min-h-full overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={productImages[currentImageIndex] || Img.src}
        alt={`${product.name} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-contain sm:[object-fit:unset]  transition-opacity duration-300"
      />
      
      {/* Navigation Arrows (only show if multiple images) */}
      {productImages.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {productImages.length}
          </div>
        </>
      )}
    </div>

    
  </div>


          {/* Info Section */}
          <div  ref={rightSectionRef} className="w-full lg:w-1/2 space-y-10 text-base p-5 leading-relaxed text-white lg:pt-10 h-full
    lg:h-screen
    overflow-y-auto
    lg:pr-6
    ">
            {/* Title & Price */}
            <div className="flex justify-between items-start gap-4">
              <h1 className={`${JersyFont.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl flex-1`}>{product.name}</h1>
              <div className="text-right flex-shrink-0">
                {isTwoOptionProduct ? (
                  <>
                    <div className="text-2xl font-bold text-lime-400">
                      ₹{coverPlatePriceValue}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Cover + Plates
                    </p>
                    {platePriceValue > 0 && (
                      <p className="text-sm text-gray-300 mt-2">
                        Plates only: ₹{platePriceValue}
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-lime-400">
                    ₹{(product as any).coverprice || product.price || 0}
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-4 w-full">
              {/* Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                <DropdownButton
                  className="w-full sm:flex-1"
                  onSelect={handleBrandSelect}
                  options={phonebrand}
                  placeholder="Select Brand"
                  variant="outline"
                  dropupMode={true}
                />
                <DropdownButton
                  className="w-full sm:flex-1"
                  onSelect={handleModelSelect}
                  options={selectedBrand ? modelsByBrand[selectedBrand] : []}
                  placeholder={
                    selectedBrand ? "Select Model" : "Select Brand First"
                  }
                  variant="outline"
                  dropupMode={true}
                  disabled={!selectedBrand}
                />
              </div>
              
              {/* Quantity Selectors */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {isTwoOptionProduct ? (
                  <>
                    <div className="flex flex-col items-center w-full sm:w-auto">
                      <span className="text-white text-xs mb-1">Backcover+Plates</span>
                      <QuantitySelector
                        key={`cards-${quantity}`}
                        initialValue={quantity}
                        min={1}
                        max={10}
                        onChange={handleQuantityChange}
                      />
                    </div>
                    <div className="flex flex-col items-center w-full sm:w-auto">
                      <span className="text-white text-xs mb-1">Only Plates</span>
                      <QuantitySelector
                        initialValue={extraPlates}
                        min={0}
                        max={20}
                        onChange={handleExtraPlatesChange}
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-full sm:w-auto">
                    <QuantitySelector
                      initialValue={1}
                      min={1}
                      max={10}
                      onChange={handleQuantityChange}
                    />
                  </div>
                )}
              </div>

              

{productImages.length > 1 && (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {productImages.map((img, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              currentImageIndex === index
                ? 'border-lime-400 scale-105'
                : 'border-gray-600 hover:border-gray-400'
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    )}



              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!selectedBrand || !selectedModel}
                  className="bg-lime-400 active:scale-95 cursor-pointer text-black px-6 py-2 rounded hover:bg-lime-500 transition font-semibold w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!selectedBrand || !selectedModel}
                  className="relative overflow-hidden border border-white px-6 py-2 rounded font-semibold text-white transition-all duration-800 group w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Add On Accessories */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-[#11110f] p-4 sm:p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-lime-400/90">Add on accessories</p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Bundle it with a matching strap</h2>
                </div>
                <p className="hidden sm:block text-sm text-gray-400 max-w-xs text-right">
                  Tap add on any accessory below and it will go straight into your cart.
                </p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                {addOnProducts.map((addOn) => (
                  <article
                    key={addOn.id}
                    className="min-w-[320px] sm:min-w-[360px] snap-start rounded-3xl border border-white/10 bg-[#161412] p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-lime-400/40"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-white/95 to-white/70 p-2 shadow-inner">
                        <img
                          src={addOn.image}
                          alt={addOn.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-white leading-tight">
                          {addOn.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                          {addOn.subtitle}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {addOn.details.map((detail) => (
                            <span
                              key={detail}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wide text-gray-300"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          {addOn.colors.map((color) => (
                            <span
                              key={color}
                              className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddOnAddToCart(addOn)}
                        disabled={addingAddOnId === addOn.id}
                        className="shrink-0 rounded-full border border-lime-400/80 px-4 py-2 text-sm font-semibold text-lime-300 transition-colors hover:bg-lime-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {addingAddOnId === addOn.id ? "Adding..." : "+ Add"}
                      </button>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">₹{addOn.price}</span>
                          <span className="text-sm text-gray-500 line-through">₹{addOn.oldPrice}</span>
                        </div>
                        <p className="text-xs text-lime-400/80">Ready to bundle with the product above</p>
                      </div>

                      <div className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-lime-300">
                        Quick add
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Suggested Products Section */}
            {suggestedProducts.length > 0 && (
              <div className="mt-6 space-y-2">
                {suggestedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSuggested.has(product._id)}
                      onChange={() => toggleSuggestedProduct(product._id)}
                      className="w-5 h-5 accent-lime-400 cursor-pointer"
                    />
                    <label className="text-sm text-gray-300 cursor-pointer" onClick={() => toggleSuggestedProduct(product._id)}>
                      {product.name}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <h2 className="font-semibold text-xl">Description</h2>
              <p className="text-gray-300">
                {product.description || "No description available"}
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1">
                <li>
                  <span className="font-medium text-white">Type:</span>{" "}
                  {product.type || "N/A"}
                </li>
                <li>
                  <span className="font-medium text-white">Flavor:</span>{" "}
                  {product.flavor || "N/A"}
                </li>
                <li>
                  <span className="font-medium text-white">Pack Size:</span>{" "}
                  {product.packSize || "N/A"}
                </li>
              </ul>
            </div>

            {/* Collapsible Sections */}
            <div className="border-t border-[#2a2a2a]">
              {["Shipping"].map((section) => (
                <div key={section} className="border-b border-[#2a2a2a] py-4">
                  <button
                    onClick={() =>
                      setActiveSection(activeSection === section ? null : section)
                    }
                    className="w-full hover:cursor-pointer text-left font-semibold text-lg flex justify-between items-center"
                  >
                    {section}
                    <span className="text-xl">
                      {activeSection === section ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      activeSection === section
                        ? "max-h-40 opacity-100 mt-3"
                        : "max-h-0 opacity-0"
                    } text-gray-400 text-sm leading-relaxed`}
                  >
                    {section === "Shipping" ? (
                      <p>
                        🚚 Ships in 2-3 business days. Free shipping on orders
                        over ₹500.
                      </p>
                    ) : (
                      <p>
                        ⭐️⭐️⭐️⭐️⭐️ — &quot;Absolutely love the flavor and the
                        energy boost!&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden flex justify-start max-w-full mx-auto px-6 mb-0">
        <div className="mt-16 mb-10 ">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Related Products
          </h2>
          <div
  className="
    grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4
    gap-x-8 mr-2
  "
>


            {relatedProducts.map((p, index) => (
              <ProductCard key={p._id || p.id || index} product={p} href={`/specific/${p._id || p.id}`} />
            ))}
          </div>
        </div>
        
        
      </div>
      </main>
      <Footer />
      
    </div>
  );
};

export default ProductDetails;
