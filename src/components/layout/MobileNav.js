"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { navItems } from "./navItems";
import { LogoutButton } from "./LogoutButton";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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
              <Link href="/" className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white">
                  <Sparkles size={20} />
                </span>
                <span>
                  <span className="block text-lg font-bold text-slate-950">Portfolio</span>
                  <span className="text-xs font-medium text-slate-500">Career identity</span>
                </span>
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
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="mt-auto border-t border-slate-200 pt-4 pb-4">
              <LogoutButton />
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
