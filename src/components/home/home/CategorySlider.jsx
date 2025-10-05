"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Autoplay, Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const CategorySlider = ({ title = "Shop by Category", autoplay = true, className = "" }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`${className} container mx-auto p-4 `}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || categories.length === 0) {
    return null
  }

  return (
    <div className={`${className} container mx-auto p-4  `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <Link href="/categories">
            <Button variant="outline" className="hidden sm:flex">
              View All Categories
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="category-button-prev h-10 w-10 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="category-button-next h-10 w-10 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Slider */}
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        navigation={{
          prevEl: ".category-button-prev",
          nextEl: ".category-button-next",
        }}
        
        autoplay={
          autoplay
            ? {
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        loop={categories.length > 5}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 24,
          },
        }}
        className="pb-4"
      >
        {categories.map((category) => (
          <SwiperSlide key={category._id}>
            <Link href={`/categories/${category._id}`}>
              <Card className="py-0 group relative rounded-none overflow-hidden hover:shadow-2xl transition-all duration-300 border-0">
                <CardContent className="p-0">
                  {/* Category Image - Full Card */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" /> */}
                    
                    {/* Category Info - Over Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-black z-10">
                      <h3 className="font-bold text-lg mb-1  transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-black opacity-90">
                        {category.products?.length || 0} {category.products?.length === 1 ? "Product" : "Products"}
                      </p>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default CategorySlider