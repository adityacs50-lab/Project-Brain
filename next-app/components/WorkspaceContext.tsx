"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface WorkspaceContextType {
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceId: "",
  setWorkspaceId: () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlWs = searchParams.get("workspaceId") || searchParams.get("workspace_id");
    if (urlWs) {
      setWorkspaceId(urlWs);
      localStorage.setItem("workspaceId", urlWs);
    } else {
      const stored = localStorage.getItem("workspaceId");
      if (stored) {
        setWorkspaceId(stored);
      } else {
        setWorkspaceId("demo-workspace"); // Default fallback
      }
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
