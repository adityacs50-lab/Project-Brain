"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface WorkspaceContextType {
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceId: "demo-workspace",
  setWorkspaceId: () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string>("demo-workspace");
  const searchParams = useSearchParams();

  // 1. Initial resolution on mount
  useEffect(() => {
    const stored = localStorage.getItem("workspaceId");
    const urlWs = searchParams.get("workspaceId") || searchParams.get("workspace_id");
    
    const resolvedId = urlWs || stored || "demo-workspace";
    
    console.log("WorkspaceContext: Resolved Workspace ID:", resolvedId, {
      fromURL: urlWs,
      fromStorage: stored,
      fallback: "demo-workspace"
    });
    
    setWorkspaceId(resolvedId);
    if (urlWs) {
      localStorage.setItem("workspaceId", urlWs);
    }
  }, [searchParams]);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
