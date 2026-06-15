"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PageGuide({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-3 grid size-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        title={`How to use the ${title} page`}
      >
        <Info size={18} />
      </button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Invisible backdrop that closes the panel when clicking outside, but doesn't blur the screen */}
          <div className="fixed inset-0 bg-transparent" onClick={() => setIsOpen(false)} />
          
          {/* Right side panel sliding in */}
          <div className="relative h-full w-full max-w-sm flex flex-col bg-white shadow-2xl animate-in slide-in-from-right-full duration-300 ease-out border-l border-slate-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-indigo-100 text-indigo-600">
                  <Info size={18} />
                </span>
                <h2 className="text-base font-bold text-slate-900">Guide: {title}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                title="Close panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
                {children}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-5 bg-slate-50/50">
              <Button onClick={() => setIsOpen(false)} className="w-full">Got it!</Button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
