"use client";
import ReviewSystem from "@/components/shared/ReviewSystem/ReviewSystem";
import { Button } from "@/components/ui/button";
import useAuthContext from "@/hooks/useAuthContext";
import { addToCart } from "@/utils/cartUtils";
import axios from "axios";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "./shop.css";

const ProductDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Product selection states
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchProductDetails();
      fetchRelatedProducts();
    }
  }, [params.id]);

  useEffect(() => {
    if (product && selectedColor) {
      const selectedVariant = product.variants?.find((v) => v.color === selectedColor);
      if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
        setCurrentImages(selectedVariant.images);
      } else {
        setCurrentImages(product.mainImages || []);
      }
    } else if (product) {
      setCurrentImages(product.mainImages || []);
    }
  }, [product, selectedColor]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?id=${params.id}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      const data = await response.json();
      setProduct(data);

      if (data.variants && data.variants.length > 0) {
        setSelectedColor(data.variants[0].color);
        if (data.variants[0].sizes && data.variants[0].sizes.length > 0) {
          setSelectedSize(data.variants[0].sizes[0]);
        }
      }

      setCurrentImages(data.mainImages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((p) => p._id !== params.id);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 8));
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Swal.fire({
        title: "Please login to add to cart",
        text: "You need to be logged in to add items to your cart.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      return;
    }

    if (!selectedColor && product.variants && product.variants.length > 0) {
      Swal.fire({
        title: "Please select a color",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!selectedSize && product.variants && product.variants.some((v) => v.sizes && v.sizes.length > 0)) {
      Swal.fire({
        title: "Please select a size",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      if (user?.email) {
        await axios.post("/api/cart", {
          email: user.email,
          productImage: currentImages?.[0]?.url || "",
          price: product.price,
          title: product.title,
          quantity: quantity,
          currency: product.currency,
          selectedColor: selectedColor,
          selectedSize: selectedSize,
        });

        Swal.fire({
          title: "Added to Cart!",
          text: `${quantity} x ${product.title} has been added to your cart.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        addToCart(product, quantity, selectedColor, selectedSize);

        Swal.fire({
          title: "Added to Cart!",
          text: `${quantity} x ${product.title} has been added to your cart. Please login to sync your cart.`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to add product to cart. Please try again.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleColorSelection = (color) => {
    setSelectedColor(color);
    const selectedVariant = product.variants?.find((v) => v.color === color);
    if (selectedVariant?.sizes && selectedVariant.sizes.length > 0) {
      setSelectedSize(selectedVariant.sizes[0]);
    } else {
      setSelectedSize("");
    }
  };

  const formatPrice = (price) => {
    return typeof price === "string" ? Number.parseInt(price) : price;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The product you are looking for does not exist."}</p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded overflow-hidden">
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                thumbs={{ swiper: thumbsSwiper }}
                navigation
                pagination={{ clickable: true }}
                className="h-full"
                key={selectedColor}
              >
                {currentImages &&
                  currentImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>

            {currentImages && currentImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (thumbsSwiper) thumbsSwiper.slideTo(index);
                    }}
                    className="aspect-square bg-gray-50 rounded overflow-hidden border-2 border-transparent hover:border-gray-300"
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-gray-900">
                {product.currency}
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {product.currency}
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                    {Math.round(
                      ((formatPrice(product.compareAtPrice) - formatPrice(product.price)) /
                        formatPrice(product.compareAtPrice)) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.quantity > 0 ? (
                <span className="text-sm text-green-600">✓ {product.quantity} in stock</span>
              ) : (
                <span className="text-sm text-red-600">Out of stock</span>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-6">
              {/* Color Selection */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                  </label>
                  <div className="flex gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelection(variant.color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === variant.color ? "border-gray-900" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: variant.color }}
                        title={variant.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.variants && selectedColor && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Size</label>
                  <div className="flex gap-2">
                    {product.variants
                      .find((v) => v.color === selectedColor)
                      ?.sizes?.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 text-sm border rounded ${
                            selectedSize === size
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-300 bg-white text-gray-900 hover:border-gray-900"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Quantity</label>
                <div className="inline-flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    disabled={quantity >= product.quantity}
                    className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.quantity === 0 ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-gray-200 py-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>

        {/* Reviews */}
        <div className="border-t border-gray-200 py-12 mb-12">
          <ReviewSystem productId={params.id} productImage={currentImages?.[0]?.url || ""} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
            >
              {relatedProducts.map((relatedProduct) => (
                <SwiperSlide key={relatedProduct._id}>
                  <Link href={`/shop/${relatedProduct._id}`}>
                    <div className="group">
                      <div className="aspect-square bg-gray-50 rounded overflow-hidden mb-3">
                        <img
                          src={relatedProduct.mainImages?.[0]?.url || "/placeholder.svg"}
                          alt={relatedProduct.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {relatedProduct.title}
                      </h3>
                      <p className="text-lg font-bold text-gray-900">
                        {relatedProduct.currency}
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;