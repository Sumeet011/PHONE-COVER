'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CardCarousel } from "../ui/card-carousel";
import img1 from "../../../public/images/card.webp";
import img2 from "../../../public/images/card2.webp";
import mobileimg from "../../../public/images/mobile.webp";
import WrapButton from "../ui/wrap-button";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";



const CardCarouselParent = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const [images, setImages] = useState([
    { src: img1.src, alt: "Image 1" },
    { src: img2.src, alt: "Image 2" },
    { src: img1.src, alt: "Image 3" },
    { src: img1.src, alt: "Image 4" },
    { src: img1.src, alt: "Image 5" },
    { src: img1.src, alt: "Image 6" },
  ]);

  useEffect(() => {
    // Fetch CARD category images from backend
    const fetchImages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/design-assets?category=CARD&isActive=true`);
        const data = await response.json();
        
        if (data.success && data.items && data.items.length > 0) {
          const formattedImages = data.items.map((asset: any, index: number) => ({
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

  const handleOnClick = () => {
    
    router.push('/gamecollections');
  };

  return (
    <div className="relative">
      {/* Background mobile image */}
      <div className="absolute inset-0 flex  justify-center z-[-1]">
        <img
          src="/images/mobile.webp"
          alt="Mobile background"
          className="h-[580px] w-auto opacity-50 mt-4 mr-3"
        />
      </div>

      {/* Foreground content */}
      <div className="relative z-10">
        <CardCarousel images={images} showPagination={false} />
      </div>

      {/*/Buy Now Button */}
      <div onClick={handleOnClick} className="cursor-pointer relative bottom-13 flex items-center justify-center left-1/2 transform -translate-x-1/2 z-20">
            <button className="bg-[#9AE600] text-black text-2xl sm:text-4xl font-bold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300"> 
              BUY NOW
            </button>
          
      </div>
    </div>
  );
};

export default CardCarouselParent;
