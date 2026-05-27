import { Award, FileText, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { achievements, profile, skills } from "@/lib/data";

export function DemoProfile() {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#4F46E5] text-lg font-bold text-white">
          AM
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-950">{profile.name}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">{profile.headline}</p>
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin size={14} /> {profile.location}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
          <span>Profile completion</span>
          <span>{profile.completion}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-[#06B6D4]" style={{ width: `${profile.completion}%` }} />
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#4F46E5]">
          <Award size={15} /> Featured achievement
        </p>
        <h4 className="font-bold text-slate-950">{achievements[0].title}</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">{achievements[0].result}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {skills.slice(0, 4).map((skill) => (
          <Badge key={skill.name}>{skill.name}</Badge>
        ))}
      </div>
      <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">
        <FileText size={16} /> Download Resume
      </button>
    </Card>
  );
}
