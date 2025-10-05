"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    CheckCircle, Clock, CreditCard, Download, Edit, Eye, FileText, MoreHorizontal, Package, RefreshCw, Search, Trash2, Truck, XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [generalSettings, setGeneralSettings] = useState(null)
  const [editFormData, setEditFormData] = useState({
    orderStatus: "",
    paymentStatus: "",
    notes: ""
  })

  // Fetch general settings
  const fetchGeneralSettings = async () => {
    try {
      const response = await fetch('/api/general-settings')
      const data = await response.json()
      setGeneralSettings(data)
    } catch (error) {
      console.error('Error fetching general settings:', error)
    }
  }

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchGeneralSettings()
  }, [])

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          orderStatus: status
        })
      })


      if (response.ok) {
        await fetchOrders()
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Order status updated successfully!',
          confirmButtonColor: '#3085d6'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update order. Please try again.',
          confirmButtonColor: '#d33'
        })
      }
    } catch (error) {
      console.error('Error updating order:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#d33'
      })
    }
  }

  // Update order (full edit)
  const handleUpdateOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder._id,
          orderStatus: editFormData.orderStatus,
          paymentStatus: editFormData.paymentStatus,
          notes: editFormData.notes
        })
      })

      if (response.ok) {
        await fetchOrders()
        setEditDialog(false)
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Order updated successfully!',
          confirmButtonColor: '#3085d6'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update order. Please try again.',
          confirmButtonColor: '#d33'
        })
      }
    } catch (error) {
      console.error('Error updating order:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#d33'
      })
    }
  }

  // Delete order
  const handleDeleteOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrder._id })
      })

      if (response.ok) {
        await fetchOrders()
        setDeleteDialog(false)
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Order deleted successfully!',
          confirmButtonColor: '#3085d6'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete order. Please try again.',
          confirmButtonColor: '#d33'
        })
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#d33'
      })
    }
  }

  // Export orders to CSV
  const exportToCSV = () => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'Order Date',
      'Order Status',
      'Payment Status',
      'Payment Method',
      'Items Count',
      'Subtotal',
      'Delivery Charge',
      'Discount',
      'Total',
      'Estimated Delivery'
    ]

    const csvData = filteredOrders.map(order => [
      `#${order._id.slice(-6)}`,
      order.customerInfo.name,
      order.customerInfo.email,
      order.customerInfo.phone,
      order.customerInfo.address,
      new Date(order.createdAt).toLocaleDateString('en-GB'),
      order.orderStatus,
      order.paymentStatus,
      order.paymentMethod,
      order.items.length,
      order.subtotal,
      order.deliveryCharge,
      order.couponDiscount || 0,
      order.total,
      `${order.estimatedDelivery} days`
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: `${filteredOrders.length} orders exported successfully!`,
      confirmButtonColor: '#3085d6'
    })
  }

  // Generate Invoice (PDF)
  const generateInvoice = (order) => {
    const logoUrl = generalSettings?.logo?.url || ''
    const logoWidth = generalSettings?.logo?.width || 130

    // Create invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-width: ${logoWidth}px; margin-bottom: 20px; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #333; margin: 10px 0; }
          .order-id { font-size: 14px; color: #666; }
          .invoice-details { margin-bottom: 20px; line-height: 1.8; }
          .invoice-details p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #ff6c2f; color: white; font-weight: bold; }
          .total-section { margin-top: 20px; text-align: right; }
          .total-section p { margin: 8px 0; font-size: 16px; }
          .grand-total { font-size: 20px; font-weight: bold; color: #ff6c2f; margin-top: 15px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ''}
          <div class="invoice-title">INVOICE</div>
          <p class="order-id">Order ID: #${order._id.slice(-6)}</p>
        </div>
        <div class="invoice-details">
          <p><strong>Customer Name:</strong> ${order.customerInfo.name}</p>
          <p><strong>Email:</strong> ${order.customerInfo.email}</p>
          <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
          <p><strong>Address:</strong> ${order.customerInfo.address}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery} days</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.currency}${item.price}</td>
                <td style="text-align: right;">${item.currency}${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <p>Subtotal: ${order.items[0]?.currency || '৳'}${order.subtotal}</p>
          <p>Delivery Charge: ${order.items[0]?.currency || '৳'}${order.deliveryCharge}</p>
          ${order.couponDiscount ? `<p>Discount: -${order.items[0]?.currency || '৳'}${order.couponDiscount}</p>` : ''}
          <p class="grand-total">Total: ${order.items[0]?.currency || '৳'}${order.total}</p>
        </div>
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>For any queries, please contact us.</p>
        </div>
      </body>
      </html>
    `

    // Open in new window for printing
    const printWindow = window.open('', '_blank')
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.print()
  }

  // View order details
  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setViewDialog(true)
  }

  // Edit order
  const handleEditOrder = (order) => {
    setSelectedOrder(order)
    setEditFormData({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      notes: order.notes || ""
    })
    setEditDialog(true)
  }

  // Delete confirmation
  const handleDeleteConfirmation = (order) => {
    setSelectedOrder(order)
    setDeleteDialog(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
      case "in-progress":
        return <RefreshCw className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "refund":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "processing":
      case "in-progress":
        return "text-orange-600 bg-orange-50"
      case "shipped":
        return "text-blue-600 bg-blue-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "cancelled":
        return "text-red-600 bg-red-50"
      case "refund":
        return "text-purple-600 bg-purple-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getPriorityFromStatus = (status) => {
    if (status === "pending" || status === "processing") return 1
    if (status === "shipped") return 2
    return 3
  }

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter

      const matchesDate = (() => {
        if (dateFilter === "all") return true
        const orderDate = new Date(order.createdAt)
        const today = new Date()

        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === today.toDateString()
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDate >= weekAgo
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return orderDate >= monthAgo
          default:
            return true
        }
      })()

      return matchesSearch && matchesStatus && matchesDate
    })
    .sort((a, b) => getPriorityFromStatus(a.orderStatus) - getPriorityFromStatus(b.orderStatus))

  const orderStats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Progress",
      value: orders.filter((o) => o.orderStatus === "processing" || o.orderStatus === "in-progress").length.toString(),
      icon: RefreshCw,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Order Shipped",
      value: orders.filter((o) => o.orderStatus === "shipped").length.toString(),
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Order Cancel",
      value: orders.filter((o) => o.orderStatus === "cancelled").length.toString(),
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Payment Refund",
      value: orders.filter((o) => o.paymentStatus === "refunded").length.toString(),
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">Manage and track all your orders with advanced filtering</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="btn-ghost-hover bg-transparent" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" style={{ backgroundColor: "#ff6c2f", borderColor: "#ff6c2f" }}>
            Create Order
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {orderStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.title === "Total Orders" ? "All time" : "This month"}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management Dashboard</CardTitle>
          <CardDescription>View and manage all customer orders with advanced filtering options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, or order IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Order Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Order Cancel</SelectItem>
                <SelectItem value="refund">Payment Refund</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const priority = getPriorityFromStatus(order.orderStatus)
                    return (
                      <TableRow key={order._id} className={priority === 1 ? "bg-yellow-50" : ""}>
                        <TableCell className="font-medium">#{order._id.slice(-6)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerInfo.name}</div>
                            <div className="text-sm text-muted-foreground">{order.customerInfo.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            {order.orderStatus === "in-progress" || order.orderStatus === "processing"
                              ? "Processing"
                              : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.items.length} items</TableCell>
                        <TableCell className="font-medium">{order.items[0]?.currency || '৳'}{order.total}</TableCell>
                        <TableCell>
                          <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 btn-hover-custom">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateInvoice(order)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'processing')}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Mark as Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'shipped')}>
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Shipped
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => updateOrderStatus(order._id, 'cancelled')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteConfirmation(order)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: #{selectedOrder?._id.slice(-6)}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customerInfo.name}</p>
                <p><strong>Email:</strong> {selectedOrder.customerInfo.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customerInfo.phone}</p>
                <p><strong>Address:</strong> {selectedOrder.customerInfo.address}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.currency}{item.price}</TableCell>
                          <TableCell>{item.currency}{item.price * item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <p><strong>Subtotal:</strong> {selectedOrder.items[0]?.currency || '৳'}{selectedOrder.subtotal}</p>
                <p><strong>Delivery Charge:</strong> {selectedOrder.items[0]?.currency || '৳'}{selectedOrder.deliveryCharge}</p>
                {selectedOrder.couponDiscount > 0 && (
                  <p><strong>Discount:</strong> -{selectedOrder.items[0]?.currency || '৳'}{selectedOrder.couponDiscount}</p>
                )}
                <p className="text-lg"><strong>Total:</strong> {selectedOrder.items[0]?.currency || '৳'}{selectedOrder.total}</p>
              </div>
              <div>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Estimated Delivery:</strong> {selectedOrder.estimatedDelivery} days</p>
                {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update order status and payment information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="orderStatus">Order Status</Label>
              <Select value={editFormData.orderStatus} onValueChange={(val) => setEditFormData({ ...editFormData, orderStatus: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select value={editFormData.paymentStatus} onValueChange={(val) => setEditFormData({ ...editFormData, paymentStatus: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Add order notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateOrder} style={{ backgroundColor: "#ff6c2f" }}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order #{selectedOrder?._id.slice(-6)}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}