"use client";

import { useState } from "react";
import { updateRuleStatus } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit2, MessageSquare } from "lucide-react";

export interface Rule {
  id: string;
  title: string;
  rule_text: string;
  status: string;
  confidence: number;
  source_message: string;
  source_channel?: string;
  channel_id: string;
  version: number;
}

export function RuleCard({ rule, onRemoved }: { rule: Rule, onRemoved: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(rule.rule_text);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleAction = async (status: string, useEditedText = false) => {
    try {
      await updateRuleStatus(rule.id, status, useEditedText ? editedText : undefined, "admin");
      setIsRemoving(true);
      setTimeout(() => {
        onRemoved();
      }, 200);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const confidenceValue = Math.round(rule.confidence * 100);
  const confidenceColor = confidenceValue > 85 ? "text-green-500 bg-green-500/10 border-green-500/20" : confidenceValue > 60 ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" : "text-red-500 bg-red-500/10 border-red-500/20";

  return (
    <div className={`bg-white border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300 ${isRemoving ? "opacity-0 scale-95 translate-y-4" : "opacity-100 scale-100 translate-y-0"} mb-6 hover:border-zinc-300 shadow-sm`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">{rule.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceColor} uppercase tracking-wider`}>
                {confidenceValue}% Confidence
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500 font-medium px-2 py-0.5 bg-zinc-50 rounded-md border border-zinc-100">
                {rule.source_channel || "#general"}
              </span>
              <span className="text-xs text-zinc-500 font-medium px-2 py-0.5 bg-zinc-50 rounded-md border border-zinc-100">
                v{rule.version}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <Textarea 
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[120px] bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-blue-600 text-sm leading-relaxed"
            />
          ) : (
            <div className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-lg">
               <p className="text-zinc-700 leading-relaxed text-sm">{rule.rule_text}</p>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500 italic leading-relaxed">
              &quot;{rule.source_message}&quot;
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex gap-3 justify-end items-center">
        {isEditing ? (
          <>
            <button 
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-md transition-all flex items-center gap-2"
              onClick={() => handleAction("active", true)}
            >
              <Check className="w-3.5 h-3.5" /> Confirm Edit
            </button>
          </>
        ) : (
          <>
            <button 
              className="text-xs font-semibold text-red-500/70 hover:text-red-500 transition-colors flex items-center gap-1.5"
              onClick={() => handleAction("archived")}
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
            <button 
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-md transition-all flex items-center gap-2"
              onClick={() => handleAction("active")}
            >
              <Check className="w-3.5 h-3.5" /> Approve Rule
            </button>
          </>
        )}
      </div>
    </div>
  );
}
