const config = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
  INTERNAL_API_URL: process.env.INTERNAL_API_URL || 'http://localhost:4000',
};

export default config;