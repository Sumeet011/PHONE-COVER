"use client";

import React from "react";
import Link from "next/link";

export default function BlogCard({ post }) {
  return (
    <article className="group bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col">
      <div className="relative overflow-hidden rounded-lg h-44 md:h-48 mb-3">
        <img
          src={post.image || `https://picsum.photos/600/400?random=${post.id}`}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="text-lg md:text-xl font-semibold leading-tight mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-300 mb-3 line-clamp-3">{post.excerpt}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-400">{post.date}</div>
        <Link href={post.href || '#'} className="inline-flex items-center gap-2 bg-lime-400 text-black px-3 py-1 rounded-full text-sm">
          Read
        </Link>
      </div>
    </article>
  );
}
