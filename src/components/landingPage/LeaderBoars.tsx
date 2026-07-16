import React from "react";
import localFont from "next/font/local";

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
});

export default function LeaderBoards() {
  return (
    <div className="w-full -mt-5">
      {/* Title */}
      <div className={`${JersyFont.className} flex justify-center items-center`}>
        <h1 className="text-4xl min-[290px]:text-5xl sm:text-6xl lg:text-8xl text-[#9AE600] mt-20 text-center">
          Climb Up The Ranking
        </h1>
      </div>

      {/* Content Row — now row on small too */}
      <div className="w-full flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 p-4">
        {/* Left text */}
        <div className="flex-1 text-center">
          <h1 className="text-[clamp(1.3rem,3vw,2rem)] md:text-[clamp(1.5rem,4vw,3rem)] font-bold">
            BUY MORE COVERS COLLECTION TO GAIN POINTS
          </h1>
        </div>

        {/* Video */}
        <div className="flex-shrink-0 w-full sm:w-1/2 md:w-auto flex justify-center">
          <video
            src="/video/intro.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Right text */}
        <div className="flex-1 text-center">
          <h1 className="text-[clamp(1.3rem,3vw,2rem)] md:text-[clamp(1.5rem,4vw,3rem)] font-bold">
            CLIMB UP THE RANKING AND GET MORE DISCOUNT
          </h1>
        </div>
      </div>
    </div>
  );
}
