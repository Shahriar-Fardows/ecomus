"use client"

import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { DollarSign, Download, Eye, Package, ShoppingCart, TrendingDown, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function DashboardOverview() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "$0",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      description: "from last month",
    },
    {
      title: "Orders",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: ShoppingCart,
      description: "from last month",
    },
    {
      title: "Customers",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Users,
      description: "from last month",
    },
    {
      title: "Products",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Package,
      description: "from last month",
    },
  ])
  const [monthlySales, setMonthlySales] = useState([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
      processOrderData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setLoading(false)
    }
  }

  const processOrderData = (ordersData) => {
    // Calculate total revenue
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0)

    // Get unique customers
    const uniqueCustomers = new Set(ordersData.map(order => order.userEmail)).size

    // Get unique products
    const uniqueProducts = new Set()
    ordersData.forEach(order => {
      order.items.forEach(item => uniqueProducts.add(item.productId))
    })

    // Calculate previous month data for comparison
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthOrders = ordersData.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    })

    const previousMonthOrders = ordersData.filter(order => {
      const orderDate = new Date(order.createdAt)
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear
    })

    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total, 0)
    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.total, 0)

    const revenueChange = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
      : 0

    const orderChange = previousMonthOrders.length > 0
      ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length * 100).toFixed(1)
      : 0

    // Update stats
    setStats([
      {
        title: "Total Revenue",
        value: `৳${totalRevenue.toFixed(2)}`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
        trend: revenueChange >= 0 ? "up" : "down",
        icon: DollarSign,
        description: "from last month",
      },
      {
        title: "Orders",
        value: ordersData.length.toString(),
        change: `${orderChange >= 0 ? '+' : ''}${orderChange}%`,
        trend: orderChange >= 0 ? "up" : "down",
        icon: ShoppingCart,
        description: "from last month",
      },
      {
        title: "Customers",
        value: uniqueCustomers.toString(),
        change: "+19%",
        trend: "up",
        icon: Users,
        description: "from last month",
      },
      {
        title: "Products",
        value: uniqueProducts.size.toString(),
        change: "+12%",
        trend: "up",
        icon: Package,
        description: "total products",
      },
    ])

    // Process monthly sales data
    const monthlyData = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Initialize all months
    months.forEach((month, index) => {
      monthlyData[month] = { month, sales: 0, orders: 0, trend: "up", change: "+0%" }
    })

    // Aggregate order data by month
    ordersData.forEach(order => {
      const orderDate = new Date(order.createdAt)
      const monthIndex = orderDate.getMonth()
      const monthName = months[monthIndex]

      monthlyData[monthName].sales += order.total
      monthlyData[monthName].orders += 1
    })

    // Calculate trends
    const salesArray = Object.values(monthlyData)
    salesArray.forEach((data, index) => {
      if (index > 0) {
        const prevSales = salesArray[index - 1].sales
        if (prevSales > 0) {
          const change = ((data.sales - prevSales) / prevSales * 100).toFixed(1)
          data.change = `${change >= 0 ? '+' : ''}${change}%`
          data.trend = change >= 0 ? 'up' : 'down'
        }
      }
    })

    setMonthlySales(salesArray)
  }

  const exportChartData = () => {
    const csvContent = [
      ['Month', 'Sales (৳)', 'Orders', 'Trend', 'Change'],
      ...monthlySales.map(item => [
        item.month,
        item.sales.toFixed(2),
        item.orders,
        item.trend,
        item.change
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const recentOrders = orders.slice(0, 5).map(order => ({
    id: `#${order._id.slice(-4)}`,
    customer: order.customerInfo.name,
    email: order.customerInfo.email,
    amount: `৳${order.total.toFixed(2)}`,
    status: order.orderStatus === 'completed' ? 'Completed' :
      order.orderStatus === 'processing' ? 'Processing' : 'Pending'
  }))

  useEffect(() => {
    if (monthlySales.length === 0) return

    const loadChart = async () => {
      const { Chart, registerables } = await import("chart.js")
      Chart.register(...registerables)

      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current?.getContext("2d")
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: monthlySales.map((item) => item.month),
            datasets: [
              {
                label: "Sales Report",
                type: "bar",
                data: monthlySales.map((item) => Math.floor(item.sales / 10)),
                backgroundColor: "#ff6c2f",
                borderColor: "#ff6c2f",
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
              },
              {
                label: "Orders",
                type: "line",
                data: monthlySales.map((item) => item.orders),
                borderColor: "#10b981",
                backgroundColor: "transparent",
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: "#10b981",
                pointBorderColor: "#10b981",
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    if (context.dataset.label === "Sales Report") {
                      return `Sales: ৳${monthlySales[context.dataIndex].sales.toFixed(2)}`
                    } else {
                      return `Orders: ${context.parsed.y}`
                    }
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  font: {
                    size: 11,
                  },
                  color: "#6b7280",
                },
                grid: {
                  color: "#f3f4f6",
                  drawBorder: false,
                },
              },
              x: {
                ticks: {
                  font: {
                    size: 11,
                  },
                  color: "#6b7280",
                },
                grid: {
                  display: false,
                },
              },
            },
          },
        })
      }
    }

    loadChart()

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [monthlySales])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>You have {recentOrders.length} recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-[#ff5811]/30 bg-white hover:bg-[#fff7f3] transition-all duration-200 p-2 rounded-2xl"
                >
                  {/* Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#ff5811]/10 text-[#ff5811] rounded-full flex items-center justify-center font-semibold">
                      {order.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="flex items-center gap-3">
                    {/* Dynamic Status Badge */}
                    <Badge
                      className={`text-xs px-2 py-1 rounded-lg font-medium ${order.status === 'Completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : order.status === 'Processing'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' // Pending
                        }`}
                    >
                      {order.status}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-800">
                      ৳{order.amount}
                    </span>
                  </div>
                </div>

              )) : (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Monthly performance metrics with trends</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={exportChartData}
                title="Export chart data as CSV"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <canvas ref={chartRef} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}