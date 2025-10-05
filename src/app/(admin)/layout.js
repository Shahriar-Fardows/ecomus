import AdminPrivateRoute from "@/auth/adminRoute/AdminRoute"
import Context from "@/auth/context/Context"
import EcommerceSidebar from "@/components/admin/Sidebar/Sidebar"
import "./admin.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex">
        <Context>
          <AdminPrivateRoute>
            {/* Sidebar */}
            <div className="w-64 fixed top-0 left-0 h-screen border-r">
              <EcommerceSidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 ml-64 overflow-y-auto h-screen">
              {children}
            </div>
          </AdminPrivateRoute>
        </Context>
      </body>
    </html>
  )
}
