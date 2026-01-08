'use client';
import { CardSwipe } from "@/components/ui/card-swipe";
import React, { useEffect, useState } from "react";

interface SwipeCardProps {
  images?: Array<{ src: string; alt: string; level?: number }>;
  slideShadows?: boolean;
  collectionName?: string;
  alignLeft?: boolean;
}

const SwipeCard = ({ images: propImages, slideShadows = false, collectionName, alignLeft = false }: SwipeCardProps) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [images, setImages] = useState(propImages || [
    { src: "/images/1.webp", alt: "Image 1" },
    { src: "/images/2.webp", alt: "Image 2" },
    { src: "/images/3.webp", alt: "Image 3" },
  ]);

  useEffect(() => {
    // Only fetch if no images provided via props
    if (propImages && propImages.length > 0) {
      setImages(propImages);
      return;
    }
    
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
        console.error('Error fetching design assets:', error);
      }
    };
    
    fetchImages();
  }, [propImages, BACKEND_URL]);

  return <CardSwipe images={images} slideShadows={slideShadows} collectionName={collectionName} alignLeft={alignLeft} />;
};

export default SwipeCard;
