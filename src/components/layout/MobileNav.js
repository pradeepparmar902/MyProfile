"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { getNavItems } from "./navItems";

export function MobileNav({ isAdmin = false, settings = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);
  const navItems = getNavItems(settings);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-3 z-30 grid size-10 place-items-center rounded-lg hover:bg-slate-100"
      >
        <Menu size={20} />
      </button>

      {mounted && isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white px-4 py-5 shadow-2xl transition-transform">
            <div className="mb-8 flex items-center justify-between px-2">
              <Link href="/" className="flex items-center gap-3 px-2 group">
                <span className="grid size-9 place-items-center rounded-xl bg-white shadow-md overflow-hidden transition-transform group-hover:scale-105">
                  <img src="/logo.png" alt="Proofolio Logo" className="h-full w-full object-cover" />
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900">Proofolio</span>
              </Link>
              <button 
                onClick={() => setIsOpen(false)}
                className="grid size-8 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <div className="grid gap-1 pb-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePath === item.href || (item.href !== "/dashboard" && activePath.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setActivePath(item.href);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
            {isAdmin && (
              <div className="mt-auto border-t border-slate-200 pt-4 mb-2">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  Admin Panel
                </Link>
              </div>
            )}
            <div className={`border-t border-slate-200 pt-4 pb-4 ${isAdmin ? "" : "mt-auto"}`}>
              <LogoutButton />
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
