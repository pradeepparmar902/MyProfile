import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, CircleDashed, Clock, AlertTriangle, Calendar, FileText } from 'lucide-react';

export default function RoadmapReportModal({ nodes, roadmapTitle, onClose }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const reportData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let total = nodes.length;
    let achieved = 0;
    let inProgress = 0;
    let notStarted = 0;
    
    let overdue = [];
    let inProgressList = [];
    let notStartedList = [];
    let completedSteps = [];

    nodes.forEach(node => {
      const { label, status, startDate, endDate } = node.data;
      const currentStatus = status || 'Not yet started';
      
      if (currentStatus === 'Achieved') achieved++;
      else if (currentStatus === 'In Progress') inProgress++;
      else notStarted++;

      const isAchieved = currentStatus === 'Achieved';
      const hasStartDate = !!startDate;
      const hasEndDate = !!endDate;
      const start = hasStartDate ? new Date(startDate) : null;
      const end = hasEndDate ? new Date(endDate) : null;
      
      let isOverdue = false;
      let overdueReason = '';

      if (!isAchieved) {
        if (hasEndDate && end < today) {
          isOverdue = true;
          overdueReason = 'Missed Target Date';
        } else if (currentStatus === 'Not yet started' && hasStartDate && start < today) {
          isOverdue = true;
          overdueReason = 'Missed Start Date';
        }
      }

      const stepData = {
        id: node.id,
        title: label || 'Untitled Step',
        status: currentStatus,
        startDate: startDate || 'Not set',
        endDate: endDate || 'Not set',
        overdueReason
      };

      if (isAchieved) {
        completedSteps.push(stepData);
      } else if (isOverdue) {
        overdue.push(stepData);
      } else if (currentStatus === 'In Progress') {
        inProgressList.push(stepData);
      } else {
        notStartedList.push(stepData);
      }
    });

    const completionRate = total > 0 ? Math.round((achieved / total) * 100) : 0;

    return {
      total,
      achieved,
      inProgress,
      notStarted,
      completionRate,
      overdue,
      inProgressList,
      notStartedList,
      completedSteps
    };
  }, [nodes]);

  const executivePrintView = (
    <div id="executive-print-view" className="hidden print:block print:w-full print:bg-white text-black font-serif p-10 max-w-[8.5in] mx-auto text-sm">
      <div className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900">Executive Management Report</h1>
        <p className="text-lg text-slate-600 mt-2">Project Roadmap: {roadmapTitle || 'Untitled'}</p>
        <p className="text-sm text-slate-500 mt-1">Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="mb-8 bg-slate-50 p-4 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2 border-b border-slate-300 pb-1">Executive Summary</h2>
        <p className="text-slate-700 leading-relaxed">
          This roadmap encompasses a total of <strong>{reportData.total}</strong> strategic steps. 
          Currently, <strong>{reportData.achieved}</strong> steps have been successfully achieved, resulting in an overall project completion rate of <strong>{reportData.completionRate}%</strong>. 
          There are <strong>{reportData.inProgress}</strong> steps actively in progress, and <strong>{reportData.notStarted}</strong> steps awaiting initiation. 
          Critically, there {reportData.overdue.length === 1 ? 'is' : 'are'} <strong>{reportData.overdue.length}</strong> overdue action item{reportData.overdue.length === 1 ? '' : 's'} that require immediate management attention to prevent cascading delays.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-300 pb-1">Strategic Step Analysis & Advisories</h2>
        
        {[...reportData.overdue, ...reportData.inProgressList, ...reportData.notStartedList, ...reportData.completedSteps].map((step, idx) => {
          
          let advisory = { decision: '', advise: '' };
          if (step.status === 'Achieved') {
            advisory = { decision: "No Action Required.", advise: "Step successfully completed. Ensure lessons learned are recorded." };
          } else if (step.overdueReason === 'Missed Target Date') {
            advisory = { decision: "Critical Timeline Breach.", advise: "Immediate intervention required. Re-evaluate the target deadline and allocate additional resources to clear blockers." };
          } else if (step.overdueReason === 'Missed Start Date') {
            advisory = { decision: "Delayed Kick-off.", advise: "This phase has missed its scheduled start date. Schedule a kick-off meeting immediately to realign stakeholders." };
          } else if (step.status === 'In Progress') {
            advisory = { decision: "Monitor Execution.", advise: "Active progress is being made. Maintain momentum and conduct regular status checks against the target date." };
          } else {
            advisory = { decision: "Preparation Phase.", advise: "Task is pending. Review resource availability and finalize prerequisites prior to the scheduled start date." };
          }

          return (
            <div key={step.id} className="border border-slate-300 p-4" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900">{idx + 1}. {step.title}</h3>
                <div className="text-right">
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold border ${step.status === 'Achieved' ? 'border-emerald-500 text-emerald-700' : step.overdueReason ? 'border-red-500 text-red-700 bg-red-50' : 'border-slate-400 text-slate-600'}`}>
                    {step.overdueReason || step.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-xs text-slate-600 border-b border-slate-200 pb-2">
                <div><strong>Start Date:</strong> {step.startDate}</div>
                <div><strong>Target Date:</strong> {step.endDate}</div>
              </div>

              <div className="space-y-1">
                <p className="text-sm">
                  <strong className="text-slate-800">Decision Point:</strong> <span className="text-slate-700">{advisory.decision}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-slate-800">Advisory Action:</strong> <span className="text-slate-700">{advisory.advise}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
        End of Management Report • Generated confidentially via Portfolio Platform
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body > *:not(#executive-print-view) {
            display: none !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}} />
      
      {mounted && createPortal(executivePrintView, document.body)}

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
        
        {/* Dashboard Screen Wrapper (Hidden on Print) */}
        <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="text-blue-500" />
                Progress Report
              </h2>
              <p className="text-slate-400 mt-1">Roadmap: <strong className="text-slate-200">{roadmapTitle || 'Untitled Roadmap'}</strong></p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-blue-600 rounded-lg transition-colors border border-slate-700 hover:border-blue-500"
              >
                <FileText size={16} /> Save as PDF
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><FileText size={24} /></div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Steps</p>
                  <p className="text-2xl font-bold text-white">{reportData.total}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg"><CheckCircle2 size={24} /></div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Achieved</p>
                  <p className="text-2xl font-bold text-white">{reportData.achieved}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg"><Clock size={24} /></div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">In Progress</p>
                  <p className="text-2xl font-bold text-white">{reportData.inProgress}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-slate-500/20 text-slate-400 rounded-lg"><CircleDashed size={24} /></div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Not Started</p>
                  <p className="text-2xl font-bold text-white">{reportData.notStarted}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-800/30 border border-slate-700 p-6 rounded-xl">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-lg font-semibold text-white">Overall Completion</h3>
                <span className="text-2xl font-bold text-emerald-400">{reportData.completionRate}%</span>
              </div>
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${reportData.completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overdue Items (Critical) */}
              <div className="bg-red-950/20 border border-red-900/50 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-red-900/20 px-4 py-3 border-b border-red-900/50 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" size={18} />
                  <h3 className="font-semibold text-red-400">Overdue</h3>
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{reportData.overdue.length}</span>
                </div>
                <div className="p-2 flex-1 overflow-y-auto max-h-[300px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-red-900/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-red-800/80">
                  {reportData.overdue.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">No overdue steps. Great job!</div>
                  ) : (
                    <ul className="space-y-2">
                      {reportData.overdue.map(step => (
                        <li key={step.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-white">{step.title}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">{step.overdueReason}</span>
                          </div>
                          <div className="flex gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Calendar size={12}/> Start: {step.startDate}</span>
                            <span className="flex items-center gap-1 text-red-300"><Calendar size={12}/> Target: {step.endDate}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* In Progress Items */}
              <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-amber-900/10 px-4 py-3 border-b border-amber-900/30 flex items-center gap-2">
                  <Clock className="text-amber-400" size={18} />
                  <h3 className="font-semibold text-amber-400">In Progress (On Track)</h3>
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{reportData.inProgressList.length}</span>
                </div>
                <div className="p-2 flex-1 overflow-y-auto max-h-[300px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-amber-900/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-amber-800/80">
                  {reportData.inProgressList.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">No active steps.</div>
                  ) : (
                    <ul className="space-y-2">
                      {reportData.inProgressList.map(step => (
                        <li key={step.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex flex-col gap-2">
                          <span className="font-medium text-slate-200">{step.title}</span>
                          <div className="flex gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={12}/> Target: {step.endDate}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Not Started Items */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                  <CircleDashed className="text-slate-400" size={18} />
                  <h3 className="font-semibold text-slate-300">Not Started</h3>
                  <span className="ml-auto bg-slate-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{reportData.notStartedList.length}</span>
                </div>
                <div className="p-2 flex-1 overflow-y-auto max-h-[300px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                  {reportData.notStartedList.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">All steps started!</div>
                  ) : (
                    <ul className="space-y-2">
                      {reportData.notStartedList.map(step => (
                        <li key={step.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex flex-col gap-2">
                          <span className="font-medium text-slate-300">{step.title}</span>
                          <div className="flex gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={12}/> Start: {step.startDate}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Completed Items Table */}
            {reportData.completedSteps.length > 0 && (
               <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl overflow-hidden">
                <div className="bg-emerald-900/10 px-4 py-3 border-b border-emerald-900/30 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  <h3 className="font-semibold text-emerald-400">Completed Steps</h3>
                  <span className="ml-auto bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{reportData.completedSteps.length}</span>
                </div>
                <div className="p-0 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-emerald-900/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-emerald-800/80">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
                      <tr>
                        <th className="px-6 py-3 font-medium">Step Title</th>
                        <th className="px-6 py-3 font-medium">Start Date</th>
                        <th className="px-6 py-3 font-medium">Completion Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.completedSteps.map((step, idx) => (
                        <tr key={step.id} className={idx !== reportData.completedSteps.length - 1 ? "border-b border-slate-800/50" : ""}>
                          <td className="px-6 py-3 font-medium text-white">{step.title}</td>
                          <td className="px-6 py-3 text-slate-400">{step.startDate}</td>
                          <td className="px-6 py-3 text-emerald-400">{step.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
