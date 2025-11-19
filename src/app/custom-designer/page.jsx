"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/homeCards/Footer";
import IMG from '../../../public/images/phone.png'
import CAMERA from '../../../public/images/camera.png'
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Phone brand options
  const phoneBrands = useMemo(
    () => [
      { value: "apple", label: "Apple" },
      { value: "samsung", label: "Samsung" },
      { value: "google", label: "Google" },
      { value: "oneplus", label: "OnePlus" },
      { value: "xiaomi", label: "Xiaomi" },
    ],
    []
  );

  // Phone models by brand
  const modelsByBrand = useMemo(
    () => ({
      apple: [
        { value: "iphone-16-pro", label: "iPhone 16 Pro" },
        { value: "iphone-16", label: "iPhone 16" },
        { value: "iphone-15-pro", label: "iPhone 15 Pro" },
        { value: "iphone-15", label: "iPhone 15" },
        { value: "iphone-14-pro", label: "iPhone 14 Pro" },
        { value: "iphone-14", label: "iPhone 14" },
        { value: "iphone-13", label: "iPhone 13" },
      ],
      samsung: [
        { value: "galaxy-s24", label: "Galaxy S24" },
        { value: "galaxy-s23", label: "Galaxy S23" },
        { value: "galaxy-s22", label: "Galaxy S22" },
        { value: "galaxy-a54", label: "Galaxy A54" },
      ],
      google: [
        { value: "pixel-8-pro", label: "Pixel 8 Pro" },
        { value: "pixel-8", label: "Pixel 8" },
        { value: "pixel-7-pro", label: "Pixel 7 Pro" },
        { value: "pixel-7", label: "Pixel 7" },
      ],
      oneplus: [
        { value: "oneplus-12", label: "OnePlus 12" },
        { value: "oneplus-11", label: "OnePlus 11" },
        { value: "oneplus-10-pro", label: "OnePlus 10 Pro" },
      ],
      xiaomi: [
        { value: "mi-14", label: "Mi 14" },
        { value: "mi-13", label: "Mi 13" },
        { value: "redmi-note-13", label: "Redmi Note 13" },
      ],
    }),
    []
  );

  const availableModels = selectedBrand ? modelsByBrand[selectedBrand] || [] : [];

  // Reset model when brand changes
  useEffect(() => {
    setSelectedModel("");
  }, [selectedBrand]);

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

  // Capture design as image
  const captureDesignImage = async () => {
    const phoneContainer = document.getElementById("phone-preview");
    if (!phoneContainer) {
      throw new Error("Phone preview container not found");
    }

    try {
      const canvas = await html2canvas(phoneContainer, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error capturing design:", error);
      throw error;
    }
  };

  // Upload image to backend
  const uploadImageToBackend = async (imageData) => {
    try {
      console.log("Uploading to:", `${BACKEND_URL}/custom-design/upload`);
      const response = await fetch(`${BACKEND_URL}/custom-design/upload`, {
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
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(`Backend API not responding correctly. Make sure backend is running on http://localhost:3000`);
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to upload image");
      }

      return result.data.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Export design (download as image)
  const handleExportDesign = async () => {
    if (!uploadedImage) {
      alert("Please upload an image first!");
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
      console.error("Export error:", error);
      alert("Failed to export design. Please try again.");
      setUploadStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!uploadedImage) {
      alert("Please upload an image first!");
      return;
    }

    // Validate brand and model selection
    if (!selectedBrand || !selectedModel) {
      alert("Please select both phone brand and model!");
      return;
    }

    // Check if user is logged in

    const storedUser = localStorage.getItem('USER');
  const Loged = storedUser ? JSON.parse(storedUser).isLogedIn : false;
  const userId = storedUser ? JSON.parse(storedUser).id : null;
  const isLoggedIn = Loged;
    if (!userId) {
      alert("Please login to add items to cart!");
      window.location.href = "/Auth/Login";
      return;
    }

    setIsProcessing(true);
    setUploadStatus("Processing your design...");

    try {
      // 1. Capture the design image
      setUploadStatus("Capturing design...");
      const designImageData = await captureDesignImage();

      // 2. Upload design image to Cloudinary
      setUploadStatus("Uploading design...");
      const designImageUrl = await uploadImageToBackend(designImageData);

      // 3. Upload original image if it's a file (not already a URL)
      let originalImageUrl = "";
      if (uploadedImage && uploadedImage.startsWith("data:")) {
        setUploadStatus("Uploading original image...");
        originalImageUrl = await uploadImageToBackend(uploadedImage);
      } else {
        originalImageUrl = uploadedImage;
      }

      // 4. Add to cart via API
      setUploadStatus("Adding to cart...");
      const response = await fetch(`${BACKEND_URL}/custom-design/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Id": userId,
        },
        body: JSON.stringify({
          designImageUrl,
          originalImageUrl,
          phoneModel: `${selectedBrand}-${selectedModel}`,
          selectedBrand: phoneBrands.find(b => b.value === selectedBrand)?.label || selectedBrand,
          selectedModel: availableModels.find(m => m.value === selectedModel)?.label || selectedModel,
          transform: imageTransform,
          price: 499,
          quantity: 1,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error(`Server error: Expected JSON but got ${contentType}. Is the backend server running on port 3000?`);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add to cart");
      }

      setUploadStatus("Added to cart successfully!");
      
      // Show success message
      alert(`Custom design added to cart!\nTotal items: ${result.data.itemCount}\nTotal: ₹${result.data.total}`);
      
      // Optionally redirect to cart
      setTimeout(() => {
        if (confirm("Would you like to view your cart?")) {
          window.location.href = "/mycart";
        }
        setUploadStatus("");
      }, 1000);

    } catch (error) {
      console.error("Add to cart error:", error);
      alert(`Failed to add to cart: ${error.message}`);
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

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Custom Design Studio
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
              <div className="space-y-4">
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
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {selectedBrand && selectedModel && (
                  <div className="p-3 bg-[#9AE600]/10 border border-[#9AE600]/30 rounded-lg">
                    <p className="text-sm text-[#9AE600]">
                      ✓ Selected: {phoneBrands.find(b => b.value === selectedBrand)?.label} - {availableModels.find(m => m.value === selectedModel)?.label}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Preview Container */}
            <div className="relative flex items-center justify-center min-h-[600px] overflow-visible">
              <div
                id="phone-preview"
                className="relative w-[320px] h-[650px] rounded-[50px] shadow-2xl"
                style={{ 
                  boxShadow: "0 0 60px rgba(0, 0, 0, 0.5)" 
                }}
              >
                {/* Phone Frame Background Image - z-index: 1 */}
                <img
                  src={IMG.src}
                  alt="Phone Frame"
                  className="absolute inset-0 w-full h-full object-cover rounded-[50px] pointer-events-none"
                  style={{ zIndex: 1 }}
                />

                

                

                {/* Design Area - User uploaded image - z-index: 10 */}
                <div
                  className="absolute inset-0 overflow-hidden cursor-move rounded-[50px]"
                  style={{ margin: '5px', zIndex: 10 }}
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
                <div className="absolute top-8 left-8 w-[154px] h-[160px] pointer-events-none rounded-[35px] overflow-hidden  " 
                     style={{ zIndex: 20 }}>
                  <img
                    src={CAMERA.src}
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

            {/* Price Display */}
            <div className="mt-4 p-4 bg-black/40 border border-[#9AE600] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Custom Design Price:</span>
                <span className="text-2xl font-bold text-[#9AE600]">₹499</span>
              </div>
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
                  disabled={!uploadedImage || !selectedBrand || !selectedModel || isProcessing}
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
                      Add to Cart - ₹499
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
