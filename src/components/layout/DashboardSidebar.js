"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems as items } from "./navItems";
import { LogoutButton } from "./LogoutButton";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  return (
    <aside className="no-print hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        </span>
        <span>
          <span className="block text-lg font-bold text-slate-950">Portfolio</span>
          <span className="text-xs font-medium text-slate-500">Career identity</span>
        </span>
      </Link>
      <nav className="grid gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href || (item.href !== "/dashboard" && activePath.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActivePath(item.href)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                isActive 
                  ? "bg-slate-100 text-slate-950" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-slate-200 pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
