import React from "react";
import localFont from "next/font/local";
import Image from "next/image";
import imL from "../../../public/images/Screenshot_2025-09-09_110117-removebg-preview.png"
import imR from "../../../public/images/Screenshot_2025-09-09_110123-removebg-preview.png"

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
});

const HeroContent = () => {
  return (
    <>
      <div className="flex flex-col items-center pt-16 ">
        <h1
          className={`${JersyFont.className} text-[#9AE600] text-5xl sm:text-8xl md:text-6xl lg:text-8xl`}
        >
          SCROLL COLLECTION
        </h1>
      </div>

      <Image
        className="absolute left-28 top-50 h-[700px] z-10 hidden xl:block"
        src={imL}
        alt=""
         height={550}
      />
      <Image
        className="absolute right-28 top-55 h-[500px] z-10 hidden xl:block"
        src={imR}
        alt=""
        height={550}
      />
    </>
  );
};

export default HeroContent;
