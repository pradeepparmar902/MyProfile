import Link from "next/link";
import { ArrowRight, Award, BookOpen, BriefcaseBusiness, FileText, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    <main className="relative min-h-screen bg-slate-50 text-slate-950 overflow-hidden selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-[120px] animate-pulse-slow mix-blend-multiply" />
      <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-400/20 blur-[120px] animate-pulse-slow mix-blend-multiply" style={{ animationDelay: "2s" }} />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
        <Link href="/" className="flex items-center gap-3 group">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <Sparkles size={20} className="fill-white/20" />
          </span>
          <span className="text-xl font-bold tracking-tight">Proofolio</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#how" className="hover:text-indigo-600 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <Button href="/login" variant="ghost" className="font-semibold">Login</Button>
          <Button href="/register" className="shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40">Create Profile</Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-16 px-6 pt-20 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center xl:pt-28">
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="fill-indigo-600/20" />
            <span>The New Standard for Student Careers</span>
          </div>
          <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl leading-[1.1]">
            Your Work.<br/>
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">Your Story.</span><br/>
            Your Identity.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
            Create a proof-based profile that helps recruiters understand your achievements, skills, thinking, and potential far beyond a traditional resume.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/register" className="h-12 px-8 text-base shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-1 hover:shadow-indigo-500/40">
              Build Your Career Identity <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button href="/profile/demo-student" variant="secondary" className="h-12 px-8 text-base border-slate-200 bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
              View Demo Profile
            </Button>
          </div>
          
          <div className="mt-12 flex items-center gap-6 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Free to start</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Auto-resume generation</div>
          </div>
        </div>
        
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-indigo-500 to-cyan-400 blur-2xl opacity-20 animate-pulse-slow" />
          <div className="relative animate-float">
            <DemoProfile />
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 max-w-3xl text-center mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Everything you need to <span className="text-indigo-600">stand out</span></h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">Move past generic PDF resumes. Build a comprehensive portfolio that captures your true potential and provides proof for every skill.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            // Create a bento box layout by making some cards span differently
            const isLarge = i === 0 || i === 3;
            return (
              <div key={feature.title} className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 ${isLarge ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                  <Icon size={28} />
                </div>
                <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how" className="relative z-10 bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">How it works</h2>
            <p className="mt-4 text-lg text-slate-400">Five simple steps to launch your professional identity.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-5 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-slate-800 -translate-y-1/2" />
            
            {["Create profile", "Add stories", "Attach proof", "Share link", "Print resume"].map((step, index) => (
              <div key={step} className="relative z-10 flex flex-col items-center text-center">
                <span className="grid size-16 place-items-center rounded-2xl bg-slate-900 border border-slate-800 text-xl font-bold text-indigo-400 shadow-xl shadow-indigo-500/10 transition-transform hover:scale-110">
                  {index + 1}
                </span>
                <p className="mt-6 text-lg font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-24 pb-32">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-slate-600">Start for free, upgrade when you need more power.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto items-center">
          {[{name: "Free", price: "$0", desc: "Basic profile, achievements, and public link.", features: ["1 Public Profile", "Up to 5 Stories", "Basic Resume Builder"]}, 
            {name: "Premium", price: "$4", desc: "Unlimited stories, analytics, and premium resume tools.", features: ["Unlimited Stories", "Custom Domains", "Profile Analytics", "Premium Templates"], popular: true}, 
            {name: "College", price: "Custom", desc: "Bulk onboarding and placement visibility for institutions.", features: ["Bulk Onboarding", "Admin Dashboard", "Recruiter Access"]}].map((plan) => (
            <div key={plan.name} className={`relative rounded-3xl bg-white p-8 shadow-sm transition-all ${plan.popular ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 scale-105 z-10' : 'border border-slate-200 hover:shadow-lg'}`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-1 text-sm font-bold text-white shadow-md">Most Popular</div>}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-500">/mo</span>}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{plan.desc}</p>
              
              <ul className="mt-8 space-y-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 size={18} className="text-indigo-500" /> {f}
                  </li>
                ))}
              </ul>
              
              <Button className={`mt-8 w-full ${plan.popular ? 'shadow-lg shadow-indigo-500/25' : 'bg-slate-900'}`} variant={plan.popular ? 'default' : 'secondary'}>
                {plan.price === "Custom" ? "Contact Us" : "Get Started"}
              </Button>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Proofolio. All rights reserved.</p>
      </footer>
    </main>
  );
}
