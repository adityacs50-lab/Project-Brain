"use client";

import useSWR from "swr";
import { fetcher, getWorkflows } from "@/lib/api";
import { Layers, CheckCircle2, Loader2, PlayCircle, Clock } from "lucide-react";

interface Workflow {
  id: string;
  title: string;
  status: string;
  current_step: number;
  value_generated: number;
  created_at: string;
}

export function WorkflowFeed({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useSWR(getWorkflows(workspaceId), fetcher, { refreshInterval: 5000 });
  const workflows: Workflow[] = data?.workflows || [];

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center p-12 bg-white border border-zinc-200 rounded-xl">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          Live Workflow Engine
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Stream</span>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
        {workflows.length > 0 ? (
          workflows.map((wf) => (
            <div key={wf.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  wf.status === 'completed' ? 'bg-green-100 text-green-600' : 
                  wf.status === 'running' ? 'bg-blue-100 text-blue-600 animate-pulse' : 
                  'bg-zinc-100 text-zinc-600'
                }`}>
                  {wf.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-zinc-900">{wf.title}</h3>
                    {wf.value_generated > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        +${wf.value_generated.toFixed(2)} ROI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                      wf.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {wf.status}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(wf.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Progress</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div 
                      key={s} 
                      className={`w-3 h-1 rounded-full ${
                        s <= wf.current_step ? 'bg-purple-500' : 'bg-zinc-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-400">No active workflows detected.</p>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest">Awaiting brain trigger...</p>
          </div>
        )}
      </div>
    </div>
  );
}
