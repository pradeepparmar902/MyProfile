import { cn } from "@/lib/utils";

export function Card({ children, className }) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}
