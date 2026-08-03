import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">

        <Navbar />

        <main>
          {children}
        </main>

      </div>
    </AuthProvider>
  );
}