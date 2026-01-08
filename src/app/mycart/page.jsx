'use client'
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import OrderSummary from "../../components/orderSummary";
import Navbar from "../../components/navbar/Navbar";
import localFont from "next/font/local";
import {useRouter} from 'next/navigation';
import { toast } from "react-toastify";

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

const CartPage = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [showTooltip, setShowTooltip] = useState(null);
  const [tooltips, setTooltips] = useState([]);

  // Fetch cart items on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCartItems();
    fetchTooltips();
  }, []);

  const fetchTooltips = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/collection-tooltips`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setTooltips(data.data.tooltips);
      }
    } catch (error) {
      console.error('Error fetching tooltips:', error);
      // Set default tooltips if fetch fails
      setTooltips([
        {
          quantity: 1,
          title: "⚠ Just Starting",
          message: "Buy 5 cards to unlock the complete collection. Otherwise, a random card will be delivered."
        },
        {
          quantity: 2,
          title: "⚠ Making Progress",
          message: "Buy 3 more to unlock the complete collection. Otherwise, a random card will be delivered."
        },
        {
          quantity: 3,
          title: "⚠ Halfway There!",
          message: "Buy 2 more to unlock the complete collection. Otherwise, a random card will be delivered."
        },
        {
          quantity: 4,
          title: "⚠ Almost Complete",
          message: "Buy 1 more to unlock the complete collection. Otherwise, a random card will be delivered."
        },
        {
          quantity: 5,
          title: "✓ Complete Collection!",
          message: "You will receive all 5 cards from this collection."
        }
      ]);
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      
    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        toast.error("Please refresh the page");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': userId
        }
      });

      const result = await response.json();

      if (result.success) {
        console.log('Raw cart items from backend:', result.data.items);
        console.log('Checking plate data for collections:', result.data.items.filter(i => i.type === 'collection').map(i => ({
          name: i.productDetails?.name,
          type: i.productDetails?.type,
          plateQuantity: i.plateQuantity,
          platePrice: i.platePrice,
          productDetailsPlatePrice: i.productDetails?.plateprice
        })));
        
        // Load applied coupons from cart
        if (result.data.appliedCoupons) {
          setAppliedCoupons(result.data.appliedCoupons);
        }
        
        // Log items with missing product details or issues
        result.data.items.forEach(item => {
          if (!item.productDetails && item.type !== 'custom-design') {
            console.warn(`⚠️ Missing productDetails for ${item.type}:`, {
              type: item.type,
              productId: item.productId,
              _id: item._id
            });
          }
          if (item.type === 'custom-design' && !item.customDesign?.designImageUrl && !item.customDesign?.originalImageUrl) {
            console.warn(`⚠️ Custom design has no image:`, {
              productId: item.productId,
              _id: item._id,
              customDesign: item.customDesign
            });
          }
          // Warn if products/collections have customDesign populated (shouldn't happen)
          if ((item.type === 'product' || item.type === 'collection') && item.customDesign) {
            console.warn(`⚠️ Non-custom item has customDesign object:`, {
              type: item.type,
              productId: item.productId,
              customDesign: item.customDesign
            });
          }
        });
        
        // Transform cart items to match your component structure
        const transformedItems = result.data.items.map(item => {
          // SVG placeholder for missing images
          const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
          
          // Handle custom design items
          if (item.type === 'custom-design') {
            return {
              _id: item._id,
              productId: item.productId, // Changed from 'id' to 'productId'
              id: item.productId, // Keep for backward compatibility
              name: 'Custom Design',
              packSize: `${item.selectedBrand} - ${item.selectedModel}`,
              price: item.price,
              quantity: item.quantity,
              image: item.customDesign?.designImageUrl || item.customDesign?.originalImageUrl || placeholderImage,
              selectedBrand: item.selectedBrand,
              selectedModel: item.selectedModel,
              type: item.type,
              customDesign: item.customDesign
            };
          }
          
          // Handle collection items
          if (item.type === 'collection') {
            const isGamingCollection = item.productDetails?.type === 'gaming';
            const plateCount = item.plateQuantity || 0;
            const platePrice = item.platePrice || 0;
            
            return {
              _id: item._id,
              productId: item.productId,
              id: item.productId,
              name: item.productDetails?.name || 'Collection',
              packSize: `${item.selectedBrand} - ${item.selectedModel}`,
              price: item.price,
              quantity: item.quantity,
              image: item.productDetails?.heroImage || item.productDetails?.image || placeholderImage,
              selectedBrand: item.selectedBrand,
              selectedModel: item.selectedModel,
              type: item.type,
              collectionName: item.productDetails?.name || 'Collection',
              isGamingCollection,
              plateQuantity: plateCount,
              platePrice: platePrice,
              plateTotalPrice: plateCount * platePrice
            };
          }
          
          // Handle regular product items
          return {
            _id: item._id,
            productId: item.productId,
            id: item.productId,
            name: item.productDetails?.name || 'Product',
            packSize: `${item.selectedBrand} - ${item.selectedModel}`,
            price: item.price,
            quantity: item.quantity,
            image: item.productDetails?.image || placeholderImage,
            selectedBrand: item.selectedBrand,
            selectedModel: item.selectedModel,
            type: item.type
          };
        });

        setCartItems(transformedItems);
      } else {
        toast.error(result.message || "Failed to load cart",{
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error("Failed to load cart",{
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, delta) => {
    const item = cartItems.find(i => i._id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    
    // If quantity becomes 0 or less, remove the item
    if (newQuantity < 1) {
      await handleRemoveItem(itemId, item.id);
      return;
    }

    // For gaming collections, ensure plates >= cards
    let newPlateQuantity = item.plateQuantity;
    if (item.isGamingCollection && newPlateQuantity < newQuantity) {
      newPlateQuantity = newQuantity;
    }

    try {
      
          const userData = localStorage.getItem('USER');
          const userId = userData ? JSON.parse(userData).id : null;
      
      const response = await fetch(`${BACKEND_URL}/api/cart/update/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': userId
        },
        body: JSON.stringify({ 
          quantity: newQuantity,
          plateQuantity: newPlateQuantity
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setCartItems(prevItems =>
          prevItems.map(i =>
            i._id === itemId ? { 
              ...i, 
              quantity: newQuantity,
              plateQuantity: newPlateQuantity,
              plateTotalPrice: newPlateQuantity * (i.platePrice || 0)
            } : i
          )
        );
        toast.success("Cart updated", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(result.message || "Failed to update cart", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error("Failed to update quantity", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handlePlateQuantityChange = async (itemId, delta) => {
    const item = cartItems.find(i => i._id === itemId);
    if (!item) return;

    const newPlateQuantity = (item.plateQuantity || 0) + delta;
    
    // Plates must be >= cards
    if (newPlateQuantity < item.quantity) {
      toast.warning(`Plate quantity must be at least ${item.quantity} (card count)`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      const userData = localStorage.getItem('USER');
      const userId = userData ? JSON.parse(userData).id : null;
      
      const response = await fetch(`${BACKEND_URL}/api/cart/update/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': userId
        },
        body: JSON.stringify({ 
          quantity: item.quantity,
          plateQuantity: newPlateQuantity
        })
      });

      const result = await response.json();

      if (result.success) {
        setCartItems(prevItems =>
          prevItems.map(i =>
            i._id === itemId ? { 
              ...i, 
              plateQuantity: newPlateQuantity,
              plateTotalPrice: newPlateQuantity * (i.platePrice || 0)
            } : i
          )
        );
        toast.success("Plate quantity updated", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(result.message || "Failed to update plate quantity", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error updating plate quantity:', error);
      toast.error("Failed to update plate quantity", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleRemoveItem = async (itemId, productId) => {
    try {
      
    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : null;
      
      const response = await fetch(`${BACKEND_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'User-Id': userId
        }
      });

      const result = await response.json();

      if (result.success) {
        setCartItems(prevItems => prevItems.filter(i => i._id !== itemId));
        toast.success("Item removed from cart");
      } else {
        toast.error(result.message || "Failed to remove item");
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {

    try {
      
    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : null;
      
      const response = await fetch(`${BACKEND_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'User-Id': userId
        }
      });

      const result = await response.json();

      if (result.success) {
        setCartItems([]);
        setAppliedCoupons([]);
        toast.success("Cart cleared");
      } else {
        toast.error(result.message || "Failed to clear cart");
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error("Failed to clear cart");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    // Get userId first and validate
    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : null;
    
    if (!userId) {
      toast.error("Please login to apply coupons");
      return;
    }

    try {
      // First validate the coupon
      const validateResponse = await fetch(`${BACKEND_URL}/api/coupon/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: couponCode.toUpperCase(),
          orderAmount: subtotal,
          appliedCoupons: appliedCoupons
        })
      });

      const validateResult = await validateResponse.json();

      if (validateResult.success) {
        // Apply coupon to cart in backend
        const applyResponse = await fetch(`${BACKEND_URL}/api/cart/coupon/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Id': userId
          },
          body: JSON.stringify({
            code: validateResult.coupon.code,
            discountPercentage: validateResult.coupon.discountPercentage,
            discountAmount: validateResult.coupon.discountAmount
          })
        });

        const applyResult = await applyResponse.json();
        
        if (applyResult.success) {
          setAppliedCoupons(applyResult.data.appliedCoupons);
          setCouponCode('');
          toast.success(`Coupon applied! ${validateResult.coupon.discountPercentage}% off`);
        } else {
          toast.error(applyResult.message || "Failed to apply coupon");
        }
      } else {
        toast.error("Invalid coupon");
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error("Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = async (couponCode) => {
    try {
      const userData = localStorage.getItem('USER');
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (userId) {
        const response = await fetch(`${BACKEND_URL}/api/cart/coupon/remove/${couponCode}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'User-Id': userId
          }
        });

        const result = await response.json();
        
        if (result.success) {
          setAppliedCoupons(result.data.appliedCoupons);
          toast.info("Coupon removed");
        } else {
          toast.error(result.message || "Failed to remove coupon");
        }
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
      toast.error("Failed to remove coupon");
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => {
    const itemTotal = item.price * item.quantity;
    const plateTotal = (item.plateTotalPrice || 0);
    return acc + itemTotal + plateTotal;
  }, 0);
  const shipping = subtotal > 0 ? 5 : 0;
  const totalDiscountAmount = appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);
  const totalCost = subtotal - totalDiscountAmount + shipping;

  if (loading) {
    return (
      <div className="bg-[#090701] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#090701] h-screen overflow-x-hidden">
      <Navbar />
      <div className="min-h-screen text-white px-4 md:px-12 py-8">
        <h1
          className={`${JersyFont.className} text-[#9AE600] text-4xl font-bold mb-8 tracking-[1px]`}
        >
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400 mb-6">Your cart is empty</p>
            <button
              onClick={() => router.push('/All')}
              className="bg-[#9AE600] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#8BD500] transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="flex-1 bg-[#131313] p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl font-semibold">{totalItems} Items</p>
                <button
                  className="text-red-500 cursor-pointer hover:underline text-sm"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-4 border-b border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    {item.image && item.image.startsWith('http') ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : null}
                    <div 
                      className="w-20 h-20 bg-[#333] rounded flex items-center justify-center text-[#666] text-xs"
                      style={{ display: item.image && item.image.startsWith('http') ? 'none' : 'flex' }}
                    >
                      No Image
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.packSize.split('-').slice(1).join('-')}</p>
                      
                      <div className="mt-1 flex items-center gap-1 flex-wrap">
                        {item.type === 'collection' && (
                          <span className="text-xs text-[#9AE600] bg-[#9AE600]/20 px-2 py-0.5 rounded">
                            Collection
                          </span>
                        )}
                        {item.isGamingCollection && item.plateQuantity > 0 && (
                          <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-0.5 rounded">
                            +{item.plateQuantity} Plate{item.plateQuantity > 1 ? 's' : ''}
                          </span>
                        )}
                        {item.type === 'custom-design' && (
                          <span className="text-xs text-purple-400 bg-purple-400/20 px-2 py-0.5 rounded">
                            Custom Design
                          </span>
                        )}
                      </div>
                      
                      {/* Show plate price breakdown for gaming collections */}
                      {item.isGamingCollection && item.plateQuantity > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Cards: ₹{item.price} | Plates: ₹{item.platePrice} × {item.plateQuantity}
                        </p>
                      )}
                      
                      <button
                        className="text-red-500 cursor-pointer text-sm mt-1 hover:underline"
                        onClick={() => handleRemoveItem(item._id, item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:ml-auto">
                    {/* Card Quantity Controls */}
                    <div className="flex flex-col gap-1">
                      {item.isGamingCollection && (
                        <span className="text-xs text-gray-400 text-right">Cards:</span>
                      )}
                      <div className="flex items-center gap-2 justify-start sm:justify-end">
                        <button
                          className="w-8 h-8 cursor-pointer bg-gray-800 hover:bg-gray-700 rounded"
                          onClick={() => handleQuantityChange(item._id, -1)}
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          className="w-8 h-8 cursor-pointer bg-gray-800 hover:bg-gray-700 rounded"
                          onClick={() => handleQuantityChange(item._id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Plate Quantity Controls (Gaming Collections Only) */}
                    {item.isGamingCollection && item.plateQuantity > 0 && (
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs text-gray-400 text-right">Plates:</span>
                        <div className="flex items-center gap-2 justify-start sm:justify-end">
                          <button
                            className="w-8 h-8 cursor-pointer bg-gray-800 hover:bg-gray-700 rounded"
                            onClick={() => handlePlateQuantityChange(item._id, -1)}
                          >
                            -
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">{item.plateQuantity}</span>
                          <button
                            className="w-8 h-8 cursor-pointer bg-gray-800 hover:bg-gray-700 rounded"
                            onClick={() => handlePlateQuantityChange(item._id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Collection Progress Bar (only for collection type) */}
                    {item.type === 'collection' && (
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  item.quantity >= 5 ? 'bg-[#9AE600]' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.min((item.quantity / 5) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <button
                              className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-xs flex items-center justify-center hover:bg-gray-700 cursor-help"
                              onMouseEnter={() => setShowTooltip(item._id)}
                              onMouseLeave={() => setShowTooltip(null)}
                              onClick={() => setShowTooltip(showTooltip === item._id ? null : item._id)}
                            >
                              i
                            </button>
                            {showTooltip === item._id && (
                              <div className="absolute right-0 top-6 z-10 w-64 bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-lg">
                                <p className="text-white leading-relaxed">
                                  {(() => {
                                    const quantity = Math.min(item.quantity, 5);
                                    const tooltip = tooltips.find(t => t.quantity === quantity);
                                    
                                    if (tooltip) {
                                      return (
                                        <>
                                          <span className={`font-semibold ${item.quantity >= 5 ? 'text-[#9AE600]' : 'text-yellow-500'}`}>
                                            {tooltip.title}
                                          </span>
                                          <br />
                                          {tooltip.message}
                                        </>
                                      );
                                    }
                                    
                                    // Fallback if tooltips not loaded
                                    return item.quantity >= 5 ? (
                                      <>
                                        <span className="text-[#9AE600] font-semibold">✓ Complete Collection!</span>
                                        <br />
                                        You will receive all 5 cards from this collection.
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-yellow-500 font-semibold">⚠ Incomplete Collection</span>
                                        <br />
                                        Buy 5 cards to unlock the complete collection. 
                                        Otherwise, a random card will be delivered.
                                      </>
                                    );
                                  })()}
                                </p>
                                <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-800 border-l border-t border-gray-600 transform rotate-45" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${item.quantity >= 5 ? 'text-[#9AE600]' : 'text-gray-400'}`}>
                            {item.quantity}/5 cards
                          </span>
                          {item.quantity >= 5 ? (
                            <span className="text-[#9AE600] font-semibold">✓ Complete</span>
                          ) : (
                            <span className="text-yellow-500">{5 - item.quantity} more needed</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-right mt-2">
                      <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                      {item.isGamingCollection && item.plateQuantity > 0 && (
                        <p className="text-xs text-blue-400">
                          +₹{item.plateTotalPrice.toFixed(2)} plates
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        Total: ₹{((item.price * item.quantity) + (item.plateTotalPrice || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Debug: Log cart items before passing to OrderSummary */}
            {console.log('🛒 CartItems in mycart before OrderSummary:', cartItems)}
            {console.log('🎨 CustomDesign items:', cartItems.filter(i => i.type === 'custom-design'))}
            {console.log('🎟️ Applied coupons in mycart:', appliedCoupons)}

            {/* Order Summary */}
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              appliedCoupons={appliedCoupons}
              totalDiscountAmount={totalDiscountAmount}
              totalCost={totalCost}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
              showActions={true}
              showCheckout={true}
            />
          </div>
        )}

        <div className="mt-6 cursor-pointer hover:text-[#9AE600] transition" onClick={() => router.push('/All')}>
          ← Continue Shopping
        </div>
      </div>
    </div>
  );
};

export default CartPage;