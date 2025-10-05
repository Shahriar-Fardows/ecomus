"use client"

import { useState } from "react"
import axios from "axios"
import { useCloudinary } from "@/hooks/useCloudinary"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Upload, Plus, Trash2 } from "lucide-react"

const  BannerCreateModal = ({ isOpen, onClose, onBannerCreated }) => {
  const { uploadImage, uploading, imageUrl, setImageUrl } = useCloudinary()
  const { uploadImage: uploadMobileImage, imageUrl: mobileImageUrl, setImageUrl: setMobileImageUrl } = useCloudinary()
  const [creating, setCreating] = useState(false)

  const [formData, setFormData] = useState({
    heading: "",
    headingStyle: {
      desktopSize: "36px",
      mobileSize: "24px",
      color: "#ff6c2f",
      fontWeight: "700",
      textAlign: "center",
    },
    description: "",
    descriptionStyle: {
      desktopSize: "18px",
      mobileSize: "14px",
      color: "#000000",
      fontWeight: "400",
      textAlign: "center",
    },
    buttons: [
      {
        text: "Button 1",
        link: "",
        desktopStyle: {
          bgColor: "#ff6c2f",
          textColor: "#ffffff",
          borderColor: "#ff6c2f",
          borderRadius: "8px",
          fontSize: "16px",
        },
        mobileStyle: {
          bgColor: "#ff6c2f",
          textColor: "#ffffff",
          borderColor: "#ff6c2f",
          borderRadius: "6px",
          fontSize: "14px",
        },
        enabled: true,
      },
    ],
  })

  const handleImageUpload = async (e, mobile = false) => {
    const file = e.target.files[0]
    if (!file) return
    if (mobile) await uploadMobileImage(file)
    else await uploadImage(file)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStyleChange = (styleType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [styleType]: { ...prev[styleType], [field]: value },
    }))
  }

  const handleButtonChange = (index, field, value, styleType = null) => {
    setFormData((prev) => {
      const newButtons = [...prev.buttons]
      if (styleType) {
        newButtons[index][styleType][field] = value
      } else {
        newButtons[index][field] = value
      }
      return { ...prev, buttons: newButtons }
    })
  }

  const addButton = () => {
    const newButton = {
      text: `Button ${formData.buttons.length + 1}`,
      link: "",
      desktopStyle: {
        bgColor: "#ff6c2f",
        textColor: "#ffffff",
        borderColor: "#ff6c2f",
        borderRadius: "8px",
        fontSize: "16px",
      },
      mobileStyle: {
        bgColor: "#ff6c2f",
        textColor: "#ffffff",
        borderColor: "#ff6c2f",
        borderRadius: "6px",
        fontSize: "14px",
      },
      enabled: true,
    }
    setFormData((prev) => ({ ...prev, buttons: [...prev.buttons, newButton] }))
  }

  const removeButton = (index) => {
    setFormData((prev) => ({ ...prev, buttons: prev.buttons.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imageUrl) {
      alert("Please upload desktop image")
      return
    }
    try {
      setCreating(true)
      const getPublicIdFromUrl = (url) => {
        if (!url) return ""
        const parts = url.split("/")
        const filename = parts[parts.length - 1]
        return filename.split(".")[0]
      }

      const response = await axios.post("/api/banners", {
        ...formData,
        image: imageUrl,
        mobileImage: mobileImageUrl || "",
        public_id: getPublicIdFromUrl(imageUrl),
        mobile_public_id: mobileImageUrl ? getPublicIdFromUrl(mobileImageUrl) : "",
      })
      onBannerCreated(response.data)
      setFormData({
        heading: "",
        headingStyle: {
          desktopSize: "36px",
          mobileSize: "24px",
          color: "#ff6c2f",
          fontWeight: "700",
          textAlign: "center",
        },
        description: "",
        descriptionStyle: {
          desktopSize: "18px",
          mobileSize: "14px",
          color: "#000000",
          fontWeight: "400",
          textAlign: "center",
        },
        buttons: [
          {
            text: "Button 1",
            link: "",
            desktopStyle: {
              bgColor: "#ff6c2f",
              textColor: "#ffffff",
              borderColor: "#ff6c2f",
              borderRadius: "8px",
              fontSize: "16px",
            },
            mobileStyle: {
              bgColor: "#ff6c2f",
              textColor: "#ffffff",
              borderColor: "#ff6c2f",
              borderRadius: "6px",
              fontSize: "14px",
            },
            enabled: true,
          },
        ],
      })
      setImageUrl("")
      setMobileImageUrl("")
    } catch (error) {
      console.error(error)
      alert("Error creating banner")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[80rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Banner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Desktop Image Upload */}
          <Card className=" bg-white border  pt-0 border-gray-200 rounded-none">
            <CardHeader className="bg-[#fff7ed] text-gray-900 p-4">
              <CardTitle className="text-lg">Desktop Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  {imageUrl ? (
                    <div className="text-center">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg mb-4"
                      />
                      <Button type="button" variant="outline" onClick={() => setImageUrl("")}>
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <Label htmlFor="image" className="cursor-pointer">
                        <span className="bg-[#ff6c2f] text-white px-4 py-2 rounded-lg hover:bg-[#e55a26]">
                          {uploading ? "Uploading..." : "Upload Desktop Image"}
                        </span>
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploading}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Image Upload */}
          <Card className=" bg-white border  pt-0 border-gray-200 rounded-none">
            <CardHeader className="bg-[#fff7ed] text-gray-900 p-4">
              <CardTitle className="text-lg">Mobile Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  {mobileImageUrl ? (
                    <div className="text-center">
                      <img
                        src={mobileImageUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg mb-4"
                      />
                      <Button type="button" variant="outline" onClick={() => setMobileImageUrl("")}>
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <Label htmlFor="mobileImage" className="cursor-pointer">
                        <span className="bg-[#ff6c2f] text-white px-4 py-2 rounded-lg hover:bg-[#e55a26]">
                          {uploading ? "Uploading..." : "Upload Mobile Image"}
                        </span>
                      </Label>
                      <Input
                        id="mobileImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        disabled={uploading}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heading and Description Styles */}
          <div className="flex flex-col md:flex-row gap-5">
            {/* Heading */}
            <Card className="w-full pt-0 md:w-1/2 bg-white border border-gray-200 rounded-none">
              <CardHeader className="bg-[#fff7ed] text-gray-900 p-4">
                <CardTitle>Heading Styles</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Desktop Size</Label>
                  <Input
                    value={formData.headingStyle.desktopSize}
                    onChange={(e) => handleStyleChange("headingStyle", "desktopSize", e.target.value)}
                    className="border mt-2"
                  />
                </div>
                <div>
                  <Label>Mobile Size</Label>
                  <Input
                    value={formData.headingStyle.mobileSize}
                    onChange={(e) => handleStyleChange("headingStyle", "mobileSize", e.target.value)}
                    className="border mt-2"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={formData.headingStyle.color}
                    onChange={(e) => handleStyleChange("headingStyle", "color", e.target.value)}
                    className="border mt-2"
                  />
                </div>
                <div>
                  <Label>Font Weight</Label>
                  <select
                    value={formData.headingStyle.fontWeight}
                    onChange={(e) => handleStyleChange("headingStyle", "fontWeight", e.target.value)}
                    className="border mt-2 p-2"
                  >
                    {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Text Align</Label>
                  <select
                    value={formData.headingStyle.textAlign}
                    onChange={(e) => handleStyleChange("headingStyle", "textAlign", e.target.value)}
                    className="border mt-2 p-2"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="w-full pt-0 md:w-1/2 bg-white border border-gray-200 rounded-none">
              <CardHeader className="bg-[#fff7ed] text-gray-900 p-4">
                <CardTitle>Description Styles</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Desktop Size</Label>
                  <Input
                    value={formData.descriptionStyle.desktopSize}
                    onChange={(e) => handleStyleChange("descriptionStyle", "desktopSize", e.target.value)}
                    className="border mt-2"
                  />
                </div>
                <div>
                  <Label>Mobile Size</Label>
                  <Input
                    value={formData.descriptionStyle.mobileSize}
                    onChange={(e) => handleStyleChange("descriptionStyle", "mobileSize", e.target.value)}
                    className="border mt-2"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={formData.descriptionStyle.color}
                    onChange={(e) => handleStyleChange("descriptionStyle", "color", e.target.value)}
                    className="border mt-2"
                  />
                </div>
                <div>
                  <Label>Font Weight</Label>
                  <select
                    value={formData.descriptionStyle.fontWeight}
                    onChange={(e) => handleStyleChange("descriptionStyle", "fontWeight", e.target.value)}
                    className="border mt-2 p-2"
                  >
                    {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Text Align</Label>
                  <select
                    value={formData.descriptionStyle.textAlign}
                    onChange={(e) => handleStyleChange("descriptionStyle", "textAlign", e.target.value)}
                    className="border mt-2 p-2"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heading Text Input */}
          <Card className="bg-white border pt-0 border-gray-200 rounded-none">
            <CardHeader className="bg-[#fff7ed] text-gray-900 p-4">
              <CardTitle className="text-lg">Banner Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Heading Text</Label>
                <Input
                  value={formData.heading}
                  onChange={(e) => handleChange("heading", e.target.value)}
                  placeholder="Enter banner heading"
                  className="border mt-2"
                />
              </div>
              <div>
                <Label>Description Text</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter banner description"
                  className="border mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Buttons Section */}
          <Card className=" bg-white border  pt-0 border-gray-200 rounded-none">
            <CardHeader className="bg-[#fff7ed] text-gray-900 p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Buttons</CardTitle>
              <Button type="button" onClick={addButton} size="sm" className="bg-[#ff6c2f] hover:bg-[#e55a26]">
                <Plus className="w-4 h-4 mr-1" />
                Add Button
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.buttons.map((button, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Button {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`enabled-${index}`}>Enabled</Label>
                      <Switch
                        id={`enabled-${index}`}
                        checked={button.enabled}
                        onCheckedChange={(checked) => handleButtonChange(index, "enabled", checked)}
                      />
                      {formData.buttons.length > 1 && (
                        <Button type="button" size="sm" variant="destructive" onClick={() => removeButton(index)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Button Text</Label>
                      <Input
                        className="border border-orange-500 mt-4"
                        value={button.text}
                        onChange={(e) => handleButtonChange(index, "text", e.target.value)}
                        placeholder="Button text"
                      />
                    </div>
                    <div>
                      <Label>Link</Label>
                      <Input
                        className="border border-orange-500 mt-4"
                        value={button.link}
                        onChange={(e) => handleButtonChange(index, "link", e.target.value)}
                        placeholder="/link"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Desktop Style</h5>
                      <div className="space-y-2">
                        <label htmlFor="bgColor">Background Color</label>
                        <Input
                          className="border border-orange-500 mt-4"
                          type="color"
                          value={button.desktopStyle.bgColor}
                          onChange={(e) => handleButtonChange(index, "bgColor", e.target.value, "desktopStyle")}
                          title="Background Color"
                        />
                        <label htmlFor={`desktop-textColor-${index}`} className="block">
                          Text Color
                        </label>
                        <Input
                          className="border border-orange-500 mt-4"
                          type="color"
                          value={button.desktopStyle.textColor}
                          onChange={(e) => handleButtonChange(index, "textColor", e.target.value, "desktopStyle")}
                          title="Text Color"
                        />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Mobile Style</h5>
                      <div className="space-y-2">
                        <label htmlFor={`mobile-bgColor-${index}`} className="block">
                          Background Color
                        </label>
                        <Input
                          className="border border-orange-500 mt-4"
                          type="color"
                          value={button.mobileStyle.bgColor}
                          onChange={(e) => handleButtonChange(index, "bgColor", e.target.value, "mobileStyle")}
                          title="Background Color"
                        />
                        <label htmlFor={`mobile-textColor-${index}`} className="block">
                          Text Color
                        </label>
                        <Input
                          className="border border-orange-500 mt-4"
                          type="color"
                          value={button.mobileStyle.textColor}
                          onChange={(e) => handleButtonChange(index, "textColor", e.target.value, "mobileStyle")}
                          title="Text Color"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || uploading || !imageUrl}
              className="bg-[#ff6c2f] hover:bg-[#e55a26]"
            >
              {creating ? "Creating..." : "Create Banner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


export default BannerCreateModal;