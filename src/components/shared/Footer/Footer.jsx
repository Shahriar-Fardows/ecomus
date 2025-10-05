"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Swal from "sweetalert2"
import axios from "axios"

const navigationLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Blog", href: "/blogs" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },

]

const supportLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Categories", href: "/categories" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
]

export default function Footer() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [contactInfo, setContactInfo] = useState(null);


  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
  const fetchContact = async () => {
    try {
      const res = await axios.get("/api/site-info");
      const contactData = res.data.find((item) => item.type === "contact");
      setContactInfo(contactData?.data || null);
    } catch (error) {
      console.error("Error fetching contact info:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchContact();
}, []);


  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/general-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        timer: 2000,
        showConfirmButton: false
      })
      return
    }

    try {
      setSubscribing(true)
      await axios.post('/api/newsletter', {
        email: email
      })

      Swal.fire({
        icon: 'success',
        title: 'Successfully Subscribed!',
        text: 'Thank you for subscribing to our newsletter',
        timer: 2000,
        showConfirmButton: false
      })

      setEmail("")
    } catch (error) {
      console.error("Error subscribing:", error)
      Swal.fire({
        icon: 'error',
        title: 'Subscription Failed',
        text: error.response?.data?.message || 'Failed to subscribe. Please try again.',
        timer: 2000,
        showConfirmButton: false
      })
    } finally {
      setSubscribing(false)
    }
  }

  const getSocialIcon = (platform) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "linkedin":
        return <Linkedin className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="h-10 w-40 bg-gray-800 rounded animate-pulse mb-6"></div>
            ) : settings?.logo?.url ? (
              <Link href="/">
                <img
                  src={settings.logo.url}
                  alt="Ecomus Logo"
                  className="h-10 w-auto mb-6 brightness-0 invert"
                  style={{ width: settings.logo.width ? `${settings.logo.width}px` : 'auto' }}
                />
              </Link>
            ) : (
              <h3 className="text-2xl font-bold text-white mb-6">Ecomus</h3>
            )}

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted partner for sustainable and eco-friendly products. Quality items that make a positive impact.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{contactInfo?.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{contactInfo?.email}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <span>{contactInfo?.address}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-6">Navigation</h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get updates on new products and exclusive offers.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                disabled={subscribing}
              />
              <Button
                type="submit"
                className="w-full bg-white text-gray-900 hover:bg-gray-100"
                disabled={subscribing}
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © 2025 Ecomus. All rights reserved.
            </div>

            {/* Social Links */}
            {!loading && settings?.socials && (
              <div className="flex items-center gap-4">
                {Object.entries(settings.socials).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {getSocialIcon(platform)}
                    </a>
                  )
                ))}
              </div>
            )}

            {/* Payment */}
            <div className="text-sm text-gray-500">
              Secure Payment Available
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}