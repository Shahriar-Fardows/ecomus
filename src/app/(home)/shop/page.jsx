"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import useAuthContext from "@/hooks/useAuthContext"
import { addToCart } from "@/utils/cartUtils"
import axios from "axios"
import { Filter, Search, ShoppingCart, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const ProductPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [sortBy, setSortBy] = useState("default")
  const [searchTerm, setSearchTerm] = useState("")

  // Available filter options
  const [availableColors, setAvailableColors] = useState([])
  const [availableSizes, setAvailableSizes] = useState([])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [currency, setCurrency] = useState("৳")

  const { user } = useAuthContext()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProducts(data)
        setFilteredProducts(data)

        const colors = new Set()
        const sizes = new Set()
        let highestPrice = 0

        data.forEach((product) => {
          const price = typeof product.price === "string" ? Number.parseInt(product.price) : product.price
          if (price > highestPrice) highestPrice = price

          if (product.currency && !currency) {
            setCurrency(product.currency)
          }

          if (product.variants) {
            product.variants.forEach((variant) => {
              if (variant.color) colors.add(variant.color)
              if (variant.sizes) {
                variant.sizes.forEach((size) => sizes.add(size))
              }
            })
          }
        })

        setAvailableColors(Array.from(colors))
        setAvailableSizes(Array.from(sizes))
        setMaxPrice(highestPrice)
        setPriceRange([0, highestPrice])
        setError(null)
      } catch (err) {
        setError("Failed to fetch products. Please try again later.")
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    filtered = filtered.filter((product) => {
      const price = typeof product.price === "string" ? Number.parseInt(product.price) : product.price
      return price >= priceRange[0] && price <= priceRange[1]
    })

    if (selectedColors.length > 0) {
      filtered = filtered.filter(
        (product) => product.variants && product.variants.some((variant) => selectedColors.includes(variant.color)),
      )
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.variants &&
          product.variants.some(
            (variant) => variant.sizes && variant.sizes.some((size) => selectedSizes.includes(size)),
          ),
      )
    }

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
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, priceRange, selectedColors, selectedSizes, sortBy])

  const formatPrice = (price) => {
    return typeof price === "string" ? Number.parseInt(price) : price
  }

  const handleColorFilter = (color) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const handleSizeFilter = (size) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const handleAddToCart = async (product) => {
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

        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { product, action: "add" } }))

        Swal.fire({
          title: "Added to Cart!",
          text: `${product.title} has been added to your cart.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        addToCart(product, 1)

        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { product, action: "add" } }))

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

  const clearFilters = () => {
    setSearchTerm("")
    setPriceRange([0, maxPrice])
    setSelectedColors([])
    setSelectedSizes([])
    setSortBy("default")
  }

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 space-y-6 ${isMobile ? 'h-full overflow-y-auto' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {isMobile && (
          <button onClick={() => setShowFilters(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={maxPrice}
            min={0}
            step={10}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {currency}
              {priceRange[0]}
            </span>
            <span>
              {currency}
              {priceRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Colors */}
      {availableColors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Colors</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorFilter(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColors.includes(color) ? "border-gray-900 ring-2 ring-gray-300" : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Sizes</label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeFilter(size)}
                className={`px-3 py-1 text-sm border rounded ${
                  selectedSizes.includes(size)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full flex items-center justify-center gap-2 bg-transparent"
      >
        <X className="h-4 w-4" />
        Clear All Filters
      </Button>

      {isMobile && (
        <Button
          onClick={() => setShowFilters(false)}
          className="w-full"
        >
          Show {filteredProducts.length} Products
        </Button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Products...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the latest products</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite collection of jewelry and accessories
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar />
            </div>
          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                <FilterSidebar isMobile={true} />
              </div>
            </div>
          )}

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {/* Sort and Results */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Filter Button */}
                  <Button
                    onClick={() => setShowFilters(true)}
                    variant="outline"
                    className="lg:hidden flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                  
                  <p className="text-gray-600 text-sm sm:text-base">
                    Showing {filteredProducts.length} of {products.length} products
                  </p>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-300 py-0">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      <Link href={`/shop/${product._id}`}>
                        {product.mainImages && product.mainImages.length > 0 ? (
                          <img
                            src={product.mainImages[0].url || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image Available
                          </div>
                        )}
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.compareAtPrice && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {Math.round(
                              ((formatPrice(product.compareAtPrice) - formatPrice(product.price)) /
                                formatPrice(product.compareAtPrice)) *
                                100,
                            )}
                            % OFF
                          </Badge>
                        )}
                        {product.quantity === 0 && <Badge className="bg-gray-500 text-white text-xs">SOLD OUT</Badge>}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-3 sm:p-4">
                      <Link href={`/shop/${product._id}`}>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">
                          {product.currency || currency}
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            {product.currency || currency}
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      {/* Colors */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="mb-3">
                          <div className="flex gap-1">
                            {product.variants.slice(0, 4).map((variant, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: variant.color }}
                                title={`Color: ${variant.color}`}
                              />
                            ))}
                            {product.variants.length > 4 && (
                              <span className="text-xs text-gray-500 ml-1">+{product.variants.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantity === 0}
                        className="w-full flex items-center justify-center gap-2 text-sm sm:text-base"
                        variant={product.quantity === 0 ? "secondary" : "default"}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.quantity === 0 ? "Sold Out" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Products Message */}
            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-4 px-4">
                  {searchTerm || selectedColors.length > 0 || selectedSizes.length > 0
                    ? "Try adjusting your filters to see more products."
                    : "There are no products available at the moment."}
                </p>
                {(searchTerm || selectedColors.length > 0 || selectedSizes.length > 0) && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage