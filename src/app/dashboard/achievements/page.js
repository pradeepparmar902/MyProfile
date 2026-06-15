import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AchievementActions } from "@/components/achievements/AchievementActions";
import { categories } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AchievementsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const achievements = await db.achievement.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardTopbar 
        title="Achievements" 
        guideContent={
          <>
            <p>Write stories about things you built, led, or improved.</p>
            <p><strong>Use the STAR Method:</strong></p>
            <ul>
              <li><strong>Situation:</strong> What was the context?</li>
              <li><strong>Task/Problem:</strong> What needed to be solved?</li>
              <li><strong>Action:</strong> What exactly did YOU do?</li>
              <li><strong>Result:</strong> What was the measurable impact? (e.g. "Increased speed by 20%").</li>
            </ul>
          </>
        }
      />
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Achievement stories</h2>
            <p className="mt-1 text-slate-600">Turn student work into evidence-rich stories.</p>
          </div>
          <Button href="/dashboard/achievements/new"><Plus size={16} /> Add Achievement</Button>
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {["All", ...categories].map((category) => <Badge key={category}>{category}</Badge>)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {achievements.length ? achievements.map((achievement) => (
            <Card key={achievement.title} className={`p-5 ${achievement.isHidden ? "opacity-50 grayscale" : ""}`}>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>{achievement.category}</Badge>
                <Badge>{achievement.status}</Badge>
              </div>
              <h3 className="text-lg font-bold">{achievement.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{achievement.problemStatement}</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{achievement.result}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(achievement.skillsUsed || "").split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => <Badge key={skill}>{skill}</Badge>)}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={`/dashboard/achievements/${achievement.id}`} variant="secondary">View</Button>
                <Button href={`/dashboard/achievements/${achievement.id}/edit`} variant="ghost">Edit</Button>
                <AchievementActions initialAchievement={achievement} />
              </div>
            </Card>
          )) : (
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold">Start your first achievement story</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Use the wizard to capture the problem, thinking, execution, result, and learning.</p>
              <Button href="/dashboard/achievements/new" className="mt-5"><Plus size={16} /> Add Achievement</Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
