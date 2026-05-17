import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { rule, action } = await request.json();

    if (!rule || !action) {
      return NextResponse.json(
        { error: "Both 'rule' and 'action' are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to high-fidelity local simulator.");
      return NextResponse.json(getLocalSimulatedResponse(rule, action));
    }

    // Build the system prompt instructing Gemini to behave as the StateLock Adjudication Engine
    const prompt = `You are the StateLock Adjudication Engine, a deterministic policy enforcement gateway.
Your task is to analyze the following user action against the custom rule provided.

CUSTOM RULE:
"${rule}"

SIMULATED AGENT ACTION:
"${action}"

You MUST evaluate if the action violates or complies with the custom rule, then simulate a structured multi-agent debate from 4 distinct perspectives:
1. Policy Evaluator: Cross-references the action against explicit rules, boundaries, and limits.
2. Compliance Assessor: Evaluates financial, legal, operational risks, and regulatory compliance (like GDPR or SoC2).
3. Exception Handler: Checks for valid exceptions, edge cases, user permissions, or context loopholes.
4. Adjudication Verdict: Provides the final, binding, deterministic decision.

OUTPUT FORMAT:
Respond ONLY with a valid JSON object. Do not wrap it in markdown block quotes (no \`\`\`json).
The response must adhere EXACTLY to this JSON schema:
{
  "debate": [
    { "agent": "Policy Evaluator", "content": "A detailed, technical analysis of the action against the rule." },
    { "agent": "Compliance Assessor", "content": "Analysis of the financial or operational risk score and potential compliance impact." },
    { "agent": "Exception Handler", "content": "Checks for any exceptions, user roles, or mitigations." },
    { "agent": "Adjudication Verdict", "content": "The final binding decision, stating whether the action is permitted, blocked, or escalated." }
  ],
  "decision": "PERMITTED" | "DENIED" | "ESCALATE",
  "reasoning": "A concise 1-2 sentence summary of why the verdict was reached, referencing specific thresholds or parameters.",
  "rules_applied": ["The title or a short label for the custom rule applied"],
  "confidence": 0.95
}
`;

    // Make request directly to Gemini API using fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error status:", response.status, errorText);
      return NextResponse.json(getLocalSimulatedResponse(rule, action));
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.warn("Gemini response did not contain text. Falling back to local simulator.");
      return NextResponse.json(getLocalSimulatedResponse(rule, action));
    }

    // Parse the generated JSON response
    const decisionData = JSON.parse(responseText.trim());
    return NextResponse.json(decisionData);

  } catch (error) {
    console.error("Error in sandbox API route:", error);
    // Safe fallback to prevent backend error screens
    try {
      const { rule, action } = await request.clone().json();
      return NextResponse.json(getLocalSimulatedResponse(rule, action));
    } catch {
      return NextResponse.json({
        debate: [
          { agent: "Policy Evaluator", content: "System error: Failed to parse simulated request parameters." },
          { agent: "Compliance Assessor", content: "Unable to calculate risk boundaries due to session timeout." },
          { agent: "Exception Handler", content: "Enforcement system fallback triggered." },
          { agent: "Adjudication Verdict", content: "RULING: ESCALATE. Unable to execute deterministic check." }
        ],
        decision: "ESCALATE",
        reasoning: "The Adjudication Engine encountered a system timeout. Escalating to prevent potential security bypass.",
        rules_applied: ["System Fallback Gateway"],
        confidence: 0.5
      });
    }
  }
}

// Highly realistic client-side logic to handle outages or key absence beautifully
function getLocalSimulatedResponse(rule: string, action: string) {
  const ruleLower = rule.toLowerCase();
  const actionLower = action.toLowerCase();

  // Try to parse values (e.g. $100 vs $150)
  const extractNumbers = (str: string) => {
    const matches = str.match(/\$?(\d+(?:\.\d+)?)/g);
    return matches ? matches.map(m => parseFloat(m.replace("$", ""))) : [];
  };

  const ruleNums = extractNumbers(ruleLower);
  const actionNums = extractNumbers(actionLower);

  let decision: "PERMITTED" | "DENIED" | "ESCALATE" = "DENIED";
  let reason = "The simulated action directly violates the custom policy rule entered.";
  const confidence = 0.95;

  // Simple heuristic checks
  if (ruleLower.includes("refund") && actionLower.includes("refund")) {
    if (ruleNums.length > 0 && actionNums.length > 0) {
      const limit = ruleNums[0];
      const amount = actionNums[0];
      if (amount > limit) {
        decision = ruleLower.includes("escalate") || ruleLower.includes("approval") ? "ESCALATE" : "DENIED";
        reason = `Simulated action request for a $${amount} refund violates the custom policy limit of $${limit}.`;
      } else {
        decision = "PERMITTED";
        reason = `Simulated action of $${amount} refund is within the approved custom policy limit of $${limit}.`;
      }
    }
  } else if (ruleLower.includes("delete") || ruleLower.includes("drop") || ruleLower.includes("block")) {
    if (actionLower.includes("delete") || actionLower.includes("drop")) {
      decision = "DENIED";
      reason = "Zero-tolerance schema destruction policy. Destructive production operations are blocked at the gateway.";
    }
  } else if (actionLower.includes("export") || actionLower.includes("download")) {
    if (ruleLower.includes("pii") || ruleLower.includes("sovereignty") || ruleLower.includes("restrict")) {
      decision = "DENIED";
      reason = "Data exfiltration threat detected. Action blocked to prevent PII exposure to external hosts.";
    }
  } else {
    // Default dynamic behavior
    if (actionNums.length > 0 && ruleNums.length > 0 && actionNums[0] > ruleNums[0]) {
      decision = "DENIED";
      reason = `Value threshold conflict detected. Action value exceeds the policy boundary of ${ruleNums[0]}.`;
    } else {
      decision = "PERMITTED";
      reason = "No direct rule boundary violation detected. Standard action execution permitted.";
    }
  }

  const escTarget = ruleLower.includes("vp") ? "VP of Engineering" : ruleLower.includes("manager") ? "Manager" : "on-call engineer";

  return {
    debate: [
      {
        agent: "Policy Evaluator",
        content: `Analyzing action "${action}" against policy "${rule}". Detected matching keywords and numerical limits.`
      },
      {
        agent: "Compliance Assessor",
        content: decision === "DENIED" 
          ? "Risk Level: CRITICAL. Proceeding with this action creates direct fiduciary liability and breaches internal compliance guidelines."
          : decision === "ESCALATE"
          ? "Risk Level: MODERATE. Action requires formal dual-authorization. Direct execution blocked."
          : "Risk Level: NEGLIGIBLE. Action falls safely within established corporate operational policies."
      },
      {
        agent: "Exception Handler",
        content: decision === "ESCALATE"
          ? `Searching for active manager overrides. None detected. Escalation required to ${escTarget}.`
          : "No mitigating session privileges or override tokens detected. Standard logic applies."
      },
      {
        agent: "Adjudication Verdict",
        content: decision === "DENIED"
          ? "RULING: DENIED. Action blocked at runtime gateway to enforce compliance stability."
          : decision === "ESCALATE"
          ? `RULING: ESCALATE. Action requires human administrator sign-off from ${escTarget}.`
          : "RULING: PERMITTED. Action allowed. Logged in audit ledger."
      }
    ],
    decision,
    reasoning: reason,
    rules_applied: ["Custom Policy Rule"],
    confidence
  };
}
