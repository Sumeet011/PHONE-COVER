"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import localFont from "next/font/local";
import CircularGallery from "@/components/homeCards/CircularGalary";
import { DropdownButton } from "@/components/ui/dropdown-button-upward";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useParams, useRouter } from "next/navigation";
import { BuyNowButton } from "@/components/ui/buy-now-button";
import { toast } from "react-toastify";

const JersyFont = localFont({
  src: "../../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

type Product = {
  _id: string;
  id?: string;
  name: string;
  image: string;
  price: number;
  category?: string;
  description?: string;
  Features?: string[];
  material?: string;
  level?: string;
  type?: string;
};

type Collection = {
  _id: string;
  name: string;
  description?: string;
  heroImage?: string;
  Products?: Product[];
  Features?: string[];
};

const Specific_Collection = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
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
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // ALL EFFECTS MUST COME BEFORE useMemo
  useEffect(() => {
    console.log("collectionId:", collectionId);

    if (!collectionId) {
      console.log("No collectionId found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      toast.error("Fetched")
      try {
        setLoading(true);
        const url = `${BACKEND_URL}/api/collections/${collectionId}`;
        console.log("Fetching from:", url);

        const response = await fetch(url);
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Full API response:", result);

        if (result.success && result.data) {
          console.log("Setting collection data:", result.data);
          setCollection(result.data);

          if (result.data.Products && Array.isArray(result.data.Products)) {
            console.log("Products found:", result.data.Products);
            setProducts(result.data.Products);
          }
        } else if (result.Products) {
          console.log("Setting products directly:", result.Products);
          setProducts(result.Products);
          setCollection(result);
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionId]);

  // ALL MEMOIZED VALUES AFTER useEffect
  const phonebrand = useMemo(
    () => [
      { value: "apple", label: "Apple" },
      { value: "samsung", label: "Samsung" },
      { value: "google", label: "Google" },
      { value: "oneplus", label: "OnePlus" },
      { value: "xiaomi", label: "Xiaomi" },
    ],
    []
  );

  const modelsByBrand: Record<string, { value: string; label: string }[]> =
    useMemo(
      () => ({
        apple: [
          { value: "iphone-14", label: "iPhone 14" },
          { value: "iphone-15", label: "iPhone 15" },
        ],
        samsung: [
          { value: "galaxy-s22", label: "Galaxy S22" },
          { value: "galaxy-s23", label: "Galaxy S23" },
        ],
        google: [
          { value: "pixel-7", label: "Pixel 7" },
          { value: "pixel-8", label: "Pixel 8" },
        ],
        oneplus: [
          { value: "oneplus-10", label: "OnePlus 10" },
          { value: "oneplus-12", label: "OnePlus 12" },
        ],
        xiaomi: [
          { value: "mi-11", label: "Mi 11" },
          { value: "mi-13", label: "Mi 13" },
        ],
      }),
      []
    );

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

    const loadingToast = toast.loading("Adding to cart...", {
      position: "top-right",
    });

    try {
      // Get userId from localStorage
      
    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : null;

      if (!userId) {
        toast.dismiss(loadingToast); // ✅ Dismiss loading toast
        toast.error("Please refresh the page to continue.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Prepare cart item data
      const cartItem = {
        type: "collection",
        productId: collectionId,
        price: currentProduct?.price || 0,
        quantity: quantity || 1,
        selectedBrand: selectedBrand,
        selectedModel: selectedModel,
      };

      console.log("Sending cart item:", cartItem); // Debug log

      // Add to cart via API
      const response = await fetch(`${BACKEND_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Id": userId,
        },
        body: JSON.stringify(cartItem),
      });

      const result = await response.json();
      console.log("Add to cart result:", result); // Debug log

      // ✅ Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(`✅ ${quantity}x ${collectionInfo.title} added to cart!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

      } else {
        toast.error(`❌ ${result.message || "Failed to add to cart"}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      // ✅ Dismiss loading toast on error
      toast.dismiss(loadingToast);
      
      console.error("Error adding to cart:", error);
      toast.error("❌ Network error. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [selectedBrand, selectedModel, quantity, collectionId, currentProduct, collectionInfo, router]);

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
        <div className="flex justify-center items-center h-screen">
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

      {/* Hero Banner Image */}
      {/* Hero Banner Image */}
      {collection?.heroImage ? (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-8">
          <img
            src={collection.heroImage}
            alt={collection.name || "Collection Hero"}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        /* Title (only show if no hero image) */
        <div className="w-full flex justify-center items-center mt-5">
          <h1
            className={`${JersyFont.className} text-[#9AE600] text-5xl md:text-7xl mt-6 -mb-6`}
          >
            {collectionInfo.title}
          </h1>
        </div>
      )}

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
      <div className="max-w-4xl sm:max-w-full mx-auto px-4 py-8 space-y-1 mb-10">
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
                <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {currentProduct?.type || "Standard"}
                </span>
              </div>

              <p className="text-gray-300 leading-relaxed mb-4">
                {currentProduct?.description || "No description available"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {(currentProduct?.Features || []).map(
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
                  <h4 className="font-semibold text-white mb-2">Price:</h4>
                  <p className="text-[#9AE600] font-medium text-2xl">
                    ₹{currentProduct?.price || "N/A"}
                  </p>
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
        <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-800 relative overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-4">
            About This Collection
          </h3>
          <p className="text-gray-300 mb-4">{collectionInfo.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">
                Collection Features:
              </h4>
              <ul className="space-y-2">
                {collectionInfo.features.map((feature: any, index: any) => (
                  <li
                    key={index}
                    className="text-gray-400 text-sm flex items-center"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Compatibility:</h4>
              <p className="text-gray-400 text-sm">{collectionInfo.compatibility}</p>
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="border-t border-gray-800">
          {["Shipping Info", "Customer Reviews", "Installation Guide"].map(
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
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
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
                  ) : section === "Customer Reviews" ? (
                    <p>
                      ⭐️⭐️⭐️⭐️⭐️ — "Amazing quality and perfect fit! The
                      design looks exactly like the pictures." <br />
                      ⭐️⭐️⭐️⭐️⭐️ — "Easy to apply and no bubbles. Highly
                      recommended!"
                    </p>
                  ) : (
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

      {/* Bottom Fixed Controls */}
      <div className="fixed sm:h-18 md:h-20 bottom-0 bg-black flex justify-between items-center left-1 pt-3 pb-3 mb-0 sm:left-0 z-50 w-full">
        <div className="flex items-center ml-1 sm:ml-10">
          <DropdownButton
            className="mr-2"
            onSelect={handleBrandSelect}
            options={phonebrand}
            placeholder="Select Brand"
            variant="outline"
            dropupMode={true}
          />

          <DropdownButton
            className="mr-2"
            onSelect={handleModelSelect}
            options={selectedBrand ? modelsByBrand[selectedBrand] : []}
            placeholder={selectedBrand ? "Select Model" : "Select Brand First"}
            variant="outline"
            dropupMode={true}
            disabled={!selectedBrand}
          />

          <QuantitySelector
            initialValue={1}
            min={1}
            max={10}
            onChange={handleQuantityChange}
          />
        </div>

        <div>
          <BuyNowButton
            className="h-9 mr-4"
            disabled={!selectedBrand || !selectedModel}
            onClick={handleBuyNow}
          />
        </div>
      </div>
    </>
  );
};

export default Specific_Collection;
