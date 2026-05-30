import Link from "next/link";
import { Download, Link2, Mail, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AchievementStoryCard } from "@/components/profile/AchievementStoryCard";
import { achievements, education, profile, projects, skills } from "@/lib/data";

export default function PublicProfilePage() {
  return (
    <main className="bg-[#F9FAFB] text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white"><Sparkles size={20} /></span>
          <span className="font-bold">Portfolio</span>
        </Link>
        <Button href="/dashboard/resume" variant="secondary"><Download size={16} /> Resume</Button>
      </header>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <Card className="p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex gap-5">
              <div className="grid size-20 shrink-0 place-items-center rounded-lg bg-[#4F46E5] text-2xl font-bold text-white">AM</div>
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="mt-2 max-w-2xl leading-7 text-slate-600">{profile.headline}</p>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500"><MapPin size={16} /> {profile.location}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary"><Link2 size={16} /> LinkedIn</Button>
              <Button variant="secondary"><Link2 size={16} /> GitHub</Button>
              <Button><Mail size={16} /> Contact</Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold">About</h2>
              <p className="mt-3 leading-7 text-slate-600">{profile.bio}</p>
              <p className="mt-3 leading-7 text-slate-600"><span className="font-semibold text-slate-900">Career goal:</span> {profile.careerGoal}</p>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-bold">Education</h2>
              <div className="mt-4 grid gap-4">
                {education.map((item) => (
                  <div key={item.institutionName} className="border-l-2 border-[#4F46E5] pl-4">
                    <p className="font-bold">{item.institutionName}</p>
                    <p className="text-sm text-slate-600">{item.degree} · {item.startYear} - {item.endYear}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </Card>
            <section>
              <h2 className="mb-4 text-xl font-bold">Achievement Stories</h2>
              <div className="grid gap-4">{achievements.map((achievement) => <AchievementStoryCard key={achievement.title} achievement={achievement} />)}</div>
            </section>
            <Card className="p-6">
              <h2 className="text-xl font-bold">Projects</h2>
              <div className="mt-4 grid gap-4">
                {projects.map((project) => (
                  <div key={project.title} className="rounded-lg border border-slate-200 p-4">
                    <h3 className="font-bold">{project.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">{project.tools.map((tool) => <Badge key={tool}>{tool}</Badge>)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <aside className="grid h-fit gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold">Skills With Proof</h2>
              <div className="mt-4 grid gap-3">
                {skills.map((skill) => (
                  <div key={skill.name} className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold">{skill.name}</p>
                    <p className="text-sm text-slate-600">{skill.level} · {skill.proof}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-bold">Personality</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Volunteering", "Brand ideas", "Public speaking", "Student events"].map((item) => <Badge key={item}>{item}</Badge>)}
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
