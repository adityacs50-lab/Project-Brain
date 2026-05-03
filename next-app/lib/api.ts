export const fetcher = (url: string) => fetch(url).then(res => res.json());

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Review queue and stats bar both fetch the full rules list and filter by status on the client.
export const getRules = (workspaceId: string) => {
    return `${BASE_URL}/rules/${workspaceId}/rules`;
};

export const getContradictions = (workspaceId: string) => {
    return `${BASE_URL}/rules/${workspaceId}/contradictions`;
};

export const updateRuleStatus = async (ruleId: string, status: string, editedText?: string) => {
    const res = await fetch(`${BASE_URL}/rules/${ruleId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, edited_text: editedText })
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
};
