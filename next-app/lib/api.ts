export const fetcher = (url: string) => fetch(url).then(res => res.json());

const BASE_URL = "http://localhost:8000";

export const getRules = (workspaceId: string, status?: string) => {
    const url = new URL(`${BASE_URL}/rules/${workspaceId}/rules`);
    if (status) {
        url.searchParams.append("status", status);
    }
    return url.toString();
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
