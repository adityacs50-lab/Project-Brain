export const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * 🛡️ STATELOCK ORCHESTRATION LAYER
 * This utility ensures all frontend requests are routed through the deterministic 
 * Railway backend. Hardcoded database URLs are strictly prohibited.
 */

const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

export const getRules = (workspaceId: string) => {
    const url = `${getBaseUrl()}/rules/${workspaceId}/rules`;
    if (typeof window !== 'undefined' && workspaceId) {
        console.log("API: Fetching rules from Railway:", url);
    }
    return url;
};

export const getContradictions = (workspaceId: string) => {
    return `${getBaseUrl()}/rules/${workspaceId}/contradictions`;
};

export const getDecisions = (workspaceId: string) => {
    return `${getBaseUrl()}/agent/decisions/${workspaceId}`;
};

export const getStats = (workspaceId: string) => {
    const url = `${getBaseUrl()}/agent/stats/${workspaceId}`;
    if (typeof window !== 'undefined' && workspaceId) {
        console.log("API: Fetching stats from Railway:", url);
    }
    return url;
};

export const getWorkflows = (workspaceId: string) => {
    return `${getBaseUrl()}/agent/dashboard/workflows/${workspaceId}`;
};

export const getBilling = (workspaceId: string) => {
    return `${getBaseUrl()}/agent/dashboard/billing/${workspaceId}`;
};

export const updateRuleStatus = async (ruleId: string, status: string, editedText?: string, approvedBy?: string) => {
    const res = await fetch(`${getBaseUrl()}/rules/${ruleId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, edited_text: editedText, approved_by: approvedBy })
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
};

export const submitFeedback = async (auditId: string, outcome: string, notes?: string) => {
    const res = await fetch(`${getBaseUrl()}/agent/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit_id: auditId, outcome, notes })
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return res.json();
};
