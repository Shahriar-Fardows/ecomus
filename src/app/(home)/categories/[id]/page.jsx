"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useAuthContext from "@/hooks/useAuthContext"
import { addToCart } from "@/utils/cartUtils"
import axios from "axios"
import { Package, ShoppingCart, Star } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const CategoryPage = () => {
  const params = useParams()
  const categoryId = params.id
  const { user } = useAuthContext()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter states
  const [sortBy, setSortBy] = useState("default")
  const [priceRange, setPriceRange] = useState("all")
  const [selectedColor, setSelectedColor] = useState("all")

  useEffect(() => {
    fetchCategoryData()
  }, [categoryId])

  useEffect(() => {
    applyFilters()
  }, [products, sortBy, priceRange, selectedColor])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch category data")
      }

      const data = await response.json()
      const foundCategory = data.find((cat) => cat._id === categoryId)

      if (!foundCategory) {
        throw new Error("Category not found")
      }

      setCategory(foundCategory)
      setProducts(foundCategory.products || [])
      setFilteredProducts(foundCategory.products || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching category:", err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        const price = typeof product.price === "string" ? Number.parseInt(product.price) : product.price
        switch (priceRange) {
          case "under-100":
            return price < 100
          case "100-200":
            return price >= 100 && price <= 200
          case "200-300":
            return price >= 200 && price <= 300
          case "over-300":
            return price > 300
          default:
            return true
        }
      })
    }

    // Color filter
    if (selectedColor !== "all") {
      filtered = filtered.filter((product) => product.variants?.some((variant) => variant.color === selectedColor))
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = typeof a.price === "string" ? Number.parseInt(a.price) : a.price
          const priceB = typeof b.price === "string" ? Number.parseInt(b.price) : b.price
          return priceA - priceB
        })
        break
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = typeof a.price === "string" ? Number.parseInt(a.price) : a.price
          const priceB = typeof b.price === "string" ? Number.parseInt(b.price) : b.price
          return priceB - priceA
        })
        break
      case "name-az":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "name-za":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
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
          quantity: 1,
          currency: product.currency,
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

  // Get unique colors from all products
  const availableColors = Array.from(
    new Set(products.flatMap((product) => product.variants?.map((v) => v.color) || []))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The category you're looking for doesn't exist."}</p>
          <Link href="/categories">
            <Button>Browse All Categories</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-gray-900">Categories</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
          </p>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter Bar */}
        <div className="bg-gray-50 rounded p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-az">Name: A to Z</SelectItem>
                  <SelectItem value="name-za">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-100">Under ৳100</SelectItem>
                  <SelectItem value="100-200">৳100 - ৳200</SelectItem>
                  <SelectItem value="200-300">৳200 - ৳300</SelectItem>
                  <SelectItem value="over-300">Over ৳300</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Filter */}
            {availableColors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <span>{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reset Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSortBy("default")
                  setPriceRange("all")
                  setSelectedColor("all")
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more products.</p>
            <Button
              onClick={() => {
                setSortBy("default")
                setPriceRange("all")
                setSelectedColor("all")
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="group">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-50 rounded overflow-hidden mb-3">
                  <Link href={`/shop/${product._id}`}>
                    <img
                      src={product.mainImages?.[0]?.url || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Badges */}
                  {product.compareAtPrice && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        -{calculateDiscount(product.price, product.compareAtPrice)}%
                      </span>
                    </div>
                  )}

                  {product.quantity === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Add to Cart on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={product.quantity === 0}
                      className="w-full"
                      size="sm"
                    >
                      {product.quantity === 0 ? (
                        "Sold Out"
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <Link href={`/shop/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-gray-600 transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {product.currency}
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {product.currency}
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  {/* Colors Preview */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {product.variants.slice(0, 3).map((variant, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: variant.color }}
                          title={variant.color}
                        />
                      ))}
                      {product.variants.length > 3 && (
                        <span className="text-xs text-gray-500">+{product.variants.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage