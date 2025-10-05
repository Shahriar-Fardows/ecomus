// import Sidebar from "@/components/Admin/Sidebar/Sidebar";
import Context from "@/auth/context/Context";
import "../(admin)/admin.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
        {/* Sidebar */}
        <Context>
          {/* Main content */}
          <div className="flex-1 overflow-y-auto h-screen">
            {children}
          </div>
        </Context>
      </body>
    </html>
  );
}
