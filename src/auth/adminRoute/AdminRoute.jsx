"use client"

import useAuthContext from "@/hooks/useAuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const AdminPrivateRoute = ({ children }) => {
  const { user, loading } = useAuthContext()
  const [userType, setUserType] = useState(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyUserAccess = async () => {
      if (!loading && user?.email) {
        try {
          const res = await fetch("/api/userEntries")
          const data = await res.json()

          // Find the logged-in user in the database
          const currentUser = data.find((entry) => entry.email === user.email)

          // Check if user is admin/moderator/staff and active
          if (
            currentUser &&
            ["admin", "moderator", "staff"].includes(currentUser.usertype) &&
            currentUser.status === "active"
          ) {
            setUserType(currentUser.usertype)

            // If currently on /admin (login) or /admin-verify, redirect to dashboard
            if (
              window.location.pathname === "/admin" ||
              window.location.pathname === "/admin-verify"
            ) {
              router.replace("/admin")
            }
          } else {
            router.replace("/admin-verify")
          }
        } catch (error) {
          console.error("Error verifying user:", error)
          router.replace("/admin-verify")
        } finally {
          setChecking(false)
        }
      } else if (!user && !loading) {
        router.replace("/admin-verify")
        setChecking(false)
      }
    }

    verifyUserAccess()
  }, [user, loading, router])

  // Show a loader while verifying access
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Render admin panel if user is valid
  if (userType) {
    return <>{children}</>
  }

  // Unauthorized users are already redirected
  return null
}

export default AdminPrivateRoute
