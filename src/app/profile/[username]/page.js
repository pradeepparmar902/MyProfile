import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Link2, Mail, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/db";

export default async function PublicProfilePage({ params }) {
  const { username } = await params;
  const profile = await db.profile.findUnique({
    where: { username },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          education: { orderBy: { startYear: "desc" } },
          achievements: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } },
          projects: { orderBy: { createdAt: "desc" } },
          skills: { orderBy: { createdAt: "desc" } },
          outOfBox: { orderBy: { createdAt: "desc" } },
          hobbies: { orderBy: { createdAt: "desc" } },
          wishes: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!profile || !profile.isPublic) notFound();
  await db.profileView.create({ data: { profileId: profile.id } });

  profile.user.education = profile.user.education.filter((x) => !x.isHidden);
  profile.user.achievements = profile.user.achievements.filter((x) => !x.isHidden);
  profile.user.projects = profile.user.projects.filter((x) => !x.isHidden);
  profile.user.skills = profile.user.skills.filter((x) => !x.isHidden);
  profile.user.outOfBox = profile.user.outOfBox.filter((x) => !x.isHidden);
  profile.user.hobbies = profile.user.hobbies.filter((x) => !x.isHidden);
  profile.user.wishes = (profile.user.wishes || []).filter((x) => !x.isHidden);

  const initials = profile.user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

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
              <div className="grid size-20 shrink-0 place-items-center rounded-lg bg-[#4F46E5] text-2xl font-bold text-white">{initials}</div>
              <div>
                <h1 className="text-3xl font-bold">{profile.user.name}</h1>
                <p className="mt-2 max-w-2xl leading-7 text-slate-600">{profile.headline}</p>
                {profile.location ? <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500"><MapPin size={16} /> {profile.location}</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {profile.linkedinUrl ? <Button href={profile.linkedinUrl} variant="secondary"><Link2 size={16} /> LinkedIn</Button> : null}
              {profile.githubUrl ? <Button href={profile.githubUrl} variant="secondary"><Link2 size={16} /> GitHub</Button> : null}
              {profile.emailVisible ? <Button href={`mailto:${profile.user.email}`}><Mail size={16} /> Contact</Button> : null}
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold">About</h2>
              <p className="mt-3 leading-7 text-slate-600">{profile.bio || "This student is building their career story."}</p>
              {profile.careerGoal ? <p className="mt-3 leading-7 text-slate-600"><span className="font-semibold text-slate-900">Career goal:</span> {profile.careerGoal}</p> : null}
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-bold">Education</h2>
              <div className="mt-4 grid gap-4">
                {profile.user.education.map((item) => (
                  <div key={item.id} className="border-l-2 border-[#4F46E5] pl-4">
                    <p className="font-bold">{item.institutionName}</p>
                    <p className="text-sm text-slate-600">{item.degree} · {item.startYear || ""} - {item.endYear || ""}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </Card>
            <section>
              <h2 className="mb-4 text-xl font-bold">Achievement Stories</h2>
              <div className="grid gap-4">
                {profile.user.achievements.map((achievement) => (
                  <Card key={achievement.id} className="p-5">
                    <Badge>{achievement.category}</Badge>
                    <h3 className="mt-4 text-lg font-bold">{achievement.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{achievement.problemStatement}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{achievement.result}</p>
                  </Card>
                ))}
              </div>
            </section>
            <Card className="p-6">
              <h2 className="text-xl font-bold">Projects</h2>
              <div className="mt-4 grid gap-4">
                {profile.user.projects.map((project) => (
                  <div key={project.id} className="rounded-lg border border-slate-200 p-4">
                    <h3 className="font-bold">{project.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{project.outcome}</p>
                  </div>
                ))}
              </div>
            </Card>

            {profile.user.outOfBox && profile.user.outOfBox.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">Out-of-Box Thinking</h2>
                <div className="mt-4 grid gap-4">
                  {profile.user.outOfBox.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-indigo-50/30 p-4">
                      <h3 className="font-bold">{item.title}</h3>
                      {item.context && <p className="mt-2 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-900">Context:</span> {item.context}</p>}
                      {item.innovation && <p className="mt-2 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-900">Innovation:</span> {item.innovation}</p>}
                      {item.result && <p className="mt-2 text-sm font-semibold text-emerald-700">Result: {item.result}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {profile.user.hobbies && profile.user.hobbies.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">Hobbies & Personality</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {profile.user.hobbies.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                      <Badge variant="outline" className="mb-2">{item.category}</Badge>
                      <h3 className="font-bold">{item.title}</h3>
                      {item.description && <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>}
                      {item.achievements && <p className="mt-2 text-xs font-semibold text-[#06B6D4]">{item.achievements}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {profile.user.wishes && profile.user.wishes.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-amber-500" size={20} /> Career Vision & Goals</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {profile.user.wishes.map((item) => (
                    <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                      <h3 className="font-bold text-amber-900">{item.title}</h3>
                      {item.achievedSteps && <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-emerald-700">Achieved:</span> {item.achievedSteps}</p>}
                      {item.futureSteps && <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-semibold text-indigo-700">Next Steps:</span> {item.futureSteps}</p>}
                      {item.thoughts && <p className="mt-3 text-sm italic leading-6 text-amber-800">"{item.thoughts}"</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <aside className="grid h-fit gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold">Skills With Proof</h2>
              <div className="mt-4 grid gap-3">
                {profile.user.skills.map((skill) => (
                  <div key={skill.id} className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold">{skill.skillName}</p>
                    <p className="text-sm text-slate-600">{skill.proficiencyLevel} {skill.proofLink ? `· ${skill.proofLink}` : ""}</p>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
