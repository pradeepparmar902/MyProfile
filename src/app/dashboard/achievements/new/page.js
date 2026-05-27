import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { AchievementWizard } from "@/components/achievements/AchievementWizard";

export default function NewAchievementPage() {
  return (
    <>
      <DashboardTopbar title="New Achievement" />
      <div className="p-4 md:p-8">
        <AchievementWizard />
      </div>
    </>
  );
}
