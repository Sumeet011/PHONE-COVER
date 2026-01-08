'use client';
import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import { Download, ClipboardCopy, CheckCircle2, Loader2, Package } from "lucide-react";
import { toast } from "react-toastify";
import localFont from "next/font/local";
const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Define the order type based on backend schema
type OrderItem = {
  productId: string;
  productName: string;
  phoneModel: string;
  quantity: number;
  price: number;
  itemType?: string;
  collectionId?: string;
  collectionName?: string;
  level?: number;
};

type ShippingAddress = {
  fullName: string;
  phoneNumber: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type Order = {
  _id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  isPaid: boolean;
  shippingAddress: ShippingAddress;
  trackingLink?: string;
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
  updatedAt: string;
  returnRequest?: {
    isRequested: boolean;
    requestedAt: string;
    items: Array<{
      productId: string;
      productName: string;
      phoneModel: string;
      quantity: number;
      reason: string;
    }>;
    status: string;
  };
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState("");
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState<{[key: string]: {selected: boolean, reason: string, index: number, type: 'item' | 'plate'}}>({});
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const User= localStorage.getItem('USER');
        const userId = User ? JSON.parse(User).id : null;
        const userEmail = User ? JSON.parse(User).email : null;

        if (!userId) {
          toast.error("Please log in to view your orders");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/orders/userorders`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            userId,
            email: userEmail // Send email for guest users
          })
        });

        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
          if (data.orders && data.orders.length === 0 && data.message) {
            toast.info(data.message, {
              position: "top-center",
              autoClose: 3000
            });
          }
        } else {
          toast.error(data.message || "Failed to fetch orders");
        }
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Order ID copied!", {
      position: "top-center",
      autoClose: 2000
    });
  };

  const handleDownloadInvoice = (order: Order) => {
    // TODO: Implement invoice download
    toast.info(`Invoice download for ${order.orderNumber} coming soon!`, {
      position: "top-center",
      autoClose: 2000
    });
  };

  const handleReturnClick = (orderId: string) => {
    setReturningOrderId(orderId);
    setSelectedReturnItems({});
  };

  const handleCancelReturn = () => {
    setReturningOrderId(null);
    setSelectedReturnItems({});
    setShowReturnDialog(false);
    setReturnReason("");
  };

  const handleToggleReturnItem = (order: Order, itemIndex: number) => {
    const item = order.items[itemIndex];
    const itemKey = `item_${itemIndex}_${item.productName}`;
    setSelectedReturnItems(prev => ({
      ...prev,
      [itemKey]: {
        selected: !prev[itemKey]?.selected,
        reason: prev[itemKey]?.reason || "",
        index: itemIndex,
        type: 'item'
      }
    }));
  };

  const handleToggleReturnPlate = (order: Order, plateIndex: number) => {
    const plate = order.plates[plateIndex];
    const plateKey = `plate_${plateIndex}_${plate.collectionName}`;
    setSelectedReturnItems(prev => ({
      ...prev,
      [plateKey]: {
        selected: !prev[plateKey]?.selected,
        reason: prev[plateKey]?.reason || "",
        index: plateIndex,
        type: 'plate'
      }
    }));
  };

  const handleSubmitReturnRequest = async () => {
    if (!returningOrderId) return;

    const order = orders.find(o => o._id === returningOrderId);
    if (!order) return;

    const selectedItems = Object.entries(selectedReturnItems)
      .filter(([_, data]) => data.selected && data.type === 'item')
      .map(([key, data]) => {
        const index = data.index;
        const item = order.items[index];
        return {
          type: 'item',
          itemIndex: index,
          productId: item.productId,
          productName: item.productName,
          phoneModel: item.phoneModel,
          quantity: item.quantity,
          reason: returnReason || data.reason || "No reason provided"
        };
      });
    const selectedPlates = Object.entries(selectedReturnItems)
      .filter(([_, data]) => data.selected && data.type === 'plate')
      .map(([key, data]) => {
        const index = data.index;
        const plate = order.plates[index];
        return {
          type: 'plate',
          plateIndex: index,
          collectionId: plate.collectionId,
          collectionName: plate.collectionName,
          quantity: plate.quantity,
          reason: returnReason || data.reason || "No reason provided"
        };
      });

    if (selectedItems.length === 0 && selectedPlates.length === 0) {
      toast.error("Please select at least one item or plate to return");
      return;
    }

    if (!returnReason.trim()) {
      toast.error("Please provide a reason for return");
      return;
    }

    try {
      const User = localStorage.getItem('USER');
      const userId = User ? JSON.parse(User).id : null;

      const response = await fetch(`${BACKEND_URL}/api/orders/return-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          orderId: returningOrderId,
          userId,
          items: selectedItems,
          plates: selectedPlates
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Return request submitted successfully!");
        handleCancelReturn();
        // Refresh orders to show updated return status
        const fetchOrders = async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/api/orders/userorders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (data.success) {
              setOrders(data.orders || []);
            }
          } catch (error) {
            console.error('Error refreshing orders:', error);
          }
        };
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to submit return request");
      }
    } catch (error) {
      toast.error("Failed to submit return request");
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Pending': 'text-yellow-400',
      'Confirmed': 'text-lime-400',
      'Processing': 'text-blue-400',
      'Shipped': 'text-purple-400',
      'Out for Delivery': 'text-orange-400',
      'Delivered': 'text-green-400',
      'Cancelled': 'text-red-400',
      'Refunded': 'text-gray-400',
      'Failed': 'text-red-500'
    };
    return statusColors[status] || 'text-gray-400';
  };

  const getPaymentStatusIcon = (isPaid: boolean, paymentStatus: string) => {
    if (isPaid && paymentStatus === 'Paid') {
      return '✅ Paid';
    } else if (paymentStatus === 'Pending') {
      return '⏳ Pending';
    } else if (paymentStatus === 'Failed') {
      return '❌ Failed';
    }
    return '⏳ Pending';
  };

  const getDeliveryStatus = (status: string) => {
    const statusInfo: { [key: string]: { icon: string; text: string; color: string } } = {
      'Pending': { icon: '⏳', text: 'Order Pending', color: 'text-yellow-400' },
      'Confirmed': { icon: '✅', text: 'Order Confirmed', color: 'text-lime-400' },
      'Processing': { icon: '📦', text: 'Processing', color: 'text-blue-400' },
      'Shipped': { icon: '🚚', text: 'Shipped', color: 'text-purple-400' },
      'Out for Delivery': { icon: '🛵', text: 'Out for Delivery', color: 'text-orange-400' },
      'Delivered': { icon: '✅', text: 'Delivered', color: 'text-green-400' },
      'Cancelled': { icon: '❌', text: 'Cancelled', color: 'text-red-400' },
      'Refunded': { icon: '💰', text: 'Refunded', color: 'text-gray-400' },
      'Failed': { icon: '❌', text: 'Failed', color: 'text-red-500' }
    };
    
    const info = statusInfo[status] || { icon: '❓', text: status, color: 'text-gray-400' };
    return { ...info };
  };

  const getEstimatedDelivery = (createdAt: string, status: string) => {
    if (status === 'Delivered') {
      return 'Delivered';
    }
    
    const orderDate = new Date(createdAt);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 5); // 5 days delivery estimate
    
    const today = new Date();
    const daysLeft = Math.ceil((estimatedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return 'Delayed';
    } else if (daysLeft === 0) {
      return 'Today';
    } else if (daysLeft === 1) {
      return 'Tomorrow';
    } else {
      return `${daysLeft} days`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#090701] text-white">
        <Loader2 className="animate-spin w-12 h-12 text-lime-400 mb-4" />
        <p className="text-gray-400">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#090701] min-h-screen overflow-hidden text-white">
      <Navbar />
      <div className="h-full py-10 px-6 lg:px-20">
        <h1 className={` ${JersyFont.className} text-[#9AE600]  text-5xl font-bold mb-10`}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-20 h-20 text-gray-600 mb-4" />
            <p className="text-center text-gray-500 text-xl">No orders found.</p>
            <p className="text-center text-gray-600 text-sm mt-2">Your orders will appear here after checkout.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  max-w-[1400px]">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#131313] rounded-xl shadow-md p-5 space-y-5 border border-gray-700 hover:border-lime-400/50 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-lime-400">Order #{order.orderNumber}</h2>
                    <p className="text-xs text-gray-500">{order.orderId}</p>
                  </div>
                  <button onClick={() => handleCopy(order.orderId)}>
                    {copiedId === order.orderId ? (
                      <CheckCircle2 className="w-5 h-5 text-lime-400" />
                    ) : (
                      <ClipboardCopy className="w-5 h-5 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-md mb-2">
                    {order.status === 'Delivered' ? 'Products Received' : 'Order Items'}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {(() => {
                      // If not delivered, group collection items
                      if (order.status !== 'Delivered') {
                        const groupedItems: { [key: string]: { items: OrderItem[], totalQty: number, totalPrice: number } } = {};
                        const regularItems: OrderItem[] = [];

                        order.items.forEach((item) => {
                          if (item.collectionId && item.collectionName) {
                            const key = item.collectionId;
                            if (!groupedItems[key]) {
                              groupedItems[key] = {
                                items: [],
                                totalQty: 0,
                                totalPrice: 0
                              };
                            }
                            groupedItems[key].items.push(item);
                            groupedItems[key].totalQty += item.quantity;
                            const itemTotal = item.price * item.quantity;
                            const plateTotal = item.hasPlate && item.platePrice ? item.platePrice : 0;
                            groupedItems[key].totalPrice += itemTotal + plateTotal;
                          } else {
                            regularItems.push(item);
                          }
                        });

                        return (
                          <>
                            {/* Show grouped collections */}
                            {Object.entries(groupedItems).map(([collectionId, data]) => (
                              <li key={collectionId} className="flex justify-between items-start border-l-2 border-lime-400 pl-2">
                                <div className="flex-1">
                                  <span className="block font-semibold text-lime-400">
                                    {data.items[0].collectionName}
                                  </span>
                                  <span className="text-xs text-gray-500">Collection ({data.items.length} cards)</span>
                                  {data.items.filter(i => i.hasPlate).length > 0 && (
                                    <span className="text-xs text-blue-400 block">
                                      +{data.items.filter(i => i.hasPlate).length} Plate(s)
                                    </span>
                                  )}
                                  <span className="text-xs text-yellow-400 block mt-1">
                                    ⏳ Cards will be revealed on delivery
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="block">x{data.totalQty}</span>
                                  <span className="text-xs text-gray-500">₹{data.totalPrice}</span>
                                </div>
                              </li>
                            ))}
                            {/* Show regular items */}
                            {regularItems.map((item, idx) => (
                              <li key={`regular-${idx}`} className="flex justify-between items-start">
                                <div className="flex-1">
                                  <span className="block">{item.productName}</span>
                                  <span className="text-xs text-gray-500">{item.phoneModel}</span>
                                  {item.hasPlate && (
                                    <span className="text-xs text-blue-400">+Plate (₹{item.platePrice})</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="block">x{item.quantity}</span>
                                  <span className="text-xs text-gray-500">₹{item.price * item.quantity + (item.hasPlate && item.platePrice ? item.platePrice : 0)}</span>
                                </div>
                              </li>
                            ))}
                          </>
                        );
                      }

                      // If delivered, show all individual products
                      return order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="block">{item.productName}</span>
                            <span className="text-xs text-gray-500">{item.phoneModel}</span>
                            {item.collectionName && (
                              <span className="text-xs text-lime-400 block">
                                From: {item.collectionName}
                              </span>
                            )}
                            {item.level && (
                              <span className="text-xs text-purple-400 block font-semibold">
                                ⭐ Level {item.level}
                              </span>
                            )}
                            {item.hasPlate && (
                              <span className="text-xs text-blue-400">
                                +Plate (₹{item.platePrice})
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="block">x{item.quantity}</span>
                            <span className="text-xs text-gray-500">₹{item.price * item.quantity + (item.hasPlate && item.platePrice ? item.platePrice : 0)}</span>
                          </div>
                        </li>
                      ));
                    })()}
                    
                    {/* Show plates separately */}
                    {order.plates && order.plates.length > 0 && order.plates.map((plate: any, idx: number) => (
                      <li key={`plate-${idx}`} className="flex justify-between items-start border-l-2 border-blue-400 pl-2 mt-2">
                        <div className="flex-1">
                          <span className="block font-semibold text-blue-400">
                            🎴 {plate.collectionName} - Plates
                          </span>
                          <span className="text-xs text-gray-500">Gaming Collection Plates</span>
                        </div>
                        <div className="text-right">
                          <span className="block">x{plate.quantity}</span>
                          <span className="text-xs text-gray-500">₹{plate.totalPrice}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal:</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Discount:</span>
                      <span className="text-lime-400">-₹{order.discount}</span>
                    </div>
                  )}
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping:</span>
                      <span>₹{order.shippingCost}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-700 pt-2">
                    <span>Total:</span>
                    <span className="text-lime-400">₹{order.totalAmount}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-400 space-y-1">
                  <p className="flex justify-between items-center">
                    <span className="font-semibold">Delivery Status:</span>
                    <span className={`${getDeliveryStatus(order.status).color} font-medium flex items-center gap-1`}>
                      <span>{getDeliveryStatus(order.status).icon}</span>
                      <span>{getDeliveryStatus(order.status).text}</span>
                    </span>
                  </p>
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Failed' && (
                    <p className="flex justify-between">
                      <span className="font-semibold">Est. Delivery:</span>
                      <span className="text-lime-400">{getEstimatedDelivery(order.createdAt, order.status)}</span>
                    </p>
                  )}
                  <p className="flex justify-between">
                    <span className="font-semibold">Payment:</span>
                    <span>{getPaymentStatusIcon(order.isPaid, order.paymentStatus)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Method:</span>
                    <span>{order.paymentMethod}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Order Date:</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</span>
                  </p>
                  {order.trackingLink && (
                    <p className="flex justify-between items-center">
                      <span className="font-semibold">Tracking:</span>
                      <a 
                        href={order.trackingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lime-400 hover:text-lime-300 underline flex items-center gap-1"
                      >
                        Track Order
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p className="flex justify-between">
                      <span className="font-semibold">AWB:</span>
                      <span className="font-mono text-xs">{order.trackingNumber}</span>
                    </p>
                  )}
                  {order.courierPartner && (
                    <p className="flex justify-between">
                      <span className="font-semibold">Courier:</span>
                      <span>{order.courierPartner}</span>
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-500 bg-[#1a1a1a] p-3 rounded-lg">
                  <p className="font-semibold text-white mb-1">Shipping Address</p>
                  <p className="text-xs">{order.shippingAddress.fullName}</p>
                  <p className="text-xs">{order.shippingAddress.phoneNumber}</p>
                  <p className="text-xs mt-1">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-xs">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-xs">{order.shippingAddress.country}</p>
                </div>

                <div className="flex justify-end gap-2">
                  {/* Return Button - only show for delivered orders without existing return request */}
                  {order.status === 'Delivered' && !order.returnRequest?.isRequested && (
                    <button
                      onClick={() => handleReturnClick(order._id)}
                      className={`${
                        returningOrderId === order._id 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      } px-4 py-4 rounded-full flex items-center justify-center gap-2 text-black transition-all duration-300 hover:scale-105 font-semibold`}
                    >
                      {returningOrderId === order._id ? 'Cancel' : 'Return'}
                    </button>
                  )}

                  {/* Show return status if return requested */}
                  {order.returnRequest?.isRequested && (
                    <div className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-2 font-semibold">
                      <span>🔄</span>
                      <span>Return {order.returnRequest.status}</span>
                    </div>
                  )}

                  {/* Download Invoice Button */}
                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="bg-lime-400 hover:bg-lime-500 px-4 py-4 rounded-full flex items-center justify-center gap-2 text-black transition-all duration-300 hover:scale-105"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>

                {/* Return Items Selection */}
                {returningOrderId === order._id && (
                  <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg border-2 border-yellow-500">
                    <h3 className="font-semibold text-yellow-400 mb-3">Select items to return:</h3>
                    <div className="space-y-2">
                      {/* Product items */}
                      {order.items.map((item, idx) => {
                        const itemKey = `item_${idx}_${item.productName}`;
                        const isSelected = selectedReturnItems[itemKey]?.selected || false;
                        return (
                          <label 
                            key={itemKey}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-[#131313] hover:bg-[#1f1f1f]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleReturnItem(order, idx)}
                              className="w-5 h-5 accent-yellow-500"
                            />
                            <div className="flex-1 text-sm">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-gray-400 text-xs">{item.phoneModel} - Qty: {item.quantity}</div>
                            </div>
                          </label>
                        );
                      })}
                      {/* Plates */}
                      {order.plates && order.plates.length > 0 && order.plates.map((plate, idx) => {
                        const plateKey = `plate_${idx}_${plate.collectionName}`;
                        const isSelected = selectedReturnItems[plateKey]?.selected || false;
                        return (
                          <label
                            key={plateKey}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-500/20 border border-blue-500' : 'bg-[#131313] hover:bg-[#1f1f1f]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleReturnPlate(order, idx)}
                              className="w-5 h-5 accent-blue-500"
                            />
                            <div className="flex-1 text-sm">
                              <div className="font-medium text-blue-400">{plate.collectionName} Plate</div>
                              <div className="text-gray-400 text-xs">Qty: {plate.quantity}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    
                    {Object.values(selectedReturnItems).some(item => item.selected) && (
                      <button
                        onClick={() => setShowReturnDialog(true)}
                        className="mt-4 w-full bg-lime-400 hover:bg-lime-500 px-4 py-3 rounded-lg text-black font-semibold transition-all duration-300"
                      >
                        Submit Return Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Reason Dialog */}
      {showReturnDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#131313] rounded-xl p-6 max-w-md w-full border border-lime-400">
            <h2 className="text-2xl font-bold text-lime-400 mb-4">Return Reason</h2>
            <p className="text-gray-300 mb-4">Please provide a reason for returning the selected items:</p>
            
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Enter reason for return..."
              className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded-lg p-3 min-h-[120px] focus:outline-none focus:border-lime-400"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelReturn}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReturnRequest}
                disabled={!returnReason.trim()}
                className="flex-1 bg-lime-400 hover:bg-lime-500 text-black px-4 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
