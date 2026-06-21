"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, Save, Eye, EyeOff, LayoutTemplate } from "lucide-react";

export function SettingsManager({ initialSettings }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    theme: initialSettings?.theme || "modern",
    enableCommercialization: initialSettings?.enableCommercialization ?? false,
    commercializationLaunchDate: initialSettings?.commercializationLaunchDate || "",
    currency: initialSettings?.currency || "USD",
    adSensePublisherId: initialSettings?.adSensePublisherId || "",
    showEducation: initialSettings?.showEducation ?? true,
    showAchievements: initialSettings?.showAchievements ?? true,
    showProjects: initialSettings?.showProjects ?? true,
    showSkills: initialSettings?.showSkills ?? true,
    showInternship: initialSettings?.showInternship ?? true,
    showProfession: initialSettings?.showProfession ?? true,
    showProfessionSelf: initialSettings?.showProfessionSelf ?? true,
    showHobbies: initialSettings?.showHobbies ?? true,
    showRoadmaps: initialSettings?.showRoadmaps ?? true,
    showSports: initialSettings?.showSports ?? true,
    showActivities: initialSettings?.showActivities ?? true,
    showOutOfBox: initialSettings?.showOutOfBox ?? true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
        router.refresh();
      } else {
        alert("Failed to save settings.");
      }
    } catch (e) {
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleRow = ({ label, description, settingKey }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => handleToggle(settingKey)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          settings[settingKey] ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings[settingKey] ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid size-10 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
            <LayoutTemplate size={20} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Platform Redesign</h2>
            <p className="text-sm text-slate-500">Choose the default visual theme for all public profiles.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {["modern", "classic", "minimal"].map((theme) => (
            <button
              key={theme}
              onClick={() => setSettings(prev => ({ ...prev, theme }))}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                settings.theme === theme 
                  ? "border-indigo-600 bg-indigo-50/50" 
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold capitalize text-slate-900">{theme} Theme</span>
                {settings.theme === theme && <Check size={16} className="text-indigo-600" />}
              </div>
              <div className="h-20 rounded-md bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className={`h-4 w-full ${theme === 'modern' ? 'bg-indigo-600' : theme === 'classic' ? 'bg-slate-800' : 'bg-white border-b'}`}></div>
                <div className="flex-1 p-2 flex flex-col gap-1">
                  <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                  <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="grid size-10 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
            {Object.values(settings).some(v => v === false) ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Global Content Visibility</h2>
            <p className="text-sm text-slate-500">Hide or unhide specific profile sections and menu buttons for the entire platform.</p>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-x-8 gap-y-0">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 mb-2 mt-4">Core Sections</h3>
            <ToggleRow label="Education" description="Academic history" settingKey="showEducation" />
            <ToggleRow label="Achievements" description="STAR method stories" settingKey="showAchievements" />
            <ToggleRow label="Projects" description="Side-projects" settingKey="showProjects" />
            <ToggleRow label="Skills" description="Proof-backed skills" settingKey="showSkills" />
            <ToggleRow label="Internships" description="Official internships" settingKey="showInternship" />
            <ToggleRow label="Profession (Job)" description="Employment history" settingKey="showProfession" />
            <ToggleRow label="Profession (Self)" description="Business/Training" settingKey="showProfessionSelf" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 mb-2 mt-4">Extra Sections</h3>
            <ToggleRow label="Hobbies & Personality" description="Personal interests" settingKey="showHobbies" />
            <ToggleRow label="Career Roadmaps" description="Future goals" settingKey="showRoadmaps" />
            <ToggleRow label="Sports Activities" description="Athletic involvement" settingKey="showSports" />
            <ToggleRow label="Other Activities" description="Clubs & volunteering" settingKey="showActivities" />
            <ToggleRow label="Out of Box Thinking" description="Creative problem solving" settingKey="showOutOfBox" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
            <Check size={20} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Commercialization & Billing</h2>
            <p className="text-sm text-slate-500">Enable subscription plans and limits for resumes, roadmaps, and recruiters.</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <ToggleRow label="Enable Commercialization" description="If disabled, all users have unlimited access to everything." settingKey="enableCommercialization" />
          
          {settings.enableCommercialization && (
            <div className="py-3 border-t border-slate-100">
              <label className="block">
                <span className="font-semibold text-slate-900 block">Launch Date (Optional)</span>
                <span className="text-sm text-slate-500 block mb-2">If set, limits will only enforce AFTER this date. Until then, everyone gets unlimited access.</span>
                <input 
                  type="date" 
                  value={settings.commercializationLaunchDate}
                  onChange={(e) => setSettings({...settings, commercializationLaunchDate: e.target.value})}
                  className="p-2 border border-slate-300 rounded-md shadow-sm w-full max-w-xs"
                />
              </label>
            <label className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 block">Currency</span>
                <span className="text-sm text-slate-500">Choose between USD ($) and INR (₹) for subscription plans.</span>
              </div>
              <select
                className="p-2 border border-slate-300 rounded-md bg-white text-sm font-semibold"
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </label>
          </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="grid size-10 place-items-center rounded-lg bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Google AdSense (Monetization)</h2>
            <p className="text-sm text-slate-500">Earn revenue by displaying ads on your platform and student profiles.</p>
          </div>
        </div>
        <div className="mt-6 py-3 border-t border-slate-100">
          <label className="block">
            <span className="font-semibold text-slate-900 block">Publisher ID</span>
            <span className="text-sm text-slate-500 block mb-2">Enter your Google AdSense ID (e.g. <code>ca-pub-1234567890123456</code>). Leave blank to disable ads.</span>
            <input 
              type="text" 
              value={settings.adSensePublisherId}
              onChange={(e) => setSettings({...settings, adSensePublisherId: e.target.value})}
              placeholder="ca-pub-..."
              className="p-2 border border-slate-300 rounded-md shadow-sm w-full max-w-sm"
            />
          </label>
        </div>
      </Card>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save All Settings"}
          <Save size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
