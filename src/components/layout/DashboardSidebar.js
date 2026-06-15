"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";
import { getNavItems } from "./navItems";

export function DashboardSidebar({ isAdmin = false, settings = {} }) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);
  const navItems = getNavItems(settings);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  return (
    <aside className="no-print hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-3 group">
        <span className="grid size-9 place-items-center rounded-xl bg-white shadow-md overflow-hidden transition-transform group-hover:scale-105">
          <img src="/logo.png" alt="Proofolio Logo" className="h-full w-full object-cover" />
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900">Proofolio</span>
      </Link>
      <nav className="grid gap-1">
        {navItems.map((item) => {
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
      {isAdmin && (
        <div className="mt-auto border-t border-slate-200 pt-4 mb-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            Admin Panel
          </Link>
        </div>
      )}
      <div className={`border-t border-slate-200 pt-4 ${isAdmin ? "" : "mt-auto"}`}>
        <LogoutButton />
      </div>
    </aside>
  );
}
