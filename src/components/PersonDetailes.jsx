import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import PaymentModal from "./PaymentModal";

const PersonDetails = ({ totalCost, cartItems = [], appliedCoupons = [], totalDiscountAmount = 0 }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentFormData, setCurrentFormData] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const BASE_URL = `${BACKEND_URL}/api`;

  // Handler to show payment modal
  const handlePayNowClick = (data) => {
    // Validate cart has items
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Add applied coupons to form data
    const formDataWithCoupons = {
      ...data,
      appliedCoupons: appliedCoupons
    };

    // Save form data and show payment modal
    setCurrentFormData(formDataWithCoupons);
    setShowPaymentModal(true);
  };

  // Handler when payment method is selected
  const handlePaymentMethodSelect = async (paymentMethod) => {
    toast.info(`Selected: ${paymentMethod.name} (Integration pending)`);
    setShowPaymentModal(false);

    // Here you can add payment gateway integration later
    // For now, it's just a dummy popup
    console.log("Payment method selected:", paymentMethod);
  };

  const HandlePay = async (data) => {
    try {
      setLoading(true);

      const userdata = localStorage.getItem('USER');
      const userId = userdata ? JSON.parse(userdata).id : null;
      console.log('Processing payment for user:', userId);
      
      if (!userId) {
        toast.error("User session not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Step 1️⃣: Check if user exists in DB
      console.log('Checking user existence:', `${BASE_URL}/users/${userId}`);
      const checkUser = await fetch(`${BASE_URL}/users/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      let userExists = false;
      let existingUser = null;

      if (checkUser.ok) {
        const result = await checkUser.json();
        console.log('User check result:', result);
        if (result.success && result.data) {
          userExists = true;
          existingUser = result.data;
        }
      }

      // Prepare user data
      const userData = {
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        email: data.email,
        address: {
          label: "Home",
          street: data.street,
          city: data.city,
          state: data.city,
          zipCode: data.postCode,
          country: data.country,
          isDefault: true,
        },
      };

      // Step 2️⃣: Add or update user
      if (!userExists) {
        const createUser = await fetch(`${BASE_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...userData }),
        });

        if (!createUser.ok) {
          toast.error("Failed to create user");
          setLoading(false);
          return;
        }

        toast.info("New user created!");
      } else {
        // Update only missing fields
        const updates = {};

        if (!existingUser.phone) updates.phone = userData.phone;
        if (!existingUser.email) updates.email = userData.email;
        if (!existingUser.name) updates.name = userData.name;

        const hasAddress =
          existingUser.addresses &&
          existingUser.addresses.some(
            (addr) => addr.street === userData.address.street
          );

        if (!hasAddress) {
          updates.address = userData.address;
        }

        if (Object.keys(updates).length > 0) {
          await fetch(`${BASE_URL}/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          toast.success("User info updated!");
        }
      }

      // Step 3️⃣: Create order (you can call this after successful Razorpay payment)
      const orderData = {
        userId,
        userName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          postCode: data.postCode,
          city: data.city,
          country: data.country,
        },
        products: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalCost,
      };

      const orderRes = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderRes.json();

      if (orderResult.success) {
        toast.success("Order placed successfully!");
        navigate("/myOrders");
      } else {
        toast.error("Failed to create order");
      }
    } catch (err) {
      console.error("Error in HandlePay:", err);
      toast.error("Failed to process order");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex-1 bg-[#131313] px-8 py-5 rounded-2xl overflow-hidden shadow-xl border border-[#2e2e2e] max-h-fit">
      <h2 className="text-3xl font-bold mb-6 text-white">
        Delivery Information
      </h2>
      <form onSubmit={handleSubmit(handlePayNowClick)} className="space-y-8">
        {/* PERSONAL DETAILS */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            YOUR PERSONAL DETAILS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* First Name */}
            <div>
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName", {
                  required: "First name is required",
                })}
                className="p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl w-full"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName", {
                  required: "Last name is required",
                })}
                className="p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl w-full"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            YOUR RESIDENTIAL ADDRESS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Street Address */}
            <div>
              <input
                type="text"
                placeholder="Street Address"
                {...register("street", {
                  required: "Street address is required",
                })}
                className="p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl w-full"
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.street.message}
                </p>
              )}
            </div>

            {/* Optional Address */}
            <div>
              <input
                type="text"
                placeholder="Street Address (optional)"
                className="p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Post Code */}
            <div>
              <input
                type="text"
                placeholder="Post Code"
                {...register("postCode", {
                  required: "Post code is required",
                })}
                className="p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl w-full"
              />
              {errors.postCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.postCode.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <input
                type="text"
                placeholder="City"
                {...register("city", { required: "City is required" })}
                className="p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl w-full"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <input
                type="text"
                placeholder="Country"
                {...register("country", { required: "Country is required" })}
                className="p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl w-full"
              />
              {errors.country && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CONTACT DETAILS */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            CONTACT DETAILS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Phone */}
            <div>
              <input
                type="tel"
                placeholder="Your Phone Number"
                {...register("phone", {
                  required: "Phone number is required",
                })}
                className="w-full p-3 focus:border-lime-300 outline-none bg-[#121212] border border-gray-700 text-white rounded-xl"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <input
                type="email"
                placeholder="Your Email Address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format",
                  },
                })}
                className="w-full focus:border-lime-300 outline-none p-3 bg-[#121212] border border-gray-700 text-white rounded-xl"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 pb-2.5 flex gap-4 justify-between md:justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`p-4 bg-gradient-to-r from-lime-500 to-lime-400 text-black font-bold py-3 rounded-md shadow-lg ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:cursor-pointer active:scale-95"
            }`}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </form>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectPayment={handlePaymentMethodSelect}
        totalAmount={totalCost}
        formData={currentFormData || {}}
        cartItems={cartItems}
      />
    </div>
  );
};

export default PersonDetails;
