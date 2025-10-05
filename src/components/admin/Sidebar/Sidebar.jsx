"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import useAuthContext from "@/hooks/useAuthContext"
import {
  Bell,
  ChevronDown,
  CreditCard,
  FileText,
  Home,
  Menu,
  Package,
  Percent,
  Plus,
  Settings,
  ShoppingCart,
  User,
  X
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"


export default function EcommerceSidebar() {
  const [activeItem, setActiveItem] = useState("dashboard")
  const [isProductsExpanded, setIsProductsExpanded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const { user, LogOutUser } = useAuthContext()

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.email) {
        try {
          const response = await fetch('/api/userEntries')
          const users = await response.json()
          const currentUser = users.find(u => u.email === user.email)
          
          if (currentUser) {
            setUserRole(currentUser.usertype)
            setUserData(currentUser)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
    }

    fetchUserRole()
  }, [user])

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/admin",
      allowedRoles: ["admin", "moderator", "staff"]
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      href: "/products",
      hasSubmenu: true,
      submenu: [
        { id: "categories", label: "Categories", href: "/products/categories" },
      ],
      allowedRoles: ["admin", "moderator", "staff"]
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      href: "/orders",
      allowedRoles: ["admin", "moderator", "staff"]
    },
    {
      id: "discounts",
      label: "Discounts",
      icon: Percent,
      href: "/discounts",
      allowedRoles: ["admin", "moderator", "staff"]
    },
  ]

  const siteSettingsItems = [
    {
      id: "general-settings",
      label: "General Settings",
      icon: Settings,
      href: "/admin/general-settings",
      allowedRoles: ["admin", "moderator"]
    },
    {
      id: "ads-banners-settings",
      label: "Ads Banners Settings",
      icon: FileText,
      href: "/admin/ads-banners-settings",
      allowedRoles: ["admin", "moderator"]
    },
    {
      id: "banners-settings",
      label: "Banners Settings",
      icon: Settings,
      href: "/admin/banners-settings",
      allowedRoles: ["admin", "moderator"]
    },
    {
      id: "news-letter-settings",
      label: "News Letter Settings",
      icon: Settings,
      href: "/admin/news-letter",
      allowedRoles: ["admin", "moderator"]
    },
    {
      id: "blog-settings",
      label: "Blog Settings",
      icon: FileText,
      href: "/admin/blog-settings",
      allowedRoles: ["admin", "moderator"]
    },
    {
      id: "delivery-charges",
      label: "Delivery Charges",
      icon: CreditCard,
      href: "/delivery-charges",
      allowedRoles: ["admin", "moderator"]
    },
    {
      id: "fraud-Checker",
      label: "Fraud Checker",
      icon: User,
      href: "/admin/fraud-checker",
      allowedRoles: ["admin"]
    },
    {
      id: "user-management",
      label: "User Management",
      icon: User,
      href: "/user-management",
      allowedRoles: ["admin"]
    },
  ]

  const handleItemClick = (itemId) => {
    setActiveItem(itemId)
    if (itemId === "products") {
      setIsProductsExpanded(!isProductsExpanded)
    }
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const hasAccess = (allowedRoles) => {
    if (!userRole) return false
    return allowedRoles.includes(userRole)
  }

  const filteredNavigationItems = navigationItems.filter(item => hasAccess(item.allowedRoles))
  const filteredSiteSettingsItems = siteSettingsItems.filter(item => hasAccess(item.allowedRoles))

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#ff6c2f] text-white hover:bg-[#ffdacb] hover:text-gray-800 transition-colors"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Main Menu</h3>

            {filteredNavigationItems.map((item) => (
              <div key={item.id}>
                <Link href={item.href}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeItem === item.id
                        ? "bg-[#ff6c2f] text-white shadow-sm"
                        : "text-sidebar-foreground hover:bg-[#ffdacb] hover:text-gray-800"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant="secondary" className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.hasSubmenu && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${isProductsExpanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </div>
                  </button>
                </Link>

                {/* Submenu */}
                {item.hasSubmenu && isProductsExpanded && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link key={subItem.id} href={subItem.href}>
                        <button
                          onClick={() => handleItemClick(subItem.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${activeItem === subItem.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                            }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          <span>{subItem.label}</span>
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {hasAccess(["admin", "moderator", "staff"]) && (
            <div className="pt-4 border-t border-sidebar-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>

              <Link href="/products/add">
                <Button
                  className="w-full justify-start gap-3 bg-[#ff6c2f] hover:bg-[#ffdacb] hover:text-gray-800 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          )}

          {/* Site Settings  */}
          {filteredSiteSettingsItems.length > 0 && (
            <div className="pt-4 border-t border-sidebar-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Site Settings</h3>

              {filteredSiteSettingsItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeItem === item.id
                        ? "bg-[#ff6c2f] text-white shadow-sm"
                        : "text-sidebar-foreground hover:bg-[#ffdacb] hover:text-gray-800"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-sidebar-accent text-sidebar-accent-foreground text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => LogOutUser()}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeItem === "settings"
                  ? "bg-[#ff6c2f] text-white"
                  : "text-sidebar-foreground hover:bg-[#ffdacb] hover:text-gray-800"
                }`}
            >
              <Settings className="w-5 h-5" />
              <span>Log Out</span>
            </button>

            <button className="p-2 rounded-lg text-sidebar-foreground hover:bg-[#ffdacb] hover:text-gray-800 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-accent-foreground">
                  {userData?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userData?.name || 'Admin User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'admin@shopstore.com'}
                </p>
                {userRole && (
                  <p className="text-xs text-[#ff6c2f] font-medium capitalize">
                    {userRole}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}