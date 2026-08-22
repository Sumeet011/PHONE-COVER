'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const defaultSlides = [
  {
    title: 'Gengar',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Lugia',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Mega Lucario',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Zacian',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Mega Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Zacian and Zamazenta',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Lucario',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
  {
    title: 'Charizard',
    image:
      'https://res.cloudinary.com/phonewraps/image/upload/v1787206574/card_4_center_urqqmm.png',
  },
];

function normalizeDiff(diff, length) {
  if (length === 0) return 0;

  if (diff > length / 2) {
    return diff - length;
  }

  if (diff < -length / 2) {
    return diff + length;
  }

  return diff;
}

function getPositionClass(index, center, length, screenWidth) {
  const diff = normalizeDiff(index - center, length);

  let maxVisibleCards;

  if (screenWidth >= 900) {
    maxVisibleCards = 8;
  } else if (screenWidth >= 600) {
    maxVisibleCards = 3;
  } else {
    maxVisibleCards = 2;
  }

  if (Math.abs(diff) > maxVisibleCards) {
    return 'hidden';
  }

  if (diff === -4) {
    return 'left-[10%] z-[1] [transform:translate(-50%,0)_scale(0.6)]';
  }

  if (diff === -3) {
    return 'left-[20%] z-[2] [transform:translate(-50%,0)_scale(0.7)]';
  }

  if (diff === -2) {
    return 'left-[30%] z-[2] [transform:translate(-50%,0)_scale(0.8)]';
  }

  if (diff === -1) {
    return 'left-[40%] z-[3] [transform:translate(-50%,0)_scale(0.9)]';
  }

  if (diff === 0) {
    return 'left-[50%] z-[5] [transform:translate(-50%,0)_scale(1)]';
  }

  if (diff === 1) {
    return 'left-[60%] z-[3] [transform:translate(-50%,0)_scale(0.9)]';
  }

  if (diff === 2) {
    return 'left-[70%] z-[2] [transform:translate(-50%,0)_scale(0.8)]';
  }

  if (diff === 3) {
    return 'left-[80%] z-[1] [transform:translate(-50%,0)_scale(0.7)]';
  }

  if (diff === 4) {
    return 'left-[90%] z-[0] [transform:translate(-50%,0)_scale(0.6)]';
  }

  return 'hidden';
}

function isCenterSlide(index, center, length) {
  return normalizeDiff(index - center, length) === 0;
}

export default function ThreeDSlider({
  title = 'Slider',
  slides = defaultSlides,
  onKnowMore,
  autoScrollInterval = 0,
}) {
  const safeSlides = useMemo(
    () => (slides?.length ? slides : defaultSlides),
    [slides]
  );

  const [center, setCenter] = useState(
    Math.floor(safeSlides.length / 2)
  );

  const [screenWidth, setScreenWidth] = useState(0);

  const [touchStartX, setTouchStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartXRef = useRef(null);
  const wheelLockRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (safeSlides.length < 2) return undefined;

    if (autoScrollInterval <= 0) return undefined;

    const timer = setInterval(() => {
      setCenter((previousCenter) => {
        return (previousCenter + 1) % safeSlides.length;
      });
    }, autoScrollInterval);

    return () => {
      clearInterval(timer);
    };
  }, [safeSlides.length, autoScrollInterval]);

  const leftScroll = () => {
    setCenter((previousCenter) => {
      return (
        (previousCenter - 1 + safeSlides.length) %
        safeSlides.length
      );
    });
  };

  const rightScroll = () => {
    setCenter((previousCenter) => {
      return (previousCenter + 1) % safeSlides.length;
    });
  };

  const onWheel = (event) => {
    event.preventDefault();

    if (wheelLockRef.current) return;

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (Math.abs(delta) < 10) return;

    wheelLockRef.current = true;

    if (delta > 0) {
      rightScroll();
    } else {
      leftScroll();
    }

    setTimeout(() => {
      wheelLockRef.current = false;
    }, 400);
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
    if (!isDragging || dragStartXRef.current === null) {
      return;
    }

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
    <div className="flex w-full items-center justify-center py-4">
      <div className="relative mt-8 flex h-[45rem] w-screen max-w-[90%] select-none items-center justify-center">
        <div
          className="relative flex h-full w-full flex-row items-center justify-center overflow-hidden [perspective:100px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopMouseDrag}
          onMouseLeave={stopMouseDrag}
          onWheel={onWheel}
        >
          {safeSlides.map((slide, index) => (
            <div
              key={`${slide.title}-${index}`}
              className={`
                absolute
                left-1/2
                z-0
                flex
                min-[200px]:h-[20rem]
                min-[200px]:max-h-[280px]
                min-[400px]:h-[25rem]
                min-[400px]:max-h-[320px]
                min-[600px]:h-[32rem]
                min-[600px]:max-h-[380px]
                min-[1100px]:h-[38rem]
                min-[1100px]:max-h-[550px]
                min-h-0
                min-[200px]:w-[6rem]
                min-[200px]:min-w-[170px]
                min-[400px]:w-[12rem]
                min-[400px]:min-w-[20px]
                min-[600px]:w-[15rem]
                min-[600px]:min-w-[225px]
                min-[1100px]:w-[20rem]
                min-[1100px]:min-w-[270px]
                items-center
                justify-center
                rounded-[30px]
                bg-[#999]
                text-[90%]
                text-white
                [letter-spacing:-0.001em]
                [transform-style:preserve-3d]
                transition-[transform,opacity,left,z-index,box-shadow,filter]
                duration-500
                ease-in-out
                ${getPositionClass(
                  index,
                  center,
                  safeSlides.length,
                  screenWidth
                )}
              `}
            >
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden rounded-[25px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>

              <div className="absolute left-0 top-0 box-border flex h-full w-full flex-col justify-between overflow-hidden rounded-[25px] p-4">
                <div
                  className={`
                    flex
                    flex-row
                    justify-between
                    transition-opacity
                    duration-700
                    ease-in-out
                    ${
                      isCenterSlide(
                        index,
                        center,
                        safeSlides.length
                      )
                        ? 'opacity-100'
                        : 'opacity-0'
                    }
                  `}
                >
                  {/* Your center card content */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}