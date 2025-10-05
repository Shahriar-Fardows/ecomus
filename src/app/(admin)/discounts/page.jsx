"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  Calendar,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users
} from "lucide-react"
import { useEffect, useState } from "react"

export default function DiscountManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [coupons, setCoupons] = useState([])
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true)
  
  const [newCoupon, setNewCoupon] = useState({
    couponCode: "",
    discount: "",
    discountType: "percentage",
    validTill: "",
    minimumPurchase: "",
    description: "",
    category: "",
    userLevel: "",
    maxUsage: "",
    isUnlimited: false,
    status: "active"
  })

  // Fetch coupons from API
  const fetchCoupons = async () => {
    try {
      setIsLoadingCoupons(true)
      const response = await fetch('/api/coupons', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform API data to match our component structure
      const transformedCoupons = data.map(coupon => ({
        id: coupon._id || coupon.id,
        couponCode: coupon.couponCode,
        discount: coupon.discount,
        discountType: coupon.customData?.discountType || (coupon.discount.includes('%') ? 'percentage' : 'fixed'),
        description: coupon.description,
        status: coupon.customData?.status || 'active',
        used: coupon.used || 0,
        maxUsage: coupon.customData?.maxUsage === -1 || coupon.customData?.maxUsage === 'unlimited' ? 'Unlimited' : (coupon.customData?.maxUsage || 100),
        validTill: coupon.validTill,
        minimumPurchase: coupon.minimumPurchase,
        createdDate: coupon.createdAt ? new Date(coupon.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: coupon.customData?.category || "general",
        userLevel: coupon.customData?.userLevel || "all"
      }))
      
      setCoupons(transformedCoupons)
    } catch (err) {
      console.error('Error fetching coupons:', err)
      setError('Failed to load coupons. Please refresh the page.')
    } finally {
      setIsLoadingCoupons(false)
    }
  }

  // Load coupons on component mount
  useEffect(() => {
    fetchCoupons()
  }, [])

  const stats = [
    {
      title: "Total Coupons",
      value: coupons.length.toString(),
      change: "+3 this month",
      icon: Percent,
      color: "text-blue-600",
    },
    {
      title: "Active Coupons",
      value: coupons.filter(c => c.status === 'active').length.toString(),
      change: "+2 this week",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Total Redemptions",
      value: coupons.reduce((sum, c) => sum + (c.used || 0), 0).toString(),
      change: "+12% from last month",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue Impact",
      value: `${coupons.reduce((sum, c) => sum + (c.used || 0) * (c.discountType === 'fixed' ? parseInt(c.discount) : 0), 0)} Tk`,
      change: "This month",
      icon: Calendar,
      color: "text-orange-600",
    },
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
      expired: { label: "Expired", className: "bg-red-100 text-red-800" },
    }
    const config = statusConfig[status] || statusConfig.inactive
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCoupon({ ...newCoupon, couponCode: result })
  }

  const validateForm = () => {
    if (!newCoupon.couponCode.trim()) return "Coupon code is required"
    if (!newCoupon.discount.trim()) return "Discount value is required"
    if (!newCoupon.validTill) return "Expiry date is required"
    if (!newCoupon.minimumPurchase || parseFloat(newCoupon.minimumPurchase) < 0) return "Valid minimum purchase amount is required"
    if (!newCoupon.description.trim()) return "Description is required"
    
    // Check for duplicate coupon codes
    if (coupons.some(c => c.couponCode.toLowerCase() === newCoupon.couponCode.toLowerCase())) {
      return "Coupon code already exists"
    }
    
    return null
  }

  const handleCreateCoupon = async () => {
    setError("")
    setSuccess("")
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    
    try {
      // Prepare data for API
      const apiData = {
        couponCode: newCoupon.couponCode.trim(),
        discount: newCoupon.discountType === 'percentage' ? `${newCoupon.discount}%` : newCoupon.discount,
        validTill: newCoupon.validTill,
        minimumPurchase: parseInt(newCoupon.minimumPurchase),
        description: newCoupon.description.trim(),
        customData: {
          category: newCoupon.category || "general",
          userLevel: newCoupon.userLevel || "all",
          maxUsage: newCoupon.isUnlimited ? -1 : parseInt(newCoupon.maxUsage) || 100,
          discountType: newCoupon.discountType,
          status: newCoupon.status,
          isUnlimited: newCoupon.isUnlimited
        }
      }

      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Add new coupon to local state
      const newCouponData = {
        id: Date.now(), // Temporary ID
        couponCode: newCoupon.couponCode,
        discount: newCoupon.discountType === 'percentage' ? `${newCoupon.discount}%` : newCoupon.discount,
        discountType: newCoupon.discountType,
        description: newCoupon.description,
        status: newCoupon.status,
        used: 0,
        maxUsage: parseInt(newCoupon.maxUsage) || 100,
        validTill: newCoupon.validTill,
        minimumPurchase: parseInt(newCoupon.minimumPurchase),
        createdDate: new Date().toISOString().split('T')[0],
        category: newCoupon.category || "general",
        userLevel: newCoupon.userLevel || "all"
      }
      
      setSuccess("Coupon created successfully!")
      setIsCreateDialogOpen(false)
      resetForm()
      
      // Refresh coupon list from API
      await fetchCoupons()
      
    } catch (err) {
      console.error('Error creating coupon:', err)
      setError(err.message || 'Failed to create coupon. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setNewCoupon({
      couponCode: "",
      discount: "",
      discountType: "percentage",
      validTill: "",
      minimumPurchase: "",
      description: "",
      category: "",
      userLevel: "",
      maxUsage: "",
      isUnlimited: false,
      status: "active"
    })
    setError("")
  }

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.couponCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || coupon.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatDiscount = (discount, type) => {
    return type === 'percentage' ? discount : `${discount} Tk`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
          <p className="text-gray-600">Create and manage discount coupons for your store</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ff6c2f] hover:bg-[#ffdacb] hover:text-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Create a new discount coupon for your customers</DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="code" className="pb-2">Coupon Code Name*</Label>
                  <Input
                    id="code"
                    value={newCoupon.couponCode}
                    onChange={(e) => setNewCoupon({ ...newCoupon, couponCode: e.target.value.toUpperCase() })}
                    placeholder="Enter coupon code"
                    className="mt-1"
                  />
                </div>
                <Button type="button" variant="outline" onClick={generateCouponCode} className="bg-transparent">
                  Generate
                </Button>
              </div>
              
              <div>
                <Label htmlFor="description" className="pb-2">Description*</Label>
                <Textarea
                  id="description"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="Coupon description"
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="pb-2">Discount Type*</Label>
                  <Select 
                    value={newCoupon.discountType} 
                    onValueChange={(value) => setNewCoupon({ ...newCoupon, discountType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (Tk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value" className="pb-2">Discount Value*</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    placeholder={newCoupon.discountType === "percentage" ? "20" : "500"}
                    className="mt-1"
                    min="0"
                    max={newCoupon.discountType === "percentage" ? "100" : undefined}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="pb-2">Valid Till*</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newCoupon.validTill}
                    onChange={(e) => setNewCoupon({ ...newCoupon, validTill: e.target.value })}
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label className="pb-2">Usage Limit</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="unlimited"
                        checked={newCoupon.isUnlimited}
                        onChange={(e) => setNewCoupon({ 
                          ...newCoupon, 
                          isUnlimited: e.target.checked,
                          maxUsage: e.target.checked ? "" : newCoupon.maxUsage
                        })}
                        className="w-4 h-4 text-[#ff6c2f] border-gray-300 rounded focus:ring-[#ff6c2f]"
                      />
                      <Label htmlFor="unlimited" className="text-sm font-medium">
                        Unlimited Usage
                      </Label>
                    </div>
                    {!newCoupon.isUnlimited && (
                      <Input
                        type="number"
                        value={newCoupon.maxUsage}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUsage: e.target.value })}
                        placeholder="100"
                        className="mt-1"
                        min="1"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="minimumPurchase" className="pb-2">Minimum Purchase Amount (Tk)*</Label>
                <Input
                  id="minimumPurchase"
                  type="number"
                  value={newCoupon.minimumPurchase}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minimumPurchase: e.target.value })}
                  placeholder="500"
                  className="mt-1"
                  min="0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="pb-2">Category</Label>
                  <Select 
                    value={newCoupon.category} 
                    onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="userLevel" className="pb-2">User Level</Label>
                  <Select 
                    value={newCoupon.userLevel} 
                    onValueChange={(value) => setNewCoupon({ ...newCoupon, userLevel: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select user level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="new">New Users</SelectItem>
                      <SelectItem value="regular">Regular Users</SelectItem>
                      <SelectItem value="premium">Premium Users</SelectItem>
                      <SelectItem value="vip">VIP Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="status" className="pb-2">Status</Label>
                <Select 
                  value={newCoupon.status} 
                  onValueChange={(value) => setNewCoupon({ ...newCoupon, status: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {setIsCreateDialogOpen(false); resetForm()}}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateCoupon}
                disabled={isLoading}
                className="bg-[#ff6c2f] hover:bg-[#ffdacb] hover:text-gray-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Coupon'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Coupon List</CardTitle>
              <CardDescription>Manage all your discount coupons</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCoupons ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading coupons...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCoupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || filterStatus !== 'all' 
                    ? "No coupons found matching your criteria." 
                    : "No coupons available. Create your first coupon!"
                  }
                </div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 space-y-2 sm:space-y-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-medium">
                          {coupon.couponCode}
                        </code>
                        {getStatusBadge(coupon.status)}
                        <span className="text-sm text-gray-600">
                          {formatDiscount(coupon.discount, coupon.discountType)} off
                        </span>
                        {coupon.category && coupon.category !== 'general' && (
                          <Badge variant="secondary" className="text-xs">
                            {coupon.category}
                          </Badge>
                        )}
                        {coupon.userLevel && coupon.userLevel !== 'all' && (
                          <Badge variant="outline" className="text-xs">
                            {coupon.userLevel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>
                          Used: {coupon.used || 0}/{coupon.maxUsage === 'Unlimited' ? '∞' : coupon.maxUsage}
                        </span>
                        <span>Min Order: {coupon.minimumPurchase} Tk</span>
                        <span>Valid Till: {coupon.validTill}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <div className="text-right text-sm">
                        <div className="font-medium text-gray-900">
                          {coupon.maxUsage === 'Unlimited' 
                            ? `${coupon.used || 0} used`
                            : `${Math.round(((coupon.used || 0) / coupon.maxUsage) * 100)}% used`
                          }
                        </div>
                        <div className="text-gray-500">
                          {coupon.maxUsage === 'Unlimited' 
                            ? 'Unlimited remaining'
                            : `${coupon.maxUsage - (coupon.used || 0)} remaining`
                          }
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {coupon.status === "active" ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}