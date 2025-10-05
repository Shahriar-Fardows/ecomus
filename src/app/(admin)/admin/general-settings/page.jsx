"use client"

import axios from "axios"
import {
  Camera,
  Edit,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Settings,
  Twitter,
  Upload,
  X,
  Youtube,
} from "lucide-react"
import { useEffect, useState } from "react"
import SiteInfoPage from "../../../../components/admin/siteInfo/SiteInfo"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Switch } from "../../../../components/ui/switch"
import { Textarea } from "../../../../components/ui/textarea"
import { useCloudinary } from "../../../../hooks/useCloudinary"

const GeneralSettingsForm = () => {
  const { uploadImage, deleteImage, uploading, imageUrl, setImageUrl } = useCloudinary()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [currentImagePublicId, setCurrentImagePublicId] = useState("")

  const [formData, setFormData] = useState({
    _id: "",
    logo: { url: "", public_id: "", width: 180 },
    socials: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    announcements: [],
    announcementsStatus: true,
  })

  const [originalData, setOriginalData] = useState({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setFetching(true)
      const response = await axios.get("/api/settings")
      const data = response.data

      setFormData({
        _id: data._id || "",
        logo: data.logo || { url: "", public_id: "", width: 180 },
        socials: {
          facebook: data.socials?.facebook || "",
          twitter: data.socials?.twitter || "",
          instagram: data.socials?.instagram || "",
          linkedin: data.socials?.linkedin || "",
          youtube: data.socials?.youtube || "",
        },
        announcements: data.announcements || [],
        announcementsStatus: data.announcementsStatus ?? true,
      })

      setOriginalData(data)
      setImageUrl(data.logo?.url || "")
      setCurrentImagePublicId(data.logo?.public_id || "")
    } catch (error) {
      console.log("[v0] No existing settings, initializing empty data")
      const emptyData = {
        _id: "",
        logo: { url: "", public_id: "", width: 180 },
        socials: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" },
        announcements: [],
        announcementsStatus: true,
      }
      setFormData(emptyData)
      setOriginalData(emptyData)
    } finally {
      setFetching(false)
    }
  }

  const handleSocialChange = (platform, value) => {
    if (!isEditing) return
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value },
    }))
  }

  const handleAnnouncementChange = (index, value) => {
    if (!isEditing) return
    const updated = [...formData.announcements]
    updated[index].text = value
    setFormData((prev) => ({ ...prev, announcements: updated }))
  }

  const addAnnouncement = () => {
    if (!isEditing) return
    setFormData((prev) => ({
      ...prev,
      announcements: [...(prev.announcements || []), { text: "" }],
    }))
  }

  const removeAnnouncement = (index) => {
    if (!isEditing) return
    const updated = formData.announcements.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, announcements: updated }))
  }

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => {
    setFormData(originalData)
    setImageUrl(originalData.logo?.url || "")
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!isEditing) return
    setLoading(true)
    try {
      const response = await axios.post("/api/general-settingss", formData)
      setOriginalData(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event) => {
    if (!isEditing) return
    const file = event.target.files[0]
    if (file) {
      const result = await uploadImage(file)
      setImageUrl(result.secure_url)
      setFormData((prev) => ({
        ...prev,
        logo: { url: result.secure_url, public_id: result.public_id, width: prev.logo.width || 180 },
      }))
      setCurrentImagePublicId(result.public_id)
    }
  }

  const getSocialIcon = (platform) => {
    const icons = {
      facebook: <Facebook className="w-4 h-4 text-blue-600" />,
      twitter: <Twitter className="w-4 h-4 text-sky-500" />,
      instagram: <Instagram className="w-4 h-4 text-pink-600" />,
      linkedin: <Linkedin className="w-4 h-4 text-blue-700" />,
      youtube: <Youtube className="w-4 h-4 text-red-600" />,
    }
    return icons[platform] || <Globe className="w-4 h-4 text-gray-500" />
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-[#ff6c2f]" />
              <div>
                <h1 className="text-2xl font-semibold">General Settings</h1>
                <p className="text-gray-600 mt-1">Manage your website's basic configuration</p>
              </div>
            </div>

            {!isEditing ? (
              <Button onClick={handleEdit} className="bg-[#ff6c2f] hover:bg-[#e55a26]">
                <Edit className="w-4 h-4 mr-2" />
                Edit Settings
              </Button>
            ) : (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 text-sm border border-orange-200">
                Editing Mode
              </span>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-1/3 bg-white border border-gray-200">
            <div className="bg-orange-50 p-4 border-b border-gray-200">
              <h2 className="flex items-center space-x-2 text-lg font-medium text-gray-800">
                <Camera className="w-5 h-5 text-[#ff6c2f]" />
                <span>Website Logo</span>
              </h2>
            </div>

            <div className="space-y-4 p-6 flex flex-col items-center">
              <Label htmlFor="logo-upload" className={isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-50"}>
                <div className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 hover:border-[#ff6c2f] transition-colors">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Choose Logo</span>
                </div>
              </Label>

              {uploading && (
                <div className="flex items-center space-x-2 text-[#ff6c2f]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}

              {imageUrl && (
                <div className="relative inline-block mt-4 flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Logo Preview"
                    className="object-contain bg-white border border-gray-200"
                    style={{ width: formData.logo?.width + "px" }}
                  />
                  {isEditing && (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={async () => {
                          if (currentImagePublicId) await deleteImage(currentImagePublicId)
                          setImageUrl("")
                          setCurrentImagePublicId("")
                          setFormData((prev) => ({ ...prev, logo: { url: "", public_id: "", width: prev.logo.width } }))
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {/* Logo width input */}
                      <div className="mt-2 flex items-center space-x-2">
                        <Input
                          type="number"
                          min={50}
                          max={1000}
                          value={formData.logo?.width || 180}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, logo: { ...prev.logo, width: Number(e.target.value) } }))
                          }
                          className="w-20 text-sm"
                          disabled={!isEditing}
                        />
                        <span className="text-sm text-gray-600">px</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Input id="logo-upload" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" disabled={!isEditing} />
            </div>
          </div>

          {/* Socials */}
          <div className="w-full md:w-2/3 bg-white border">
            <div className="bg-[#fff7ed] text-gray-900 p-4">
              <h2 className="flex items-center space-x-2 text-lg font-medium">
                <Globe className="w-5 h-5 text-[#ff6c2f]" />
                <span>Social Media Links</span>
              </h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {Object.keys(formData.socials).map((platform) => (
                <div key={platform} className="space-y-2">
                  <Label className="flex items-center space-x-2 capitalize font-medium text-gray-700">
                    {getSocialIcon(platform)}
                    <span>{platform}</span>
                  </Label>
                  <Input
                    type="url"
                    value={formData.socials[platform]}
                    onChange={(e) => handleSocialChange(platform, e.target.value)}
                    placeholder={`Enter ${platform} URL`}
                    disabled={!isEditing}
                    className="bg-gray-50 border border-gray-300 text-sm p-2.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white border">
          <div className="bg-[#fff7ed] text-gray-900 p-4 flex items-center justify-between">
            <h2 className="flex items-center space-x-2 text-lg font-medium">
              <Megaphone className="w-5 h-5 text-[#ff6c2f]" />
              <span>Announcements</span>
            </h2>
            {isEditing && (
              <Button onClick={addAnnouncement} size="sm" className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-3 py-1">
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            )}
          </div>

          <div className="p-6 space-y-4">
            {(formData.announcements || []).length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 p-4">
                <p className="text-blue-800">No announcements yet. {isEditing ? 'Click "Add New" to create one.' : ""}</p>
              </div>
            ) : (
              formData.announcements.map((announcement, index) => (
                <div key={index} className="border border-gray-200 bg-gray-50 p-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Announcement Text</Label>
                  <Textarea
                    value={announcement.text}
                    onChange={(e) => handleAnnouncementChange(index, e.target.value)}
                    placeholder="Write your announcement here..."
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-4 border-2 border-gray-300 bg-white text-sm"
                  />

                  {formData.announcements.length > 1 && isEditing && (
                    <Button variant="destructive" size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1" onClick={() => removeAnnouncement(index)}>
                      <X className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              ))
            )}

            {/* Global Announcements Toggle */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                checked={formData.announcementsStatus}
                onCheckedChange={(checked) => isEditing && setFormData((prev) => ({ ...prev, announcementsStatus: checked }))}
                disabled={!isEditing}
              />
              <Label className={`text-sm font-medium ${formData.announcementsStatus ? "text-green-600" : "text-gray-500"}`}>
                {formData.announcementsStatus ? "Announcements Enabled" : "Announcements Disabled"}
              </Label>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="p-6 flex flex-col md:flex-row gap-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 bg-white">
              Cancel Changes
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" /> Save Settings
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
      <SiteInfoPage />
    </div>
  )
}

export default GeneralSettingsForm
