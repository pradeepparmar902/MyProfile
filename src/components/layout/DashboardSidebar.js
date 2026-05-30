import Link from "next/link";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  FileText,
  Gauge,
  GraduationCap,
  Lightbulb,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Education", href: "/dashboard/education", icon: GraduationCap },
  { label: "Achievements", href: "/dashboard/achievements", icon: Award },
  { label: "Projects", href: "/dashboard/projects", icon: Lightbulb },
  { label: "Skills", href: "/dashboard/skills", icon: BookOpen },
  { label: "Internship", href: "/dashboard/internship", icon: BriefcaseBusiness },
  { label: "Profession - Job", href: "/dashboard/profession", icon: Building2 },
  { label: "Profession - Self Business / Training", href: "/dashboard/profession-self", icon: Building2 },
  { label: "Out-of-Box Thinking", href: "/dashboard/outofbox", icon: Lightbulb },
  { label: "Hobbies & Personality", href: "/dashboard/hobbies", icon: Award },
  { label: "Resume", href: "/dashboard/resume", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="no-print hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white">
          <Sparkles size={20} />
        </span>
        <span>
          <span className="block text-lg font-bold text-slate-950">Proofolio</span>
          <span className="text-xs font-medium text-slate-500">Career identity</span>
        </span>
      </Link>
      <nav className="grid gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
