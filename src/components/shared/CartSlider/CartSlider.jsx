"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import useAuthContext from "@/hooks/useAuthContext"
import { getCartFromStorage, removeFromCart, updateCartQuantity } from "@/utils/cartUtils"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const CartSlider = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthContext()

  useEffect(() => {
    if (isOpen) {
      loadCartItems()
    }
  }, [isOpen, user])

  const loadCartItems = async () => {
    try {
      setLoading(true)
      if (user?.email) {
        // Fetch from API for logged-in users
        const response = await fetch(`/api/cart?email=${user.email}`)
        if (response.ok) {
          const data = await response.json()
          setCartItems(data)
        }
      } else {
        // Load from localStorage for non-logged users
        const localCart = getCartFromStorage()
        setCartItems(localCart)
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return

    // Instantly update the UI
    setCartItems(prevItems =>
      prevItems.map(cartItem =>
        cartItem._id === item._id &&
          cartItem.selectedColor === item.selectedColor &&
          cartItem.selectedSize === item.selectedSize
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    )

    try {
      if (user?.email) {
        // Update via API for logged-in users in background
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: item._id,
            quantity: newQuantity,
          }),
        })

        if (!response.ok) {
          // If API fails, revert the change
          setCartItems(prevItems =>
            prevItems.map(cartItem =>
              cartItem._id === item._id &&
                cartItem.selectedColor === item.selectedColor &&
                cartItem.selectedSize === item.selectedSize
                ? { ...cartItem, quantity: item.quantity }
                : cartItem
            )
          )
        }
      } else {
        // Update localStorage for non-logged users
        updateCartQuantity(item._id, newQuantity, item.selectedColor, item.selectedSize)
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      // Revert on error
      setCartItems(prevItems =>
        prevItems.map(cartItem =>
          cartItem._id === item._id &&
            cartItem.selectedColor === item.selectedColor &&
            cartItem.selectedSize === item.selectedSize
            ? { ...cartItem, quantity: item.quantity }
            : cartItem
        )
      )
    }
  }

  const removeItem = async (item) => {
    try {
      const result = await Swal.fire({
        title: "Remove Item?",
        text: "Are you sure you want to remove this item from your cart?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, remove it!",
      })

      if (result.isConfirmed) {
        if (user?.email) {
          // Remove via API for logged-in users
          const response = await fetch(`/api/cart?id=${item._id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: item._id,
            }),
          })

          if (response.ok) {
            // Instantly remove from UI
            setCartItems(prevItems =>
              prevItems.filter(cartItem => cartItem._id !== item._id)
            )
            Swal.fire("Removed!", "Item has been removed from your cart.", "success")
          } else {
            Swal.fire("Error!", "Failed to remove item from cart.", "error")
          }
        } else {
          // Remove from localStorage for non-logged users
          removeFromCart(item._id, item.selectedColor, item.selectedSize)
          // Instantly remove from UI
          setCartItems(prevItems =>
            prevItems.filter(cartItem =>
              !(cartItem._id === item._id &&
                cartItem.selectedColor === item.selectedColor &&
                cartItem.selectedSize === item.selectedSize)
            )
          )
          Swal.fire("Removed!", "Item has been removed from your cart.", "success")
        }
      }
    } catch (error) {
      console.error("Error removing item:", error)
      Swal.fire("Error!", "Failed to remove item from cart.", "error")
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === "string" ? Number.parseInt(item.price) : item.price
      return total + price * item.quantity
    }, 0)
  }

  const formatPrice = (price) => {
    return typeof price === "string" ? Number.parseInt(price) : price
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#00000096] bg-opacity-50 z-50 transition-opacity duration-300" onClick={onClose} />
      )}

      {/* Cart Slider */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-gray-900">Shopping Cart ({cartItems.length})</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some products to get started!</p>
                <Button onClick={onClose} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <Card key={`${item._id}-${item.selectedColor}-${item.selectedSize}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || item.productImage || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{item.title}</h3>

                          {/* Variants */}
                          {(item.selectedColor || item.selectedSize) && (
                            <div className="flex gap-2 text-xs text-gray-500 mb-2">
                              {item.selectedColor && (
                                <span className="flex items-center gap-1">
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.selectedColor }}
                                  />
                                  Color
                                </span>
                              )}
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            </div>
                          )}

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              {item.currency || "৳"}
                              {formatPrice(item.price)}
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeItem(item)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>৳{calculateTotal()}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 space-y-2">
                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Cart
                  </Button>
                </Link>
                <Link href="/check-out" onClick={onClose}>
                  <Button className="w-full">Checkout</Button>
                </Link>
              </div>

              {/* Continue Shopping */}
              <Link href="/shop" onClick={onClose}>
                <Button variant="ghost" className="w-full text-sm">
                  Continue Shopping
                </Button>
              </Link>

            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartSlider