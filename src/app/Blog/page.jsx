"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";

import Footer from "@/components/homecomponents/Footer";
import BlogCard from "./BlogCard";
import axios from "axios";
import localFont from "next/font/local";

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});
const faqItems = [
	{
		question: "How do I choose the correct phone model for a cover?",
		answers: [
			"Open Settings on your phone and check the exact model name.",
			"Use the search bar on the model page and match the full model variant.",
			"If unsure, place a support request before ordering.",
		],
	},
	{
		question: "Are your mobile covers shockproof and protective?",
		answers: [
			"Most cases are designed for daily drop protection and scratch resistance.",
			"Raised edges help protect the camera and display from flat-surface impact.",
			"Protection level can vary by design, so check the product details section.",
		],
	},
	{
		question: "How long does delivery usually take?",
		answers: [
			"Standard orders are generally delivered within 3 to 7 business days.",
			"Metro cities are often faster compared to remote locations.",
			"You will receive tracking details once the order is dispatched.",
		],
	},
	{
		question: "Can I return or exchange a wrong-size cover?",
		answers: [
			"Returns are usually accepted for damaged or incorrect products.",
			"Exchange requests should be raised within the return window.",
			"Keep original packaging and invoice for faster resolution.",
		],
	},
	{
		question: "Do you offer custom printed covers?",
		answers: [
			"Yes, selected models support custom photo or text print options.",
			"Preview quality depends on the uploaded image resolution.",
			"Custom products may need extra processing time before shipping.",
		],
	},
];

export default function BlogPage() {
	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openFaqIndex, setOpenFaqIndex] = useState(null);

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
		<div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
			<Navbar />

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-18 pb-20">
				<section className="mb-16 mt-10">
					<div className="max-w-3xl mx-auto">
						<h2 style={{ fontFamily: JersyFont.style.fontFamily }} className="text-[#9AE600] text-5xl sm:text-6xl text-center mb-8">
							Frequently Asked Questions
						</h2>

						<div className="rounded-xl border border-white/10 bg-[#111111] overflow-hidden">
							{faqItems.map((item, index) => {
								const isOpen = openFaqIndex === index;

								return (
									<div key={item.question} className="border-b border-white/10 last:border-b-0">
										<button
											type="button"
											onClick={() => setOpenFaqIndex(isOpen ? null : index)}
											className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors duration-200"
										>
											<span className="font-medium text-base sm:text-lg">{item.question}</span>
											<svg
												className={`w-5 h-5 text-[#9AE600] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
													clipRule="evenodd"
												/>
											</svg>
										</button>

										{isOpen && (
											<div className="px-5 pb-5 text-sm text-gray-300">
												<ul className="list-disc pl-5 space-y-1">
													{item.answers.map((answer, answerIndex) => (
														<li key={`${item.question}-${answerIndex}`}>{answer}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</section>

				<section>
					<header className="text-center mb-10">
						<h1 style={{ fontFamily: JersyFont.style.fontFamily }} className="text-[#9AE600] text-5xl sm:text-6xl text-center mb-8">
							Blog &amp; Guides
						</h1>
						<p className="mt-3 text-gray-300 max-w-2xl mx-auto">
							Articles, tips and updates about Phone Wraps, site features and
							store best practices. Check back often for new posts.
						</p>
					</header>

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
