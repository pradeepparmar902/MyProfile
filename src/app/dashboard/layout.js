import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-950">
      <div className="flex">
        <MobileNav />
        <DashboardSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
