import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { ResumeManager } from "@/components/resume/ResumeManager";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ResumePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const resumes = await db.resume.findMany({
    where: { userId: sessionUser.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <DashboardTopbar 
        title="My Resumes" 
        guideContent={
          <>
            <p>Manage your multiple tailored resumes.</p>
            <p><strong>Specific Roles:</strong> Create a different resume version for specific jobs, highlighting only the skills and achievements relevant to that role.</p>
            <p><strong>Visibility:</strong> Resumes can be downloaded as PDF or viewed online via public link.</p>
          </>
        }
      />
      <ResumeManager resumes={JSON.parse(JSON.stringify(resumes || []))} />
    </>
  );
}
