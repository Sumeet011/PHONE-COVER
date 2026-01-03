"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/homeCards/Footer";

type Collection = {
  _id: string;
  name: string;
  description: string;
  type: string;
  price?: number;
  heroImage?: string;
  image?: string;
  Products?: any[];
};

const CollectionsPage = () => {
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://phone-wraps-backend.onrender.com";
  
  const [gamingCollections, setGamingCollections] = useState<Collection[]>([]);
  const [normalCollections, setNormalCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gaming' | 'normal'>('gaming');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/collections`);
        const data = await response.json();
        
        if (data.success && data.items) {
          const gaming = data.items.filter((c: Collection) => c.type === 'gaming');
          const normal = data.items.filter((c: Collection) => c.type === 'normal');
          
          setGamingCollections(gaming);
          setNormalCollections(normal);
        }
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [BACKEND_URL]);

  const CollectionCard = ({ collection }: { collection: Collection }) => (
    <div
      onClick={() => router.push(`/Specific_Collection/${collection._id}`)}
      className="group cursor-pointer relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300"
    >
      <div className="relative overflow-hidden rounded-xl h-[200px]">
        <img
          src={collection.heroImage || collection.image || "/images/card.webp"}
          alt={collection.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-3">
        <h2 className="text-lg font-semibold leading-tight line-clamp-2">
          {collection.name}
        </h2>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
          {collection.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {collection.Products?.length || 0} Products
          </p>
          {collection.type === 'gaming' && collection.price && (
            <p className="text-sm font-bold text-[#9AE600]">
              ₹{collection.price}
            </p>
          )}
        </div>
      </div>

      <div className="absolute top-6 right-6 px-2 py-1 bg-[#9AE600] text-black text-xs font-bold rounded">
        {collection.type === 'gaming' ? '🎮 GAMING' : '✨ PREMIUM'}
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
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading collections...</div>
        </div>
      </div>
    );
  }

  const currentCollections = activeTab === 'gaming' ? gamingCollections : normalCollections;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2 text-center">Phone Wrap Collections</h1>
        <p className="text-gray-400 text-center mb-8">
          Choose from our gaming-themed or premium material collections
        </p>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('gaming')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'gaming'
                ? 'bg-[#9AE600] text-black'
                : 'bg-[#1a1816] text-white hover:bg-[#2a2826]'
            }`}
          >
            🎮 Gaming Collections ({gamingCollections.length})
          </button>
          <button
            onClick={() => setActiveTab('normal')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'normal'
                ? 'bg-[#9AE600] text-black'
                : 'bg-[#1a1816] text-white hover:bg-[#2a2826]'
            }`}
          >
            ✨ Material Collections ({normalCollections.length})
          </button>
        </div>

        {/* Collections Grid */}
        {currentCollections.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-xl">No {activeTab} collections available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {currentCollections.map((collection) => (
              <CollectionCard key={collection._id} collection={collection} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CollectionsPage;
