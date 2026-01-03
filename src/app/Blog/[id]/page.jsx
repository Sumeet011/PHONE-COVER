"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/homeCards/Footer";

export default function BlogDetailPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/blogs/${params.id}`
        );
        const data = await response.json();
        
        if (data.success) {
          setBlog(data.blog);
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Navbar />
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-gray-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/Blog")}
            className="px-6 py-3 bg-[#9AE600] text-black rounded-lg hover:bg-[#8BD600] transition-colors"
          >
            Back to Blog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Hero Section with Image */}
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
        <img
          src={blog.image || "/images/default-blog.jpg"}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/Blog")}
          className="flex items-center gap-2 text-[#9AE600] hover:text-[#8BD600] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Blog</span>
        </button>

        {/* Article Card */}
        <article className="bg-[#111111] rounded-2xl overflow-hidden">
          {/* Article Header */}
          <div className="p-8 md:p-12 border-b border-gray-800">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(blog.date || blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author || "Admin"}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Render Rich Content Blocks */}
            {blog.contentBlocks && blog.contentBlocks.length > 0 ? (
              <div className="prose prose-invert prose-lg max-w-none blog-content space-y-6">
                {blog.contentBlocks.map((block, index) => {
                  switch (block.type) {
                    case 'heading':
                      const HeadingTag = `h${block.level || 2}`;
                      return (
                        <HeadingTag key={index} className="font-bold text-white">
                          {block.content}
                        </HeadingTag>
                      );
                    
                    case 'paragraph':
                      return (
                        <p key={index} className="text-gray-300 leading-relaxed">
                          {block.content}
                        </p>
                      );
                    
                    case 'quote':
                      return (
                        <blockquote key={index} className="border-l-4 border-[#9AE600] pl-4 italic text-gray-400">
                          {block.content}
                        </blockquote>
                      );
                    
                    case 'list':
                      return (
                        <ul key={index} className="list-disc list-inside space-y-2 text-gray-300">
                          {block.items?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      );
                    
                    case 'image':
                      return (
                        <figure key={index} className="my-8">
                          <img
                            src={block.content}
                            alt={block.alt || ''}
                            className="w-full rounded-lg"
                          />
                          {block.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    
                    default:
                      return null;
                  }
                })}
              </div>
            ) : (
              // Fallback to old content field
              <div
                className="prose prose-invert prose-lg max-w-none blog-content"
                dangerouslySetInnerHTML={{ __html: blog.content || blog.excerpt }}
              />
            )}
          </div>
        </article>

        {/* Share Section */}
        <div className="mt-12 p-8 bg-[#111111] rounded-2xl">
          <h3 className="text-xl font-bold mb-4">Share this article</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: blog.title,
                    url: window.location.href
                  });
                }
              }}
              className="p-3 bg-[#1a1a1a] hover:bg-[#9AE600] hover:text-black rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
      
      <style jsx>{`
        .blog-content {
          color: #e5e7eb;
          line-height: 1.8;
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          color: #9ae600;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content h2 {
          font-size: 2rem;
        }

        .blog-content h3 {
          font-size: 1.5rem;
        }

        .blog-content p {
          margin-bottom: 1.5rem;
        }

        .blog-content ul,
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .blog-content li {
          margin-bottom: 0.75rem;
        }

        .blog-content strong {
          color: #9ae600;
          font-weight: 600;
        }

        .blog-content a {
          color: #9ae600;
          text-decoration: underline;
        }

        .blog-content a:hover {
          color: #8bd600;
        }

        .blog-content img {
          border-radius: 0.5rem;
          margin: 2rem 0;
        }

        .blog-content code {
          background-color: #1f1f1f;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
          color: #9ae600;
        }

        .blog-content blockquote {
          border-left: 4px solid #9ae600;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
