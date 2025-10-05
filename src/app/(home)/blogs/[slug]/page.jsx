"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Facebook, Linkedin, LinkIcon, Twitter, User } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const BlogDetailPage = () => {
  const params = useParams()
  const [blog, setBlog] = useState(null)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (params.slug) {
      fetchBlog()
    }
  }, [params.slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blogs")
      if (!response.ok) {
        throw new Error("Failed to fetch blog")
      }

      const data = await response.json()
      const foundBlog = data.find((b) => b.slug === params.slug && b.published)

      if (!foundBlog) {
        throw new Error("Blog not found")
      }

      setBlog(foundBlog)

      // Get related blogs (same tags)
      const related = data
        .filter(
          (b) =>
            b._id !== foundBlog._id &&
            b.published &&
            b.tags &&
            foundBlog.tags &&
            b.tags.some((tag) => foundBlog.tags.includes(tag)),
        )
        .slice(0, 3)

      setRelatedBlogs(related)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching blog:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return readTime
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const title = blog?.title || ""

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    }

    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-gray-200 aspect-video rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
            <p className="text-gray-600 mb-8">{error || "The blog post you're looking for doesn't exist."}</p>
            <Link href="/blogs">
              <Button>Back to Blogs</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/blogs" className="hover:text-blue-600">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-900">{blog.title}</span>
          </div>
        </div>

        {/* Blog Header */}
        <div className="mb-8">
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag, index) => (
                <Badge key={index} className="bg-blue-600 text-white">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{blog.title}</h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-gray-600 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{calculateReadTime(blog.content)} min read</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Share:</span>
            <Button variant="outline" size="icon" onClick={() => handleShare("facebook")}>
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleShare("twitter")}>
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleShare("linkedin")}>
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleShare("copy")}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8">
          <img
            src={blog.image || "/placeholder.svg?height=600&width=1200"}
            alt={blog.title}
            className="w-full aspect-video object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 font-medium mb-6">{blog.excerpt}</p>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{blog.content}</div>
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Card
                  key={relatedBlog._id}
                  className="group py-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                      <Link href={`/blog/${relatedBlog.slug}`}>
                        <img
                          src={relatedBlog.image || "/placeholder.svg?height=400&width=600"}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                        />
                      </Link>
                    </div>
                    <div className="p-4">
                      <Link href={`/blog/${relatedBlog.slug}`}>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
                          {relatedBlog.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm line-clamp-2">{relatedBlog.excerpt}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogDetailPage
