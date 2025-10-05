"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useAuthContext from "@/hooks/useAuthContext"
import axios from "axios"
import { Menu, Search, ShoppingCart, User, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import CartSlider from "../CartSlider/CartSlider" 
import { getCartFromStorage } from "@/utils/cartUtils"

const menuItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blogs" },
]

export default function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [cartItemCount, setCartItemCount] = useState(0)
    const [logo, setLogo] = useState({ url: "", width: 120 })
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const { user } = useAuthContext()

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await axios.get("/api/general-settings")
                if (res.data.logo) {
                    setLogo({
                        url: res.data.logo.url || "",
                        width: res.data.logo.width || 120,
                    })
                }
            } catch (error) {
                console.error("Error fetching logo:", error)
            }
        }
        fetchLogo()
    }, [])

    useEffect(() => {
        const updateCartCount = async () => {
            try {
                if (user?.email) {
                    const response = await fetch(`/api/cart?email=${user.email}`)
                    if (response.ok) {
                        const data = await response.json()
                        setCartItemCount(data.length)
                    }
                } else {
                    const localCart = getCartFromStorage()
                    setCartItemCount(localCart.length)
                }
            } catch (error) {
                console.error("Error updating cart count:", error)
            }
        }

        updateCartCount()

        const handleCartUpdate = (event) => {
            if (event.detail?.action === "add") {
                updateCartCount()
                setIsCartOpen(true)
            }
        }

        window.addEventListener("cartUpdated", handleCartUpdate)
        const interval = setInterval(updateCartCount, 5000)

        return () => {
            clearInterval(interval)
            window.removeEventListener("cartUpdated", handleCartUpdate)
        }
    }, [user, isCartOpen])

    // Search functionality
    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const response = await axios.get("/api/products")
                const products = response.data
                
                // Filter products based on search query
                const filtered = products.filter(product =>
                    product.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                
                setSearchResults(filtered.slice(0, 5)) // Show only first 5 results
            } catch (error) {
                console.error("Error searching products:", error)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }

        const debounceTimer = setTimeout(searchProducts, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    const handleSearchClose = () => {
        setIsSearchOpen(false)
        setSearchQuery("")
        setSearchResults([])
    }

    return (
        <>
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/">
                                {logo.url ? (
                                    <img
                                        src={logo.url || "/placeholder.svg"}
                                        alt="Logo"
                                        style={{ width: `${logo.width}px`, height: "auto" }}
                                    />
                                ) : (
                                    <span className="text-xl font-bold">Ecomus</span>
                                )}
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right side icons */}
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="text-gray-700 hover:text-gray-900"
                            >
                                <Search className="h-5 w-5" />
                            </Button>

                            {user?.email ? (
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            <Link href="/cart">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-700 hover:text-gray-900 relative"
                                    onClick={() => setIsCartOpen(true)}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>

                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-gray-700 hover:text-gray-900"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-[#22212194] bg-opacity-50 z-60 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-70 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                            {logo.url ? (
                                <img
                                    src={logo.url || "/placeholder.svg"}
                                    alt="Logo"
                                    style={{ width: `${logo.width}px`, height: "auto" }}
                                />
                            ) : (
                                <span className="text-xl font-bold">Ecomus</span>
                            )}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-700 hover:text-gray-900"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg text-base font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Bar Overlay */}
            {isSearchOpen && (
                <div className="bg-white border-b border-gray-200 px-4 py-3 relative z-40">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative">
                            <Input 
                                type="text" 
                                placeholder="Search products..." 
                                className="w-full pl-10 pr-10 py-2" 
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <button
                                onClick={handleSearchClose}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Search Results */}
                        {searchQuery.length >= 2 && (
                            <div className="max-w-7xl mx-auto absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="py-2">
                                        {searchResults.map((product) => (
                                            <Link
                                                key={product._id}
                                                href={`/shop/${product._id}`}
                                                onClick={handleSearchClose}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <img
                                                    src={product.mainImages[0]?.url || "/placeholder.svg"}
                                                    alt={product.title}
                                                    className="w-28 h-28 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {product.currency} {product.price}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No products found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CartSlider isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    )
}