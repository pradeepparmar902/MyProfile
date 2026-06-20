import React, { useMemo } from 'react';
import { X, CheckCircle2, CircleDashed, Clock, AlertTriangle, Calendar, FileText } from 'lucide-react';

export default function RoadmapReportModal({ nodes, wishTitle, onClose }) {
  const reportData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let total = nodes.length;
    let achieved = 0;
    let inProgress = 0;
    let notStarted = 0;
    let overdue = [];
    let onTrack = [];
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
      } else {
        onTrack.push(stepData);
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
      onTrack,
      completedSteps
    };
  }, [nodes]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="text-blue-500" />
              Progress Report
            </h2>
            <p className="text-slate-400 mt-1">Roadmap: <strong className="text-slate-200">{wishTitle || 'Untitled Roadmap'}</strong></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overdue Items (Critical) */}
            <div className="bg-red-950/20 border border-red-900/50 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-red-900/20 px-4 py-3 border-b border-red-900/50 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={18} />
                <h3 className="font-semibold text-red-400">Overdue / Action Required</h3>
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

            {/* On Track / Upcoming */}
            <div className="bg-blue-950/10 border border-blue-900/30 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-blue-900/10 px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
                <Clock className="text-blue-400" size={18} />
                <h3 className="font-semibold text-blue-400">On Track / Upcoming</h3>
                <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{reportData.onTrack.length}</span>
              </div>
              <div className="p-2 flex-1 overflow-y-auto max-h-[300px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-900/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-800/80">
                {reportData.onTrack.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">No upcoming steps found.</div>
                ) : (
                  <ul className="space-y-2">
                    {reportData.onTrack.map(step => (
                      <li key={step.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-slate-200">{step.title}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{step.status}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar size={12}/> Start: {step.startDate}</span>
                          <span className="flex items-center gap-1"><Calendar size={12}/> Target: {step.endDate}</span>
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
  );
}
