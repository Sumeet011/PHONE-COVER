"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/homeCards/Footer";
import BlogCard from "./BlogCard";
import axios from "axios";

export default function BlogPage() {
	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				setLoading(true);
				const response = await axios.get(
					`${BACKEND_URL}/api/blogs?status=published`
				);
				if (response.data.success) {
					// Transform the data to match the existing BlogCard format
					const transformedPosts = response.data.blogs.map((blog) => ({
						id: blog._id,
						title: blog.title,
						excerpt: blog.excerpt,
						image: blog.image,
						date: new Date(blog.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						}),
						href: `/Blog/${blog._id}`,
						author: blog.author,
						category: blog.category,
					}));
					setPosts(transformedPosts);
				}
			} catch (err) {
				setError("Failed to load blogs. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchBlogs();
	}, []);

	return (
		<div className="min-h-screen bg-[#0a0a0a] text-white">
			<Navbar />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
				<header className="text-center mb-12">
					<h1 className="text-[#9AE600] text-4xl sm:text-5xl md:text-6xl font-extrabold">
						Blog &amp; Guides
					</h1>
					<p className="mt-3 text-gray-300 max-w-2xl mx-auto">
						Articles, tips and updates about Phone Wraps, site features and
						store best practices. Check back often for new posts.
					</p>
				</header>

				<section>
					{loading ? (
						<div className="text-center py-12">
							<p className="text-gray-400">Loading blogs...</p>
						</div>
					) : error ? (
						<div className="text-center py-12">
							<p className="text-red-400">{error}</p>
						</div>
					) : posts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-400">No blogs available yet. Check back soon!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{posts.map((post) => (
								<BlogCard post={post} key={post.id} />
							))}
						</div>
					)}
				</section>
			</main>

			<Footer />
		</div>
	);
}
