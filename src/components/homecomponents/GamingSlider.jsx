'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const defaultSlides = [
  {
    title: 'Gengar',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/MegaGengar.jpg',
  },
  {
    title: 'Lugia',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/Lugia.jpg',
  },
  {
    title: 'Mega Lucario',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/MegeLucario.jpg',
  },
  {
    title: 'Zacian',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/zacian.jpg',
  },
  {
    title: 'Mega Charizard',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/MegaCharizard.jpg',
  },
  {
    title: 'Zacian and Zamazenta',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/zacianAndZamazenta.jpg',
  },
  {
    title: 'Lucario',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/Lucario.jpg',
  },
  {
    title: 'Charizard',
    image:
      'https://raw.githubusercontent.com/siddnlw/codepen-assets/refs/heads/main/img/Charizard.jpg',
  },
];

function normalizeDiff(diff, length) {
  if (length === 0) return 0;
  if (diff > length / 2) return diff - length;
  if (diff < -length / 2) return diff + length;
  return diff;
}

function getPositionClass(index, center, length) {
  const diff = normalizeDiff(index - center, length);

  if (diff === -2) {
    return 'left-[20%] z-[1] [transform:translate(-50%,0)_rotateY(-2deg)_scale(0.8)] opacity-100 shadow-[0_0.4rem_1.6rem_rgba(0,0,0,0.1)] blur-[5px] max-[620px]:opacity-50 max-[445px]:opacity-0 max-[415px]:left-[-50%] max-[415px]:[transform:translate(-50%,0)_rotateY(0deg)_scale(0.7)] max-[415px]:opacity-0 max-[415px]:shadow-none';
  }
  if (diff === -1) {
    return 'left-[35%] z-[2] [transform:translate(-50%,0)_rotateY(-1deg)_scale(0.9)] opacity-100 shadow-[0_0.4rem_1.6rem_rgba(0,0,0,0.3)] blur-[2px] max-[620px]:opacity-95 max-[445px]:opacity-50 max-[415px]:left-[-50%] max-[415px]:[transform:translate(-50%,0)_rotateY(0deg)_scale(0.7)] max-[415px]:opacity-0 max-[415px]:shadow-none';
  }
  if (diff === 0) {
    return 'left-1/2 z-[4] [transform:translate(-50%,0)_rotateY(0deg)_scale(1)] opacity-100 shadow-[0_0.4rem_1.6rem_rgba(0,0,0,0.5)] blur-0 cursor-pointer hover:shadow-[0_0_1.8rem_rgba(0,0,0,0.7)] hover:[transform:translate(-50%,0)_rotateY(0deg)_scale(1.05)] max-[415px]:shadow-none';
  }
  if (diff === 1) {
    return 'left-[65%] z-[2] [transform:translate(-50%,0)_rotateY(1deg)_scale(0.9)] opacity-100 shadow-[0_0.4rem_1.6rem_rgba(0,0,0,0.3)] blur-[2px] max-[620px]:opacity-95 max-[445px]:opacity-50 max-[415px]:left-[150%] max-[415px]:[transform:translate(-50%,0)_rotateY(0deg)_scale(0.7)] max-[415px]:opacity-0 max-[415px]:shadow-none';
  }
  if (diff === 2) {
    return 'left-[80%] z-[1] [transform:translate(-50%,0)_rotateY(2deg)_scale(0.8)] opacity-100 shadow-[0_0.4rem_1.6rem_rgba(0,0,0,0.1)] blur-[5px] max-[620px]:opacity-50 max-[445px]:opacity-0 max-[415px]:left-[150%] max-[415px]:[transform:translate(-50%,0)_rotateY(0deg)_scale(0.7)] max-[415px]:opacity-0 max-[415px]:shadow-none';
  }
  return 'left-1/2 z-0 [transform:translate(-50%,0)_rotateY(0deg)_scale(0.7)] opacity-100 shadow-none';
}

function isCenterSlide(index, center, length) {
  return normalizeDiff(index - center, length) === 0;
}

export default function ThreeDSlider({
  title = 'Slider',
  slides = defaultSlides,
  onKnowMore,
  autoScrollInterval = 2500,
}) {
  const safeSlides = useMemo(() => (slides?.length ? slides : defaultSlides), [slides]);
  const [center, setCenter] = useState(Math.floor(safeSlides.length / 2));
  const [touchStartX, setTouchStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(null);

  useEffect(() => {
    if (safeSlides.length < 2) return undefined;
    if (autoScrollInterval <= 0) return undefined;

    const timer = setInterval(() => {
      setCenter((prev) => (prev + 1) % safeSlides.length);
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [safeSlides.length, autoScrollInterval]);

  const leftScroll = () => {
    setCenter((prev) => (prev - 1 + safeSlides.length) % safeSlides.length);
  };

  const rightScroll = () => {
    setCenter((prev) => (prev + 1) % safeSlides.length);
  };

  const onTouchStart = (event) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const onTouchEnd = (event) => {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) > 20) {
      if (delta > 0) {
        rightScroll();
      } else {
        leftScroll();
      }
    }

    setTouchStartX(null);
  };

  const onMouseDown = (event) => {
    event.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = event.clientX;
  };

  const onMouseMove = (event) => {
    if (!isDragging || dragStartXRef.current === null) return;

    const delta = event.clientX - dragStartXRef.current;
    const threshold = 40;

    if (Math.abs(delta) >= threshold) {
      if (delta > 0) {
        leftScroll();
      } else {
        rightScroll();
      }

      dragStartXRef.current = event.clientX;
    }
  };

  const stopMouseDrag = () => {
    setIsDragging(false);
    dragStartXRef.current = null;
  };

  return (
    <div className="flex w-full items-center justify-center  py-4">
      <div className="relative mt-8 flex h-[35rem] w-screen max-w-[1200px] select-none items-center justify-center">

        <button
          type="button"
          className="flex h-full w-[10%] items-center justify-center border-0 bg-transparent text-[24px] leading-none"
          aria-label="Previous slide"
          onClick={leftScroll}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[rgba(22,22,220,0.1)] hover:text-white"
          >
            &lt;
          </span>
        </button>

        <div
          className="relative flex h-full w-full flex-row items-center justify-center  overflow-hidden [perspective:100px] "
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {safeSlides.map((slide, index) => (
            <div
              key={`${slide.title}-${index}`}
              className={`absolute left-1/2 z-0 flex h-[24rem] max-h-[400px] min-h-0 w-[14rem] min-w-[270px] items-center justify-center rounded-[25px] bg-[#999] text-[90%] text-white [letter-spacing:-0.001em] [transform-style:preserve-3d] transition-[transform,opacity,left,z-index,box-shadow,filter] duration-500 ease-in-out ${getPositionClass(index, center, safeSlides.length)}`}
            >
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden rounded-[25px]">
                <img src={slide.image} alt={slide.title} className="absolute h-[30rem]" />
              </div>

              <div className="absolute left-0 top-0 box-border flex h-full w-full flex-col justify-between overflow-hidden rounded-[25px] p-4">
                <div
                  className={`flex flex-row justify-between transition-opacity duration-700 ease-in-out ${isCenterSlide(index, center, safeSlides.length) ? 'opacity-100' : 'opacity-0'}`}
                >
                  
                </div>

              </div>
            </div>
          ))}

          <div className="pointer-events-none absolute left-[-1%] top-0 z-[3] h-full w-[102%] bg-" />
        </div>

        <button
          type="button"
          className="flex h-full w-[10%] items-center justify-center border-0 bg-transparent text-[24px] leading-none"
          aria-label="Next slide"
          onClick={rightScroll}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[rgba(22,22,220,0.1)] hover:text-white"
          >
            &gt;
          </span>
        </button>
      </div>
    </div>
  );
}
