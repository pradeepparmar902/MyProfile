import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserLimits } from "@/lib/plans";
import { Card } from "@/components/ui/Card";
import { Check, Info, LayoutTemplate } from "lucide-react";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const limits = await getUserLimits(user.id);
  const allPlans = await db.plan.findMany({ orderBy: { price: "asc" } });

  const resumeCount = await db.resume.count({ where: { userId: user.id } });
  const roadmapCount = await db.roadmap.count({ where: { userId: user.id } });
  
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  const inviteCount = profile ? await db.invite.count({ where: { profileId: profile.id } }) : 0;

  const getPercent = (count, limit) => {
    if (limit >= 9999) return 0;
    return Math.min(100, Math.round((count / limit) * 100));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Subscription & Billing</h1>
        <p className="text-slate-600 mt-1">Manage your plan and track resource usage.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          <Card className="p-6 border-indigo-200 bg-indigo-50/30">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Current Plan</h2>
            <p className="text-3xl font-black text-slate-900">{limits.planName}</p>
            {limits.resumeLimit >= 9999 && (
              <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                You have unlimited access to all features.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Resource Usage</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700">Tailored Resumes</span>
                  <span className="text-slate-500">{resumeCount} / {limits.resumeLimit >= 9999 ? "Unlimited" : limits.resumeLimit}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getPercent(resumeCount, limits.resumeLimit)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700">Career Roadmaps</span>
                  <span className="text-slate-500">{roadmapCount} / {limits.roadmapLimit >= 9999 ? "Unlimited" : limits.roadmapLimit}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getPercent(roadmapCount, limits.roadmapLimit)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700">Recruiter Links</span>
                  <span className="text-slate-500">{inviteCount} / {limits.inviteLimit >= 9999 ? "Unlimited" : limits.inviteLimit}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getPercent(inviteCount, limits.inviteLimit)}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Available Plans</h2>
          <div className="grid gap-4">
            {allPlans.map(plan => (
              <Card key={plan.id} className={`p-5 transition-all ${plan.id === limits.planId ? 'border-indigo-600 ring-1 ring-indigo-600' : 'hover:border-indigo-300'}`}>
                {plan.id === limits.planId && (
                  <div className="text-xs font-bold text-indigo-600 uppercase mb-2">Current Plan</div>
                )}
                <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                <p className="text-2xl font-black text-slate-900 mt-1 mb-4">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {plan.resumeLimit >= 9999 ? "Unlimited" : plan.resumeLimit} Resumes</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {plan.roadmapLimit >= 9999 ? "Unlimited" : plan.roadmapLimit} Roadmaps</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {plan.inviteLimit >= 9999 ? "Unlimited" : plan.inviteLimit} Recruiter Links</li>
                </ul>
                
                {plan.id !== limits.planId && (
                  <a href={`mailto:admin@proofolio.com?subject=Upgrade to ${plan.name} Plan`} className="block w-full text-center py-2 px-4 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
                    Contact Admin to Upgrade
                  </a>
                )}
              </Card>
            ))}
            {allPlans.length === 0 && (
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500 text-center">
                No plans are currently configured.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
