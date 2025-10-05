"use client";
import { Button } from "@/components/ui/button";
import { useCloudinary } from "@/hooks/useCloudinary";
import axios from "axios";
import { DollarSign, PackageSearch } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

const AddProductPage = () => {
  // 🔥 mainImage কে array করা হলো
  const [mainImages, setMainImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const { uploadImage } = useCloudinary();

  const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const path = parts[1];
    return path.split(".")[0]; // remove file extension
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const title = form.title.value;
    const description = form.description.value;
    const price = form.price.value;
    const compareAtPrice = form.compareAtPrice.value;
    const costPerItem = form.costPerItem.value;
    const profit = form.profit.value;
    const quantity = form.quantity.value;
    const currency = form.currency.value;

    try {
      Swal.fire({
        title: "Uploading product...",
        text: "Please wait while the product is being uploaded.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // 🔥 একসাথে সব main images upload করা
      const uploadedMainImages = await Promise.all(
        mainImages.map(async (file) => {
          const result = await uploadImage(file);
          const url = result ? result.secure_url : null;
          const publicId = url ? getPublicIdFromUrl(url) : null;
          return { url, publicId };
        })
      );

      // Variant images upload
      const uploadedVariantImages = await Promise.all(
        variants.map(async (variant) => {
          if (variant.image) {
            const result = await uploadImage(variant.image);
            const url = result ? result.secure_url : null;
            const publicId = url ? getPublicIdFromUrl(url) : null;
            return { url, publicId };
          }
          return { url: null, publicId: null };
        })
      );

      // Final product data
      const productData = {
        title,
        description,
        mainImages: uploadedMainImages, // 🔥 multiple image array
        currency,
        price,
        compareAtPrice,
        costPerItem,
        profit,
        quantity,
        variants: variants.map((variant, idx) => ({
          ...variant,
          image: uploadedVariantImages[idx].url,
          imagePublicId: uploadedVariantImages[idx].publicId,
        })),
      };

      await axios.post("/api/products", productData);

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Product added successfully!",
        showConfirmButton: false,
        timer: 2000,
      });

      form.reset();
      setMainImages([]); // reset multiple
      setVariants([]);
    } catch (error) {
      Swal.close();
      console.error("Error adding product:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add product. Please try again.",
      });
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), image: null, color: "", sizes: [], extraPrice: "" },
    ]);
  };

  const updateVariant = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const addSizeToVariant = (id, size) => {
    if (!size) return;
    setVariants((prev) =>
      prev.map((v) =>
        v.id === id && !v.sizes.includes(size)
          ? { ...v, sizes: [...v.sizes, size] }
          : v
      )
    );
  };

  const removeSizeFromVariant = (id, size) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, sizes: v.sizes.filter((s) => s !== size) } : v
      )
    );
  };

  const removeVariant = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Add Product</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-[#ff6c2f] border-[#ff6c2f] hover:bg-[#e65b1f]"
            type="submit"
            form="product-form"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Form */}
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Product Title
          </label>
          <input
            type="text"
            name="title"
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#ff6c2f] focus:ring-[#ff6c2f]"
            placeholder="Enter product title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Product Description
          </label>
          <textarea
            name="description"
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#ff6c2f] focus:ring-[#ff6c2f]"
            placeholder="Enter product description"
            rows="4"
          ></textarea>
        </div>

        {/* 🔥 Multiple Main Images Upload */}
        <div className="relative my-6">
          <input
            id="id-dropzone01"
            name="file-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => setMainImages(Array.from(e.target.files))} // ✅ এখানে mainImages state এ ফাইল যাবে
          />
          <label
            htmlFor="id-dropzone01"
            className="relative flex cursor-pointer flex-col items-center gap-4 rounded border border-dashed border-slate-300 px-3 py-6 text-center text-sm font-medium transition-colors"
          >
            <span className="inline-flex h-12 items-center justify-center self-center rounded-full bg-slate-100/70 px-3 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-label="File input icon"
                role="graphics-symbol"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                />
              </svg>
            </span>
            <span className="text-slate-500">
              Drag & drop or
              <span className="text-emerald-500"> upload files</span>
            </span>
          </label>
        </div>



        {/* Pricing & Variants code একই থাকবে */} {/* Pricing Section */}
        <div className="w-full bg-white border rounded-lg overflow-hidden">
          <div className="bg-[#fff7ed] text-gray-900 p-4 flex items-center justify-between">
            <h2 className="flex items-center space-x-2 text-lg font-medium">
              <DollarSign className="w-5 h-5 text-[#ff6c2f]" />
              <span>Pricing</span>
            </h2>
            <select
              name="currency"
              id="currency"
              className="rounded-lg bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6c2f]"
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
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="price" type="number" placeholder="Product Price" className="rounded-lg border p-2 text-sm" />
            <input name="compareAtPrice" type="number" placeholder="Compare-at price" className="rounded-lg border p-2 text-sm" />
            <input name="costPerItem" type="number" placeholder="Cost per item" className="rounded-lg border p-2 text-sm" />
            <input name="profit" type="number" placeholder="Profit" className="rounded-lg border p-2 text-sm" />
            <input name="quantity" type="number" placeholder="Product Quantity" className="rounded-lg border p-2 text-sm" />
          </div>
        </div>

        {/* Variant Section */}
        <div className="w-full bg-white border rounded-lg overflow-hidden">
          <div className="bg-[#fff7ed] text-gray-900 p-4 flex items-center justify-between">
            <h2 className="flex items-center space-x-2 text-lg font-medium">
              <PackageSearch className="w-5 h-5 text-[#ff6c2f]" />
              <span>Product Variants</span>
            </h2>
            <Button
              type="button"
              size="sm"
              onClick={addVariant}
              className="bg-[#ff6c2f] border-[#ff6c2f] hover:bg-[#e65b1f]"
            >
              Add Variant
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {variants.map((variant, idx) => (
              <div
                key={variant.id}
                className="p-4 border rounded-lg space-y-3 bg-gray-50"
              >
                <h3 className="font-medium">Variant {idx + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      updateVariant(variant.id, "image", e.target.files[0])
                    }
                    className="rounded-lg border p-2 text-sm"
                  />

                  {/* Color Selector */}
                  <input
                    type="color"
                    value={variant.color}
                    onChange={(e) => updateVariant(variant.id, "color", e.target.value)}
                    className="w-full h-12 p-1 rounded cursor-pointer border"
                  />


                  {/* Size Multiple */}
                  <div>
                    <input
                      type="text"
                      placeholder="Enter size and press Add"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSizeToVariant(variant.id, e.target.value.trim());
                          e.target.value = "";
                        }
                      }}
                      className="rounded-lg border p-2 text-sm w-full"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {variant.sizes?.map((size) => (   // ✅ safe map
                        <span
                          key={size}
                          className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center gap-1"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => removeSizeFromVariant(variant.id, size)}
                            className="text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Extra Price */}
                  <input
                    type="number"
                    value={variant.extraPrice}
                    onChange={(e) =>
                      updateVariant(variant.id, "extraPrice", e.target.value)
                    }
                    className="rounded-lg border p-2 text-sm"
                    placeholder="Extra Price"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="bg-red-500 hover:bg-red-600 text-white mt-2"
                  size="sm"
                >
                  Remove Variant
                </Button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
