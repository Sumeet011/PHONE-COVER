import React, { useState } from "react";
import { X, CreditCard, Smartphone, Banknote } from "lucide-react";
import { toast } from "react-toastify";

const PaymentModal = ({ isOpen, onClose, onSelectPayment, totalAmount, formData, cartItems }) => {
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  

  if (!isOpen) return null;

  const paymentMethods = [
    {
      id: "razorpay",
      name: "UPI / Card / Netbanking",
      description: "Pay using Razorpay (UPI, Cards, Wallets)",
      icon: Smartphone,
      color: "from-purple-500 to-purple-400",
      type: "razorpay"
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: Banknote,
      color: "from-lime-500 to-lime-400",
      type: "cod"
    },
  ];

  // Initialize Razorpay payment
  const initRazorpay = (order, orderData) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY",
      amount: order.amount,
      currency: order.currency,
      name: 'Phone Wraps',
      description: 'Order Payment',
      order_id: order.id,
      handler: async (response) => {
        setLoading(true);
        try {
          // Verify payment and create order on backend
          const verifyResponse = await fetch(`${BACKEND_URL}/api/orders/verifyRazorpay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderData // Send all order data to create order after payment
            })
          });

          const result = await verifyResponse.json();
          
          if (result.success) {
            // Store email in localStorage for guest users to fetch their orders
            if (orderData.address && orderData.address.email) {
              localStorage.setItem('userEmail', orderData.address.email);
            }
            // ✅ Mark user as logged in after successful order
  const storedUser = localStorage.getItem('USER');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    user.isLogedIn = true;
    localStorage.setItem('USER', JSON.stringify(user));
  } else {
    // fallback: create one if not found
    localStorage.setItem(
      'USER',
      JSON.stringify({ id: orderData.userId, isLogedIn: true })
    );
  }
            
            toast.success('Payment successful! Order placed.', {
              position: "top-center",
              autoClose: 3000
            });
            onClose();
            // Clear cart and redirect to orders page
            setTimeout(() => {
              window.location.href = '/my_orders';
            }, 1500);
          } else {
            toast.error(result.message || 'Payment verification failed');
          }
        } catch (error) {
          toast.error('Payment verification failed. Please contact support.');
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          toast.info('Payment cancelled', {
            position: "top-center",
            autoClose: 2000
          });
          setLoading(false);
        }
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: '#84cc16' // lime-500
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
      toast.error(`Payment failed: ${response.error.description}`, {
        position: "top-center",
        autoClose: 4000
      });
      setLoading(false);
    });
    
    rzp.open();
  };

  const handlePaymentSelect = async (method) => {
    if (loading) return;

    // Validate form data
    if (!formData || !formData.firstName || !formData.email || !formData.phone) {
      toast.error("Please fill in all delivery information");
      return;
    }

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Prepare order data
    
    const userData = localStorage.getItem('USER');
    const userId = userData ? JSON.parse(userData).id : null;
    
    if (!userId) {
      toast.error("User session not found. Please refresh the page.");
      return;
    }

    // Format items for backend - include all necessary fields including customDesign
    const formattedItems = cartItems.map(item => ({
      productId: item.productId || item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedBrand: item.selectedBrand || '',
      selectedModel: item.selectedModel || '',
      type: item.type || 'product',
      collectionName: item.collectionName || '',
      customDesign: item.customDesign || undefined
    }));

    // Format address for backend
    const formattedAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      street: formData.street,
      city: formData.city,
      state: formData.state || formData.city,
      zipcode: formData.postCode || formData.zipcode,
      country: formData.country,
      phone: formData.phone
    };

    // Handle different payment methods
    switch (method.type) {
      case 'razorpay':
        try {
          setLoading(true);
          
          // Prepare complete order data to send after successful payment
          const completeOrderData = {
            userId: userId,
            items: formattedItems,
            address: formattedAddress,
            coupon: formData.appliedCoupons || []
          };
          
          // Create Razorpay payment session (NOT the order yet)
          const razorpayResponse = await fetch(`${BACKEND_URL}/api/orders/razorpay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              items: formattedItems,
              coupon: formData.appliedCoupons || []
            })
          });

          const razorpayResult = await razorpayResponse.json();
          
          if (razorpayResult.success && razorpayResult.order) {
            // Initialize Razorpay modal - order will be created after successful payment
            initRazorpay(razorpayResult.order, completeOrderData);
          } else {
            toast.error(razorpayResult.message || 'Failed to initiate payment');
            setLoading(false);
          }
        } catch (error) {
          toast.error('Failed to process payment');
          setLoading(false);
        }
        break;

      case 'cod':
        try {
          setLoading(true);
          
          const response = await fetch(`${BACKEND_URL}/api/orders/cod`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              items: formattedItems,
              amount: totalAmount,
              address: formattedAddress,
              coupon: formData.appliedCoupons || []
            })
          });

          const result = await response.json();
          
          if (result.success) {
            // Store email in localStorage for guest users to fetch their orders
            if (formattedAddress && formattedAddress.email) {
              localStorage.setItem('userEmail', formattedAddress.email);
            }
            
            const storedUser = localStorage.getItem('USER');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    user.isLogedIn = true;
    localStorage.setItem('USER', JSON.stringify(user));
  }
            
            toast.success('Order placed successfully!', {
              position: "top-center",
              autoClose: 3000
            });
            onClose();
            // Clear cart and redirect
            setTimeout(() => {
              window.location.href = '/my_orders';
            }, 1500);
          } else {
            toast.error(result.message || 'Failed to place order', {
              position: "top-center",
              autoClose: 3000
            });
          }
        } catch (error) {
          toast.error('Failed to place order. Please try again.', {
            position: "top-center",
            autoClose: 3000
          });
        } finally {
          setLoading(false);
        }
        break;

      default:
        toast.error('Invalid payment method');
        break;
    }

    // Call parent callback if provided
    if (onSelectPayment) {
      onSelectPayment(method);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#131313] rounded-2xl shadow-2xl border border-[#2e2e2e] max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-[#131313] border-b border-[#2e2e2e] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Choose Payment Method
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Total: ₹{totalAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2e2e2e] rounded-lg transition-colors group"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Payment Options */}
        <div className="p-6 space-y-4">
          {loading && (
            <div className="text-center text-lime-400 mb-4">
              <p>Processing payment...</p>
            </div>
          )}
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentSelect(method)}
                disabled={loading}
                className={`w-full group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl hover:border-lime-400/50 hover:bg-[#1f1f1f] transition-all duration-300 active:scale-[0.98]">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br ${method.color} flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-white group-hover:text-lime-400 transition-colors">
                      {method.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {method.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="text-gray-600 group-hover:text-lime-400 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[#2e2e2e] px-6 py-4">
          <p className="text-xs text-gray-500 text-center">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;


