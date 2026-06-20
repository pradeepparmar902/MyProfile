import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { BookOpen, CheckCircle, FileText, Share2, Target, Zap } from "lucide-react";

export default function UserManualPage() {
  return (
    <>
      <DashboardTopbar title="User Manual" description="Learn how to use Portfolio to build your proof-backed professional story." />
      <div className="max-w-4xl p-4 md:p-8 space-y-8">
        
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <Zap className="text-indigo-600" /> Introduction to Portfolio
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Welcome to Portfolio! This platform is designed to help you move beyond traditional resumes by building a <strong>proof-backed portfolio</strong>. 
            Instead of just claiming you have a skill, Portfolio allows you to attach real evidence (links, certificates, project outcomes) to everything you do.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <CheckCircle className="text-emerald-600" /> 1. Building Your Data Foundation
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The left sidebar contains various categories like <strong>Education, Achievements, Projects, Skills, and Internships</strong>. 
            Think of these as your master database. Add every professional and academic milestone here.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Achievements:</strong> Use the STAR method (Situation, Task, Action, Result) to document your successes.</li>
            <li><strong>Skills:</strong> Link direct proof for your skills (e.g., a GitHub repo, a certification link).</li>
            <li><strong>Out of Box & Hobbies:</strong> Show your personality and creative thinking. Employers hire humans, not just robots!</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Target className="text-blue-600" /> 2. My Roadmap (Career Vision)
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Use the <strong>My Roadmap</strong> section to visually map out your career goals. 
            This is an interactive mindmap where you can plot out your short-term and long-term milestones. 
            You can add nodes for specific job titles you want to achieve or skills you plan to learn next.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <FileText className="text-orange-600" /> 3. The Resume Builder
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Once your data is populated, head over to the <strong>Resume</strong> tab. Here you can generate targeted documents for specific jobs.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Master Resume:</strong> A clean view of your entire portfolio. You can quickly toggle sections on or off to print a custom PDF.</li>
            <li><strong>Tailored Resumes:</strong> Click "+ New Tailored Resume" to create a saved preset. You can select exactly which items (e.g., which specific projects or skills) should appear on this version. You can also write a custom headline and summary just for this role.</li>
            <li><strong>Printing:</strong> Hit the "Print / Save as PDF" button at the bottom to download a beautiful, ATS-friendly document.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Share2 className="text-purple-600" /> 4. Sharing with Recruiters
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Go to the <strong>Settings</strong> page to generate secure, read-only Invite Links for your portfolio.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>General Links:</strong> Anyone with the link can view your portfolio.</li>
            <li><strong>Specific Links:</strong> Locked down to a specific recruiter's email address for enhanced privacy.</li>
            <li><strong>Associated Resumes:</strong> When creating a link, you can associate it with a specific Tailored Resume. When the recruiter opens the link, they will see a beautiful web version of your portfolio, specifically filtered to only show the items you selected for that role!</li>
          </ul>
        </section>

      </div>
    </>
  );
}
