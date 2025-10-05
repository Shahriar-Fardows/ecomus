"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import useAuthContext from "@/hooks/useAuthContext"
import { ArrowRight, Lock, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const PrivateRoute = ({ children, redirectTo = "/login", requireAuth = true }) => {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Show login prompt instead of immediate redirect----
        setShowLoginPrompt(true)
      } else {
        setShowLoginPrompt(false)
      }
    }
  }, [user, loading, requireAuth])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Checking authentication...</h2>
          <p className="text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    )
  }

  // Show login prompt if authentication is required but user is not logged in
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this page. Please sign in to continue.
            </p>

            <div className="space-y-3">
              <Link href={redirectTo}>
                <Button className="w-full flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Button variant="outline" onClick={() => router.back()} className="w-full bg-transparent">
                Go Back
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user is authenticated or authentication is not required, render children
  return <>{children}</>
}

export default PrivateRoute
