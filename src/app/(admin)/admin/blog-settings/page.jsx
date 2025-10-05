"use client"

import useAuthContext from "../../../../hooks/useAuthContext"
import { useCloudinary } from "../../../../hooks/useCloudinary"
import axios from "axios"
import { AlertCircle, Edit2, Image, Plus, Save, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"


export default function BlogAdminPanel() {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingBlog, setEditingBlog] = useState(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const { user } = useAuthContext()

    const { uploadImage, deleteImage, uploading, imageUrl, setImageUrl } = useCloudinary()

    const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    imagePublicId: "",
    author: "", // initial empty
    tags: "",
    metaTitle: "",
    metaDescription: "",
    published: true,
});

useEffect(() => {
    if (user?.displayName) {
        setFormData(prev => ({ ...prev, author: user.displayName }));
    }
}, [user]);


    useEffect(() => {
        fetchBlogs()
    }, [])


    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/blogs")
            setBlogs(response.data)
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load blogs.",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: "warning",
                title: "File Too Large",
                text: "Image size cannot exceed 5MB.",
            })
            return
        }

        const result = await uploadImage(file)
        if (result) {
            setFormData({
                ...formData,
                image: result.secure_url,
                imagePublicId: result.public_id,
            })

            Swal.fire({
                icon: "success",
                title: "Uploaded!",
                text: "Image uploaded successfully.",
                timer: 2000,
                showConfirmButton: false,
            })
        }
    }


    const handleRemoveImage = async () => {
        if (formData.imagePublicId) {
            await deleteImage(formData.imagePublicId)
        }
        setFormData({ ...formData, image: "", imagePublicId: "" })
        setImageUrl("")
    }

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/--+/g, "-")
            .trim()
    }

    const handleTitleChange = (title) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
            metaTitle: title.substring(0, 60),
        })
    }


    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title || !formData.content || !formData.image) {
            Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Title, Content and Image are required!",
            })
            return
        }

        try {
            setLoading(true)
            const blogData = {
                ...formData,
                tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                createdAt: editingBlog?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            if (editingBlog) {
                await axios.put("/api/blogs", { id: editingBlog.id, ...blogData })
                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Blog updated successfully!",
                    timer: 3000,
                    showConfirmButton: false,
                })
            } else {
                await axios.post("/api/blogs", blogData)
                Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "New blog added successfully!",
                    timer: 3000,
                    showConfirmButton: false,
                })
            }

            resetForm()
            fetchBlogs()
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to save the blog.",
            })
        } finally {
            setLoading(false)
        }
    }


    const handleEdit = (blog) => {
        setEditingBlog(blog)
        setFormData({
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt || "",
            content: blog.content,
            image: blog.image,
            imagePublicId: blog.imagePublicId || "",
            author: blog.author || "",
            category: blog.category || "",
            tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
            metaTitle: blog.metaTitle || blog.title,
            metaDescription: blog.metaDescription || "",
            published: blog.published !== false,
        })
        setShowForm(true)
    }


   const handleDelete = async (blog) => {
  // Confirm dialog প্রথমে দেখাও
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this blog?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel"
  })

  if (!result.isConfirmed) return // Cancel করলে exit

  try {
    setLoading(true)

    // যদি image থাকে, সেটাও delete করো
    if (blog.imagePublicId) {
      await deleteImage(blog.imagePublicId)
    }

    // API call to delete blog
    await axios.delete("/api/blogs", { data: { id: blog._id } })

    // Success alert
    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Blog deleted successfully!",
      timer: 3000,
      showConfirmButton: false,
    })

    fetchBlogs() // Update UI
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Failed to delete the blog.",
    })
  } finally {
    setLoading(false)
  }
}



    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            image: "",
            imagePublicId: "",
            author: "",
            category: "",
            tags: "",
            metaTitle: "",
            metaDescription: "",
            published: true,
        })
        setEditingBlog(null)
        setShowForm(false)
        setImageUrl("")
    }

    return (
        <div className=" p-4 md:p-8">
            <div className="container ">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Blog Admin Panel</h1>
                            <p className="text-gray-600 mt-1">Manage your SEO-optimized blog posts</p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 bg-[#ff6c2f] text-white px-6 py-3 rounded-lg hover:bg-[#e55a26] transition"
                            >
                                <Plus size={20} />
                                New Blog
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                        {success}
                    </div>
                )}

                {showForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                            </h2>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Blog Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter blog title..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    URL Slug (SEO)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                    placeholder="auto-generated-slug"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Featured Image *
                                </label>
                                {!formData.image ? (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <Image size={48} className="text-gray-400 mb-2" />
                                        <span className="text-gray-600">Click to upload image</span>
                                        <span className="text-sm text-gray-500 mt-1">(Max 5MB)</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                                {uploading && <p className="text-blue-600 mt-2">Uploading image...</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Excerpt (Summary)
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief summary of the blog post..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Blog Content *
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={12}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="Write your blog content here... (Supports HTML/Markdown)"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                                    <input
                                        type="text"
                                        value={user?.displayName || ""}
                                        readOnly
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:ring-0 focus:border-gray-300"
                                        placeholder="Author name"
                                    />

                                </div>
                                <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                            </div>


                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Meta Title (60 chars)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            maxLength={60}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">{formData.metaTitle.length}/60</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Meta Description (160 chars)
                                        </label>
                                        <textarea
                                            value={formData.metaDescription}
                                            onChange={(e) =>
                                                setFormData({ ...formData, metaDescription: e.target.value })
                                            }
                                            maxLength={160}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formData.metaDescription.length}/160
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={formData.published}
                                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="published" className="text-sm font-semibold text-gray-700">
                                    Publish immediately
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || uploading}
                                    className="flex items-center gap-2 bg-[#ff6c2f] text-white px-8 py-3 rounded-lg hover:bg-[#e55a26] transition disabled:bg-gray-400"
                                >
                                    <Save size={20} />
                                    {editingBlog ? "Update Blog" : "Create Blog"}
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">All Blog Posts</h2>
                    {loading && !showForm ? (
                        <p className="text-center text-gray-600 py-8">Loading blogs...</p>
                    ) : blogs.length === 0 ? (
                        <p className="text-center text-gray-600 py-8">No blogs found. Create your first blog!</p>
                    ) : (
                        <div className="grid gap-6">
                            {blogs.map((blog) => (
                                <article
                                    key={blog._id || blog.id || index}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                                >
                                    <div className="flex gap-6">
                                        {blog.image && (
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                                className="w-48 h-40 object-cover rounded-lg flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.title}</h3>
                                                    {blog.category && (
                                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                                            {blog.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(blog)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(blog)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            {blog.excerpt && <p className="text-gray-600 mb-3">{blog.excerpt}</p>}
                                            {blog.author && (
                                                <p className="text-sm text-black">Author: {blog.author}</p>
                                            )}
                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {blog.tags.map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}