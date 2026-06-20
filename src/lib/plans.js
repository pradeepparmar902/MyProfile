import { db } from "@/lib/db";

export const UNLIMITED = 9999;

export async function getUserLimits(userId) {
  const globalSettings = await db.setting.findFirst({}) || {};
  
  // If commercialization is disabled, return unlimited for everything
  if (!globalSettings.enableCommercialization) {
    return {
      resumeLimit: UNLIMITED,
      roadmapLimit: UNLIMITED,
      inviteLimit: UNLIMITED,
      planName: "Unlimited (Commercialization Disabled)",
    };
  }

  // If there's a launch date set in the future, return unlimited
  if (globalSettings.commercializationLaunchDate) {
    const launchDate = new Date(globalSettings.commercializationLaunchDate);
    const now = new Date();
    if (now < launchDate) {
      return {
        resumeLimit: UNLIMITED,
        roadmapLimit: UNLIMITED,
        inviteLimit: UNLIMITED,
        planName: `Unlimited (Free until ${launchDate.toLocaleDateString()})`,
      };
    }
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  let plan = null;
  if (user.planId && user.planId !== "default") {
    plan = await db.plan.findUnique({ where: { id: user.planId } });
  }

  // Fallback to default plan if user has no assigned plan or plan was deleted
  if (!plan) {
    plan = await db.plan.findFirst({ where: { isDefault: true } });
  }

  // Absolute fallback if no plans exist in DB
  if (!plan) {
    plan = {
      name: "Free",
      resumeLimit: 1,
      roadmapLimit: 1,
      inviteLimit: 0,
    };
  }

  return {
    resumeLimit: plan.resumeLimit,
    roadmapLimit: plan.roadmapLimit,
    inviteLimit: plan.inviteLimit,
    planName: plan.name,
    planId: plan.id,
  };
}
