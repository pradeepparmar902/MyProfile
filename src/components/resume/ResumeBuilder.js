"use client";

import { useState, useEffect } from "react";
import { Printer, LayoutTemplate, Plus, CheckCircle2, Save, ExternalLink, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const TEMPLATES = [
  { key: "classic", label: "Classic", desc: "Clean & professional" },
  { key: "modern", label: "Modern", desc: "Two-column sidebar" },
  { key: "executive", label: "Executive", desc: "Bold dark header" },
  { key: "minimal", label: "Minimal", desc: "Ultra-clean lines" },
];

export function ResumeBuilder(props) {
  const user = props.user;
  const profile = props.profile;
  const invite = props.invite;
  const resumes = props.resume ? [props.resume] : (props.resumes || []);
  
  const rawEducation = props.education?.filter(x => !x.isHidden) || [];
  const rawAchievements = props.achievements?.filter(x => !x.isHidden) || [];
  const rawProjects = props.projects?.filter(x => !x.isHidden) || [];
  const rawSkills = props.skills?.filter(x => !x.isHidden) || [];
  const rawInternships = props.internships?.filter(x => !x.isHidden) || [];
  const rawProfessions = props.professions?.filter(x => !x.isHidden) || [];
  const rawProfessionsSelf = props.professionsSelf?.filter(x => !x.isHidden) || [];

  const [activeTab, setActiveTab] = useState(props.resume ? props.resume.id : "master");
  
  // Find current resume if tailored
  const currentResume = activeTab === "master" ? null : resumes.find(r => r.id === activeTab);
  const isTailored = !!currentResume;

  const [template, setTemplate] = useState("classic");
  const [origin, setOrigin] = useState("");
  
  const [customHeadline, setCustomHeadline] = useState("");
  const [customBio, setCustomBio] = useState("");
  const [title, setTitle] = useState("");
  const [selections, setSelections] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (activeTab === "master") {
      setTemplate("classic");
      setVisibleSections({
        education: true, achievements: true, projects: true, skills: true,
        internships: true, professions: true, professionsSelf: true,
      });
    } else if (currentResume) {
      setTemplate(currentResume.template || "classic");
      setCustomHeadline(currentResume.customHeadline || props.profile?.headline || "");
      setCustomBio(currentResume.customBio || props.profile?.bio || "");
      setTitle(currentResume.title || "Untitled Resume");
      setSelections(currentResume.selections || {});
      setVisibleSections(currentResume.selections?.visibleSections || {
        education: true, achievements: true, projects: true, skills: true,
        internships: true, professions: true, professionsSelf: true,
      });
    }
  }, [activeTab, currentResume, props.profile]);

  const handleSave = async () => {
    if (!currentResume) return;
    setIsSaving(true);
    try {
      await fetch(`/api/resumes/${currentResume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, template, customHeadline, customBio, selections
        }),
      });
      // A full app might refresh router here to update `props.resumes` but we rely on local state
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save debounced
  useEffect(() => {
    if (!currentResume) return;
    // Don't auto-save immediately on mount/tab-switch if it matches DB exactly to save requests
    if (
      title === currentResume.title &&
      template === currentResume.template &&
      customHeadline === (currentResume.customHeadline || props.profile?.headline || "") &&
      customBio === (currentResume.customBio || props.profile?.bio || "") &&
      JSON.stringify(selections) === JSON.stringify(currentResume.selections || {})
    ) return;

    const timer = setTimeout(() => handleSave(), 1500);
    return () => clearTimeout(timer);
  }, [title, template, customHeadline, customBio, selections]);

  const createNewResume = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Resume", template: "classic" }),
      });
      const data = await res.json();
      window.location.reload(); // Quickest way to refresh props.resumes
    } finally {
      setIsSaving(false);
    }
  };

  const deleteResume = async (id) => {
    if (!confirm("Are you sure you want to delete this tailored resume?")) return;
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  const [visibleSections, setVisibleSections] = useState({
    education: true, achievements: true, projects: true, skills: true,
    internships: true, professions: true, professionsSelf: true,
  });

  const toggleSection = (section) => {
    setVisibleSections((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      if (isTailored) {
        setSelections(s => ({ ...s, visibleSections: next }));
      }
      return next;
    });
  };

  const toggleItemSelection = (category, id) => {
    setSelections(prev => {
      let current = prev[category];
      if (!current) {
        const fullDataMap = {
          education: rawEducation, achievements: rawAchievements, projects: rawProjects,
          skills: rawSkills, internships: rawInternships, professions: rawProfessions, professionsSelf: rawProfessionsSelf,
        };
        current = fullDataMap[category].map(x => x.id);
      }
      if (current.includes(id)) {
        return { ...prev, [category]: current.filter(x => x !== id) };
      } else {
        return { ...prev, [category]: [...current, id] };
      }
    });
  };

  const hasSelections = (category) => Array.isArray(selections[category]);

  const education = isTailored ? rawEducation.filter(x => !hasSelections("education") || selections.education.includes(x.id)) : rawEducation;
  const achievements = isTailored ? rawAchievements.filter(x => !hasSelections("achievements") || selections.achievements.includes(x.id)) : rawAchievements;
  const projects = isTailored ? rawProjects.filter(x => !hasSelections("projects") || selections.projects.includes(x.id)) : rawProjects;
  const skills = isTailored ? rawSkills.filter(x => !hasSelections("skills") || selections.skills.includes(x.id)) : rawSkills;
  const internships = isTailored ? rawInternships.filter(x => !hasSelections("internships") || selections.internships.includes(x.id)) : rawInternships;
  const professions = isTailored ? rawProfessions.filter(x => !hasSelections("professions") || selections.professions.includes(x.id)) : rawProfessions;
  const professionsSelf = isTailored ? rawProfessionsSelf.filter(x => !hasSelections("professionsSelf") || selections.professionsSelf.includes(x.id)) : rawProfessionsSelf;

  const sectionsConfig = [
    { key: "education", label: "Education", data: education, rawData: rawEducation },
    { key: "achievements", label: "Achievements", data: achievements, rawData: rawAchievements },
    { key: "projects", label: "Projects", data: projects, rawData: rawProjects },
    { key: "skills", label: "Skills", data: skills, rawData: rawSkills },
    { key: "internships", label: "Internships", data: internships, rawData: rawInternships },
    { key: "professions", label: "Profession – Job", data: professions, rawData: rawProfessions },
    { key: "professionsSelf", label: "Self Business / Training", data: professionsSelf, rawData: rawProfessionsSelf },
  ];

  const vis = isTailored ? {
    education: visibleSections.education && education.length > 0,
    achievements: visibleSections.achievements && achievements.length > 0,
    projects: visibleSections.projects && projects.length > 0,
    skills: visibleSections.skills && skills.length > 0,
    internships: visibleSections.internships && internships.length > 0,
    professions: visibleSections.professions && professions.length > 0,
    professionsSelf: visibleSections.professionsSelf && professionsSelf.length > 0,
  } : visibleSections;

  function getCategoryLabel(type) {
    const map = {
      SELF_BUSINESS: "Self Business", FREELANCE: "Freelance",
      TRAINING: "Professional Training", CONSULTING: "Consulting",
      FULL_TIME: "Full Time", PART_TIME: "Part Time",
      INTERNSHIP: "Internship", CONTRACT: "Contract", OTHER: "Other",
    };
    return map[type] || (type?.replace(/_/g, " ") ?? "");
  }

  const name = user?.name || "";
  const headline = isTailored ? customHeadline : (profile?.headline || "");
  const location = profile?.location || "";
  const email = user?.email || "";
  const bio = isTailored ? customBio : (profile?.bio || "");
  const linkedin = profile?.linkedinUrl || "";
  const portfolio = profile?.portfolioUrl || "";

  const qrUrl = origin && invite && profile?.username ? `${origin}/invite/${profile.username}/${invite.id}` : null;

  /* ─── CLASSIC ─────────────────────────────────────────────────── */
  const ClassicResume = () => (
    <div className="mx-auto w-full max-w-3xl bg-white text-slate-900 shadow-xl border border-slate-200 print:shadow-none">
      {/* Header */}
      <div className="bg-[#1e3a5f] px-10 py-8 text-white flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{name}</h1>
          <p className="mt-1 text-lg font-medium text-blue-200">{headline}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-100">
            {email && <a href={`mailto:${email}`} className="hover:underline">✉ {email}</a>}
            {location && <span>📍 {location}</span>}
            {linkedin && <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">🔗 LinkedIn</a>}
            {(qrUrl || portfolio) && <a href={qrUrl || (portfolio.startsWith('http') ? portfolio : `https://${portfolio}`)} target="_blank" rel="noreferrer" className="hover:underline">🌐 Portfolio</a>}
          </div>
        </div>
        {qrUrl && (
          <div className="bg-white p-2 rounded-lg flex flex-col items-center gap-1 shrink-0">
            <QRCodeSVG value={qrUrl} size={64} level="L" />
            <span className="text-[8px] font-bold text-slate-800 uppercase tracking-wider">Scan Portfolio</span>
          </div>
        )}
      </div>

      <div className="px-10 py-8 grid gap-6">
        {bio && (
          <Section title="Professional Summary" accent="#1e3a5f">
            <p className="text-sm leading-6 text-slate-700">{bio}</p>
          </Section>
        )}

        {vis.education && education?.length > 0 && (
          <Section title="Education" accent="#1e3a5f">
            {education.map((e) => (
              <EntryRow key={e.id}
                title={e.degree} subtitle={e.institutionName}
                meta={`${e.startYear || ""} – ${e.endYear || "Present"} · ${e.grade || ""}`}
                desc={e.description} />
            ))}
          </Section>
        )}

        {vis.internships && internships?.length > 0 && (
          <Section title="Internships" accent="#1e3a5f">
            {internships.map((i) => (
              <EntryRow key={i.id}
                title={i.designation} subtitle={i.companyName}
                meta={`${i.joiningDate || ""} – ${i.isCurrent ? "Present" : i.completionDate || ""} · ${i.location || ""}`}
                desc={i.responsibilities} extra={i.achievements} />
            ))}
          </Section>
        )}

        {vis.professions && professions?.length > 0 && (
          <Section title="Professional Experience" accent="#1e3a5f">
            {professions.map((p) => (
              <EntryRow key={p.id}
                title={p.designation} subtitle={p.companyName}
                meta={`${p.joiningDate || ""} – ${p.isCurrent ? "Present" : p.completionDate || ""} · ${getCategoryLabel(p.employmentType)} · ${p.location || ""}`}
                desc={p.responsibilities} extra={p.achievements} />
            ))}
          </Section>
        )}

        {vis.professionsSelf && professionsSelf?.length > 0 && (
          <Section title="Self Business & Training" accent="#1e3a5f">
            {professionsSelf.map((p) => (
              <EntryRow key={p.id}
                title={p.designation} subtitle={p.companyName}
                meta={`${p.joiningDate || ""} – ${p.isCurrent ? "Present" : p.completionDate || ""} · ${getCategoryLabel(p.employmentType)}`}
                desc={p.responsibilities} extra={p.achievements} />
            ))}
          </Section>
        )}

        {vis.achievements && achievements?.length > 0 && (
          <Section title="Key Achievements" accent="#1e3a5f">
            {achievements.map((a) => (
              <div key={a.id} className="mb-3 last:mb-0">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm text-slate-900">{a.title}</span>
                  <span className="ml-4 shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#1e3a5f] border border-blue-100">{a.category}</span>
                </div>
                {a.result && <p className="mt-0.5 text-xs font-medium text-emerald-700">▸ {a.result}</p>}
                {a.problemStatement && <p className="mt-0.5 text-xs leading-5 text-slate-600">{a.problemStatement}</p>}
              </div>
            ))}
          </Section>
        )}

        {vis.projects && projects?.length > 0 && (
          <Section title="Projects" accent="#1e3a5f">
            {projects.map((p) => (
              <div key={p.id} className="mb-3 last:mb-0">
                <span className="font-semibold text-sm">{p.title}</span>
                {p.description && <p className="text-xs leading-5 text-slate-600 mt-0.5">{p.description}</p>}
                {p.outcome && <p className="text-xs text-emerald-700 font-medium mt-0.5">▸ {p.outcome}</p>}
              </div>
            ))}
          </Section>
        )}

        {vis.skills && skills?.length > 0 && (
          <Section title="Skills" accent="#1e3a5f">
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {s.skillName} <span className="text-slate-400">· {s.proficiencyLevel}</span>
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );

  /* ─── MODERN (two-column) ──────────────────────────────────────── */
  const ModernResume = () => (
    <div className="mx-auto w-full max-w-3xl bg-white shadow-xl border border-slate-200 text-slate-900 print:shadow-none flex min-h-[1000px]">
      {/* Left sidebar */}
      <div className="w-[220px] shrink-0 bg-[#0f172a] text-white px-5 py-8 flex flex-col gap-6">
        <div>
          <div className="size-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 grid place-items-center text-3xl font-black mb-4">
            {name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
          </div>
          <h1 className="text-xl font-black leading-tight">{name}</h1>
          <p className="mt-1 text-xs text-indigo-300 font-medium">{headline}</p>
        </div>

        {qrUrl && (
          <div className="bg-white p-2 rounded-xl self-start flex flex-col items-center gap-1.5 shadow-sm mt-2">
            <QRCodeSVG value={qrUrl} size={80} level="L" />
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Scan Me</span>
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contact</p>
          {email && <a href={`mailto:${email}`} className="text-xs text-slate-300 mb-1 break-all hover:underline block">✉ {email}</a>}
          {location && <p className="text-xs text-slate-300 mb-1">📍 {location}</p>}
          {linkedin && <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="text-xs text-slate-300 mb-1 hover:underline block">🔗 LinkedIn</a>}
          {(qrUrl || portfolio) && <a href={qrUrl || (portfolio.startsWith('http') ? portfolio : `https://${portfolio}`)} target="_blank" rel="noreferrer" className="text-xs text-slate-300 mb-1 hover:underline block">🌐 Portfolio</a>}
        </div>

        {vis.skills && skills?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Skills</p>
            <div className="flex flex-col gap-1.5">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-xs text-slate-300 mb-0.5">
                    <span>{s.skillName}</span>
                    <span className="text-indigo-300 text-[10px]">{s.proficiencyLevel}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-slate-700">
                    <div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: s.proficiencyLevel === "ADVANCED" ? "90%" : s.proficiencyLevel === "INTERMEDIATE" ? "60%" : "35%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bio && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">About</p>
            <p className="text-xs leading-5 text-slate-300">{bio}</p>
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="flex-1 px-7 py-8 grid content-start gap-5">
        {vis.education && education?.length > 0 && (
          <ModernSection title="Education" color="#4F46E5">
            {education.map((e) => (
              <EntryRow key={e.id} title={e.degree} subtitle={e.institutionName}
                meta={`${e.startYear || ""} – ${e.endYear || "Present"} · ${e.grade || ""}`} desc={e.description} />
            ))}
          </ModernSection>
        )}

        {vis.internships && internships?.length > 0 && (
          <ModernSection title="Internships" color="#4F46E5">
            {internships.map((i) => (
              <EntryRow key={i.id} title={i.designation} subtitle={i.companyName}
                meta={`${i.joiningDate || ""} – ${i.isCurrent ? "Present" : i.completionDate || ""} · ${i.location || ""}`}
                desc={i.responsibilities} extra={i.achievements} />
            ))}
          </ModernSection>
        )}

        {vis.professions && professions?.length > 0 && (
          <ModernSection title="Professional Experience" color="#4F46E5">
            {professions.map((p) => (
              <EntryRow key={p.id} title={p.designation} subtitle={p.companyName}
                meta={`${p.joiningDate || ""} – ${p.isCurrent ? "Present" : p.completionDate || ""} · ${getCategoryLabel(p.employmentType)}`}
                desc={p.responsibilities} extra={p.achievements} />
            ))}
          </ModernSection>
        )}

        {vis.professionsSelf && professionsSelf?.length > 0 && (
          <ModernSection title="Self Business & Training" color="#4F46E5">
            {professionsSelf.map((p) => (
              <EntryRow key={p.id} title={p.designation} subtitle={p.companyName}
                meta={`${p.joiningDate || ""} – ${p.isCurrent ? "Present" : p.completionDate || ""} · ${getCategoryLabel(p.employmentType)}`}
                desc={p.responsibilities} extra={p.achievements} />
            ))}
          </ModernSection>
        )}

        {vis.achievements && achievements?.length > 0 && (
          <ModernSection title="Key Achievements" color="#4F46E5">
            {achievements.map((a) => (
              <div key={a.id} className="mb-2.5 last:mb-0">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm">{a.title}</span>
                  <span className="ml-3 shrink-0 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{a.category}</span>
                </div>
                {a.result && <p className="text-xs text-emerald-700 font-medium mt-0.5">▸ {a.result}</p>}
              </div>
            ))}
          </ModernSection>
        )}

        {vis.projects && projects?.length > 0 && (
          <ModernSection title="Projects" color="#4F46E5">
            {projects.map((p) => (
              <div key={p.id} className="mb-2.5 last:mb-0">
                <span className="font-semibold text-sm">{p.title}</span>
                {p.description && <p className="text-xs text-slate-600 mt-0.5">{p.description}</p>}
                {p.outcome && <p className="text-xs text-emerald-700 font-medium mt-0.5">▸ {p.outcome}</p>}
              </div>
            ))}
          </ModernSection>
        )}
      </div>
    </div>
  );

  /* ─── EXECUTIVE ────────────────────────────────────────────────── */
  const ExecutiveResume = () => (
    <div className="mx-auto w-full max-w-3xl bg-white text-slate-900 shadow-xl border border-slate-200 print:shadow-none">
      {/* Gold accent bar */}
      <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

      <div className="px-10 pt-8 pb-4 flex items-start justify-between border-b-2 border-slate-900">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950">{name}</h1>
          <p className="mt-2 text-base font-semibold text-amber-600 uppercase tracking-widest">{headline}</p>
        </div>
        <div className="flex items-start gap-4">
          <div className="text-right text-xs text-slate-600 mt-1 grid gap-0.5">
            {email && <a href={`mailto:${email}`} className="hover:underline">{email}</a>}
            {location && <span>{location}</span>}
            {linkedin && <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
            {(qrUrl || portfolio) && <a href={qrUrl || (portfolio.startsWith('http') ? portfolio : `https://${portfolio}`)} target="_blank" rel="noreferrer" className="hover:underline">Portfolio</a>}
          </div>
          {qrUrl && (
            <div className="flex flex-col items-center gap-1">
              <QRCodeSVG value={qrUrl} size={64} level="L" />
              <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">Scan Resume</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-10 py-7 grid gap-6">
        {bio && (
          <ExecSection title="Executive Summary">
            <p className="text-sm leading-7 text-slate-700 italic border-l-4 border-amber-400 pl-4">{bio}</p>
          </ExecSection>
        )}

        {vis.education && education?.length > 0 && (
          <ExecSection title="Education">
            {education.map((e) => (
              <div key={e.id} className="flex justify-between mb-3 last:mb-0">
                <div>
                  <p className="font-bold text-sm text-slate-900">{e.degree}</p>
                  <p className="text-xs text-slate-600">{e.institutionName} · {e.grade}</p>
                  {e.description && <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>}
                </div>
                <p className="text-xs font-bold text-amber-600 shrink-0 ml-4">{e.startYear} – {e.endYear || "Present"}</p>
              </div>
            ))}
          </ExecSection>
        )}

        {vis.internships && internships?.length > 0 && (
          <ExecSection title="Internships">
            {internships.map((i) => (
              <ExecEntry key={i.id} title={i.designation} org={i.companyName}
                period={`${i.joiningDate || ""} – ${i.isCurrent ? "Present" : i.completionDate || ""}`}
                location={i.location} desc={i.responsibilities} extra={i.achievements} />
            ))}
          </ExecSection>
        )}

        {vis.professions && professions?.length > 0 && (
          <ExecSection title="Career History">
            {professions.map((p) => (
              <ExecEntry key={p.id} title={p.designation} org={p.companyName}
                period={`${p.joiningDate || ""} – ${p.isCurrent ? "Present" : p.completionDate || ""}`}
                location={p.location} type={getCategoryLabel(p.employmentType)}
                desc={p.responsibilities} extra={p.achievements} />
            ))}
          </ExecSection>
        )}

        {vis.professionsSelf && professionsSelf?.length > 0 && (
          <ExecSection title="Entrepreneurship & Training">
            {professionsSelf.map((p) => (
              <ExecEntry key={p.id} title={p.designation} org={p.companyName}
                period={`${p.joiningDate || ""} – ${p.isCurrent ? "Present" : p.completionDate || ""}`}
                location={p.location} type={getCategoryLabel(p.employmentType)}
                desc={p.responsibilities} extra={p.achievements} />
            ))}
          </ExecSection>
        )}

        {vis.achievements && achievements?.length > 0 && (
          <ExecSection title="Notable Achievements">
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div key={a.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">{a.category}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{a.title}</p>
                  {a.result && <p className="mt-1 text-xs text-emerald-700 font-medium">▸ {a.result}</p>}
                </div>
              ))}
            </div>
          </ExecSection>
        )}

        {vis.projects && projects?.length > 0 && (
          <ExecSection title="Projects">
            {projects.map((p) => (
              <div key={p.id} className="mb-3 last:mb-0 pl-4 border-l-2 border-amber-400">
                <p className="font-bold text-sm">{p.title}</p>
                {p.description && <p className="text-xs text-slate-600 mt-0.5">{p.description}</p>}
                {p.outcome && <p className="text-xs text-emerald-700 font-medium mt-0.5">▸ {p.outcome}</p>}
              </div>
            ))}
          </ExecSection>
        )}

        {vis.skills && skills?.length > 0 && (
          <ExecSection title="Core Competencies">
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.id} className="rounded-md bg-slate-900 text-white px-3 py-1 text-xs font-bold tracking-wide">
                  {s.skillName}
                </span>
              ))}
            </div>
          </ExecSection>
        )}
      </div>
      <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
    </div>
  );

  /* ─── MINIMAL ──────────────────────────────────────────────────── */
  const MinimalResume = () => (
    <div className="mx-auto w-full max-w-2xl bg-white text-slate-900 shadow-xl border border-slate-100 print:shadow-none px-12 py-10">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">{name}</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">{headline}</p>
          <div className="mt-2 h-px w-full bg-slate-200" />
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
            {email && <a href={`mailto:${email}`} className="hover:underline">{email}</a>}
            {location && <span>{location}</span>}
            {linkedin && <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
            {(qrUrl || portfolio) && <a href={qrUrl || (portfolio.startsWith('http') ? portfolio : `https://${portfolio}`)} target="_blank" rel="noreferrer" className="hover:underline">Portfolio</a>}
          </div>
        </div>
        {qrUrl && (
          <div className="flex flex-col items-center gap-1 shrink-0 ml-6">
            <QRCodeSVG value={qrUrl} size={56} level="L" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Scan Me</span>
          </div>
        )}
      </div>

      {bio && (
        <MinSection title="Summary">
          <p className="text-sm leading-6 text-slate-600">{bio}</p>
        </MinSection>
      )}

      {vis.education && education?.length > 0 && (
        <MinSection title="Education">
          {education.map((e) => (
            <div key={e.id} className="flex justify-between mb-2 last:mb-0">
              <div>
                <p className="text-sm font-semibold text-slate-900">{e.degree}, {e.institutionName}</p>
                {e.grade && <p className="text-xs text-slate-500">{e.grade}</p>}
              </div>
              <p className="text-xs text-slate-400 shrink-0 ml-4">{e.startYear} – {e.endYear || "Now"}</p>
            </div>
          ))}
        </MinSection>
      )}

      {vis.internships && internships?.length > 0 && (
        <MinSection title="Internships">
          {internships.map((i) => (
            <div key={i.id} className="flex justify-between mb-2 last:mb-0">
              <div>
                <p className="text-sm font-semibold text-slate-900">{i.designation} — {i.companyName}</p>
                {i.responsibilities && <p className="text-xs text-slate-500 mt-0.5">{i.responsibilities}</p>}
              </div>
              <p className="text-xs text-slate-400 shrink-0 ml-4">{i.joiningDate || ""} – {i.isCurrent ? "Now" : i.completionDate || ""}</p>
            </div>
          ))}
        </MinSection>
      )}

      {vis.professions && professions?.length > 0 && (
        <MinSection title="Experience">
          {professions.map((p) => (
            <div key={p.id} className="flex justify-between mb-2 last:mb-0">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.designation} — {p.companyName}</p>
                {p.responsibilities && <p className="text-xs text-slate-500 mt-0.5">{p.responsibilities}</p>}
              </div>
              <p className="text-xs text-slate-400 shrink-0 ml-4">{p.joiningDate || ""} – {p.isCurrent ? "Now" : p.completionDate || ""}</p>
            </div>
          ))}
        </MinSection>
      )}

      {vis.professionsSelf && professionsSelf?.length > 0 && (
        <MinSection title="Business & Training">
          {professionsSelf.map((p) => (
            <div key={p.id} className="flex justify-between mb-2 last:mb-0">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.designation} — {p.companyName}</p>
                <p className="text-xs text-slate-500">{getCategoryLabel(p.employmentType)}</p>
                {p.responsibilities && <p className="text-xs text-slate-500 mt-0.5">{p.responsibilities}</p>}
              </div>
              <p className="text-xs text-slate-400 shrink-0 ml-4">{p.joiningDate || ""} – {p.isCurrent ? "Now" : p.completionDate || ""}</p>
            </div>
          ))}
        </MinSection>
      )}

      {vis.achievements && achievements?.length > 0 && (
        <MinSection title="Achievements">
          {achievements.map((a) => (
            <div key={a.id} className="mb-2 last:mb-0">
              <p className="text-sm font-semibold text-slate-900">{a.title}</p>
              {a.result && <p className="text-xs text-slate-500">▸ {a.result}</p>}
            </div>
          ))}
        </MinSection>
      )}

      {vis.projects && projects?.length > 0 && (
        <MinSection title="Projects">
          {projects.map((p) => (
            <div key={p.id} className="mb-2 last:mb-0">
              <p className="text-sm font-semibold text-slate-900">{p.title}</p>
              {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
            </div>
          ))}
        </MinSection>
      )}

      {vis.skills && skills?.length > 0 && (
        <MinSection title="Skills">
          <p className="text-sm text-slate-600">{skills.map(s => s.skillName).join(" · ")}</p>
        </MinSection>
      )}
    </div>
  );

  const resumeMap = {
    classic: ClassicResume(),
    modern: ModernResume(),
    executive: ExecutiveResume(),
    minimal: MinimalResume(),
  };

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    document.title = `${name.replace(/\s+/g, "_")}_Resume`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className={`gap-6 p-4 md:p-8 ${props.readOnly ? 'flex justify-center' : 'grid lg:grid-cols-[310px_1fr]'}`}>
      {/* Tabs */}
      {!props.readOnly && (
        <>
      <div className="lg:col-span-2 flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("master")}
          className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-t-lg transition ${activeTab === "master" ? "bg-white text-indigo-700 border border-b-white border-slate-200 shadow-[0_4px_0_0_white]" : "text-slate-600 hover:bg-slate-100"}`}
        >
          Master Resume
        </button>
        {resumes.map(r => (
          <button 
            key={r.id}
            onClick={() => setActiveTab(r.id)}
            className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-t-lg transition ${activeTab === r.id ? "bg-white text-indigo-700 border border-b-white border-slate-200 shadow-[0_4px_0_0_white]" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {activeTab === r.id ? (title || "Untitled") : (r.title || "Untitled")}
          </button>
        ))}
        <button 
          onClick={createNewResume}
          className="shrink-0 flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
        >
          <Plus size={16}/> New Tailored Resume
        </button>
      </div>

      {/* Controls */}
      <Card className="no-print h-fit p-5 grid gap-5 border-t-0 rounded-tl-none">
        {/* Template picker */}
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <LayoutTemplate size={15} /> Choose Template
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button key={t.key} onClick={() => setTemplate(t.key)}
                className={`rounded-xl border-2 p-3 text-left transition ${template === t.key ? "border-[#4F46E5] bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                <p className="text-sm font-bold text-slate-900">{t.label}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {isTailored && (
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Tailored Settings</span>
              <div className="flex items-center gap-3">
                <a href={`/resume/${currentResume.id}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold flex items-center gap-1"><ExternalLink size={12}/> Link</a>
                {isSaving ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 animate-pulse"><Save size={12}/> Saving...</span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><CheckCircle2 size={12}/> Saved</span>
                )}
                <button onClick={() => deleteResume(currentResume.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={14}/></button>
              </div>
            </div>
            
            <label className="block mb-2">
              <span className="text-xs font-semibold text-slate-700 mb-1 block">Document Title</span>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm p-2 rounded border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
            </label>
            <label className="block mb-2">
              <span className="text-xs font-semibold text-slate-700 mb-1 block">Tailored Headline</span>
              <input type="text" value={customHeadline} onChange={e => setCustomHeadline(e.target.value)} className="w-full text-sm p-2 rounded border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" placeholder="e.g. Senior Marketing Director" />
            </label>
            <label className="block mb-4">
              <span className="text-xs font-semibold text-slate-700 mb-1 block">Tailored Summary</span>
              <textarea value={customBio} onChange={e => setCustomBio(e.target.value)} rows={4} className="w-full text-sm p-2 rounded border border-slate-200 bg-white resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" placeholder="Professional summary focused on this specific role..." />
            </label>

            <div>
              <p className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Select Specific Content</span>
              </p>
              <div className="grid gap-2">
                {sectionsConfig.map((sec) => {
                  if (sec.rawData.length === 0) return null;
                  const isExpanded = expandedSection === sec.key;
                  
                  return (
                    <div key={sec.key} className="border border-slate-200 rounded-lg overflow-hidden transition-all bg-white">
                      <button 
                        onClick={() => setExpandedSection(isExpanded ? null : sec.key)}
                        className={`w-full flex items-center justify-between p-3 text-left transition ${isExpanded ? "bg-slate-50 border-b border-slate-200" : "hover:bg-slate-50"}`}
                      >
                        <span className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{sec.label}</span>
                          <span className="text-xs font-medium text-indigo-600">{sec.data.length} of {sec.rawData.length} included</span>
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-2 bg-slate-50 max-h-[250px] overflow-y-auto">
                          <div className="flex flex-col gap-1">
                            {sec.rawData.map(item => {
                              const isSelected = !hasSelections(sec.key) || selections[sec.key].includes(item.id);
                              return (
                                <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer transition border border-transparent hover:border-slate-200">
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={() => toggleItemSelection(sec.key, item.id)}
                                    className="mt-1 size-4 accent-indigo-600 rounded" 
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{item.title || item.degree || item.designation || item.skillName}</span>
                                    <span className="text-[10px] text-slate-500 line-clamp-1">{item.companyName || item.institutionName || item.category || ""}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-bold text-slate-900 mb-3">Sections</p>
          <div className="grid gap-2">
            {sectionsConfig.map((sec) => (
              <label key={sec.key}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50 transition">
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">{sec.label}</span>
                  <span className="text-xs text-slate-400">{sec.data?.length || 0} record{sec.data?.length === 1 ? "" : "s"}</span>
                </span>
                <input type="checkbox" checked={visibleSections[sec.key]}
                  onChange={() => toggleSection(sec.key)}
                  className="size-4 accent-[#4F46E5] rounded" />
              </label>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleDownloadPdf}>
          <Printer size={15} /> Print / Save as PDF
        </Button>
      </Card>
      </>
      )}

      {/* Resume preview */}
      <div id="resume-preview" className="print-page overflow-hidden rounded-xl">
        {resumeMap[template]}
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─────────────────────────────────────── */

function Section({ title, accent, children }) {
  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1 border-b-2"
        style={{ color: accent, borderColor: accent }}>{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ModernSection({ title, color, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-1 rounded-full" style={{ background: color }} />
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ExecSection({ title, children }) {
  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 border-b border-slate-200 pb-1 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function MinSection({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

function EntryRow({ title, subtitle, meta, desc, extra }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-start justify-between">
        <span className="font-bold text-sm text-slate-900">{title}</span>
        <span className="ml-4 shrink-0 text-xs text-slate-400">{meta}</span>
      </div>
      <p className="text-xs font-semibold text-[#4F46E5] mt-0.5">{subtitle}</p>
      {desc && <p className="mt-1 text-xs leading-5 text-slate-600">{desc}</p>}
      {extra && <p className="mt-0.5 text-xs text-emerald-700 font-medium">▸ {extra}</p>}
    </div>
  );
}

function ExecEntry({ title, org, period, location, type, desc, extra }) {
  return (
    <div className="mb-4 last:mb-0 pl-4 border-l-4 border-amber-400">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-black text-sm text-slate-900">{title}</p>
          <p className="text-xs font-semibold text-slate-600">
            {org}{location ? ` · ${location}` : ""}{type ? ` · ${type}` : ""}
          </p>
        </div>
        <p className="text-xs font-bold text-amber-600 shrink-0 ml-4">{period}</p>
      </div>
      {desc && <p className="mt-1.5 text-xs leading-5 text-slate-600">{desc}</p>}
      {extra && <p className="mt-1 text-xs text-emerald-700 font-medium">▸ {extra}</p>}
    </div>
  );
}
