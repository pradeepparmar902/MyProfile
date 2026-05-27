import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MediaGallery } from "@/components/media/MediaGallery";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

function DetailBlock({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{children || "Not added yet."}</p>
    </div>
  );
}

export default async function AchievementDetailPage({ params }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const achievement = await db.achievement.findFirst({
    where: { id, userId: user.id },
  });

  if (!achievement) notFound();

  const skills = (achievement.skillsUsed || "").split(",").map((skill) => skill.trim()).filter(Boolean);
  const media = await db.media.findMany({
    where: { userId: user.id, relatedType: "ACHIEVEMENT", relatedId: achievement.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardTopbar title="Achievement Detail" />
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <Button href="/dashboard/achievements" variant="secondary"><ArrowLeft size={16} /> Back</Button>
          <Button href={`/dashboard/achievements/${achievement.id}/edit`}><Pencil size={16} /> Edit Achievement</Button>
        </div>
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{achievement.category}</Badge>
            <Badge>{achievement.status}</Badge>
            {achievement.metrics ? <Badge>{achievement.metrics}</Badge> : null}
          </div>
          <h2 className="text-3xl font-bold text-slate-950">{achievement.title}</h2>
          <div className="mt-6 grid gap-6">
            <DetailBlock title="Problem">{achievement.problemStatement}</DetailBlock>
            <DetailBlock title="Thinking Process">{achievement.thinkingProcess}</DetailBlock>
            <DetailBlock title="Execution">{achievement.executionProcess}</DetailBlock>
            <DetailBlock title="Result">{achievement.result}</DetailBlock>
            <DetailBlock title="Learning">{achievement.learning}</DetailBlock>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Skills Used</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.length ? skills.map((skill) => <Badge key={skill}>{skill}</Badge>) : <p className="text-slate-600">Not added yet.</p>}
              </div>
            </div>
            {achievement.proofLink ? (
              <a className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#4F46E5]" href={achievement.proofLink} target="_blank" rel="noreferrer">
                Open proof <ExternalLink size={16} />
              </a>
            ) : null}
          </div>
        </Card>
        <div className="mt-6">
          <MediaGallery
            title="Achievement Proof Gallery"
            relatedType="ACHIEVEMENT"
            relatedId={achievement.id}
            initialMedia={JSON.parse(JSON.stringify(media))}
            categories={["Certificate", "Honour Photo", "Award Photo", "Project Proof", "Media Coverage", "Other"]}
            readOnly
          />
        </div>
      </div>
    </>
  );
}
