'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import Image from 'next/image';
import config from '@/config';
import IMG1 from '../../../public/images/img_image.png';
import IMG2 from '../../../public/images/img_image_114x114.png';
import IMG3 from '../../../public/images/img_image_1.png';

import Footer from "@/components/homecomponents/Footer";

const fallbackImages = [IMG1, IMG2, IMG3];

const rankAccentClass = (rank: number) => {
  if (rank === 1) return 'text-yellow-300';
  if (rank === 2) return 'text-slate-300';
  return 'text-orange-300';
};

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
  const BACKEND_URL = config.API_BASE_URL;
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
            handle: user.email ? user.email.split('@')[0] : user.userName?.toLowerCase()?.replace(/\s+/g, ''),
            email: user.email,
            plates: user.totalPoints, // Using totalPoints as "plates"
            chars: user.collectionsCount, // Using collections as "chars"
            emoji: user.userName?.charAt(0)?.toUpperCase() || 'U',
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
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
        <Navbar />
        <div className="flex flex-1 items-center justify-center pt-28 text-white/80">
          Loading leaderboard...
        </div>
      </div>
    );

  // Split top 3 users and reorder for podium display (2nd, 1st, 3rd)
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);
  const topUsers = sortedUsers.slice(0, 3);
  const podiumOrder = topUsers.length >= 2 ? [topUsers[1], topUsers[0], topUsers[2]].filter(Boolean) : topUsers;
  const others = sortedUsers.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="overflow-hidden">

            <div className="px-2 pt-6 text-center sm:px-4">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Leaderboard</h1>
              <p className="mt-1 text-sm text-white/60">Top players ranked by plates collected and characters unlocked.</p>
            </div>

            {/* 🎖 Top 3 Users Section */}
            <div className="grid grid-cols-3 items-end gap-3 px-2 pb-8 pt-8 sm:gap-8 sm:px-4">
              {podiumOrder.map((user, index) => {
                // Get the actual rank (not display order)
                const actualRank = user.rank;
                const rankClass = rankAccentClass(actualRank);
                const isFirst = actualRank === 1;

                return (
                <div
                  key={user.id || index}
                  className={`relative flex flex-col items-center text-center ${isFirst ? 'sm:-mt-3' : ''}`}
                >
                  <div className={`mb-2 text-xs font-bold uppercase tracking-wide ${rankClass}`}>
                    #{actualRank}
                  </div>

                  <div className={`overflow-hidden rounded-xl border border-white/15 ${isFirst ? 'h-28 w-28 sm:h-36 sm:w-36' : 'h-24 w-24 sm:h-30 sm:w-30'}`}>
                    <Image
                      src={user.image || fallbackImages[index % 3]}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      width={144}
                      height={144}
                    />
                  </div>

                  <h3
                    className={`${
                      isFirst ? 'text-xl font-bold sm:text-2xl' : 'text-base font-semibold sm:text-lg'
                    } mt-3 text-white`}
                  >
                    {user.name}
                  </h3>

                  <div className="mt-2 text-xs text-white/70 sm:text-sm">
                    <span className="text-lime-300 font-semibold">{user.plates}</span> Plates
                  </div>
                  <div className="text-xs text-white/70 sm:text-sm">
                    <span className="text-cyan-300 font-semibold">{user.chars}</span> Characters
                  </div>
                </div>
              );
              })}

              {/* Hide placeholders when not enough users */}
              {topUsers.length < 3 &&
                Array.from({ length: 3 - topUsers.length }).map((_, i) => (
                  <div
                    key={i}
                    className="flex min-h-[180px] flex-col items-center justify-center gap-3 opacity-40"
                  >
                    <div className="h-20 w-20 rounded-xl bg-white/10" />
                    <h3 className="text-2xl text-gray-500">—</h3>
                  </div>
                ))}
            </div>

            {/* 🏅 Leaderboard Table */}
            <div className="px-2 pb-8 sm:px-4">
              <div className="mb-4 h-[1px] w-full bg-white/15"></div>

              {/* Table Header */}
              <div className="hidden grid-cols-4 gap-4 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/60 md:grid">
                <span>Rank</span>
                <span>User Name</span>
                <span>Plates Collected</span>
                <span>Characters Unlocked</span>
              </div>

              {/* Table Rows */}
              <div className="mt-1 flex flex-col">
                {others.map((user, index) => (
                  <div key={user.id || index} className="border-b border-white/10 px-2 py-4 last:border-b-0">
                    <div className="grid grid-cols-1 gap-2 text-sm text-white md:grid-cols-4 md:items-center md:gap-4">
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="text-xs uppercase text-white/50 md:hidden">Rank</span>
                        <span className="font-bold text-lime-300">#{user.rank}</span>
                      </div>

                      <div className="flex items-center justify-between md:justify-start">
                        <span className="text-xs uppercase text-white/50 md:hidden">User</span>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm">
                            {user.emoji || '👤'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold">{user.name}</span>
                            <span className="text-xs text-white/60">
                              @{user.handle || user.name.toLowerCase().replace(/\s+/g, '')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-start">
                        <span className="text-xs uppercase text-white/50 md:hidden">Plates Collected</span>
                        <span className="font-semibold">{user.plates}</span>
                      </div>

                      <div className="flex items-center justify-between md:justify-start">
                        <span className="text-xs uppercase text-white/50 md:hidden">Characters Unlocked</span>
                        <span className="font-semibold">{user.chars}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {others.length === 0 && (
                  <div className="px-2 py-6 text-center text-sm text-white/60">
                    No additional leaderboard entries yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default LeaderboardPage;
