/**
 * Frontend Configuration
 * Centralized configuration for API endpoints and backend connection
 */

export const config = {
  // Backend API URL - defaults to localhost:4000 if not set
  apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
  
  // Razorpay Configuration
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  
  // API Endpoints
  endpoints: {
    // Products
    products: '/api/products',
    productById: (id: string) => `/api/products/${id}`,
    
    // Collections
    collections: '/api/collections',
    collectionById: (id: string) => `/api/collections/${id}`,
    
    // Groups
    groups: '/api/groups',
    groupById: (id: string) => `/api/groups/${id}`,
    
    // Orders
    orders: '/api/orders',
    orderById: (id: string) => `/api/orders/${id}`,
    
    // Cart
    cart: '/api/cart',
    cartAdd: '/api/cart/add',
    cartUpdate: '/api/cart/update',
    cartRemove: '/api/cart/remove',
    
    // User
    users: '/api/users',
    userById: (id: string) => `/api/users/${id}`,
    
    // Auth
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    
    // Coupons
    coupons: '/api/coupon',
    validateCoupon: '/api/coupon/validate',
    
    // Phone Brands
    phoneBrands: '/api/phone-brands',
    phoneBrandById: (id: string) => `/api/phone-brands/${id}`,
    
    // Blogs
    blogs: '/api/blogs',
    blogById: (id: string) => `/api/blogs/${id}`,
  },
};

/**
 * Get full API URL for an endpoint
 * @param endpoint - The API endpoint path
 * @returns Full URL including base API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${config.apiUrl}${endpoint}`;
};

/**
 * Get backend URL
 * @returns Backend base URL
 */
export const getBackendUrl = (): string => {
  return config.apiUrl;
};

export default config;
