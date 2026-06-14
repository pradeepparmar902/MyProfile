import { Award, FileText, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { achievements, profile, skills } from "@/lib/data";

export function DemoProfile() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/60 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl md:p-8">
      {/* Decorative gradient blob inside the card */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-300 blur-3xl opacity-50" />
      
      <div className="relative z-10 flex items-start gap-5">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
          AM
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900">{profile.name}</h3>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{profile.headline}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <MapPin size={14} className="text-indigo-500" /> {profile.location}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Profile completion</span>
          <span className="text-indigo-600">{profile.completion}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/50 shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${profile.completion}%` }} />
        </div>
      </div>

      <div className="relative z-10 mt-8 rounded-2xl border border-white/60 bg-white/50 p-5 shadow-sm backdrop-blur-md transition-all hover:bg-white/80">
        <p className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-600">
          <Award size={16} /> Featured achievement
        </p>
        <h4 className="font-extrabold text-slate-900 leading-tight">{achievements[0].title}</h4>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{achievements[0].result}</p>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap gap-2">
        {skills.slice(0, 4).map((skill) => (
          <span key={skill.name} className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-bold text-indigo-700 backdrop-blur-sm">
            {skill.name}
          </span>
        ))}
      </div>

      <button className="relative z-10 mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:from-indigo-600 hover:to-cyan-600">
        <FileText size={18} /> Download Verified Resume
      </button>
    </div>
  );
}
