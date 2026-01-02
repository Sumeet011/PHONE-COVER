import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ScrollToTop from "@/components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import type { Viewport } from "next/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Phone Wraps - Custom Phone Skins & Wraps',
    template: '%s | Phone Wraps'
  },
  description: 'Design your own custom phone skins and wraps. Premium quality, unique designs, and perfect fit for all phone models. Transform your phone with style.',
  keywords: ['phone wraps', 'phone skins', 'custom phone cases', 'phone accessories', 'custom designs'],
  authors: [{ name: 'Phone Wraps' }],
  creator: 'Phone Wraps',
  publisher: 'Phone Wraps',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://phonewraps.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Phone Wraps - Custom Phone Skins & Wraps',
    description: 'Design your own custom phone skins and wraps. Premium quality, unique designs, and perfect fit for all phone models.',
    siteName: 'Phone Wraps',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phone Wraps - Custom Phone Skins & Wraps',
    description: 'Design your own custom phone skins and wraps. Premium quality, unique designs, and perfect fit for all phone models.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ✅ Move viewport out as its own export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // optional tuning:
  // maximumScale: 1,
  // userScalable: false,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`w-full  ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <ThemeProvider
        attribute="class"
            defaultTheme="dark"
            enableSystem
        >
          <ScrollToTop />
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
