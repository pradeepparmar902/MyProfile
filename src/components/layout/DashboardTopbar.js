import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageGuide } from "@/components/ui/PageGuide";

export function DashboardTopbar({ title, guideContent }) {
  return (
    <header className="no-print sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center">
        <div className="mr-3 w-10 lg:hidden" /> {/* Spacer for the fixed MobileNav button */}
        <div className="flex items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:block">Student workspace</p>
            <h1 className="text-xl font-bold text-slate-950">{title}</h1>
          </div>
          {guideContent && <PageGuide title={title}>{guideContent}</PageGuide>}
        </div>
      </div>
      <Button href="/profile/demo-student" variant="secondary" className="hidden sm:flex">
        <ExternalLink size={16} />
        View Public Profile
      </Button>
    </header>
  );
}
