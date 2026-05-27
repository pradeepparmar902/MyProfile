import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function AchievementStoryCard({ achievement }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge>{achievement.category}</Badge>
        {achievement.metrics ? <span className="text-xs font-semibold text-[#4F46E5]">{achievement.metrics}</span> : null}
      </div>
      <h3 className="text-lg font-bold text-slate-950">{achievement.title}</h3>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
        <p><span className="font-semibold text-slate-900">Problem:</span> {achievement.problem}</p>
        <p><span className="font-semibold text-slate-900">Result:</span> {achievement.result}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {achievement.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4F46E5]" href={achievement.proofLink}>
        View proof <ExternalLink size={15} />
      </a>
    </Card>
  );
}
