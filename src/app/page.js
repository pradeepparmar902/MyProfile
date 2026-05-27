import Link from "next/link";
import { ArrowRight, Award, BookOpen, BriefcaseBusiness, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DemoProfile } from "@/components/landing/DemoProfile";

const features = [
  { title: "Story-Based Achievements", text: "Capture the problem, thinking, execution, result, and learning behind every win.", icon: Award },
  { title: "Proof-Backed Skills", text: "Connect skills to real projects, certificates, links, and outcomes.", icon: ShieldCheck },
  { title: "Public Career Profile", text: "Share a clean recruiter-friendly page instead of a shallow resume attachment.", icon: BriefcaseBusiness },
  { title: "Resume Builder", text: "Turn profile data into a neat printable resume for internships and placements.", icon: FileText },
  { title: "Student Portfolio", text: "Bring education, projects, hobbies, and personality into one structured profile.", icon: BookOpen },
  { title: "Career Identity", text: "Build a long-term professional identity that grows with the student.", icon: Sparkles },
];

export default function Home() {
  return (
    <main className="bg-[#F9FAFB] text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white">
            <Sparkles size={20} />
          </span>
          <span className="text-lg font-bold">Proofolio</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button href="/login" variant="ghost">Login</Button>
          <Button href="/register">Create Profile</Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-[#4F46E5]">
            Career identity for students
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
            Your Work. Your Story. Your Career Identity.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Create a proof-based profile that helps recruiters understand your achievements, skills, thinking, and potential beyond a traditional resume.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/register">Build Your Career Identity <ArrowRight size={16} /></Button>
            <Button href="/profile/demo-student" variant="secondary">View Demo Profile</Button>
          </div>
        </div>
        <DemoProfile />
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-bold">Everything a student needs to show real potential</h2>
          <p className="mt-3 leading-7 text-slate-600">The MVP focuses on profile, achievements, projects, skills, and a shareable public page.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-5">
                <Icon className="text-[#4F46E5]" size={24} />
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-12">
        <Card className="grid gap-6 p-6 md:grid-cols-5">
          {["Create profile", "Add stories", "Attach proof", "Share link", "Print resume"].map((step, index) => (
            <div key={step}>
              <span className="grid size-9 place-items-center rounded-lg bg-cyan-50 text-sm font-bold text-[#0891B2]">{index + 1}</span>
              <p className="mt-3 font-bold">{step}</p>
            </div>
          ))}
        </Card>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {["Free", "Premium", "College"].map((plan) => (
            <Card key={plan} className="p-6">
              <h3 className="text-xl font-bold">{plan}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {plan === "Free" ? "Basic profile, achievements, and public link." : plan === "Premium" ? "Unlimited stories, analytics, and premium resume tools." : "Bulk onboarding and placement visibility for institutions."}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
