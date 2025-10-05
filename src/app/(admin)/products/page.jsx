"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ProductsTable = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceFilter, setPriceFilter] = useState("");
    const [stockFilter, setStockFilter] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    // Fetch products
    const fetchProducts = async () => {
        try {
            const response = await axios.get("/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Delete product with SweetAlert
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete("/api/products", { data: { id } });
                setProducts(products.filter((p) => p._id !== id));
                Swal.fire("Deleted!", "Product has been deleted.", "success");
            } catch (error) {
                Swal.fire("Error!", "Failed to delete product.", "error");
            }
        }
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setIsEditing(false);
        setEditFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            quantity: product.quantity,
            profit: product.profit,
            currency: product.currency,
            variants: product.variants.map(variant => ({
                color: variant.color,
                sizes: variant.sizes
            }))
        });
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setIsEditing(false);
        setEditFormData({});
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleVariantChange = (variantIndex, field, value) => {
        setEditFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, index) =>
                index === variantIndex ? { ...variant, [field]: value } : variant
            )
        }));
    };

    const handleSizeChange = (variantIndex, sizeIndex, value) => {
        setEditFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, index) =>
                index === variantIndex
                    ? {
                        ...variant,
                        sizes: variant.sizes.map((size, idx) => idx === sizeIndex ? value : size)
                    }
                    : variant
            )
        }));
    };

    const handleUpdate = async () => {
        try {
            const updatedData = {
                id: selectedProduct._id,
                ...editFormData
            };

            await axios.put("/api/products", updatedData);

            // Update local state
            setProducts(products.map(product =>
                product._id === selectedProduct._id
                    ? { ...product, ...editFormData }
                    : product
            ));

            // Update selected product
            setSelectedProduct({ ...selectedProduct, ...editFormData });
            setIsEditing(false);

            Swal.fire({
                title: "Updated!",
                text: "Product has been updated successfully.",
                icon: "success",
                customClass: {
                    popup: 'rounded-xl shadow-2xl'
                }
            });
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Failed to update product.",
                icon: "error",
                customClass: {
                    popup: 'rounded-xl shadow-2xl'
                }
            });
        }
    };

    // Filter and search logic
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesPrice = priceFilter === "" ||
            (priceFilter === "low" && product.price < 500) ||
            (priceFilter === "medium" && product.price >= 500 && product.price <= 1500) ||
            (priceFilter === "high" && product.price > 1500);

        const matchesStock = stockFilter === "" ||
            (stockFilter === "in-stock" && product.quantity > 0) ||
            (stockFilter === "low-stock" && product.quantity > 0 && product.quantity <= 10) ||
            (stockFilter === "out-of-stock" && product.quantity === 0);

        return matchesSearch && matchesPrice && matchesStock;
    });

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <span className="text-lg text-gray-700">Loading products...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Products</h1>
                    <p className="text-gray-600">Manage your product inventory</p>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 p-4">
                    <div className="grid md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Products
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by title or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range
                            </label>
                            <select
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Prices</option>
                                <option value="low">Under 500</option>
                                <option value="medium">500 - 1500</option>
                                <option value="high">Above 1500</option>
                            </select>
                        </div>

                        {/* Stock Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Status
                            </label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Stock</option>
                                <option value="in-stock">In Stock</option>
                                <option value="low-stock">Low Stock (≤10)</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600">
                            Showing {filteredProducts.length} of {products.length} products
                        </p>

                        {/* Clear Filters */}
                        {(searchTerm || priceFilter || stockFilter) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setPriceFilter("");
                                    setStockFilter("");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Table Container */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Images</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Title</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Price</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Quantity</th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        {/* Images */}
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {product.mainImages.slice(0, 3).map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img.url}
                                                        alt={product.title}
                                                        className="w-12 h-12 object-cover rounded border"
                                                    />
                                                ))}
                                                {product.mainImages.length > 3 && (
                                                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                                        <span className="text-xs text-gray-600">
                                                            +{product.mainImages.length - 3}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Title */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{product.title}</div>
                                            {product.description && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {product.description.substring(0, 50)}...
                                                </div>
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {product.currency} {product.price}
                                            </div>
                                            {product.compareAtPrice && (
                                                <div className="text-sm text-gray-400 line-through">
                                                    {product.currency} {product.compareAtPrice}
                                                </div>
                                            )}
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.quantity > 10
                                                    ? 'bg-green-100 text-green-800'
                                                    : product.quantity > 0
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.quantity} units
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                                    onClick={() => handleViewDetails(product)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                                    onClick={() => handleDelete(product._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && products.length > 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-3">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-1">No products match your filters</h3>
                                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                            </div>
                        )}

                        {/* No Products at all */}
                        {products.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-3">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-1">No products found</h3>
                                <p className="text-gray-400">Add your first product to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-[#0000005e] bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-lg">
                        {/* Modal Header */}
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">{selectedProduct.title}</h2>
                                <div className="flex items-center gap-2">
                                    {!isEditing ? (
                                        <button
                                            onClick={handleEditToggle}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                        >
                                            Edit Product
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleUpdate}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={handleEditToggle}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Column - Product Info */}
                                <div className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Title</h3>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editFormData.title}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{selectedProduct.title}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-600">{selectedProduct.description}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        {/* Price */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Price</h4>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={editFormData.currency}
                                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                                        className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="৳">BDT (৳)</option>
                                                        <option value="$">USD ($)</option>
                                                        <option value="€">EUR (€)</option>
                                                        <option value="£">GBP (£)</option>
                                                        <option value="₹">INR (₹)</option>
                                                        <option value="﷼">SAR (﷼)</option>
                                                        <option value="د.إ">AED (د.إ)</option>
                                                        <option value="C$">CAD (C$)</option>
                                                        <option value="A$">AUD (A$)</option>
                                                        <option value="¥">JPY (¥)</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        value={editFormData.price}
                                                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-xl font-bold text-gray-900">
                                                    {selectedProduct.currency} {selectedProduct.price}
                                                </p>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Quantity</h4>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editFormData.quantity}
                                                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-xl font-bold text-gray-900">{selectedProduct.quantity}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Compare At Price */}
                                    {(selectedProduct.compareAtPrice || isEditing) && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Compare At Price</h4>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editFormData.compareAtPrice || ''}
                                                    onChange={(e) => handleInputChange('compareAtPrice', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter compare price"
                                                />
                                            ) : (
                                                <p className="text-lg text-gray-600">
                                                    {selectedProduct.currency} {selectedProduct.compareAtPrice}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Profit */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Profit</h4>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editFormData.profit}
                                                onChange={(e) => handleInputChange('profit', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-lg text-gray-600">{selectedProduct.profit}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Images */}
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-4">Product Images</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedProduct.mainImages.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img.url}
                                                alt={selectedProduct.title}
                                                className="w-full object-cover rounded border hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Variants Section */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Product Variants</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {selectedProduct.variants.map((variant, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: variant.color }}
                                                ></div>
                                                <span className="font-medium text-gray-700">Color</span>
                                            </div>

                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-gray-600">Sizes: </span>
                                                <span className="text-sm text-gray-800">{variant.sizes.join(", ")}</span>
                                            </div>

                                            <img
                                                src={variant.image}
                                                alt="Variant"
                                                className="w-full  object-cover rounded border"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsTable;