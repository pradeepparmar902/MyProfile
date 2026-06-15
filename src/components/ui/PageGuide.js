"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PageGuide({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-3 grid size-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        title={`How to use the ${title} page`}
      >
        <Info size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-indigo-100 text-indigo-600">
                <Info size={24} />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Guide: {title}</h2>
            </div>
            <div className="mt-6 prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed">
              {children}
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setIsOpen(false)}>Got it!</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
