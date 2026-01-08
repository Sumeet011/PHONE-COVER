'use client'
import React from "react";
import { useRouter } from "next/navigation";

const OrderSummary = ({
  cartItems = [],
  subtotal,
  shipping,
  appliedCoupons = [],
  totalDiscountAmount = 0,
  totalCost,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  handleRemoveCoupon,
  showActions = true,
  showCheckout = true,
}) => {
 

  const router = useRouter();
  const handleCheckout = () => {
    // Save coupon data to localStorage for checkout page
    const checkoutData = {
      appliedCoupons: appliedCoupons,
      timestamp: Date.now()
    };
    localStorage.setItem('checkoutCoupon', JSON.stringify(checkoutData));
    
    // Navigate to checkout
    router.push('/Checkout');
  };

  return (
    <div className="w-full lg:w-1/3 bg-[#131313] p-6 rounded-lg h-fit cursor-pointer">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      {/* Cart Items Preview */}
      {cartItems && cartItems.length > 0 && (
        <div className="mb-4 max-h-40 overflow-y-auto border-b border-gray-700 pb-3 space-y-2">
          {cartItems.map((item, index) => {
            const itemPrice = item.price * item.quantity;
            const platePrice = item.plateTotalPrice || 0;
            const totalItemPrice = itemPrice + platePrice;
            
            return (
              <div key={item._id || index} className="flex justify-between items-start text-sm">
                <div className="flex-1 pr-2">
                  <p className="text-white truncate font-medium">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.packSize}</p>
                  {item.isGamingCollection && item.plateQuantity > 0 && (
                    <p className="text-blue-400 text-xs">+{item.plateQuantity} Plate{item.plateQuantity > 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white">x{item.quantity}</p>
                  <p className="text-gray-400 text-xs">₹{totalItemPrice.toFixed(2)}</p>
                  {item.isGamingCollection && platePrice > 0 && (
                    <p className="text-blue-400 text-xs">+₹{platePrice.toFixed(2)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="flex justify-between py-2 border-b border-gray-700">
        <p>Items</p>
        <p>₹{subtotal.toFixed(2)}</p>
      </div>
      <div className="flex justify-between py-2 border-b border-gray-700">
        <p>Shipping</p>
        <p>₹{shipping.toFixed(2)}</p>
      </div>

      {/* Promo Code */}
      {showActions && (
        <div className="py-4">
          <label className="block mb-2">Promo Code</label>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter your code"
              className="w-full p-2 bg-gray-800 text-white border border-gray-600 focus:border-lime-600 outline-none rounded"
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-lime-400 hover:bg-lime-400/80 cursor-pointer px-4 py-2 rounded text-black font-bold whitespace-nowrap"
            >
              Apply
            </button>
          </div>
          
          {/* Applied Coupons List */}
          {appliedCoupons && appliedCoupons.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-green-400">Applied Coupons:</p>
              {appliedCoupons.map((coupon, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{coupon.code}</p>
                    <p className="text-xs text-gray-400">{coupon.discountPercentage}% off • -₹{coupon.discountAmount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveCoupon(coupon.code)}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs text-white font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discount */}
      {appliedCoupons && appliedCoupons.length > 0 && (
        <div className="flex justify-between text-sm text-green-400 pb-2">
          <p>Total Discount ({appliedCoupons.length} coupon{appliedCoupons.length > 1 ? 's' : ''})</p>
          <p>- ₹{totalDiscountAmount.toFixed(2)}</p>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between text-lg font-bold mt-4 mb-2">
        <p>Total Cost</p>
        <p>₹{totalCost.toFixed(2)}</p>
      </div>

      {showCheckout && (
        <button
          onClick={handleCheckout}
          className="w-full bg-[#EE440E] cursor-pointer hover:bg-[#EE440E]/80 py-3 rounded text-white font-bold mt-4"
        >
          Checkout
        </button>
      )}
    </div>
  );
};

export default OrderSummary;