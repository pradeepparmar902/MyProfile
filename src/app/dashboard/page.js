import { redirect } from "next/navigation";
import { Award, BookOpen, Eye, Lightbulb, Plus, UserRoundPen } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [achievementCount, projectCount, skillCount, recentAchievements, profileViews] =
    await Promise.all([
      db.achievement.count({ where: { userId: user.id } }),
      db.project.count({ where: { userId: user.id } }),
      db.skill.count({ where: { userId: user.id } }),
      db.achievement.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
      user.profile ? db.profileView.count({ where: { profileId: user.profile.id } }) : Promise.resolve(0),
    ]);

  const completed = [
    user.name,
    user.profile?.username,
    user.profile?.headline,
    user.profile?.bio,
    user.profile?.careerGoal,
    user.profile?.location,
    achievementCount > 0,
    projectCount > 0,
    skillCount > 0,
  ].filter(Boolean).length;
  const completion = Math.round((completed / 9) * 100);
  const statCards = [
    { label: "Achievements", value: achievementCount, icon: Award },
    { label: "Projects", value: projectCount, icon: Lightbulb },
    { label: "Skills", value: skillCount, icon: BookOpen },
    { label: "Profile views", value: profileViews, icon: Eye },
  ];

  return (
    <>
      <DashboardTopbar title="Dashboard" />
      <div className="grid gap-6 p-4 md:p-8">
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#4F46E5]">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold">{user.name}</h2>
              <p className="mt-2 max-w-2xl text-slate-600">Keep shaping your proof-based profile. Start with one strong achievement story and make it easy to share.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard/profile" variant="secondary"><UserRoundPen size={16} /> Edit Profile</Button>
              <Button href="/dashboard/achievements/new"><Plus size={16} /> Add Achievement</Button>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-5">
                <Icon className="text-[#4F46E5]" size={21} />
                <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </Card>
            );
          })}
        </div>
        <Card className="p-6">
          <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">
            <span>Profile completion</span>
            <span>{completion}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-[#06B6D4]" style={{ width: `${completion}%` }} /></div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-bold">Recent achievements</h3>
          <div className="mt-4 grid gap-3">
            {recentAchievements.length ? recentAchievements.map((achievement) => (
              <div key={achievement.title} className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold">{achievement.title}</p>
                <p className="mt-1 text-sm text-slate-600">{achievement.result || achievement.problemStatement}</p>
              </div>
            )) : (
              <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                No achievements yet. Add your first story to bring this dashboard to life.
              </p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
