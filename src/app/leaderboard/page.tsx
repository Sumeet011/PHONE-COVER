'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import Image from 'next/image';
import IMG1 from '../../../public/images/img_image.png';
import IMG2 from '../../../public/images/img_image_114x114.png';
import IMG3 from '../../../public/images/img_image_1.png';

const fallbackImages = [IMG1, IMG2, IMG3];

interface LeaderboardUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  plates: number;
  chars: number;
  emoji: string;
  rank: number;
  image?: string;
}

const LeaderboardPage = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from your API or database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/orders/leaderboard`);
        const data = await res.json();

        if (data.success && data.leaderboard) {
          // Map backend data to frontend format
          const formatted = data.leaderboard.map((user: any) => ({
            id: user.userId,
            name: user.userName,
            handle: user.email.split('@')[0],
            email: user.email,
            plates: user.totalPoints, // Using totalPoints as "plates"
            chars: user.collectionsCount, // Using collections as "chars"
            emoji: user.userName.charAt(0).toUpperCase(),
            rank: user.rank
          }));
          
          setUsers(formatted);
        }
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0e0f15] flex items-center justify-center text-white">
        Loading leaderboard...
      </div>
    );

  // Split top 3 users
  const topUsers = users.slice(0, 3);
  const others = users.slice(3);

  return (
    <div className="min-h-screen bg-[#0e0f15]">
      <Navbar />

      <div className="w-full max-w-7xl mx-auto pt-8 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0e0f15] rounded-[40px] overflow-hidden">

          {/* 🎖 Top 3 Users Section */}
          <div className="flex justify-center items-end gap-6 sm:gap-12 lg:gap-32 flex-nowrap overflow-x-auto pt-16 pb-16">
            {topUsers.map((user, index) => (
              <div
                key={user.id || index}
                className="flex flex-col items-center gap-4 min-w-[120px]"
              >
                <div className="w-28 h-32 sm:w-36 sm:h-40 lg:w-40 lg:h-44 rounded-xl overflow-hidden bg-[rgba(23,28,41,0.8)] backdrop-blur-[10px] flex items-center justify-center">
                  <Image
                    src={user.image || fallbackImages[index % 3]}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    width={160}
                    height={176}
                  />
                </div>
                <h3
                  className={`${
                    index === 1
                      ? 'text-3xl sm:text-4xl font-bold'
                      : 'text-2xl sm:text-3xl font-semibold'
                  } text-white text-center`}
                >
                  {user.name}
                </h3>

                <div className="gap-4 ml-10 w-full text-center">
                  <div className="flex gap-2 items-center">
                    <div
                      className={`w-10 h-10 ${
                        index === 0
                          ? 'bg-[#ffd365]'
                          : index === 1
                          ? 'bg-[#cdcdcd]'
                          : 'bg-[#b38a48]'
                      } rounded-lg flex items-center justify-center mb-2`}
                    >
                      🏆
                    </div>
                    <span className="text-white text-sm font-bold">
                      {user.plates} Plates
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      🃏
                    </div>
                    <span className="text-white text-sm font-bold">
                      {user.chars} Characters
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Hide placeholders when not enough users */}
            {topUsers.length < 3 &&
              Array.from({ length: 3 - topUsers.length }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-4 min-w-[120px] opacity-30"
                >
                  <div className="w-28 h-32 sm:w-36 sm:h-40 lg:w-40 lg:h-44 rounded-xl bg-gray-800" />
                  <h3 className="text-2xl text-gray-500">—</h3>
                </div>
              ))}
          </div>

          {/* 🏅 Leaderboard Table */}
          <div className="px-0 sm:px-8 lg:px-16 pb-8">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8"></div>

            {/* Table Header */}
            <div className="grid grid-cols-4 px-4 text-sm text-white/60 font-medium">
              <span>Rank</span>
              <span>User name</span>
              <span>Plates Collected</span>
              <span>Characters Unlocked</span>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col gap-3">
              {others.map((user, index) => (
                <div key={user.id || index} className="bg-[#171c29] rounded-xl p-2">
                  <div className="grid grid-cols-4 items-center p-4 text-white text-sm">
                    <span className="font-semibold -mr-20">{index + 4}</span>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm`}
                      >
                        {user.emoji || '👤'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-white/60 text-xs">
                          @{user.handle || user.name.toLowerCase().replace(/\s+/g, '')}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold">{user.plates}</span>
                    <span className="font-semibold">{user.chars}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
