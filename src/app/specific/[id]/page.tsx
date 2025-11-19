'use client'
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/navbar/Navbar";
import { DropdownButton } from "@/components/ui/dropdown-button-upward";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default placeholder image
const Img = { src: '/images/card.webp' };

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BASE_URL = `${BACKEND_URL}/api`;

type Drink = {
  id: number;
  name: string;
  image: string;
  price: number;
  type?: string;
  flavor?: string;
  packSize?: string;
  description?: string;
};

const ProductCard: React.FC<{ drink: Drink; href: string }> = ({ drink, href }) => {
  return (
    <a
      href={href}
      className="group relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[230px] w-[150px] min-[370px]:w-[180px] min-[370px]:h-[270px] md:h-[300px] md:w-[230px] snap-start"
    >
      <div className="relative overflow-hidden rounded-xl h-[300px]">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-full object-cover"
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

const ProductDetails = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  // State for product data
  const [drink, setDrink] = useState<Drink | null>(null);
  const [relatedDrinks, setRelatedDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dropdown states
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Dropdown data
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

  type ModelOption = { value: string; label: string };
  const modelsByBrand: Record<string, ModelOption[]> = useMemo(
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
        console.log("Fetching product:", `${BASE_URL}/products/${productId}`);
        
        // Fetch single product
        const response = await fetch(`${BASE_URL}/products/${productId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Product API Response:", result);
        
        // Handle different response structures
        if (result.success && result.data) {
          setDrink(result.data);
        } else if (result.data) {
          setDrink(result.data);
        } else {
          setDrink(result);
        }

        // Fetch all products for related products
        const allProductsResponse = await fetch(`${BASE_URL}/products`);
        const allProductsResult = await allProductsResponse.json();
        
        let allProducts = [];
        if (allProductsResult.success && allProductsResult.items) {
          allProducts = allProductsResult.items;
        } else if (allProductsResult.data) {
          allProducts = allProductsResult.data;
        } else if (Array.isArray(allProductsResult)) {
          allProducts = allProductsResult;
        }

        // Filter out current product
        const related = allProducts.filter((p: Drink) => p.id !== parseInt(productId as string));
        setRelatedDrinks(related.slice(0, 4));
        
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handlers
  const handleBrandSelect = (option: { value: string; label: string }) => {
    setSelectedBrand(option.value);
    setSelectedModel("");
  };

  const handleModelSelect = (option: { value: string; label: string }) => {
    setSelectedModel(option.value);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = async (drink: Drink) => {
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

    // Show loading toast
    const loadingToast = toast.loading("Adding to cart...", {
      position: "top-right",
    });

    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : null;

    try {
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "User-Id": userId ? userId : "",
        },
          body: JSON.stringify({
            userId: localStorage.getItem('userId'),
            type: 'product',
            productId: drink.id,
            price: drink.price,
            quantity: quantity ? quantity : 1,
            selectedBrand: selectedBrand,
            selectedModel: selectedModel
          })
      });
      

      const result = await response.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result.success) {
        // Success notification
        toast.success(`✅ ${quantity}x ${drink.name} added to cart!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Navigate to cart after short delay
      } else {
        toast.error(`❌ ${result.message || 'Failed to add to cart'}`, {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      console.error('Error adding to cart:', error);
      toast.error("❌ Network error. Please try again.", {
        position: "top-right",
        autoClose: 4000,
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
  if (error || !drink) {
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
    <div className="bg-[#090701] text-white overflow-hidden min-h-screen">
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

      <div className="overflow-hidden max-w-6xl mx-auto px-6 py-12 -mb-20">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          Home / Products / <span className="text-white">{drink.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Image Section */}
          <div className="self-start lg:w-1/2 bg-[#13120f] p-6 rounded-md">
            <div className="aspect-square rounded-xl overflow-hidden">
              <img
                src={drink.image || Img.src}
                alt={drink.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:w-1/2 space-y-10 text-base leading-relaxed text-white">
            {/* Title & Price */}
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">{drink.name}</h1>
              <span className="text-2xl font-bold text-lime-400">
                ₹{drink.price}
              </span>
            </div>

            {/* Buttons */}
            <div className="sm:flex-row sm:items-center gap-4 w-full">
              {/* Dropdowns + Quantity */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1 mb-4">
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
                  placeholder={
                    selectedBrand ? "Select Model" : "Select Brand First"
                  }
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

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => handleAddToCart(drink)}
                  disabled={!selectedBrand || !selectedModel}
                  className="bg-lime-400 active:scale-95 cursor-pointer text-black px-6 py-2 rounded hover:bg-lime-500 transition font-semibold w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleAddToCart(drink)}
                  disabled={!selectedBrand || !selectedModel}
                  className="relative overflow-hidden border border-white px-6 py-2 rounded font-semibold text-white transition-all duration-800 group w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="font-semibold text-xl">Description</h2>
              <p className="text-gray-300">
                {drink.description || "No description available"}
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1">
                <li>
                  <span className="font-medium text-white">Type:</span>{" "}
                  {drink.type || "N/A"}
                </li>
                <li>
                  <span className="font-medium text-white">Flavor:</span>{" "}
                  {drink.flavor || "N/A"}
                </li>
                <li>
                  <span className="font-medium text-white">Pack Size:</span>{" "}
                  {drink.packSize || "N/A"}
                </li>
              </ul>
            </div>

            {/* Collapsible Sections */}
            <div className="border-t border-[#2a2a2a]">
              {["Shipping", "Reviews"].map((section) => (
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

      <div className="overflow-hidden flex justify-center max-w-full xl:ml-40 mx-auto px-6 py-12">
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mr-2">
            {relatedDrinks.map((d) => (
              <ProductCard key={d.id} drink={d} href={`/specific/${d.id}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
