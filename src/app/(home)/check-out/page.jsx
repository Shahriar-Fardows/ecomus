"use client"
import PrivateRoute from "@/auth/private/PrivateRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import useAuthContext from "@/hooks/useAuthContext"
import { getCartFromStorage } from "@/utils/cartUtils"
import axios from "axios"
import { ArrowLeft, CreditCard, MapPin, Shield, Tag, Truck, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deliveryAreas, setDeliveryAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState("")
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [estimatedDays, setEstimatedDays] = useState("")
  const [deliveryNote, setDeliveryNote] = useState("")

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  })
  const [processing, setProcessing] = useState(false)

  const { user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    loadCartItems()
    loadDeliveryAreas()
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
      }))
    }
  }, [user])

  const loadCartItems = async () => {
    try {
      setLoading(true)
      if (user?.email) {
        const response = await axios.get(`/api/cart?email=${user.email}`)
        setCartItems(response.data)
      } else {
        const localCart = getCartFromStorage()
        setCartItems(localCart)
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDeliveryAreas = async () => {
    try {
      const response = await axios.get("/api/delivery-charges")
      setDeliveryAreas(response.data)
    } catch (error) {
      console.error("Error loading delivery areas:", error)
    }
  }

  const handleAreaSelection = (areaId) => {
    const area = deliveryAreas.find((a) => a._id === areaId)
    if (area) {
      setSelectedArea(areaId)
      setDeliveryCharge(area.charge)
      setEstimatedDays(area.estimatedDays)
      setDeliveryNote(area.customData?.note || "")
      setFormData((prev) => ({ ...prev, city: area.area }))
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === "string" ? Number.parseInt(item.price) : item.price
      return total + price * item.quantity
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const finalDeliveryCharge = subtotal >= 2000 ? 0 : deliveryCharge
    return subtotal + finalDeliveryCharge - couponDiscount
  }

  const getFinalDeliveryCharge = () => {
    const subtotal = calculateSubtotal()
    return subtotal >= 2000 ? 0 : deliveryCharge
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Swal.fire("Error", "Please enter a coupon code", "warning")
      return
    }

    try {
      setApplyingCoupon(true)
      const response = await axios.get("/api/coupons")
      const coupons = response.data

      const coupon = coupons.find(
        (c) => c.couponCode.toLowerCase() === couponCode.toLowerCase() && c.customData?.status === "active",
      )

      if (!coupon) {
        Swal.fire("Invalid Coupon", "This coupon code is not valid", "error")
        return
      }

      // Check if coupon is expired
      const today = new Date()
      const validTill = new Date(coupon.validTill)
      if (today > validTill) {
        Swal.fire("Expired Coupon", "This coupon has expired", "error")
        return
      }

      // Check minimum purchase requirement
      const subtotal = calculateSubtotal()
      if (subtotal < coupon.minimumPurchase) {
        Swal.fire(
          "Minimum Purchase Required",
          `This coupon requires a minimum purchase of ৳${coupon.minimumPurchase}`,
          "warning",
        )
        return
      }

      // Check usage limit
      const maxUsage = coupon.customData?.maxUsage
      const isUnlimited = coupon.customData?.isUnlimited

      if (!isUnlimited && maxUsage <= 0) {
        Swal.fire("Coupon Limit Reached", "This coupon has reached its usage limit", "error")
        return
      }

      // Calculate discount
      let discount = 0
      if (coupon.customData?.discountType === "percentage") {
        const percentage = Number.parseFloat(coupon.discount.replace("%", ""))
        discount = Math.round((subtotal * percentage) / 100)
      } else {
        discount = Number.parseFloat(coupon.discount)
      }

      setAppliedCoupon(coupon)
      setCouponDiscount(discount)

      Swal.fire({
        title: "Coupon Applied!",
        text: `You saved ৳${discount}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error applying coupon:", error)
      Swal.fire("Error", "Failed to apply coupon", "error")
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponCode("")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      Swal.fire("Empty Cart", "Your cart is empty. Please add items before checkout.", "warning")
      return
    }

    if (!selectedArea) {
      Swal.fire("Select Delivery Area", "Please select a delivery area.", "warning")
      return
    }

    const requiredFields = ["firstName", "lastName", "email", "phone", "address"]
    const missingFields = requiredFields.filter((field) => !formData[field].trim())

    if (missingFields.length > 0) {
      Swal.fire("Missing Information", "Please fill in all required fields.", "warning")
      return
    }

    try {
      setProcessing(true)

      const selectedAreaData = deliveryAreas.find((a) => a._id === selectedArea)
      const subtotal = calculateSubtotal()
      const finalDeliveryCharge = getFinalDeliveryCharge()

      const orderData = {
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        items: cartItems.map((item) => ({
          productId: item._id,
          title: item.title,
          price: typeof item.price === "string" ? Number.parseInt(item.price) : item.price,
          quantity: item.quantity,
          currency: item.currency || "৳",
          image: item.image || item.productImage,
        })),
        deliveryArea: selectedAreaData?.area,
        deliveryCharge: finalDeliveryCharge,
        estimatedDelivery: estimatedDays,
        subtotal: subtotal,
        couponCode: appliedCoupon?.couponCode || null,
        couponDiscount: couponDiscount,
        total: calculateTotal(),
        paymentMethod: "Cash on Delivery",
        orderStatus: "pending",
        paymentStatus: "unpaid",
        notes: formData.notes,
        userEmail: user?.email,
        createdAt: new Date().toISOString(),
      }

      const orderResponse = await axios.post("/api/orders", orderData)

      if (orderResponse.status === 200 || orderResponse.status === 201) {
        if (appliedCoupon && !appliedCoupon.customData?.isUnlimited) {
          const newMaxUsage = appliedCoupon.customData.maxUsage - 1
          await axios.put("/api/coupons", {
            id: appliedCoupon._id,
            customData: {
              ...appliedCoupon.customData,
              maxUsage: newMaxUsage,
            },
          })
        }

        if (user?.email) {
          await axios.delete("/api/cart", {
            data: { email: user.email, clearAll: true },
          })
        } else {
          localStorage.removeItem("cart")
        }

        Swal.fire({
          title: "Order Placed Successfully!",
          text: `Your order has been placed. Order ID: ${orderResponse.data._id || orderResponse.data.orderId || "Generated"}`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        })

        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error processing order:", error)
      Swal.fire("Error", "Failed to process your order. Please try again.", "error")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading Checkout...</h2>
          </div>
        </div>
      </PrivateRoute>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-1">Complete your order</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Delivery Area *
                        </label>
                        <Select value={selectedArea} onValueChange={handleAreaSelection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery area" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryAreas.map((area) => (
                              <SelectItem key={area._id} value={area._id}>
                                {area.area} - ৳{area.charge} ({area.estimatedDays} days)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <Input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special instructions for your order..."
                        rows={3}
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                          <p className="text-sm text-gray-600">Pay when you receive your order</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || item.productImage || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                          <div className="text-xs text-gray-600 space-y-1">
                            {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                            {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                            <p>Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.currency || "৳"}
                            {(typeof item.price === "string" ? Number.parseInt(item.price) : item.price) *
                              item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="inline h-4 w-4 mr-1" />
                      Have a Coupon Code?
                    </label>
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" onClick={handleApplyCoupon} disabled={applyingCoupon} variant="outline">
                          {applyingCoupon ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">{appliedCoupon.couponCode}</p>
                          <p className="text-xs text-green-600">You saved ৳{couponDiscount}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>৳{calculateSubtotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charge</span>
                      <span>
                        {getFinalDeliveryCharge() === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `৳${getFinalDeliveryCharge()}`
                        )}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-৳{couponDiscount}</span>
                      </div>
                    )}
                    {selectedArea && estimatedDays && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Estimated Delivery</span>
                        <span>{estimatedDays} days</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>৳{calculateTotal()}</span>
                    </div>
                    {calculateSubtotal() >= 2000 && deliveryCharge > 0 && (
                      <p className="text-sm text-green-600">You saved ৳{deliveryCharge} on delivery!</p>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={processing || cartItems.length === 0 || !selectedArea}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? "Processing..." : "Place Order"}
                  </Button>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>Secure SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="h-4 w-4" />
                     
                      {selectedArea && deliveryNote ? (
                        <p className="text-xs text-gray-600 mt-1">{deliveryNote}</p>
                      ) : (
                        <span>select delivery area</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}

export default CheckoutPage
