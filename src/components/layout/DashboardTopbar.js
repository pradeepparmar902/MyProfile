import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "./MobileNav";

export function DashboardTopbar({ title }) {
  return (
    <header className="no-print sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center">
        <MobileNav />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:block">Student workspace</p>
          <h1 className="text-xl font-bold text-slate-950">{title}</h1>
        </div>
      </div>
      <Button href="/profile/demo-student" variant="secondary" className="hidden sm:flex">
        <ExternalLink size={16} />
        View Public Profile
      </Button>
    </header>
  );
}
