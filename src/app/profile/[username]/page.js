import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Link2, Mail, MapPin, Sparkles, Target, CheckCircle2, ArrowRight } from "lucide-react";
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
          sports: { orderBy: { createdAt: "desc" } },
          activities: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!profile || !profile.isPublic) notFound();
  await db.profileView.create({ data: { profileId: profile.id } });

  const globalSettings = await db.setting.findFirst({}) || {
    theme: "modern", showHobbies: true, showWishes: true, showSports: true, showActivities: true, showOutOfBox: true,
    showEducation: true, showAchievements: true, showProjects: true, showSkills: true, showInternship: true, showProfession: true, showProfessionSelf: true
  };

  profile.user.education = globalSettings.showEducation ? profile.user.education.filter((x) => !x.isHidden) : [];
  profile.user.achievements = globalSettings.showAchievements ? profile.user.achievements.filter((x) => !x.isHidden) : [];
  profile.user.projects = globalSettings.showProjects ? profile.user.projects.filter((x) => !x.isHidden) : [];
  profile.user.skills = globalSettings.showSkills ? profile.user.skills.filter((x) => !x.isHidden) : [];
  profile.user.internships = globalSettings.showInternship ? (profile.user.internships || []).filter((x) => !x.isHidden) : [];
  profile.user.professions = globalSettings.showProfession ? (profile.user.professions || []).filter((x) => !x.isHidden) : [];
  profile.user.professionsSelf = globalSettings.showProfessionSelf ? (profile.user.professionsSelf || []).filter((x) => !x.isHidden) : [];
  
  profile.user.outOfBox = globalSettings.showOutOfBox ? profile.user.outOfBox.filter((x) => !x.isHidden) : [];
  profile.user.hobbies = globalSettings.showHobbies ? profile.user.hobbies.filter((x) => !x.isHidden) : [];
  profile.user.wishes = globalSettings.showWishes ? (profile.user.wishes || []).filter((x) => !x.isHidden) : [];
  profile.user.sports = globalSettings.showSports ? (profile.user.sports || []).filter((x) => !x.isHidden) : [];
  profile.user.activities = globalSettings.showActivities ? (profile.user.activities || []).filter((x) => !x.isHidden) : [];

  const initials = profile.user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const isClassic = globalSettings.theme === "classic";
  const isMinimal = globalSettings.theme === "minimal";

  return (
    <main className={`bg-[#F9FAFB] text-slate-950 min-h-screen ${isClassic ? "font-serif" : "font-sans"}`}>
      <header className={`mx-auto flex max-w-6xl items-center justify-between px-4 py-5 ${isMinimal ? "border-b border-slate-200" : ""}`}>
        <Link href="/" className="flex items-center gap-3">
          <span className={`grid size-10 place-items-center rounded-lg ${isClassic ? "bg-slate-800" : isMinimal ? "bg-slate-100 text-slate-900 border" : "bg-[#4F46E5] text-white"}`}>
            <Sparkles size={20} className={isMinimal ? "text-slate-600" : ""} />
          </span>
          <span className="font-bold">Portfolio</span>
        </Link>
        <Button href="/dashboard/resume" variant={isMinimal ? "outline" : "secondary"}><Download size={16} /> Resume</Button>
      </header>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <Card className={`p-6 md:p-8 ${isMinimal ? "shadow-none border-2" : ""}`}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex gap-5">
              <div className={`grid size-20 shrink-0 place-items-center rounded-lg text-2xl font-bold ${isClassic ? "bg-slate-800 text-white" : isMinimal ? "bg-slate-100 text-slate-800 border" : "bg-[#4F46E5] text-white"}`}>{initials}</div>
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
            {profile.user.education && profile.user.education.length > 0 && (
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
            )}

            {profile.user.achievements && profile.user.achievements.length > 0 && (
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
            )}

            {profile.user.projects && profile.user.projects.length > 0 && (
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
            )}

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

            {profile.user.sports && profile.user.sports.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">Sports Activity</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {profile.user.sports.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-4 bg-emerald-50/30">
                      <h3 className="font-bold text-emerald-900">{item.title}</h3>
                      {item.description && <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>}
                      {item.achievements && <p className="mt-2 text-sm font-semibold text-emerald-700">{item.achievements}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {profile.user.activities && profile.user.activities.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">Other Activity</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {profile.user.activities.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-4 bg-sky-50/30">
                      <h3 className="font-bold text-sky-900">{item.title}</h3>
                      {item.description && <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>}
                      {item.achievements && <p className="mt-2 text-sm font-semibold text-sky-700">{item.achievements}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {profile.user.wishes && profile.user.wishes.length > 0 && (
              <div className="mt-8 mb-4">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Sparkles className="text-amber-500" size={28} /> Career Vision & Goals
                </h2>
                <div className="space-y-6">
                  {profile.user.wishes.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-4 md:items-stretch">
                      {/* Left Side: GOAL (Orange) */}
                      <div className="flex-1 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 transform transition-transform group-hover:scale-110">
                          <Target size={120} />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3 text-orange-100 text-xs font-bold uppercase tracking-widest">
                            <Target size={14} /> Goal / Wish List
                          </div>
                          <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                          {item.futureSteps && (
                            <p className="text-orange-50 leading-relaxed text-sm">
                              <strong className="text-white">Plan:</strong> {item.futureSteps}
                            </p>
                          )}
                          {item.thoughts && (
                            <div className="mt-4 bg-black/10 rounded-lg p-3 border-l-4 border-orange-300">
                              <p className="text-orange-50 italic text-sm">"{item.thoughts}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Connector Line (Desktop Only) */}
                      <div className="hidden md:flex flex-col justify-center items-center px-1">
                        <ArrowRight className="text-slate-300" size={28} />
                      </div>

                      {/* Right Side: ACHIEVED (Purple) */}
                      <div className="flex-1">
                        {item.achievedSteps ? (
                          <div className="h-full bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 transform transition-transform group-hover:scale-110">
                              <CheckCircle2 size={120} />
                            </div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-3 text-purple-200 text-xs font-bold uppercase tracking-widest">
                                <CheckCircle2 size={14} /> Achieved / Where we are
                              </div>
                              <p className="text-purple-50 leading-relaxed font-medium">
                                {item.achievedSteps}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400">
                            <div className="bg-slate-100 rounded-full p-3 mb-2">
                              <Sparkles size={20} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-medium">Journey just beginning</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center p-6 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-sm">
                  <p className="text-amber-800 font-medium flex items-center justify-center gap-2">
                    <Sparkles className="text-amber-500 animate-pulse" size={20} /> 
                    More exciting options and detailed career tracking for this section will follow soon!
                  </p>
                </div>
              </div>
            )}
          </div>
          <aside className="grid h-fit gap-6">
            {profile.user.skills && profile.user.skills.length > 0 && (
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
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
