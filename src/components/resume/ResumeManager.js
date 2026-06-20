"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Copy, Trash2, Globe, LayoutTemplate, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ResumeManager({ resumes }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(null);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Resume",
          template: "classic",
          selections: {},
        }),
      });
      if (res.ok) {
        const newResume = await res.json();
        router.push(`/dashboard/resume/${newResume.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (resume) => {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${resume.title} (Copy)`,
          template: resume.template,
          customBio: resume.customBio,
          customHeadline: resume.customHeadline,
          selections: resume.selections,
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (isDeleting) return;
    setIsDeleting(id);
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Tailored Resumes</h2>
          <p className="text-slate-500 text-sm mt-1">Create multiple versions of your resume for different job roles.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus size={16} /> Create New Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <Card key={resume.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDuplicate(resume)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(resume.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                    disabled={isDeleting === resume.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{resume.title}</h3>
              {resume.customHeadline && (
                <p className="text-sm text-slate-500 line-clamp-1 mt-1">{resume.customHeadline}</p>
              )}
              
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <LayoutTemplate size={14} />
                  <span className="capitalize">{resume.template || 'Classic'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={14} />
                  <span>{new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 text-sm bg-white"
                onClick={() => window.open(`/resume/${resume.id}`, '_blank')}
              >
                <Globe size={14} className="mr-2" /> View Public
              </Button>
              <Button 
                className="flex-1 text-sm"
                onClick={() => router.push(`/dashboard/resume/${resume.id}`)}
              >
                Edit Resume
              </Button>
            </div>
          </Card>
        ))}

        {resumes.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
            <FileText size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No tailored resumes yet</h3>
            <p className="text-sm mt-1 text-center max-w-md">Create your first specific resume by selecting the exact skills and experiences you want to highlight.</p>
            <Button onClick={handleCreate} className="mt-6 gap-2">
              <Plus size={16} /> Create New Resume
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
