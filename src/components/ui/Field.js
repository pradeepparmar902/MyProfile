export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
      {...props}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      className="min-h-28 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
      {...props}
    >
      {children}
    </select>
  );
}
