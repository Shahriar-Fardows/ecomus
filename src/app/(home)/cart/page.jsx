"use client"
import PrivateRoute from "@/auth/private/PrivateRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import useAuthContext from "@/hooks/useAuthContext"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const CartPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (user?.email) {
      loadCartItems()
    }
  }, [user?.email])

  const loadCartItems = async () => {
    try {
      setLoading(true)
      if (user?.email) {
        const response = await fetch(`/api/cart?email=${user.email}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Cart items loaded:", data)
          setCartItems(data)
        } else {
          console.error("Failed to load cart items")
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      Swal.fire("Error", "Failed to load cart items", "error")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return

    // Instantly update the UI
    setCartItems(prevItems => 
      prevItems.map(cartItem => 
        cartItem._id === item._id 
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    )

    try {
      console.log("Updating quantity for item:", {
        id: item._id,
        oldQuantity: item.quantity,
        newQuantity: newQuantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      })

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          id: item._id,
          quantity: newQuantity,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
        }),
      })

      const responseData = await response.json()
      console.log("Update response:", responseData)

      if (!response.ok) {
        console.error("Update failed:", responseData)
        // Revert the change if API fails
        setCartItems(prevItems => 
          prevItems.map(cartItem => 
            cartItem._id === item._id 
              ? { ...cartItem, quantity: item.quantity }
              : cartItem
          )
        )
        Swal.fire("Error", responseData.message || "Failed to update quantity", "error")
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      // Revert on error
      setCartItems(prevItems => 
        prevItems.map(cartItem => 
          cartItem._id === item._id 
            ? { ...cartItem, quantity: item.quantity }
            : cartItem
        )
      )
      Swal.fire("Error", "Failed to update quantity", "error")
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
        const response = await fetch(`/api/cart?id=${item._id}`, {
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            id: item._id,
          }),
        })

        const responseData = await response.json()

        if (response.ok) {
          setCartItems(prevItems => 
            prevItems.filter(cartItem => cartItem._id !== item._id)
          )
          Swal.fire("Removed!", "Item has been removed from your cart.", "success")
        } else {
          console.error("Remove failed:", responseData)
          Swal.fire("Error!", responseData.message || "Failed to remove item from cart.", "error")
        }
      }
    } catch (error) {
      console.error("Error removing item:", error)
      Swal.fire("Error!", "Failed to remove item from cart.", "error")
    }
  }

  const handleQuantityInputChange = (item, value) => {
    const newQuantity = parseInt(value)
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateQuantity(item, newQuantity)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === "string" ? parseInt(item.price) : item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const formatPrice = (price) => {
    return typeof price === "string" ? parseInt(price) : price
  }

  if (loading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading Cart...</h2>
          </div>
        </div>
      </PrivateRoute>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600 mt-1">{cartItems.length} items in your cart</p>
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-8">Add some products to get started!</p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item._id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.productImage || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                              {item.title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeItem(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Product Variants */}
                          <div className="flex gap-4 text-sm text-gray-600 mb-4">
                            {item.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span>Color:</span>
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.selectedColor }}
                                />
                                <span>{item.selectedColor}</span>
                              </div>
                            )}
                            {item.selectedSize && (
                              <div className="flex items-center gap-2">
                                <span>Size: {item.selectedSize}</span>
                              </div>
                            )}
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-xl font-bold text-gray-900">
                                {item.currency}{formatPrice(item.price)}
                              </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => updateQuantity(item, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                                  className="w-16 text-center border-0 focus:ring-0"
                                  min="1"
                                />
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => updateQuantity(item, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="mt-2 text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              Total: {item.currency}{formatPrice(item.price) * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Items ({cartItems.length})</span>
                      <span>৳{calculateSubtotal()}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>৳{calculateSubtotal()}</span>
                      </div>
                    </div>

                    <Button asChild className="w-full" size="lg">
                      <Link href="/check-out">
                        Proceed to Checkout
                      </Link>
                    </Button>

                    <Button asChild variant="outline" className="w-full">
                      <Link href="/shop">
                        Continue Shopping
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrivateRoute>
  )
}

export default CartPage