import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlansManager } from "@/components/admin/PlansManager";

export default async function AdminPlansPage() {
  await requireAdmin();
  const plans = await db.plan.findMany({ orderBy: { price: "asc" } });
  const globalSettings = await db.setting.findFirst({}) || {};
  const currency = globalSettings.currency || "USD";

  // Ensure default plans exist if none
  if (plans.length === 0) {
    const freePlan = await db.plan.create({
      data: { name: "Free", price: 0, resumeLimit: 1, roadmapLimit: 1, inviteLimit: 0, isDefault: true }
    });
    const proPlan = await db.plan.create({
      data: { name: "Pro", price: 99, resumeLimit: 3, roadmapLimit: 3, inviteLimit: 5, isDefault: false }
    });
    const premiumPlan = await db.plan.create({
      data: { name: "Premium", price: 199, resumeLimit: 9999, roadmapLimit: 9999, inviteLimit: 9999, isDefault: false }
    });
    plans.push(freePlan, proPlan, premiumPlan);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
        <p className="text-slate-600 mt-1">Manage pricing tiers and limits for commercialization.</p>
      </div>
      <PlansManager initialPlans={plans} currency={currency} />
    </div>
  );
}
