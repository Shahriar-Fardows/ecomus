"use client"
import { Button } from "@/components/ui/button"
import { useCloudinary } from "@/hooks/useCloudinary"
import axios from "axios"
import { CheckCircle2, Edit, Package, Plus, Search, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const CategoryManager = () => {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    imageUrl: "",
  })

  // Import Cloudinary hook
  const { uploadImage, uploading } = useCloudinary()

  const showSweetAlert = (title, icon = "success", text = "") => {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: "OK",
      confirmButtonColor: "#f97316",
      timer: icon === "success" ? 3000 : undefined,
      timerProgressBar: true,
    })
  }

  const showDeleteConfirmation = (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${category.name}" category? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteConfirmed(category)
      }
    })
  }

  // Fetch products from API using axios
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/products")
        setProducts(response.data)
      } catch (error) {
        console.error("Error fetching products:", error)
        showSweetAlert("Error!", "error", "Failed to fetch products!")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Fetch categories from API using axios
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/categories")
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        showSweetAlert("Error!", "error", "Failed to fetch categories!")
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const result = await uploadImage(file)
        if (result) {
          setFormData((prev) => ({
            ...prev,
            image: file,
            imageUrl: result.secure_url,
          }))
        }
      } catch (error) {
        console.error("Image upload failed:", error)
        showSweetAlert("Image upload failed!", "error", "Please try again with a different image.")
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.imageUrl) {
      showSweetAlert("Missing Information!", "error", "Please fill all fields and upload an image!")
      return
    }

    setLoading(true)

    const categoryData = {
      name: formData.name,
      image: formData.imageUrl,
      products: selectedProducts.map((p) => p._id), // Use _id from API
    }

    try {
      let response
      if (isEditing) {
        response = await axios.put("/api/categories", {
          id: editingCategory._id,
          ...categoryData,
        })
      } else {
        response = await axios.post("/api/categories", categoryData)
      }

      const result = response.data

      if (isEditing) {
        setCategories((prev) => prev.map((cat) => (cat._id === editingCategory._id ? result : cat)))
        showSweetAlert("Success!", "success", "Category updated successfully!")
      } else {
        setCategories((prev) => [...prev, result])
        showSweetAlert("Success!", "success", "Category created successfully!")
      }

      // Reset form
      setFormData({ name: "", image: null, imageUrl: "" })
      setSelectedProducts([])
      setShowModal(false)
      setIsEditing(false)
      setEditingCategory(null)
    } catch (error) {
      console.error("Error saving category:", error)
      showSweetAlert("Error!", "error", "Failed to save category!")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    setIsEditing(true)
    setEditingCategory(category)
    setFormData({
      name: category.name,
      image: null,
      imageUrl: category.image,
    })
    // Set selected products from the category being edited
    const categoryProducts = []
    
    // Get products from category.products array (populated products)
    if (category.products && Array.isArray(category.products)) {
      category.products.forEach((product) => {
        if (typeof product === 'object' && product._id) {
          categoryProducts.push(product)
        }
      })
    }
    
    // Get products from category.productIds array (just IDs)
    if (category.productIds && Array.isArray(category.productIds)) {
      category.productIds.forEach((productId) => {
        const product = products.find(p => p._id === productId)
        if (product && !categoryProducts.some(cp => cp._id === product._id)) {
          categoryProducts.push(product)
        }
      })
    }
    
    setSelectedProducts(categoryProducts)
    setShowModal(true)
  }

  const handleDelete = (category) => {
    showDeleteConfirmation(category)
  }

  const handleDeleteConfirmed = async (category) => {
    try {
      setLoading(true)
      await axios.delete("/api/categories", {
        data: { id: category._id },
      })

      setCategories((prev) => prev.filter((cat) => cat._id !== category._id))
      showSweetAlert("Deleted!", "success", "Category has been deleted successfully!")
    } catch (error) {
      console.error("Error deleting category:", error)
      showSweetAlert("Error!", "error", "Failed to delete category!")
    } finally {
      setLoading(false)
    }
  }

  const toggleProductSelection = (product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p._id === product._id)
      if (isSelected) {
        return prev.filter((p) => p._id !== product._id)
      } else {
        return [...prev, product]
      }
    })
  }

  const getAvailableProducts = () => {
    // For editing, show all products (user can add/remove any product)
    // For new categories, also show all products (allow assignment to multiple categories)
    return products
  }

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const availableProducts = getAvailableProducts()
  const filteredProducts = availableProducts.filter((product) =>
    product.title?.toLowerCase().includes(productSearchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
        <Button onClick={() => setShowModal(true)} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Category
        </Button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Categories</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by category name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && categories.length === 0 ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="text-gray-500">Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="text-gray-500">No categories found</div>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <Package className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {category.products?.length || category.productIds?.length || 0} products
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(category)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={loading}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(category)}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#00000070] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">{isEditing ? "Edit Category" : "Create New Category"}</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowModal(false)
                  setIsEditing(false)
                  setEditingCategory(null)
                  setFormData({ name: "", image: null, imageUrl: "" })
                  setSelectedProducts([])
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Category Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {formData.imageUrl ? (
                    <div className="text-center">
                      <img
                        src={formData.imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="mx-auto h-32 w-auto rounded-lg mb-4"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("image-upload").click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Change Image"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                        <Package className="w-full h-full" />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload").click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter category name..."
                />
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products for this Category
                </label>

                {/* Product Search */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Selected Products Count */}
                <div className="mb-4">
                  <span className="text-sm text-gray-600">{selectedProducts.length} products selected</span>
                </div>

                {/* Products List */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loading && products.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Loading products...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No products found</div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isSelected = selectedProducts.some((p) => p._id === product._id)
                      return (
                        <div
                          key={product._id}
                          className={`flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                            isSelected ? "bg-orange-50" : ""
                          }`}
                          onClick={() => toggleProductSelection(product)}
                        >
                          <div className="flex items-center flex-1">
                            <img
                              src={product.mainImages?.[0]?.url || "/placeholder.png"}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-md mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{product.title}</div>
                              <div className="text-sm text-gray-500">
                                {product.currency}
                                {product.price} • Stock: {product.quantity}
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  setIsEditing(false)
                  setEditingCategory(null)
                  setFormData({ name: "", image: null, imageUrl: "" })
                  setSelectedProducts([])
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading || uploading}
              >
                {loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManager