"use client"

import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Download,
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  UserPlus,
  Users,
} from "lucide-react"
import { useState } from "react"

export default function CustomersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [segmentFilter, setSegmentFilter] = useState("all")

  const customers = [
    {
      id: "CUST001",
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      joinDate: "2023-12-15",
      totalOrders: 12,
      totalSpent: "$1,245.50",
      status: "active",
      segment: "vip",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "CUST002",
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
      phone: "+1 (555) 234-5678",
      location: "Los Angeles, CA",
      joinDate: "2023-11-20",
      totalOrders: 8,
      totalSpent: "$892.30",
      status: "active",
      segment: "regular",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "CUST003",
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      phone: "+1 (555) 345-6789",
      location: "San Francisco, CA",
      joinDate: "2024-01-05",
      totalOrders: 15,
      totalSpent: "$2,156.75",
      status: "active",
      segment: "vip",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "CUST004",
      name: "William Kim",
      email: "will@email.com",
      phone: "+1 (555) 456-7890",
      location: "Chicago, IL",
      joinDate: "2023-10-12",
      totalOrders: 3,
      totalSpent: "$234.95",
      status: "inactive",
      segment: "new",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "CUST005",
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
      phone: "+1 (555) 567-8901",
      location: "Miami, FL",
      joinDate: "2024-01-10",
      totalOrders: 6,
      totalSpent: "$567.80",
      status: "active",
      segment: "regular",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "CUST006",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 678-9012",
      location: "Seattle, WA",
      joinDate: "2023-09-18",
      totalOrders: 20,
      totalSpent: "$3,245.60",
      status: "active",
      segment: "vip",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "CUST007",
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+1 (555) 789-0123",
      location: "Boston, MA",
      joinDate: "2024-01-08",
      totalOrders: 2,
      totalSpent: "$156.40",
      status: "active",
      segment: "new",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "CUST008",
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+1 (555) 890-1234",
      location: "Austin, TX",
      joinDate: "2023-08-25",
      totalOrders: 1,
      totalSpent: "$89.99",
      status: "inactive",
      segment: "at-risk",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const getSegmentVariant = (segment) => {
    switch (segment) {
      case "vip":
        return "default"
      case "regular":
        return "secondary"
      case "new":
        return "outline"
      case "at-risk":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusVariant = (status) => {
    return status === "active" ? "default" : "secondary"
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter

    return matchesSearch && matchesStatus && matchesSegment
  })

  const customerStats = [
    {
      title: "Total Customers",
      value: customers.length.toString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "New This Month",
      value: customers.filter((c) => new Date(c.joinDate) > new Date("2024-01-01")).length.toString(),
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      title: "VIP Customers",
      value: customers.filter((c) => c.segment === "vip").length.toString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Active Customers",
      value: customers.filter((c) => c.status === "active").length.toString(),
      icon: Users,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships and data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {customerStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>View and manage all your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or ID..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                          <AvatarFallback>
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {customer.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
  <Calendar className="h-3 w-3" />
  {new Date(customer.joinDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}
</div>

                    </TableCell>
                    <TableCell className="font-medium">{customer.totalOrders}</TableCell>
                    <TableCell className="font-medium">{customer.totalSpent}</TableCell>
                    <TableCell>
                      <Badge variant={getSegmentVariant(customer.segment)}>{customer.segment.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(customer.status)}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
