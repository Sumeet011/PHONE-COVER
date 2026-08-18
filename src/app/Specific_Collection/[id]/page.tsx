"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import localFont from "next/font/local";
import CircularGallery from "@/components/homecomponents/CircularGalary";
import { DropdownButton } from "@/components/ui/dropdown-button-upward";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useParams, useRouter } from "next/navigation";
import { BuyNowButton } from "@/components/ui/buy-now-button";
import { ToastContainer, toast } from "react-toastify";
import config from "@/config";


const JersyFont = localFont({
  src: "../../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

type Product = {
  _id: string;
  id?: string;
  name: string;
  image?: string;
  images?: string[];
  price: number;
  category?: string;
  description?: string;
  Features?: string[];
  features?: string[];
  material?: string;
  level?: string;
  type?: string;
};

type Collection = {
  _id: string;
  name: string;
  description?: string;
  heroImage?: string;
  type?: string;
  price?: number;
  plateprice?: number;
  products?: Product[];
  Features?: string[];
};

const Specific_Collection = () => {
  const BACKEND_URL = config.API_BASE_URL;
  const router = useRouter();
  const params = useParams();
  const collectionId = params?.id;

  // ALL STATE DECLARATIONS FIRST
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [extraPlates, setExtraPlates] = useState<number>(0);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState<boolean>(false);

  const normalizeProduct = useCallback((rawProduct: any): Product | null => {
    if (!rawProduct || typeof rawProduct !== "object") {
      return null;
    }

    const productId = rawProduct._id || rawProduct.id;
    const images = Array.isArray(rawProduct.images) ? rawProduct.images.filter(Boolean) : [];
    const image = rawProduct.image || images[0] || "/images/card.webp";

    return {
      ...rawProduct,
      _id: productId,
      id: rawProduct.id,
      image,
      images,
      price: rawProduct.price || rawProduct.coverprice || 0,
      features: rawProduct.features || rawProduct.Features || [],
      Features: rawProduct.Features || rawProduct.features || [],
    };
  }, []);

  // ALL EFFECTS MUST COME BEFORE useMemo
  useEffect(() => {

    if (!collectionId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `${BACKEND_URL}/api/collections/${collectionId}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Collection result:', result);
        console.log('Collection price:', result.data?.price);
        console.log('Collection plateprice:', result.data?.plateprice);


        if (result.success && result.data) {
          setCollection(result.data);
          console.log('✅ Collection state set:', {
            name: result.data.name,
            type: result.data.type,
            price: result.data.price,
            plateprice: result.data.plateprice
          });

          // Handle both products and legacy Products field names
          const productRefs = result.data.products || result.data.Products || [];
          
          if (productRefs && Array.isArray(productRefs) && productRefs.length > 0) {
            const productPromises = productRefs.map(async (productRef: any) => {
              try {
                // Extract the product ID - it could be a string or an object with _id
                const productId = typeof productRef === 'string' ? productRef : (productRef._id || productRef.id);
                
                if (!productId) {
                  return normalizeProduct(productRef);
                }

                const productResponse = await fetch(`${BACKEND_URL}/api/products/${productId}`);
                if (productResponse.ok) {
                  const productResult = await productResponse.json();
                  const apiProduct = productResult.success ? productResult.data : productResult;
                  return normalizeProduct(apiProduct);
                }

                // If fetch fails, still try using populated product object from collection payload.
                return normalizeProduct(productRef);
              } catch (error) {
                console.error(`Error fetching product:`, error);
                return normalizeProduct(productRef);
              }
            });

            const fetchedProducts = await Promise.all(productPromises);
            const validProducts = fetchedProducts.filter((p): p is Product => p !== null);
            
            setProducts(validProducts);
          } else {
            setProducts([]);
          }
        } else if (result.Products || result.products) {
          const directProducts = result.Products || result.products;
          const normalizedProducts = Array.isArray(directProducts)
            ? directProducts
                .map((product: any) => normalizeProduct(product))
                .filter((product): product is Product => product !== null)
            : [];
          setProducts(normalizedProducts);
          setCollection(result);
        } else {
          setProducts([]);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionId, BACKEND_URL, normalizeProduct]);

  // ALL MEMOIZED VALUES AFTER useEffect
  const [phonebrand, setPhonebrand] = useState<{ value: string; label: string }[]>([]);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, { value: string; label: string }[]>>({});
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true);

  // Fetch phone brands from API
  useEffect(() => {
    const fetchPhoneBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await fetch(`${BACKEND_URL}/api/phone-brands?activeOnly=true`);
        const data = await response.json();

        if (data.success) {
          const brands = data.data.map((brand: any) => ({
            value: brand.brandName,
            label: brand.brandName
          }));

          const models: Record<string, { value: string; label: string }[]> = {};
          data.data.forEach((brand: any) => {
            models[brand.brandName] = brand.models.map((model: any) => ({
              value: model.modelName,
              label: model.modelName
            }));
          });

          setPhonebrand(brands);
          setModelsByBrand(models);
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

  const currentProduct = useMemo(
    () => products[currentCardIndex] || products[0],
    [products, currentCardIndex]
  );

  const collectionInfo = useMemo(
    () => ({
      title: collection?.name || "Phone Wraps Collection",
      description:
        collection?.description ||
        "Transform your device with our premium collection",
      features: collection?.Features || [
        "Premium Vinyl Material",
        "Bubble-Free Installation",
        "Residue-Free Removal",
        "Perfect Fit Guarantee",
        "1 Year Warranty",
      ],
      compatibility: "Compatible with all major phone models",
    }),
    [collection]
  );

  const normalizedCollectionType = (collection?.type || '').toLowerCase();
  const isTwoOptionCollection = ['gaming', 'swap-wrap', 'normal-swap'].includes(normalizedCollectionType);

  // ALL CALLBACKS
  const handleCardChange = useCallback((cardIndex: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentCardIndex(cardIndex);
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    }, 200);
  }, []);

  const handleBrandSelect = useCallback(
    (option: { value: string; label: string }) => {
      setSelectedBrand(option.value);
      setSelectedModel("");
    },
    []
  );

  const handleModelSelect = useCallback(
    (option: { value: string; label: string }) => {
      setSelectedModel(option.value);
    },
    []
  );

  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(newQuantity);
  }, []);

  const handleExtraPlatesChange = useCallback((newQuantity: number) => {
    setExtraPlates(newQuantity);
  }, []);

  const handleBuyNow = useCallback(async () => {
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

    let loadingToast: any = null;
    
    try {
      loadingToast = toast.loading("Adding to cart...", {
        position: "top-right",
      });

      // Get userId from localStorage
      const userData = localStorage.getItem('USER');
      const userId = userData ? JSON.parse(userData).id : null;

      if (!userId) {
        if (loadingToast) toast.dismiss(loadingToast);
        toast.error("Please refresh the page to continue.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      // Prepare cart item data
      // For gaming collections, use collection price; for others, use product price
      const itemPrice = isTwoOptionCollection && collection?.price
        ? collection.price
        : (currentProduct?.price || 0);
      
      console.log('💰 Price calculation:', {
        collectionType: collection?.type,
        collectionPrice: collection?.price,
        currentProductPrice: currentProduct?.price,
        finalItemPrice: itemPrice
      });
      
      // Get plate price
      const platePriceValue = collection?.plateprice || 0;
      console.log('🍽️ Plate price:', platePriceValue);

      // Store only the extra plates here; the bundle quantity already tracks cover+plates units.
      const extraPlateQuantity = isTwoOptionCollection ? extraPlates : 0;
      
      // Determine product option based on what's being added
      let productOption = 'none';
      if (isTwoOptionCollection) {
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
        collectionType: collection?.type,
        collectionId,
        platePriceValue
      });
      
      const cartItem = {
        type: "collection",
        productId: collectionId,
        productRef: "Collection",
        price: itemPrice,
        quantity: quantity,
        selectedBrand: selectedBrand,
        selectedModel: selectedModel,
        collectionName: collection?.name || collectionInfo.title,
        collectionType: collection?.type || 'normal-swap',
        productOption: productOption,
        plateQuantity: extraPlateQuantity,
        platePrice: platePriceValue
      };

      console.log("Adding to cart:", cartItem);

      // Add to cart via API
      const response = await fetch(`${BACKEND_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Id": userId,
        },
        body: JSON.stringify(cartItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Add to cart result:", result);

      if (!result.success) {
        throw new Error(result.message || "Failed to add to cart");
      }

      // Dismiss loading toast
      if (loadingToast) toast.dismiss(loadingToast);

      // Close mobile drawer after successful add to cart.
      setIsMobileControlsOpen(false);

      // Success message
      const message = isTwoOptionCollection && extraPlates > 0
        ? `✅ ${quantity}x ${collectionInfo.title} (+ ${extraPlates} plates) added to cart!`
        : `✅ ${quantity}x ${collectionInfo.title} added to cart!`;
      
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: any) {
      // Dismiss loading toast on error
      if (loadingToast) toast.dismiss(loadingToast);
      
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
  }, [selectedBrand, selectedModel, quantity, extraPlates, collection, collectionId, currentProduct, collectionInfo, BACKEND_URL, isTwoOptionCollection]);

  // NOW CONDITIONAL RETURNS AFTER ALL HOOKS
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-2xl">Loading collection...</div>
        </div>
      </>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen pt-20">
          <div className="text-white text-2xl">
            No products found for this collection
          </div>
        </div>
      </>
    );
  }

  // MAIN RENDER
  return (
    <>
      <Navbar />

      <div className="pt-10 sm:pt-20 " style={{ overscrollBehaviorX: 'none', touchAction: 'pan-y pinch-zoom' }}></div>
        <div className="w-full flex justify-center items-center mt-5">
          <h1
            className={`${JersyFont.className} text-[#9AE600] text-5xl md:text-7xl mt-6 -mb-6`}
          >
            {collectionInfo.title}
          </h1>
        </div>

      {/* Circular Gallery */}
      <div className="w-full flex justify-center items-center pb-10">
        <div className="w-full relative h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
          <CircularGallery
            items={products}
            bend={3}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollEase={0.1}
            scrollSpeed={1}
            onCardChange={handleCardChange}
          />
        </div>
      </div>

      {/* Card Info Section */}
      <div className="max-w-4xl sm:max-w-full mx-auto px-4 py-8 space-y-1 mb-32 sm:mb-28 md:mb-24">
        <div
          className={`bg-gray-900/50 rounded-lg p-6 border border-gray-800 relative overflow-hidden transition-all duration-300 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
          style={{
            clipPath: isAnimating
              ? "circle(0% at 0% 0%)"
              : "circle(150% at 0% 0%)",
            transition:
              "clip-path 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease",
          }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div
              className={`flex-1 transition-all duration-300 ${
                isAnimating
                  ? "opacity-0 transform translate-y-4"
                  : "opacity-100 transform translate-y-0"
              }`}
              style={{
                transitionDelay: isAnimating ? "0s" : "0.3s",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2
                  className={`${JersyFont.className} text-3xl text-[#9AE600]`}
                >
                  {currentProduct?.name || "Product Name"}
                </h2>
                <span className="bg-[#9AE600] text-black px-3 py-1 rounded-full text-sm font-bold">
                  {currentProduct?.level || "N/A"}
                </span>
                
              </div>

              <p className="text-gray-300 leading-relaxed mb-4">
                {currentProduct?.description || "No description available"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {(currentProduct?.features || currentProduct?.Features || []).map(
                      (feature: string, index: number) => (
                        <li
                          key={index}
                          className="text-gray-400 text-sm flex items-center"
                        >
                          <span className="w-2 h-2 bg-[#9AE600] rounded-full mr-2"></span>
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Back cover + Plate (1 Set) :</h4>
                  <p className="text-[#9AE600] font-medium text-2xl">
                    ₹{isTwoOptionCollection && collection?.price 
                      ? collection.price 
                      : (currentProduct?.price || "N/A")}
                  </p>
                  {isTwoOptionCollection && (
                    <>

                      {collection?.plateprice && (
                        <>
                         <h4 className="font-semibold text-white mb-2 mt-2">
                            Design Plate :
                          </h4>
                          <p className="text-[#9AE600] font-medium text-2xl">
                            ₹{collection.plateprice}
                          </p>
                          
                        </>
                      )}
                    </>
                  )}
                  <h4 className="font-semibold text-white mb-2 mt-4">
                    Material:
                  </h4>
                  <p className="text-gray-400">
                    {currentProduct?.material || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-800 relative overflow-hidden
                grid grid-cols-2 gap-12">

  <div>
    <h3 className="text-xl font-bold text-white mb-4">
      About This Collection
    </h3>
    <p className="text-gray-300 mb-4">
      {collectionInfo.description}
    </p>
  </div>

  <div>
    <h4 className="font-semibold text-white mb-3">Compatibility:</h4>
    <p className="text-gray-400 text-sm">
      {collectionInfo.compatibility}
    </p>
  </div>

</div>



        {/* Collapsible Sections */}
        <div className="border-t border-gray-800">
          {["Shipping Info", "Installation Guide"].map(
            (section) => (
              <div key={section} className="border-b border-gray-800 py-4">
                <button
                  onClick={() =>
                    setActiveSection(activeSection === section ? null : section)
                  }
                  className="w-full text-left font-semibold text-lg flex justify-between items-center text-white hover:text-[#9AE600] transition-colors"
                >
                  {section}
                  <span className="text-xl">
                    {activeSection === section ? "−" : "+"}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all cursor-pointer duration-500 ease-in-out  ${
                    activeSection === section
                      ? "max-h-40 opacity-100 mt-3"
                      : "max-h-0 opacity-0"
                  } text-gray-400 text-sm leading-relaxed`}
                >
                  {section === "Shipping Info" ? (
                    <p>
                      🚚 Free shipping on orders over ₹500. Standard delivery
                      takes 3-5 business days. Express delivery available for
                      ₹99 extra.
                    </p>
                  ) : 
                   (
                    <p>
                      📱 Clean your phone → Peel off backing → Align carefully →
                      Apply from center outward → Smooth out any bubbles. Video
                      guide included with purchase.
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile Add to Cart Trigger */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800 z-50 px-3 py-3">
        <button
          type="button"
          onClick={() => setIsMobileControlsOpen(true)}
          className="w-full h-11 rounded-md bg-[#9AE600] text-black font-semibold"
        >
          Add to Cart
        </button>
      </div>

      {/* Mobile Controls Drawer */}
      {isMobileControlsOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileControlsOpen(false)}
          ></div>

          <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-800 rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-base">Select device and quantity</h3>
              <button
                type="button"
                onClick={() => setIsMobileControlsOpen(false)}
                className="text-gray-300 text-2xl leading-none"
                aria-label="Close controls"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <DropdownButton
                className="w-full"
                onSelect={handleBrandSelect}
                options={phonebrand}
                placeholder="Select Brand"
                variant="outline"
                dropupMode={true}
              />

              <DropdownButton
                className="w-full"
                onSelect={handleModelSelect}
                options={selectedBrand ? modelsByBrand[selectedBrand] : []}
                placeholder={selectedBrand ? "Select Model" : "Select Model"}
                variant="outline"
                dropupMode={true}
                disabled={!selectedBrand}
              />

              {isTwoOptionCollection ? (
                <>
                  <div className="w-full">
                    <QuantitySelector
                      key={`mobile-cards-${quantity}`}
                      initialValue={quantity}
                      min={1}
                      max={10}
                      onChange={handleQuantityChange}
                      disabled={!selectedBrand || !selectedModel}
                      label="Backcover+Plates"
                    />
                  </div>
                  <div className="w-full">
                    <QuantitySelector
                      initialValue={extraPlates}
                      min={0}
                      max={20}
                      onChange={handleExtraPlatesChange}
                      disabled={!selectedBrand || !selectedModel}
                      label="Only Plates"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <QuantitySelector
                    initialValue={1}
                    min={1}
                    max={10}
                    onChange={handleQuantityChange}
                    disabled={!selectedBrand || !selectedModel}
                    label="Quantity"
                  />
                </div>
              )}

              <BuyNowButton
                className="w-full h-11"
                disabled={!selectedBrand || !selectedModel}
                onClick={handleBuyNow}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Fixed Controls (Desktop/Tablet) */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 w-full">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center lg:gap-4 px-2 sm:px-4 lg:px-6 py-1 mt--3 lg:py-2">
          {/* Controls Group */}
          <div className="w-full flex items-center gap-2 flex-wrap lg:flex-nowrap justify-center lg:justify-start">
            <DropdownButton
              className="w-full lg:w-auto min-w-[120px] sm:min-w-[140px] mt-1"
              onSelect={handleBrandSelect}
              options={phonebrand}
              placeholder="Select Brand"
              variant="outline"
              dropupMode={true}
            />

            <DropdownButton
              className="w-full lg:w-auto min-w-[120px] sm:min-w-[140px] mt-1"
              onSelect={handleModelSelect}
              options={selectedBrand ? modelsByBrand[selectedBrand] : []}
              placeholder={selectedBrand ? "Select Model" : "Select Model"}
              variant="outline"
              dropupMode={true}
              disabled={!selectedBrand}
            />

            {isTwoOptionCollection ? (
              <>
                <div className="w-full lg:w-auto mt-1 mb-2 sm:mb-0">
                  <QuantitySelector
                    key={`cards-${quantity}`}
                    initialValue={quantity}
                    min={1}
                    max={10}
                    onChange={handleQuantityChange}
                    disabled={!selectedBrand || !selectedModel}
                    label="Cover+Plates"
                  />
                </div>
                <div className="w-full lg:w-auto mt-1 mb-2 sm:mb-0">
                  <QuantitySelector
                    initialValue={extraPlates}
                    min={0}
                    max={20}
                    onChange={handleExtraPlatesChange}
                    disabled={!selectedBrand || !selectedModel}
                    label="Plates"
                  />
                </div>
              </>
            ) : (
              <div className="w-full lg:w-auto mt-1">
                <QuantitySelector
                  initialValue={1}
                  min={1}
                  max={10}
                  onChange={handleQuantityChange}
                  disabled={!selectedBrand || !selectedModel}
                  label="Quantity"
                />
              </div>
            )}
          </div>

          {/* Buy Button */}
          <div className="flex justify-center lg:justify-end lg:flex-shrink-0">
            <BuyNowButton
              className="w-full sm:w-auto min-w-[140px] h-10 sm:h-9"
              disabled={!selectedBrand || !selectedModel}
              onClick={handleBuyNow}
            />
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Specific_Collection;
