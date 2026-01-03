"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css/effect-cards"
import { EffectCards } from "swiper/modules"

import "swiper/css"
import { SparklesIcon } from "lucide-react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"

import { Badge } from "@/components/ui/badge"

interface CarouselProps {
  images: { src: string; alt: string }[]
  autoplayDelay?: number
  slideShadows?: boolean
  collectionName?: string
  alignLeft?: boolean
}

export const CardSwipe: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  slideShadows = false,
  collectionName = "Spider Man",
  alignLeft = false,
}) => {
  const css = `
    .swiper {
      width: 200px !important; /* fixed width for horizontal layout */
      padding-bottom: 50px;
    }

    .swiper-slide {
      width: auto; /* let slide width match image */
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 18px;
    }

    .swiper-slide img {
      display: block;
      width: 130px; /* default width */
      height: auto;
      border-radius: 16px;
    }

    /* Media query for small screens or larger (example for sm breakpoint) */
    @media (min-width: 640px) {
      .swiper-slide img {
        width: 150px;
      }
    }
  `

  return (
    <section className="w-fit inline-block">
      <style>{css}</style>
      <div className={`rounded-[24px] ${alignLeft ? 'border-0 p-0' : 'border border-black/5 p-1 mx-auto max-w-4xl'}`}>
        <div className={`relative flex flex-col rounded-[24px] w-fit`}>
          

          <div className={`flex flex-col pb-2 ${alignLeft ? 'pt-0 pl-0' : 'pt-5 pl-4'} ${alignLeft ? 'items-start justify-start' : 'items-center justify-center'}`}>
            
            <h3 className={`font-bold tracking-tight opacity-85 ${alignLeft ? 'text-lg mb-2' : 'text-2xl md:text-3xl'}`}>{collectionName}</h3>
          </div>

          <div className={`flex items-center ${alignLeft ? 'justify-start' : 'justify-center'}`}>
            <Swiper
                effect={"cards"}
                grabCursor={true}
                loop={true}
                slidesPerView={"auto"}
                cardsEffect={{
                  slideShadows: slideShadows,
                }}
                modules={[EffectCards, Pagination, Navigation]}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="size-full rounded-3xl mt-2 ">
                      <Image
                        src={image.src}
                        width={180}
                        height={180}
                        className="size-full rounded-xl "
                        alt={image.alt}
                      />
                    </div>
                  </SwiperSlide>
                ))}
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="size-full rounded-3xl">
                      <Image
                        src={image.src}
                        width={180}
                        height={180}
                        className="size-full rounded-xl"
                        alt={image.alt}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
          </div>
        </div>
      </div>
    </section>
  )
}


