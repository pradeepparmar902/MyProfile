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
    showHobbies: initialSettings?.showHobbies ?? true,
    showWishes: initialSettings?.showWishes ?? true,
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
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => handleToggle(settingKey)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
            {settings.showHobbies ? <Eye size={20} /> : <EyeOff size={20} />}
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Global Content Visibility</h2>
            <p className="text-sm text-slate-500">Hide or unhide specific profile sections for the entire platform.</p>
          </div>
        </div>

        <div className="mt-6">
          <ToggleRow 
            label="Hobbies & Personality" 
            description="Allow students to display their hobbies on their public profile."
            settingKey="showHobbies" 
          />
          <ToggleRow 
            label="Career Wishes" 
            description="Allow students to display their future career goals."
            settingKey="showWishes" 
          />
          <ToggleRow 
            label="Sports Activities" 
            description="Allow students to display sports achievements."
            settingKey="showSports" 
          />
          <ToggleRow 
            label="Other Activities" 
            description="Allow students to display extracurricular clubs and volunteering."
            settingKey="showActivities" 
          />
          <ToggleRow 
            label="Out of Box Thinking" 
            description="Allow students to display innovative problem-solving stories."
            settingKey="showOutOfBox" 
          />
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
