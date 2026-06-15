import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNavItems } from "@/components/layout/navItems";

export default async function DashboardLayout({ children }) {
  const admin = await requireAdmin();
  const isAdmin = !!admin;
  const settings = await db.setting.findFirst({}) || {};
  const navItems = getNavItems(settings);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-950">
      <div className="flex">
        <MobileNav isAdmin={isAdmin} navItems={navItems} />
        <DashboardSidebar isAdmin={isAdmin} navItems={navItems} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
