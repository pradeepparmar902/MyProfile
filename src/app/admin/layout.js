import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Users, Settings, LogOut, ArrowLeft } from "lucide-react";

export default async function AdminLayout({ children }) {
  const admin = await requireAdmin();
  
  if (!admin) {
    redirect("/dashboard");
  }

  const navItems = [
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Subscription Plans", href: "/admin/plans", icon: Settings },
    { label: "Global Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-950 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 md:min-h-screen shrink-0 border-r border-slate-200 bg-white px-4 py-5 flex flex-col">
        <div className="mb-8 px-2 flex items-center justify-between">
          <div>
            <span className="block text-lg font-bold text-slate-950">Admin Panel</span>
            <span className="text-xs font-medium text-slate-500">Superuser Access</span>
          </div>
        </div>
        
        <nav className="grid gap-1 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4 grid gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
