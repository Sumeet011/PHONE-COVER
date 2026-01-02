'use client';
import { CardSwipe } from "@/components/ui/card-swipe";
import React, { useEffect, useState } from "react";

const cardswipe = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [images, setImages] = useState([
    { src: "/images/1.webp", alt: "Image 1" },
    { src: "/images/2.webp", alt: "Image 2" },
    { src: "/images/3.webp", alt: "Image 3" },
  ]);

  useEffect(() => {
    // Fetch card category images from backend
    const fetchImages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/design-assets?category=card&isActive=true`);
        const data = await response.json();
        
        if (data.success && data.items && data.items.length > 0) {
          const formattedImages = data.items.slice(0, 3).map((asset: any, index: number) => ({
            src: asset.imageUrl,
            alt: asset.name || `Image ${index + 1}`
          }));
          setImages(formattedImages);
        }
      } catch (error) {
        // Silently handle error
      }
    };
    
    fetchImages();
  }, []);

  return (
    <div
      className="w-full 
  grid 
  grid-cols-2          /* 2 on phones */
  sm:grid-cols-3       /* 3 on tablets */
  lg:grid-cols-4       /* 4 on laptops */
  gap-4 m-4"
    >
      <CardSwipe images={images} slideShadows={false} />
      <CardSwipe images={images} slideShadows={false} />
      <CardSwipe images={images} slideShadows={false} />
      <CardSwipe images={images} slideShadows={false} />
    </div>
  );
};

export default cardswipe;
