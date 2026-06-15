import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const admin = await requireAdmin();
  const isAdmin = !!admin;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-950">
      <div className="flex">
        <MobileNav isAdmin={isAdmin} />
        <DashboardSidebar isAdmin={isAdmin} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
