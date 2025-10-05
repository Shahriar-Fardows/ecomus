"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import useAuthContext from "@/hooks/useAuthContext"
import axios from "axios"
import { ChevronDown, ChevronUp, Flag, ImageIcon, MessageCircle, Reply, Star, ThumbsUp, Upload, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const ReviewSystem = ({ productId, productImage }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [sortBy, setSortBy] = useState("newest")
  const [filterRating, setFilterRating] = useState("all")
  const [selectedImages, setSelectedImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [expandedComments, setExpandedComments] = useState({})
  const [commentTexts, setCommentTexts] = useState({})
  const [submittingComments, setSubmittingComments] = useState({})

  const { user } = useAuthContext()

  useEffect(() => {
    fetchReviews()
  }, [productId, sortBy, filterRating])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      let url = `/api/reviews?productId=${productId}`

      if (sortBy !== "all") {
        url += `&sort=${sortBy}`
      }

      if (filterRating !== "all") {
        url += `&rating=${filterRating}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const uploadImageToImgBB = async (file) => {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("key", "b9d801dc23f129666ab26bcec55288e1")

    try {
      const response = await axios.post("https://api.imgbb.com/1/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data.data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files)
    if (files.length + selectedImages.length > 5) {
      Swal.fire({
        title: "Too many images",
        text: "You can upload maximum 5 images per review.",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/")
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      Swal.fire({
        title: "Invalid files",
        text: "Please select only image files under 5MB each.",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      })
    }

    setSelectedImages((prev) => [...prev, ...validFiles])
  }

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReview = async () => {
    if (!user) {
      Swal.fire({
        title: "Please login to submit a review",
        text: "You need to be logged in to write a review.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login"
        }
      })
      return
    }

    if (!reviewText.trim()) {
      Swal.fire({
        title: "Please write a review",
        text: "Review text cannot be empty.",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    try {
      setSubmittingReview(true)

      let uploadedImageUrls = []
      if (selectedImages.length > 0) {
        setUploadingImages(true)
        try {
          uploadedImageUrls = await Promise.all(selectedImages.map((file) => uploadImageToImgBB(file)))
        } catch (error) {
          console.error("Error uploading images:", error)
          Swal.fire({
            title: "Image upload failed",
            text: "Failed to upload images. Please try again.",
            icon: "error",
            timer: 2000,
            showConfirmButton: false,
          })
          return
        } finally {
          setUploadingImages(false)
        }
      }

      const response = await axios.post("/api/reviews", {
        productId: productId,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        text: reviewText,
        rating: reviewRating,
        productImage: productImage || "",
        userEmail: user.email,
        images: uploadedImageUrls,
      })

      if (response.status === 200 || response.status === 201) {
        setReviewText("")
        setReviewRating(5)
        setSelectedImages([])
        fetchReviews()

        Swal.fire({
          title: "Review submitted!",
          text: "Thank you for your feedback.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      Swal.fire({
        title: "Error!",
        text: "Failed to submit review. Please try again.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleSubmitComment = async (reviewId) => {
    if (!user) {
      Swal.fire({
        title: "Please login to comment",
        text: "You need to be logged in to comment on reviews.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login"
        }
      })
      return
    }

    const commentText = commentTexts[reviewId]?.trim()
    if (!commentText) {
      Swal.fire({
        title: "Please write a comment",
        text: "Comment text cannot be empty.",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    try {
      setSubmittingComments((prev) => ({ ...prev, [reviewId]: true }))

      const response = await axios.post("/api/reviews/comments", {
        reviewId: reviewId,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        text: commentText,
        userEmail: user.email,
      })

      if (response.status === 200 || response.status === 201) {
        setCommentTexts((prev) => ({ ...prev, [reviewId]: "" }))
        fetchReviews()

        Swal.fire({
          title: "Comment posted!",
          text: "Your comment has been added.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      Swal.fire({
        title: "Error!",
        text: "Failed to post comment. Please try again.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      })
    } finally {
      setSubmittingComments((prev) => ({ ...prev, [reviewId]: false }))
    }
  }

  const toggleComments = (reviewId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 5), 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      const rating = review.rating || 5
      distribution[rating]++
    })
    return distribution
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Recently"
    }
  }

  const StarRating = ({ rating, size = "sm", interactive = false, onRatingChange }) => {
    const starSize = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4"

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star className={`${starSize} ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    )
  }

  const ratingDistribution = getRatingDistribution()
  const averageRating = calculateAverageRating()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
            <StarRating rating={Math.round(averageRating)} size="md" />
            <p className="text-gray-600 mt-2">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: reviews.length > 0 ? `${(ratingDistribution[rating] / reviews.length) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>

          {user ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <StarRating rating={reviewRating} size="lg" interactive={true} onRatingChange={setReviewRating} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this product. What did you like or dislike? How was the quality?"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{reviewText.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Photos (Optional)</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="review-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={selectedImages.length >= 5}
                    />
                    <label
                      htmlFor="review-images"
                      className={`flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${
                        selectedImages.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Upload className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {selectedImages.length >= 5 ? "Maximum 5 images" : "Upload Images"}
                      </span>
                    </label>
                    <span className="text-xs text-gray-500">{selectedImages.length}/5 images selected</span>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Upload up to 5 images (max 5MB each). Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || uploadingImages || !reviewText.trim() || reviewText.length > 500}
                className="w-full sm:w-auto"
              >
                {uploadingImages ? "Uploading Images..." : submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Share Your Experience</h4>
              <p className="text-gray-600 mb-4">Please login to write a review and help other customers.</p>
              <Link href="/login">
                <Button>Login to Review</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Customer Reviews ({reviews.length})</h3>

          <div className="flex gap-3">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="date">Oldest First</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {(review.userName || "A").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.userName || "Anonymous"}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating || 5} />
                          <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-3">{review.text}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="mb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {review.images.map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="relative group cursor-pointer">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Review image ${imgIndex + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  Swal.fire({
                                    imageUrl: imageUrl,
                                    imageAlt: `Review image ${imgIndex + 1}`,
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                    customClass: {
                                      image: "max-h-96 object-contain",
                                    },
                                  })
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {review.verifiedPurchase && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verified Purchase
                        </span>
                      </div>
                    )}

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(review._id)}
                          className="text-gray-600 hover:text-gray-800 p-0 h-auto"
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          {review.comments?.length || 0} Comments
                          {expandedComments[review._id] ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </Button>
                      </div>

                      {expandedComments[review._id] && (
                        <div className="space-y-3">
                          {review.comments && review.comments.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {review.comments.map((comment, commentIndex) => (
                                <div key={commentIndex} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                      {(comment.userName || "A").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">
                                        {comment.userName || "Anonymous"}
                                      </span>
                                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {user
                                  ? (user.displayName || user.email?.split("@")[0] || "U").charAt(0).toUpperCase()
                                  : "G"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <Textarea
                                value={commentTexts[review._id] || ""}
                                onChange={(e) => setCommentTexts((prev) => ({ ...prev, [review._id]: e.target.value }))}
                                placeholder={user ? "Write a comment..." : "Please login to comment"}
                                rows={2}
                                className="resize-none text-sm"
                                disabled={!user}
                              />
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitComment(review._id)}
                                  disabled={
                                    !user || submittingComments[review._id] || !commentTexts[review._id]?.trim()
                                  }
                                >
                                  {submittingComments[review._id] ? "Posting..." : "Post Comment"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500 mb-6">Be the first to review this product and help other customers!</p>
              {!user && (
                <Link href="/login">
                  <Button>Login to Write First Review</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ReviewSystem
