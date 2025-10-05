"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import {
    Clock,
    Code,
    Contact,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save
} from "lucide-react"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const SiteInfoPage = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [contactData, setContactData] = useState({
    formspreeCode: "",
    heading: "",
    address: "",
    phone: "",
    email: "",
    storeInfo: "",
  })
  const [aboutData, setAboutData] = useState({
    title: "",
    content: "",
    mission: "",
    vision: "",
  })
  
  // Store the IDs for updating
  const [contactId, setContactId] = useState(null)
  const [aboutId, setAboutId] = useState(null)

  const showSweetAlert = (title, icon = "success", text = "") => {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: "OK",
      confirmButtonColor: "#ff6c2f",
      timer: icon === "success" ? 3000 : undefined,
      timerProgressBar: true,
    })
  }

  // Fetch existing site info data
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/site-info")
        const data = response.data
        
        // Since data is an array, we need to process it differently
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.type === 'contact') {
              setContactData(item.data)
              setContactId(item._id) // Store the ID for updating
            } else if (item.type === 'about') {
              setAboutData(item.data)
              setAboutId(item._id) // Store the ID for updating
            }
          })
        }
      } catch (error) {
        console.error("Error fetching site info:", error)
        // Don't show error if it's just that no data exists yet
        if (error.response?.status !== 404) {
          showSweetAlert("Error!", "error", "Failed to fetch site information!")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSiteInfo()
  }, [])

  const handleContactChange = (field, value) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAboutChange = (field, value) => {
    setAboutData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveContact = async () => {
    try {
      setSaving(true)
      
      // Always use PUT for contact - it will create if doesn't exist, update if exists
      const response = await axios.put("/api/site-info", {
        type: "contact",
        data: contactData
      })
      
      // Store the ID if it's a new entry
      if (response.data && response.data._id && !contactId) {
        setContactId(response.data._id)
      }
      
      showSweetAlert("Success!", "success", "Contact information saved successfully!")
    } catch (error) {
      console.error("Error saving contact data:", error)
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        showSweetAlert("Info!", "warning", "Contact information already exists and has been updated!")
      } else {
        showSweetAlert("Error!", "error", "Failed to save contact information!")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAbout = async () => {
    try {
      setSaving(true)
      
      // Always use PUT for about - it will create if doesn't exist, update if exists
      const response = await axios.put("/api/site-info", {
        type: "about",
        data: aboutData
      })
      
      // Store the ID if it's a new entry
      if (response.data && response.data._id && !aboutId) {
        setAboutId(response.data._id)
      }
      
      showSweetAlert("Success!", "success", "About page content saved successfully!")
    } catch (error) {
      console.error("Error saving about data:", error)
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        showSweetAlert("Info!", "warning", "About page content already exists and has been updated!")
      } else {
        showSweetAlert("Error!", "error", "Failed to save about page content!")
      }
    } finally {
      setSaving(false)
    }
  }

  // Function to clear contact data
  const handleClearContact = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will clear all contact information!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6c2f',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!'
    })

    if (result.isConfirmed) {
      setContactData({
        formspreeCode: "",
        heading: "",
        address: "",
        phone: "",
        email: "",
        storeInfo: "",
      })
      showSweetAlert("Cleared!", "success", "Contact information has been cleared!")
    }
  }

  // Function to clear about data
  const handleClearAbout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will clear all about page content!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6c2f',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!'
    })

    if (result.isConfirmed) {
      setAboutData({
        title: "",
        content: "",
        mission: "",
        vision: "",
      })
      showSweetAlert("Cleared!", "success", "About page content has been cleared!")
    }
  }

  // Function to delete contact from database
  const handleDeleteContact = async () => {
    if (!contactId) {
      showSweetAlert("Error!", "error", "No contact information found to delete!")
      return
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the contact information from database!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        setSaving(true)
        await axios.delete("/api/site-info", {
          data: { id: contactId }
        })
        
        // Clear local state
        setContactData({
          formspreeCode: "",
          heading: "",
          address: "",
          phone: "",
          email: "",
          storeInfo: "",
        })
        setContactId(null)
        
        showSweetAlert("Deleted!", "success", "Contact information has been deleted from database!")
      } catch (error) {
        console.error("Error deleting contact:", error)
        showSweetAlert("Error!", "error", "Failed to delete contact information!")
      } finally {
        setSaving(false)
      }
    }
  }

  // Function to delete about from database
  const handleDeleteAbout = async () => {
    if (!aboutId) {
      showSweetAlert("Error!", "error", "No about page content found to delete!")
      return
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the about page content from database!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        setSaving(true)
        await axios.delete("/api/site-info", {
          data: { id: aboutId }
        })
        
        // Clear local state
        setAboutData({
          title: "",
          content: "",
          mission: "",
          vision: "",
        })
        setAboutId(null)
        
        showSweetAlert("Deleted!", "success", "About page content has been deleted from database!")
      } catch (error) {
        console.error("Error deleting about:", error)
        showSweetAlert("Error!", "error", "Failed to delete about page content!")
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading site information...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Site Information</h1>
          <p className="text-muted-foreground">Manage your site's contact information and about page content.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Contact Information Card */}
        <Card className={"bg-white rounded-none p-0 pb-5 mt-5"}>
          <CardHeader className={"bg-white border border-gray-200 p-6"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contact className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Contact Information</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearContact}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  Clear Form
                </Button>
                {contactId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeleteContact}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Delete from DB
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              Manage contact details that will be displayed on your contact page.
              {contactId && (
                <span className="text-xs text-green-600 block mt-1">
                  ✓ Existing data found - will update instead of creating new (ID: {contactId.slice(-8)})
                </span>
              )}
              {!contactId && (
                <span className="text-xs text-blue-600 block mt-1">
                  ℹ No existing data - will create new entry when saved
                </span>
              )}
            </CardDescription>
          </CardHeader> 
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="formspreeCode" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Formspree Code
                </Label>
                <Input
                  id="formspreeCode"
                  placeholder="Enter formspree form code"
                  value={contactData.formspreeCode}
                  onChange={(e) => handleContactChange("formspreeCode", e.target.value)}
                  className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heading" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contact Heading
                </Label>
                <Input
                  id="heading"
                  placeholder="Get in touch with us"
                  value={contactData.heading}
                  onChange={(e) => handleContactChange("heading", e.target.value)}
                   className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+8801987654321"
                  value={contactData.phone}
                  onChange={(e) => handleContactChange("phone", e.target.value)}
                   className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@ecomus.com"
                  value={contactData.email}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                   className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Textarea
                id="address"
                placeholder="33 New Montgomery St.&#10;Ste 750 San Francisco,&#10;CA, USA 94105"
                rows={3}
                value={contactData.address}
                onChange={(e) => handleContactChange("address", e.target.value)}
                 className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeInfo" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Store Hours
              </Label>
              <Input
                id="storeInfo"
                placeholder="Monday – Friday 10 AM – 8 PM"
                value={contactData.storeInfo}
                onChange={(e) => handleContactChange("storeInfo", e.target.value)}
                 className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveContact}
                disabled={saving}
                style={{ backgroundColor: "#ff6c2f", borderColor: "#ff6c2f" }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {contactId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {contactId ? "Update Contact Info" : "Save Contact Info"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About Page Content Card */}
         <Card className={"bg-white rounded-none p-0 pb-5 mb-5"}>
          <CardHeader className={"bg-white border border-gray-200 p-6"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle>About Page Content</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearAbout}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  Clear Form
                </Button>
                {aboutId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeleteAbout}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Delete from DB
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              Create and manage the content that will be displayed on your about page.
              {aboutId && (
                <span className="text-xs text-green-600 block mt-1">
                  ✓ Existing data found - will update instead of creating new (ID: {aboutId.slice(-8)})
                </span>
              )}
              {!aboutId && (
                <span className="text-xs text-blue-600 block mt-1">
                  ℹ No existing data - will create new entry when saved
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="aboutTitle">Page Title</Label>
              <Input
                id="aboutTitle"
                placeholder="About Us"
                value={aboutData.title}
                onChange={(e) => handleAboutChange("title", e.target.value)}
                 className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutContent">Main Content</Label>
              <Textarea
                id="aboutContent"
                placeholder="Write your main about page content here..."
                rows={6}
                value={aboutData.content}
                onChange={(e) => handleAboutChange("content", e.target.value)}
                className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mission">Our Mission</Label>
                <Textarea
                  id="mission"
                  placeholder="Describe your company's mission..."
                  rows={4}
                  value={aboutData.mission}
                  onChange={(e) => handleAboutChange("mission", e.target.value)}
                   className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Our Vision</Label>
                <Textarea
                  id="vision"
                  placeholder="Describe your company's vision..."
                  rows={4}
                  value={aboutData.vision}
                  onChange={(e) => handleAboutChange("vision", e.target.value)}
                   className={"bg-gray-50 border border-gray-300 text-sm p-2.5"}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveAbout}
                disabled={saving}
                style={{ backgroundColor: "#ff6c2f", borderColor: "#ff6c2f" }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {aboutId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {aboutId ? "Update About Content" : "Save About Content"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SiteInfoPage;