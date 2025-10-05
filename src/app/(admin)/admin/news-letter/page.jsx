"use client"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import axios from "axios"
import { Download, Mail, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

export default function NewsletterDashboard() {
  const [subscribers, setSubscribers] = useState([])
  const [filteredSubscribers, setFilteredSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchSubscribers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = subscribers.filter(sub => 
        sub.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSubscribers(filtered)
    } else {
      setFilteredSubscribers(subscribers)
    }
  }, [searchQuery, subscribers])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/newsletter')
      setSubscribers(response.data)
      setFilteredSubscribers(response.data)
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load subscribers',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await axios.delete('/api/newsletter', {
          data: { id }
        })

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Subscriber has been deleted.',
          timer: 2000,
          showConfirmButton: false
        })

        fetchSubscribers()
      } catch (error) {
        console.error("Error deleting subscriber:", error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete subscriber',
        })
      }
    }
  }

  const handleExport = () => {
    const csv = [
      ['Email', 'Subscribed Date'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        new Date(sub.createdAt || Date.now()).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter-subscribers.csv'
    a.click()
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h1>
          <p className="text-gray-600">Manage your newsletter subscribers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900">{subscribers.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {subscribers.filter(sub => {
                    const subDate = new Date(sub.createdAt)
                    const now = new Date()
                    return subDate.getMonth() === now.getMonth() && 
                           subDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {subscribers.filter(sub => {
                    const subDate = new Date(sub.createdAt)
                    const now = new Date()
                    return subDate.toDateString() === now.toDateString()
                  }).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button 
              onClick={handleExport}
              variant="outline"
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No subscribers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber, index) => (
                    <tr key={subscriber._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(subscriber.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(subscriber._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        {filteredSubscribers.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredSubscribers.length} of {subscribers.length} subscribers
          </div>
        )}
      </div>
    </div>
  )
}