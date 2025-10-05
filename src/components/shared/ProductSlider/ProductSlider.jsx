"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import useAuthContext from "@/hooks/useAuthContext"
import { addToCart } from "@/utils/cartUtils"
import axios from "axios"
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import "swiper/css"
import "swiper/css/navigation"
import { Autoplay, Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const ProductSlider = ({
  title = "Featured Products",
  excludeProductId = null,
  category = null,
  limit = 8,
  autoplay = true,
  showAddToCart = true,
  className = "",
}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuthContext()

  useEffect(() => {
    fetchProducts()
  }, [excludeProductId, category, limit])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      let data = await response.json()

      if (excludeProductId) {
        data = data.filter((product) => product._id !== excludeProductId)
      }

      if (category) {
        data = data.filter((product) => product.category?.toLowerCase().includes(category.toLowerCase()))
      }

      const shuffled = data.sort(() => 0.5 - Math.random())
      setProducts(shuffled.slice(0, limit))
    } catch (err) {
      setError(err.message)
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (user?.email) {
        await axios.post("/api/cart", {
          email: user.email,
          productImage: product.mainImages?.[0]?.url || "",
          price: product.price,
          title: product.title,
          currency: product.currency,
          quantity: 1,
        })

        Swal.fire({
          title: "Added to Cart!",
          text: `${product.title} has been added to your cart.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        addToCart(product, 1)

        Swal.fire({
          title: "Added to Cart!",
          text: `${product.title} has been added to your cart. Please login to sync your cart.`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      Swal.fire({
        title: "Error!",
        text: "Failed to add product to cart. Please try again.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      })
    }
  }

  const formatPrice = (price) => {
    return typeof price === "string" ? Number.parseInt(price) : price
  }

  const calculateDiscount = (price, comparePrice) => {
    if (!comparePrice) return 0
    const originalPrice = formatPrice(comparePrice)
    const currentPrice = formatPrice(price)
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  if (loading) {
    return (
      <div className={`${className} container mx-auto p-4`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || products.length === 0) {
    return null
  }

  return (
    <div className={`${className} container mx-auto p-4`}>
      {/* Header with View All Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <Link href="/shop">
            <Button variant="outline" size="default" className="hidden sm:flex bg-transparent">
              View All Products
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="swiper-button-prev-custom h-10 w-10 rounded-full bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="swiper-button-next-custom h-10 w-10 rounded-full bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Slider */}
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        slidesPerGroup={1}
        navigation={{
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
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
        loop={true}
        breakpoints={{
          640: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        }}
        className="pb-12"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id} className="h-auto my-4">
            <Card className="py-0 rounded-[5px] group border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col bg-white">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <Link href={`/shop/${product._id}`}>
                    <img
                      src={product.mainImages?.[0]?.url || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {product.compareAtPrice && (
                      <Badge className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-md">
                        {calculateDiscount(product.price, product.compareAtPrice)}% OFF
                      </Badge>
                    )}
                    {product.quantity === 0 && (
                      <Badge className="bg-gray-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-md">
                        SOLD OUT
                      </Badge>
                    )}
                    {product.quantity > 0 && product.quantity <= 5 && (
                      <Badge className="bg-orange-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-md">
                        Only {product.quantity} left
                      </Badge>
                    )}
                  </div>
                  {/* Add to Cart Button on Hover - Center Bottom */}
                  {showAddToCart && (
                    <div className="absolute  bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.quantity === 0}
                        className="w-full shadow-xl rounded-[5px] font-medium text-xs py-1.5"
                        variant={product.quantity === 0 ? "secondary" : "default"}
                        size="sm"
                      >
                        {product.quantity === 0 ? (
                          "Sold Out"
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1.5" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-2.5 flex flex-col flex-grow space-y-1.5">
                  <Link href={`/shop/${product._id}`}>
                    <h3 className="text-[18px] lg:text-2xl font-semibold text-gray-900 line-clamp-2 cursor-pointer transition-colors min-h-[2.5rem] leading-tight">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-2.5 w-2.5 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-[10px] text-gray-500 ml-1 font-medium">(4.5)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px] lg:text-[20px] font-bold text-gray-900">
                      {product.currency}
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-[16px] lg:text-[20px] text-gray-400 line-through font-medium">
                        {product.currency}
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  {/* Colors Preview */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="flex items-center gap-1 mt-auto pt-1">
                      {product.variants.slice(0, 3).map((variant, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: variant.color }}
                          title={variant.color}
                        />
                      ))}
                      {product.variants.length > 3 && (
                        <span className="text-[10px] text-gray-500 ml-0.5 font-medium">
                          +{product.variants.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ProductSlider
