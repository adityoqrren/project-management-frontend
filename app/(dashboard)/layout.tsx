import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-gray-50">

        <Navbar />

        <main className="min-h-0 flex-1">
          {children}
        </main>

      </div>
    </AuthProvider>
  );
}