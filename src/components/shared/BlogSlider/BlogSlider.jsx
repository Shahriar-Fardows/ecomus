"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Autoplay, Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const BlogSlider = ({ title = "Latest Blog Posts", limit = 6, autoplay = true, className = "" }) => {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchBlogs()
    }, [limit])

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/blogs")
            if (!response.ok) {
                throw new Error("Failed to fetch blogs")
            }

            let data = await response.json()

            // Filter only published blogs
            data = data.filter((blog) => blog.published)

            // Sort by date (newest first)
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            setBlogs(data.slice(0, limit))
        } catch (err) {
            setError(err.message)
            console.error("Error fetching blogs:", err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const calculateReadTime = (content) => {
        const wordsPerMinute = 200
        const wordCount = content.split(/\s+/).length
        const readTime = Math.ceil(wordCount / wordsPerMinute)
        return readTime
    }

    if (loading) {
        return (
            <div className={`${className}  container mx-auto py-4`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error || blogs.length === 0) {
        return null
    }

    return (
        <div className={`${className} container mx-auto p-4`}>
            {/* Header */}
            <div className="flex items-center justify-between ">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="blog-swiper-button-prev h-10 w-10 rounded-full bg-transparent"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="blog-swiper-button-next h-10 w-10 rounded-full bg-transparent"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Blog Slider */}
            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                    prevEl: ".blog-swiper-button-prev",
                    nextEl: ".blog-swiper-button-next",
                }}
                autoplay={
                    autoplay
                        ? {
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }
                        : false
                }
                loop={blogs.length > 3}
                breakpoints={{
                    0: {
                        slidesPerView: 1, 
                        spaceBetween: 12,
                    },
                    640: {
                        slidesPerView: 2, 
                        spaceBetween: 20,
                    },
                    1024: {
                        slidesPerView: 4, 
                        spaceBetween: 24,
                    },
                }}

                className="pb-12"
            >
                {blogs.map((blog) => (
                    <SwiperSlide key={blog._id} className="h-auto my-4 ">
                        <Card className="rounded-[5px] group hover:shadow-xl py-0 transition-all duration-300 transform hover:-translate-y-1 h-full">
                            <CardContent className="p-0 flex flex-col h-full">
                                {/* Blog Image */}
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                    <Link href={`/blogs/${blog.slug}`}>
                                        <img
                                            src={blog.image || "/placeholder.svg?height=400&width=600"}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                        />
                                    </Link>
                                </div>

                                {/* Blog Details */}
                                <div className="p-5 flex flex-col flex-grow">
                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(blog.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span>{blog.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{calculateReadTime(blog.content)} min read</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <Link href={`/blogs/${blog.slug}`}>
                                        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
                                            {blog.title}
                                        </h3>
                                    </Link>

                                    {/* Excerpt */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{blog.excerpt}</p>

                                    {/* Read More Link */}
                                    <Link href={`/blogs/${blog.slug}`}>
                                        <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 font-semibold">
                                            Read More →
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

export default BlogSlider
