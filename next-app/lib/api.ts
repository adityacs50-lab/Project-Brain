export const fetcher = (url: string) => fetch(url).then(res => res.json());

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Review queue and stats bar both fetch the full rules list and filter by status on the client.
export const getRules = (workspaceId: string) => {
    return `${BASE_URL}/rules/${workspaceId}/rules`;
};

export const getContradictions = (workspaceId: string) => {
    return `${BASE_URL}/rules/${workspaceId}/contradictions`;
};

export const getDecisions = (workspaceId: string) => {
    return `${BASE_URL}/agent/decisions/${workspaceId}`;
};

export const getStats = (workspaceId: string) => {
    return `${BASE_URL}/agent/stats/${workspaceId}`;
};

export const updateRuleStatus = async (ruleId: string, status: string, editedText?: string, approvedBy?: string) => {
    const res = await fetch(`${BASE_URL}/rules/${ruleId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, edited_text: editedText, approved_by: approvedBy })
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
};

export const submitFeedback = async (auditId: string, outcome: string, notes?: string) => {
    const res = await fetch(`${BASE_URL}/agent/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit_id: auditId, outcome, notes })
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return res.json();
};
