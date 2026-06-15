import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsManager } from "@/components/admin/SettingsManager";

export default async function AdminSettingsPage() {
  await requireAdmin();

  // Fetch global settings
  const settings = await db.setting.findFirst({});

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Global Settings</h1>
        <p className="text-slate-600 mt-1">Control platform-wide visibility and redesign defaults.</p>
      </div>

      <SettingsManager initialSettings={settings || {}} />
    </div>
  );
}
