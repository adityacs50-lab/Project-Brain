"use client";

import { useState } from "react";
import { updateRuleStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, Edit2, ShieldAlert, ShieldCheck, History, MessageSquare, Shield } from "lucide-react";

export interface Rule {
  id: string;
  title: string;
  rule_text: string;
  status: string;
  confidence: number;
  source_message: string;
  channel_id: string;
  version: number;
}

export function RuleCard({ rule, onRemoved }: { rule: Rule, onRemoved: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(rule.rule_text);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleAction = async (status: string, useEditedText = false) => {
    try {
      await updateRuleStatus(rule.id, status, useEditedText ? editedText : undefined);
      setIsRemoving(true);
      setTimeout(() => {
        onRemoved();
      }, 200);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const isHighConfidence = rule.confidence >= 0.85;
  const isMedConfidence = rule.confidence >= 0.60 && rule.confidence < 0.85;

  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${isRemoving ? "opacity-0 scale-95" : "opacity-100 scale-100"} mb-6 border border-white/10 hover:border-white/20 group`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isHighConfidence ? 'bg-green-500/20 text-green-400' : isMedConfidence ? 'bg-yellow-500/20 text-yellow-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {isHighConfidence ? <ShieldCheck className="w-5 h-5" /> : isMedConfidence ? <Shield className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{rule.title}</h3>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${isHighConfidence ? 'bg-green-500/10 text-green-400 border border-green-500/20' : isMedConfidence ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isHighConfidence ? 'bg-green-400' : isMedConfidence ? 'bg-yellow-400' : 'bg-orange-400'}`} />
              {(rule.confidence * 100).toFixed(0)}% Match
            </div>
            {rule.version > 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 cursor-help">
                      <History className="w-3 h-3" /> v{rule.version}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-white/10 text-white">
                    <p>This rule replaces an earlier version</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/5 text-white/60 border border-white/10">
              #{rule.channel_id || "general"}
            </div>
          </div>
        </div>

        <div className="pl-12">
          {isEditing ? (
            <Textarea 
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="mb-4 min-h-[100px] bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50 text-base"
            />
          ) : (
            <p className="mb-6 whitespace-pre-wrap text-white/80 leading-relaxed text-[15px]">{rule.rule_text}</p>
          )}

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex gap-3 items-start relative overflow-hidden group-hover:border-white/10 transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            <MessageSquare className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
            <p className="italic text-white/50 text-sm leading-relaxed">
              &quot;{rule.source_message}&quot;
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border-t border-white/5 px-6 py-4 flex gap-3 justify-end items-center">
        {isEditing ? (
          <>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-blue-500/25 gap-2 transition-all" onClick={() => handleAction("active", true)}>
              <Check className="w-4 h-4" /> Confirm Edit
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors gap-2" onClick={() => handleAction("archived")}>
              <X className="w-4 h-4" /> Reject
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors gap-2" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4" /> Edit & Approve
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-blue-500/25 gap-2 transition-all" onClick={() => handleAction("active")}>
              <Check className="w-4 h-4" /> Approve Rule
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
