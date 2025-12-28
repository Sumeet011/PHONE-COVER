'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import OrderSummary from "../../components/orderSummary";
import PersonDetails from "../../components/PersonDetailes";
import Navbar from "../../components/navbar/Navbar";


// Define CartItem type
interface CartItem {
  _id: string;
  productId: string;
  name: string;
  packSize: string;
  price: number;
  quantity: number;
  image: string;
  selectedBrand: string;
  selectedModel: string;
  type: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const CheckoutPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupons, setAppliedCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  console.log("Razorpay Key:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

  // Fetch cart items on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load saved coupon data from cart page
    try {
      const savedCouponData = localStorage.getItem('checkoutCoupon');
      if (savedCouponData) {
        const couponData = JSON.parse(savedCouponData);
        const timeElapsed = Date.now() - (couponData.timestamp || 0);
        
        // Only use if less than 10 minutes old
        if (timeElapsed < 10 * 60 * 1000) {
          setAppliedCoupons(couponData.appliedCoupons || []);
          console.log('✓ Loaded saved coupons:', couponData.appliedCoupons?.length || 0);
          
          if (couponData.appliedCoupons && couponData.appliedCoupons.length > 0) {
            setTimeout(() => {
              toast.info(`${couponData.appliedCoupons.length} coupon(s) applied`, {
                position: "top-right",
                autoClose: 3000,
              });
            }, 500);
          }
        } else {
          // Clear expired data
          console.warn('⚠ Coupon data expired, clearing...');
          localStorage.removeItem('checkoutCoupon');
        }
      }
    } catch (error) {
      console.error('Error loading coupon data:', error);
    }
    
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      
    const userdata = localStorage.getItem('USER');
    const userId = userdata ? JSON.parse(userdata).id : null;
      
      if (!userId) {
        toast.error("Please login to continue");
        setTimeout(() => router.push('/'), 1500);
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

      if (result.success && result.data && result.data.items) {
        // Transform cart items to match component structure
        const transformedItems = result.data.items.map((item: any) => ({
          _id: item._id,
          productId: item.productId,
          name: item.productDetails?.name || 'Product',
          packSize: `${item.selectedBrand} - ${item.selectedModel}`,
          price: item.price,
          quantity: item.quantity,
          image: item.productDetails?.image || '',
          selectedBrand: item.selectedBrand,
          selectedModel: item.selectedModel,
          type: item.type,
          customDesign: item.customDesign,
          collectionName: item.collectionName
        }));

        if (transformedItems.length === 0) {
          toast.info("Your cart is empty. Redirecting...");
          setTimeout(() => router.push('/mycart'), 2000);
        }

        setCartItems(transformedItems);
      } else {
        toast.info(result.message || "Your cart is empty");
        setTimeout(() => router.push('/mycart'), 2000);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error("Failed to load cart items");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
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
        const userdata = localStorage.getItem('USER');
        const userId = userdata ? JSON.parse(userdata).id : null;
        
        if (userId) {
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
        }
      } else {
        toast.error(validateResult.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error("Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = async (couponCode: string) => {
    try {
      const userdata = localStorage.getItem('USER');
      const userId = userdata ? JSON.parse(userdata).id : null;
      
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

  // Calculate totals
  const subtotal = cartItems.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 5 : 0;
  const totalDiscountAmount = appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);
  const totalCost = subtotal - totalDiscountAmount + shipping;

  if (loading) {
    return (
      <div className="bg-[#090701] min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading checkout...</div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="bg-[#090701] min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
          <h2 className="text-2xl mb-4">Your cart is empty</h2>
          <button
            onClick={() => router.push('/All')}
            className="bg-[#9AE600] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#8BD500] transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#090701] min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="min-h-screen text-white px-4 md:px-12 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Delivery Form */}
        <PersonDetails 
          totalCost={totalCost}
          cartItems={cartItems as any}
          appliedCoupons={appliedCoupons}
          totalDiscountAmount={totalDiscountAmount}
        />

        {/* Right: Order Summary */}
        <OrderSummary
          cartItems={cartItems as any}
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
          showCheckout={false}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
