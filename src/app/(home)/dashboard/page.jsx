"use client"
import PrivateRoute from "@/auth/private/PrivateRoute"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import useAuthContext from "@/hooks/useAuthContext"
import axios from "axios"
import {
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    LogOut,
    Mail,
    MapPin,
    Package,
    Truck,
    User,
    X,
    XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

const Dashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const { user, LogOutUser } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (user?.email) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/orders?userEmail=${user.email}`)
      setOrders(response.data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: "Logout Confirmation",
        text: "Are you sure you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
      })

      if (result.isConfirmed) {
        await LogOutUser()
        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Error logging out:", error)
      Swal.fire("Error", "Failed to logout. Please try again.", "error")
    }
  }

  const cancelOrder = async (orderId, orderStatus) => {
    // Check if order is processing
    if (orderStatus?.toLowerCase() === "processing") {
      Swal.fire({
        title: "Cannot Cancel",
        text: "This order is already being processed. Please call us to cancel this order.",
        icon: "info",
        confirmButtonColor: "#3b82f6",
      })
      return
    }

    try {
      const result = await Swal.fire({
        title: "Cancel Order",
        text: "Are you sure you want to cancel this order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, cancel order",
        cancelButtonText: "Keep order",
      })

      if (result.isConfirmed) {
        await axios.delete("/api/orders", {
          data: { id: orderId },
        })

        Swal.fire({
          title: "Order Cancelled",
          text: "Your order has been cancelled successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })

        fetchUserOrders()
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      Swal.fire("Error", "Failed to cancel order. Please try again.", "error")
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const canCancelOrder = (status) => {
    return (
      status?.toLowerCase() !== "processing" &&
      status?.toLowerCase() !== "shipped" &&
      status?.toLowerCase() !== "delivered" &&
      status?.toLowerCase() !== "cancelled"
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  if (loading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
          </div>
        </div>
      </PrivateRoute>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account and orders</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-300 w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg sm:text-xl">
                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{user?.displayName || "User"}</h2>

                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3 text-gray-600">
                        <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm break-all">{user?.email}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Customer</span>
                      </div>

                      <div className="flex items-start gap-3 text-gray-600">
                        <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Member since {formatDate(user?.metadata?.creationTime)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Statistics */}
              <Card className="mt-4 sm:mt-6">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="font-semibold">{orders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-semibold text-yellow-600">
                        {orders.filter((o) => o.orderStatus?.toLowerCase() === "pending").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivered</span>
                      <span className="font-semibold text-green-600">
                        {orders.filter((o) => o.orderStatus?.toLowerCase() === "delivered").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Orders</h2>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 w-fit">
                      {orders.length} Orders
                    </Badge>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-sm sm:text-base text-gray-500 mb-6">You haven't placed any orders yet.</p>
                      <Button onClick={() => router.push("/shop")} className="w-full sm:w-auto">Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <Badge className={`${getStatusColor(order.orderStatus)} flex items-center gap-1 w-fit`}>
                                {getStatusIcon(order.orderStatus)}
                                {order.orderStatus || "Pending"}
                              </Badge>
                              <span className="text-xs sm:text-sm text-gray-500">Order #{order._id?.slice(-8) || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewOrderDetails(order)}
                                className="bg-transparent text-xs sm:text-sm flex-1 sm:flex-none"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                View
                              </Button>
                              {canCancelOrder(order.orderStatus) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelOrder(order._id, order.orderStatus)}
                                  className="bg-transparent text-red-600 hover:bg-red-50 hover:border-red-300 text-xs sm:text-sm flex-1 sm:flex-none"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>৳{order.total || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{order.deliveryArea || order.customerInfo?.city || "N/A"}</span>
                            </div>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs sm:text-sm text-gray-600">
                                {order.items.length} item{order.items.length > 1 ? "s" : ""}:{" "}
                                {order.items
                                  .slice(0, 2)
                                  .map((item) => item.title)
                                  .join(", ")}
                                {order.items.length > 2 && ` +${order.items.length - 2} more`}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-[#00000094] bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4">
              <div className="p-4 sm:p-6">
                <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 break-all">
                    Order Details #{selectedOrder._id?.slice(-8)}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowOrderDetails(false)} className="flex-shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Order Status */}
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Order Status</h3>
                    <Badge className={`${getStatusColor(selectedOrder.orderStatus)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(selectedOrder.orderStatus)}
                      {selectedOrder.orderStatus || "Pending"}
                    </Badge>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Customer Information</h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-sm">
                      <p className="break-words">
                        <strong>Name:</strong> {selectedOrder.customerInfo?.name}
                      </p>
                      <p className="break-all">
                        <strong>Email:</strong> {selectedOrder.customerInfo?.email}
                      </p>
                      <p className="break-words">
                        <strong>Phone:</strong> {selectedOrder.customerInfo?.phone}
                      </p>
                      <p className="break-words">
                        <strong>Address:</strong> {selectedOrder.customerInfo?.address}
                      </p>
                      <p className="break-words">
                        <strong>City:</strong> {selectedOrder.customerInfo?.city}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex gap-3 sm:gap-4 bg-gray-50 rounded-lg p-3">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 break-words">{item.title}</h4>
                            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                              {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                              {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                              <p>Quantity: {item.quantity}</p>
                              <p className="font-semibold">৳{item.price * item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Order Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>৳{selectedOrder.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charge:</span>
                        <span>৳{selectedOrder.deliveryCharge || 0}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base sm:text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>৳{selectedOrder.total || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Additional Information</h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-sm">
                      <p className="break-words">
                        <strong>Payment Method:</strong> {selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                      <p className="break-words">
                        <strong>Delivery Area:</strong> {selectedOrder.deliveryArea}
                      </p>
                      <p>
                        <strong>Estimated Delivery:</strong> {selectedOrder.estimatedDelivery}
                      </p>
                      <p className="break-words">
                        <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
                      </p>
                      {selectedOrder.notes && (
                        <p className="break-words">
                          <strong>Notes:</strong> {selectedOrder.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    {canCancelOrder(selectedOrder.orderStatus) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowOrderDetails(false)
                          cancelOrder(selectedOrder._id, selectedOrder.orderStatus)
                        }}
                        className="bg-transparent text-red-600 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => setShowOrderDetails(false)} 
                      className="bg-transparent w-full sm:w-auto"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  )
}

export default Dashboard