"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { getNavItems } from "./navItems";

export function DashboardSidebar({ isAdmin = false, settings = {} }) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);
  const navItems = getNavItems(settings);
  const navRef = useRef(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = navRef.current;
      // Show arrow if we haven't scrolled to the very bottom
      setShowScrollArrow(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [navItems]);

  const scrollDown = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ top: 150, behavior: "smooth" });
    }
  };

  return (
    <aside className="no-print hidden h-screen sticky top-0 w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
      <Link href="/" className="mb-6 flex shrink-0 items-center gap-3 group">
        <span className="grid size-9 place-items-center rounded-xl bg-white shadow-md overflow-hidden transition-transform group-hover:scale-105">
          <img src="/logo.png" alt="Proofolio Logo" className="h-full w-full object-cover" />
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900">Proofolio</span>
      </Link>
      
      <div className="relative flex-1 min-h-0 flex flex-col">
        <nav 
          ref={navRef}
          onScroll={checkScroll}
          className="grid gap-1 overflow-y-auto pb-4 pr-2 custom-scrollbar flex-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href || (item.href !== "/dashboard" && activePath.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActivePath(item.href)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold shrink-0 ${
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
        
        {/* Scroll Indicator */}
        {showScrollArrow && (
          <div 
            onClick={scrollDown}
            className="absolute bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent pt-8 pb-1 cursor-pointer hover:from-slate-50 transition-colors duration-300"
            title="Scroll down for more options"
          >
            <ChevronDown size={24} className="text-slate-500 animate-bounce" />
          </div>
        )}
      </div>

      <div className="mt-4 shrink-0">
        {isAdmin && (
          <div className="border-t border-slate-200 pt-4 mb-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              Admin Panel
            </Link>
          </div>
        )}
        <div className="border-t border-slate-200 pt-4">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
