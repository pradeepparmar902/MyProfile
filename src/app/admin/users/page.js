import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Mail } from "lucide-react";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  const profiles = await db.profile.findMany({});
  const achievements = await db.achievement.findMany({});
  const projects = await db.project.findMany({});
  const outOfBox = await db.outOfBox.findMany({});

  const userStats = users.map((user) => {
    const profile = profiles.find((p) => p.userId === user.id);
    const userAchievements = achievements.filter((a) => a.userId === user.id).length;
    const userProjects = projects.filter((p) => p.userId === user.id).length;
    const userOutOfBox = outOfBox.filter((o) => o.userId === user.id).length;
    
    return {
      ...user,
      username: profile?.username,
      totalActivity: userAchievements + userProjects + userOutOfBox,
    };
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">Overview of all registered students and their platform activity.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold">Activity Count</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {userStats.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700 font-medium">
                      {user.totalActivity} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.username ? (
                      <Button href={`/profile/${user.username}`} variant="secondary" className="h-8 text-xs py-0">
                        View Profile <ExternalLink size={12} className="ml-1" />
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No profile yet</span>
                    )}
                  </td>
                </tr>
              ))}
              {userStats.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
