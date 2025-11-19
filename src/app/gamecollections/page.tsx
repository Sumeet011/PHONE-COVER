"use client";

import React, { useRef, useState } from "react";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";

// Default placeholder image
const Img = { src: '/images/card.webp' };


const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

type Drink = {
  id: number;
  name: string;
  image: string;
  price: number;
};




const ProductCard: React.FC<{ drink: Drink; onClickPath?: string }> = ({ drink, onClickPath }) => {
  const router = useRouter();

  return (
    <a
      onClick={() => router.push(onClickPath ?? "/Specific_Collection/")}
      className="group cursor-pointer relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[270px] w-[180px] snap-start"
    >
      <div className="mouse-pointer relative overflow-hidden rounded-xl h-[290px]">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full mouse-pointer h-full object-cover"
        />
        <p className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/60 px-2 py-1 rounded">
          ₹{drink.price}
        </p>
      </div>

      <div className="mt-3">
        <h2 className="text-base md:text-lg font-semibold leading-tight line-clamp-1">
          {drink.name}
        </h2>
      </div>

      <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-white group-hover:bg-lime-400 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 17l10-10M7 7h10v10"
          />
        </svg>
      </div>
    </a>
  );
};

export default function GameCollections() {
  const router = useRouter();
  const [groups, setGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  //fetch all groups from backend
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/api/groups");
      const data = await response.json();
      console.log("Fetched groups:", data);
      if (data.success && data.items) {
        setGroups(data.items);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGroups();
  }, []);

  // Dynamic refs and indices for each group
  const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [visibleIndices, setVisibleIndices] = useState<{ [key: string]: number }>({});

  // Calculate initial visible cards based on collections count
  const getInitialVisibleCards = (collectionsCount: number) => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      const cardWidth = 210; // card width + gap
      return Math.min(Math.ceil(screenWidth / cardWidth), collectionsCount);
    }
    return Math.min(3, collectionsCount); // fallback for SSR
  };

  // Function to render each group with its collections
  const renderGroupSection = (group: any, index: number) => {
    const groupId = group._id;
    const collections = group.members || [];
    const totalCollections = collections.length;
    
    // Scroll handler to update currentIndex to show last visible card
    const handleScroll = (e: any) => {
      const container = e.target;
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const cardWidth = 210; // Approximate width of card + gap
      
      // Calculate the last visible card index
      const lastVisiblePosition = scrollLeft + containerWidth;
      const lastVisibleIndex = Math.min(
        Math.ceil(lastVisiblePosition / cardWidth),
        totalCollections
      );
      
      setVisibleIndices(prev => ({ ...prev, [groupId]: lastVisibleIndex }));
    };

    return (
      <div key={groupId} className="mb-10">
        <div className="flex ml-4 md:ml-10 mt-4">
          <h1 className={`${JersyFont.className} text-[#9AE600] text-4xl md:ml-20`}>
            {group.name.toUpperCase()}
          </h1>
        </div>

        <div className="relative">
          <div
            ref={(el) => { containerRefs.current[groupId] = el; }}
            onScroll={handleScroll}
            className="flex grid-cols-2 ml-5 mr-5 md:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-8 xl:ml-30 xl:mr-30 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 py-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded"
            style={{ scrollSnapType: "x mandatory" }}
            role="list"
          >
            {collections.map((collection: any) => (
              <div role="listitem" key={collection._id} className="snap-start">
                <a
                  onClick={() => router.push(`/Specific_Collection/${collection._id}`)}
                  className="group cursor-pointer relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[270px] w-[180px] snap-start"
                >
                  <div className="mouse-pointer relative overflow-hidden rounded-xl h-[200px]">
                    <img
                      src={collection.heroImage || collection.image || Img.src}
                      alt={collection.name}
                      className="w-full mouse-pointer h-full object-cover"
                    />
                  </div>

                  <div className="mt-3">
                    <h2 className="text-base md:text-lg font-semibold leading-tight line-clamp-2">
                      {collection.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {collection.Products?.length || 0} Products
                    </p>
                  </div>

                  <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-white group-hover:bg-lime-400 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-black"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 17l10-10M7 7h10v10"
                      />
                    </svg>
                  </div>
                </a>
              </div>
            ))}
          </div>
          <style jsx>{`
            /* Hide scrollbar for Chrome, Safari and Opera */
            .no-scrollbar::-webkit-scrollbar {
              display: none;
              width: 0;
              height: 0;
            }

            /* Hide scrollbar for IE, Edge and Firefox */
            .no-scrollbar {
              -ms-overflow-style: none; /* IE and Edge */
              scrollbar-width: none; /* Firefox */
            }
          `}</style>

          <div className="flex justify-center mt-2">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-400 font-medium">
              {visibleIndices[groupId] || getInitialVisibleCards(totalCollections)} / {totalCollections}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full text-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading groups...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <Navbar />
      {groups.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-400">No groups found</p>
        </div>
      ) : (
        groups.map((group, index) => renderGroupSection(group, index))
      )}
    </div>
  );
}
