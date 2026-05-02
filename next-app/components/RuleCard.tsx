"use client";

import { useState } from "react";
import { updateRuleStatus } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  let confColor = "bg-red-500 text-white";
  if (rule.confidence >= 0.85) confColor = "bg-green-500 text-white";
  else if (rule.confidence >= 0.60) confColor = "bg-yellow-500 text-white";

  return (
    <Card className={`transition-all duration-200 ${isRemoving ? "opacity-0 scale-95" : "opacity-100 scale-100"} mb-4`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{rule.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={confColor}>{(rule.confidence * 100).toFixed(0)}% Confidence</Badge>
            {rule.version > 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline">v{rule.version}</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This rule replaced an earlier version</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Badge variant="secondary">#{rule.channel_id || "general"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea 
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="mb-4 min-h-[100px]"
          />
        ) : (
          <p className="mb-4 whitespace-pre-wrap">{rule.rule_text}</p>
        )}
        <div className="bg-muted p-4 rounded-md italic text-muted-foreground border-l-4 border-gray-400">
          &quot;{rule.source_message}&quot;
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button variant="destructive" onClick={() => handleAction("archived")}>❌ Reject</Button>
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="default" onClick={() => handleAction("active", true)}>✅ Confirm Edit</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setIsEditing(true)}>✏️ Edit & Approve</Button>
            <Button variant="default" onClick={() => handleAction("active")}>✅ Approve</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
