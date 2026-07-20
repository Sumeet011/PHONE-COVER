"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/homecomponents/Footer";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import IMG from '../../../public/images/models/1/image1_boundary.png'
import CAMERA from '../../../public/images/models/1/image2_components.png'
import html2canvas from 'html2canvas';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  X,
  Download,
  ShoppingCart,
  Loader2,
  ChevronDown,
} from "lucide-react";
import config from "@/config";
import localFont from "next/font/local";
import { PHONE_PREVIEW_CONFIG } from "../../lib/phonepreviewconfig";


const BACKEND_URL = config.API_BASE_URL;


const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

export default function CustomDesignerPage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageTransform, setImageTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [coverPlatesQuantity, setCoverPlatesQuantity] = useState(1);
  const [platesOnlyQuantity, setPlatesOnlyQuantity] = useState(0);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Pricing constants
  const COVER_PLATES_PRICE = 499;
  const PLATES_ONLY_PRICE = 299;

  // State for dynamic phone brands
  const [phoneBrands, setPhoneBrands] = useState([]);
  const [modelsByBrand, setModelsByBrand] = useState({});
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [stockInfo, setStockInfo] = useState({});

  // Fetch phone brands from API
  useEffect(() => {
    const fetchPhoneBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await fetch(`${BACKEND_URL}/api/phone-brands?activeOnly=true`);
        const data = await response.json();

        if (data.success) {
          // Transform API data to use names as values
          const brands = data.data.map(brand => ({
            value: brand.brandName,
            label: brand.brandName
          }));

          const models = {};
          const stock = {};
          
          data.data.forEach(brand => {
            const brandName = brand.brandName;
            stock[brandName] = {};
            
            models[brandName] = brand.models.map(model => {
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
                disabled: !hasStock
              };
            });
          });

          setPhoneBrands(brands);
          setModelsByBrand(models);
          setStockInfo(stock);
        }
      } catch (error) {
        // Fallback to hardcoded brands if API fails
        setPhoneBrands([
          { value: "apple", label: "Apple" },
          { value: "samsung", label: "Samsung" },
          { value: "google", label: "Google" },
          { value: "oneplus", label: "OnePlus" },
          { value: "xiaomi", label: "Xiaomi" },
        ]);
        setModelsByBrand({
          apple: [
            { value: "iphone-16-pro", label: "iPhone 16 Pro" },
            { value: "iphone-16", label: "iPhone 16" },
            { value: "iphone-15-pro", label: "iPhone 15 Pro" },
            { value: "iphone-15", label: "iPhone 15" },
          ],
          samsung: [
            { value: "galaxy-s24", label: "Galaxy S24" },
            { value: "galaxy-s23", label: "Galaxy S23" },
          ],
        });
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchPhoneBrands();
  }, []);

  

  const availableModels = selectedBrand ? modelsByBrand[selectedBrand] || [] : [];
  const phoneConfig =
  PHONE_PREVIEW_CONFIG[selectedModel] ??
  PHONE_PREVIEW_CONFIG["iPhone 16 Pro"];

  // Check if there are any out-of-stock models
  const hasOutOfStockModels = useMemo(() => {
    return availableModels.some(model => model.disabled);
  }, [availableModels]);

  // Calculate max quantities based on stock
  const maxQuantities = useMemo(() => {
    if (!selectedBrand || !selectedModel || !stockInfo[selectedBrand]?.[selectedModel]) {
      return { coverPlates: 10, platesOnly: 20 };
    }

    const stock = stockInfo[selectedBrand][selectedModel];
    
    // Cover+Plates limited by back covers (each needs 1 cover + 2 plates)
    const maxCoverPlates = Math.min(stock.backCovers, Math.floor(stock.aluminumSheets / 2), 10);
    
    // Plates-only limited by aluminum sheets (each needs 2 plates)
    const maxPlatesOnly = Math.min(Math.floor(stock.aluminumSheets / 2), 20);

    return {
      coverPlates: Math.max(0, maxCoverPlates),
      platesOnly: Math.max(0, maxPlatesOnly)
    };
  }, [selectedBrand, selectedModel, stockInfo]);

  // Reset model when brand changes
  useEffect(() => {
    setSelectedModel("");
  }, [selectedBrand]);

  useEffect(() => {
  console.log("selectedModel =", selectedModel);
  console.log("phoneConfig =", PHONE_PREVIEW_CONFIG[selectedModel]);
}, [selectedModel]);
  // Reset quantities when model changes or stock updates
  useEffect(() => {
    if (selectedBrand && selectedModel && stockInfo[selectedBrand]?.[selectedModel]) {
      const stock = stockInfo[selectedBrand][selectedModel];
      
      // Reset cover+plates quantity if exceeds stock
      if (coverPlatesQuantity > maxQuantities.coverPlates) {
        setCoverPlatesQuantity(maxQuantities.coverPlates);
      }
      
      // Reset plates-only quantity if exceeds stock
      if (platesOnlyQuantity > maxQuantities.platesOnly) {
        setPlatesOnlyQuantity(maxQuantities.platesOnly);
      }
    }
  }, [selectedBrand, selectedModel, stockInfo, maxQuantities]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        // Reset transform when new image is uploaded
        setImageTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragStart = (e) => {
    if (!uploadedImage) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imageTransform.x,
      y: e.clientY - imageTransform.y,
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setImageTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setImageTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + 0.1, 3),
    }));
  };

  const handleZoomOut = () => {
    setImageTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - 0.1, 0.5),
    }));
  };

  // Rotation control
  const handleRotate = () => {
    setImageTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  // Reset position
  const handleReset = () => {
    setImageTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
  };

  // Remove image
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
  };

  // Compress image helper function
  const compressImage = (base64Image, maxWidth = 1200, quality = 0.85) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Image;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too large
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  // Capture design as image
  const captureDesignImage = async () => {
    const phoneContainer = document.getElementById("phone-preview");
    if (!phoneContainer) {
      throw new Error("Phone preview container not found");
    }

    try {
      const canvas = await html2canvas(phoneContainer, {
        backgroundColor: null,
        scale: 1.0, // Faster rendering
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Use JPEG with 70% quality for faster upload
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch (error) {
      throw error;
    }
  };

  // Upload image to backend
  const uploadImageToBackend = async (imageData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/custom-design/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
      };

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to upload image");
      }

      return result.data.url;
    } catch (error) {
      throw error;
    }
  };

  // Export design (download as image)
  const handleExportDesign = async () => {
    if (!uploadedImage) {
      //alert("Please upload an image first!");
      return;
    }

    setIsProcessing(true);
    setUploadStatus("Generating preview...");

    try {
      const imageData = await captureDesignImage();
      
      // Create download link
      const link = document.createElement("a");
      link.download = `custom-design-${Date.now()}.png`;
      link.href = imageData;
      link.click();

      setUploadStatus("Download complete!");
      setTimeout(() => setUploadStatus(""), 2000);
    } catch (error) {
      //alert("Failed to export design. Please try again.");
      setUploadStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!uploadedImage) {
      //alert("Please upload an image first!");
      return;
    }

    // Validate brand and model selection
    if (!selectedBrand || !selectedModel) {
      //alert("Please select both phone brand and model!");
      return;
    }

    // Validate that at least one quantity is selected
    if (coverPlatesQuantity === 0 && platesOnlyQuantity === 0) {
      //alert("Please select at least one quantity!");
      return;
    }

    // Check stock availability
    const modelStock = stockInfo[selectedBrand]?.[selectedModel];
    if (modelStock) {
      // Check if adding cover+plates (requires back covers)
      if (coverPlatesQuantity > 0 && modelStock.backCovers < coverPlatesQuantity) {
        //alert(`Insufficient back cover stock. Only ${modelStock.backCovers} available.`);
        setUploadStatus(`❌ Only ${modelStock.backCovers} back covers available`);
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }
      
      // Check if adding plates (requires aluminum sheets)
      const totalPlatesNeeded = (coverPlatesQuantity * 2) + (platesOnlyQuantity * 2); // Each item needs 2 plates
      if (totalPlatesNeeded > 0 && modelStock.aluminumSheets < totalPlatesNeeded) {
        //alert(`Insufficient aluminum sheet stock. Only ${modelStock.aluminumSheets} available.`);
        setUploadStatus(`❌ Only ${modelStock.aluminumSheets} aluminum sheets available`);
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }

      // Check if completely out of stock
      if (modelStock.backCovers === 0 && modelStock.aluminumSheets === 0) {
        setUploadStatus("❌ Selected model is completely out of stock");
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }
    }

    // Check if user is logged in

    const storedUser = localStorage.getItem('USER');
  const Loged = storedUser ? JSON.parse(storedUser).isLogedIn : false;
  const userId = storedUser ? JSON.parse(storedUser).id : null;
  const isLoggedIn = Loged;
    if (!userId) {
      //alert("Please login to add items to cart!");
      window.location.href = "/Auth/Login";
      return;
    }

    setIsProcessing(true);
    setUploadStatus("Processing your design...");

    try {
      // 1. Capture design screenshot immediately
      setUploadStatus("Capturing design...");
      const designImageData = await captureDesignImage();

      // 2. Upload design to Cloudinary
      setUploadStatus("Uploading...");
      const designImageUrl = await uploadImageToBackend(designImageData);

      const brandLabel = phoneBrands.find(b => b.value === selectedBrand)?.label || selectedBrand;
      const modelLabel = availableModels.find(m => m.value === selectedModel)?.label || selectedModel;

      // 3. Add items to cart via API
      const itemsToAdd = [];
      
      // Add cover+plates item if quantity > 0
      if (coverPlatesQuantity > 0) {
        itemsToAdd.push({
          type: "custom-design",
          productId: `custom-cover-plates-${Date.now()}`,
          price: COVER_PLATES_PRICE,
          quantity: coverPlatesQuantity,
          selectedBrand: brandLabel,
          selectedModel: modelLabel,
          collectionType: 'custom',
          productOption: 'cover+plates',
          customDesign: {
            designImageUrl,
            originalImageUrl: uploadedImage,
            phoneModel: `${selectedBrand}-${selectedModel}`,
            transform: imageTransform,
          }
        });
      }

      // Add plates-only item if quantity > 0
      if (platesOnlyQuantity > 0) {
        itemsToAdd.push({
          type: "custom-design",
          productId: `custom-plates-only-${Date.now()}`,
          price: PLATES_ONLY_PRICE,
          quantity: platesOnlyQuantity,
          selectedBrand: brandLabel,
          selectedModel: modelLabel,
          collectionType: 'custom',
          productOption: 'plates-only',
          customDesign: {
            designImageUrl,
            originalImageUrl: uploadedImage,
            phoneModel: `${selectedBrand}-${selectedModel}`,
            transform: imageTransform,
          }
        });
      }

      // Add all items to cart
      setUploadStatus("Adding to cart...");
      let successCount = 0;
      let failedCount = 0;

      for (const item of itemsToAdd) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Id": userId,
            },
            body: JSON.stringify(item),
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Expected JSON, got: ${text}`);
          }

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || "Failed to add to cart");
          }

          successCount++;
        } catch (error) {
          console.error('Failed to add item:', error);
          failedCount++;
        }
      }

      if (successCount > 0) {
        const totalItems = coverPlatesQuantity + platesOnlyQuantity;
        setUploadStatus(`Added ${successCount} custom design${successCount > 1 ? 's' : ''} to cart!`);
        setTimeout(() => setUploadStatus(""), 3000);
      }

      if (failedCount > 0) {
        setUploadStatus(`Warning: ${failedCount} item(s) failed to add`);
      }

    } catch (error) {
      //alert(`Failed to add to cart: ${error.message}`);
      setUploadStatus("");
    } finally {
      setIsProcessing(false);
    }
  };


  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-12 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`${JersyFont.className} text-4xl md:text-6xl  mb-4`}>
            Custom Design 
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your own image and create a personalized phone wrap. Adjust
            the position, size, and rotation to get it perfect.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Phone Preview */}
          <div className="bg-[#131313] rounded-3xl p-8 border border-gray-800">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Preview</h2>
              
              {/* Brand and Model Selection */}
              <div className="space-y-4 pb-10">
                {/* Select Brand */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Select Phone Brand *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#9AE600] appearance-none cursor-pointer"
                    >
                      <option value="">Choose Brand</option>
                      {phoneBrands.map((brand) => (
                        <option key={brand.value} value={brand.value}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Select Model */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Select Phone Model *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={!selectedBrand}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#9AE600] appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedBrand ? "Choose Model" : "Select brand first"}
                      </option>
                      {availableModels.map((model) => (
                        <option 
                          key={model.value} 
                          value={model.value}
                          disabled={model.disabled}
                          className={model.disabled ? 'text-gray-500' : ''}
                        >
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {/* Out of Stock Notice */}
                  {selectedBrand && hasOutOfStockModels && (
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                      <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                      <p className="text-xs text-amber-300">
                        Some models are currently out of stock and cannot be selected.
                      </p>
                    </div>
                  )}
                </div>

                {selectedBrand && selectedModel && (
                  <>
                    <div className="p-3 bg-[#9AE600]/10 border border-[#9AE600]/30 rounded-lg">
                      <p className="text-sm text-[#9AE600]">
                        ✓ Selected: {phoneBrands.find(b => b.value === selectedBrand)?.label} - {availableModels.find(m => m.value === selectedModel)?.label?.replace(' (Out of Stock)', '')}
                      </p>
                    </div>

                    {/* Stock Limitation Warning */}
                    {stockInfo[selectedBrand]?.[selectedModel] && (
                      <>
                        {stockInfo[selectedBrand][selectedModel].backCovers === 0 && (
                          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                            <span className="text-red-400 text-sm mt-0.5">❌</span>
                            <p className="text-xs text-red-300">
                              No back covers available. Only "Plates Only" option can be ordered.
                            </p>
                          </div>
                        )}
                        {stockInfo[selectedBrand][selectedModel].aluminumSheets === 0 && (
                          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                            <span className="text-red-400 text-sm mt-0.5">❌</span>
                            <p className="text-xs text-red-300">
                              No aluminum plates available. This model cannot be ordered at this time.
                            </p>
                          </div>
                        )}
                        {stockInfo[selectedBrand][selectedModel].backCovers > 0 && 
                         stockInfo[selectedBrand][selectedModel].aluminumSheets > 0 &&
                         (maxQuantities.coverPlates < 5 || maxQuantities.platesOnly < 10) && (
                          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                            <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                            <p className="text-xs text-amber-300">
                              Limited stock available. Maximum quantities have been adjusted.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Phone Preview Container */}
            <div className="relative flex items-center justify-center min-h-[600px] bg-white p-15 rounded-2xl overflow-visible">
              <div
                id="phone-preview"
                className="relative w-[300px] h-[640px] rounded-[25px] "
                
              >
                {/* Phone Frame Background Image - z-index: 1 */}
                <img
                  src={phoneConfig.frame.src}
                  alt="Phone Frame"
                  className="absolute inset-0 w-full h-full object-cover rounded-[25px] pointer-events-none z-1"
                  style={{zIndex: 20 }}
                />

                

                

                {/* Design Area - User uploaded image - z-index: 10 */}
                <div 
                  className="absolute inset-0 overflow-hidden cursor-move rounded-[40px] border-5"
                  style={{  zIndex: 10 }}
                  onMouseDown={handleDragStart}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Custom design"
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                      style={{
                        transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale}) rotate(${imageTransform.rotation}deg)`,
                        transformOrigin: "center",
                      }}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                  
                    </div>
                  )}
                </div>

                {/* Camera Module - Top layer - z-index: 50 */}
                <div className={phoneConfig.cameraClass}
                     style={{ zIndex: 20 }}>
                  <img
                  
    src={phoneConfig.camera.src}
                    alt="iPhone Camera Module"
                    className="w-full h-full object-cover "
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-[#9AE600]/10 border border-[#9AE600]/30 rounded-lg p-4">
              <h3 className="text-[#9AE600] font-semibold mb-2">
                Design Tips:
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Select your phone brand and model first</li>
                <li>• Upload high-resolution images (300 DPI recommended)</li>
                <li>• Drag the image to reposition it on the phone</li>
                <li>• Use zoom controls to adjust size</li>
                <li>• Your design wraps around the entire phone</li>
              </ul>
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-[#131313] rounded-3xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6">Upload Your Design</h2>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#9AE600] text-black font-semibold py-4 rounded-xl hover:bg-[#8BD600] transition-colors flex items-center justify-center gap-3"
              >
                <Upload className="w-5 h-5" />
                Choose Image
              </button>

              {uploadedImage && (
                <div className="mt-4 p-4 bg-[#0a0a0a] rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Image uploaded successfully
                    </span>
                    <button
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-400">
                <p className="mb-2">Supported formats:</p>
                <p>JPG, PNG, SVG, PDF (max 50MB)</p>
              </div>
            </div>

            {/* Transform Controls */}
            <div className="bg-[#131313] rounded-3xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6">Adjust Design</h2>

              {/* Zoom Controls */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">
                  Zoom: {Math.round(imageTransform.scale * 100)}%
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={handleZoomOut}
                    disabled={!uploadedImage}
                    className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 hover:border-[#9AE600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ZoomOut className="w-5 h-5" />
                    Zoom Out
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={!uploadedImage}
                    className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 hover:border-[#9AE600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ZoomIn className="w-5 h-5" />
                    Zoom In
                  </button>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={imageTransform.scale}
                  onChange={(e) =>
                    setImageTransform((prev) => ({
                      ...prev,
                      scale: parseFloat(e.target.value),
                    }))
                  }
                  disabled={!uploadedImage}
                  className="w-full mt-3 accent-[#9AE600]"
                />
              </div>

              {/* Position Controls */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleRotate}
                    disabled={!uploadedImage}
                    className="bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 hover:border-[#9AE600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    Rotate
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={!uploadedImage}
                    className="bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 hover:border-[#9AE600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Move className="w-5 h-5" />
                    Reset
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Drag the image on the phone to reposition
                </p>
              </div>

              {/* Manual Position Adjustment */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Horizontal: {imageTransform.x}px
                  </label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={imageTransform.x}
                    onChange={(e) =>
                      setImageTransform((prev) => ({
                        ...prev,
                        x: parseInt(e.target.value),
                      }))
                    }
                    disabled={!uploadedImage}
                    className="w-full accent-[#9AE600]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Vertical: {imageTransform.y}px
                  </label>
                  <input
                    type="range"
                    min="-300"
                    max="300"
                    value={imageTransform.y}
                    onChange={(e) =>
                      setImageTransform((prev) => ({
                        ...prev,
                        y: parseInt(e.target.value),
                      }))
                    }
                    disabled={!uploadedImage}
                    className="w-full accent-[#9AE600]"
                  />
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="bg-[#131313] rounded-3xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6">Select Quantity</h2>
              
              <div className="space-y-4">
                {/* Cover + Plates Option */}
                <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">Cover + Plates</div>
                      <div className="text-sm text-gray-400 mt-1">Complete phone wrap set</div>
                      <div className="text-xl text-[#9AE600] font-bold mt-2">₹{COVER_PLATES_PRICE}</div>
                    </div>
                    <QuantitySelector
                      initialValue={coverPlatesQuantity}
                      min={0}
                      max={maxQuantities.coverPlates}
                      onChange={(value) => setCoverPlatesQuantity(value)}
                    />
                  </div>
                </div>

                {/* Plates Only Option */}
                <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">Plates Only</div>
                      <div className="text-sm text-gray-400 mt-1">Replacement plates without cover</div>
                      <div className="text-xl text-[#9AE600] font-bold mt-2">₹{PLATES_ONLY_PRICE}</div>
                    </div>
                    <QuantitySelector
                      initialValue={platesOnlyQuantity}
                      min={0}
                      max={maxQuantities.platesOnly}
                      onChange={(value) => setPlatesOnlyQuantity(value)}
                    />
                  </div>
                </div>

                {/* Total Price Display */}
                <div className="bg-[#9AE600]/10 border border-[#9AE600]/30 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-lg">Total Price:</span>
                    <span className="text-3xl font-bold text-[#9AE600]">
                      ₹{(coverPlatesQuantity * COVER_PLATES_PRICE) + (platesOnlyQuantity * PLATES_ONLY_PRICE)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#131313] rounded-3xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6">Finalize Design</h2>

              {/* Status Message */}
              {uploadStatus && (
                <div className="mb-4 p-3 bg-[#9AE600]/10 border border-[#9AE600]/30 rounded-lg">
                  <p className="text-sm text-[#9AE600] text-center flex items-center justify-center gap-2">
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {uploadStatus}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleExportDesign}
                  disabled={!uploadedImage || isProcessing}
                  className="w-full bg-white/10 border border-gray-700 text-white font-semibold py-4 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Preview
                    </>
                  )}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={!uploadedImage || !selectedBrand || !selectedModel || (coverPlatesQuantity === 0 && platesOnlyQuantity === 0) || isProcessing}
                  className="w-full bg-[#9AE600] text-black font-semibold py-4 rounded-xl hover:bg-[#8BD600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart - ₹{(coverPlatesQuantity * COVER_PLATES_PRICE) + (platesOnlyQuantity * PLATES_ONLY_PRICE)}
                    </>
                  )}
                </button>

                {/* Validation Message */}
                {(!selectedBrand || !selectedModel) && (
                  <p className="text-sm text-amber-400 text-center">
                    ⚠️ Please select phone brand and model to continue
                  </p>
                )}
                {!uploadedImage && selectedBrand && selectedModel && (
                  <p className="text-sm text-amber-400 text-center">
                    ⚠️ Please upload a design image to continue
                  </p>
                )}
                {uploadedImage && selectedBrand && selectedModel && (coverPlatesQuantity === 0 && platesOnlyQuantity === 0) && (
                  <p className="text-sm text-amber-400 text-center">
                    ⚠️ Please select at least one quantity to continue
                  </p>
                )}
              </div>

              <div className="mt-6 p-4 bg-[#9AE600]/10 border border-[#9AE600]/30 rounded-lg">
                <p className="text-sm text-gray-300">
                  <span className="text-[#9AE600] font-semibold">Note:</span>{" "}
                  Your custom design will be reviewed by our team to ensure
                  print quality before production.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-[#131313] rounded-2xl p-6 border border-gray-800 text-center">
            <div className="w-12 h-12 bg-[#9AE600]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-[#9AE600]" />
            </div>
            <h3 className="font-bold mb-2">Easy Upload</h3>
            <p className="text-sm text-gray-400">
              Simply drag and drop or browse for your image
            </p>
          </div>

          <div className="bg-[#131313] rounded-2xl p-6 border border-gray-800 text-center">
            <div className="w-12 h-12 bg-[#9AE600]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Move className="w-6 h-6 text-[#9AE600]" />
            </div>
            <h3 className="font-bold mb-2">Full Control</h3>
            <p className="text-sm text-gray-400">
              Adjust position, size, and rotation precisely
            </p>
          </div>

          <div className="bg-[#131313] rounded-2xl p-6 border border-gray-800 text-center">
            <div className="w-12 h-12 bg-[#9AE600]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-[#9AE600]" />
            </div>
            <h3 className="font-bold mb-2">Preview & Export</h3>
            <p className="text-sm text-gray-400">
              See exactly how it looks before ordering
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
