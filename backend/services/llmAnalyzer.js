const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");

const RESPONSE_SCHEMA_HINT = `{
  "overallImpression": string,
  "suggestions": [
    { "section": string, "issue": string, "suggestion": string }
  ],
  "missingSections": [string]
}`;

const PROMPT_TEMPLATE = new PromptTemplate({
  inputVariables: ["resumeText", "targetRole", "schema"],
  template: `You are an experienced technical recruiter reviewing a resume for ATS compatibility and quality.

Target role: {targetRole}

Resume text:
"""
{resumeText}
"""

Analyze the resume and respond with ONLY valid JSON matching this exact schema, no markdown formatting, no extra text:
{schema}

Rules:
- Give 5 to 8 specific, actionable suggestions tied to actual content in the resume.
- Each suggestion must reference a real section or line, not generic advice.
- List missingSections only if genuinely absent from the resume.
- overallImpression should be 1-2 sentences.`,
});

function buildModel() {
  return new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}

function extractJson(rawOutput) {
  const stripped = rawOutput.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in LLM response");
  }

  return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
}

function validateShape(parsed) {
  if (typeof parsed.overallImpression !== "string") return false;
  if (!Array.isArray(parsed.suggestions)) return false;
  if (!Array.isArray(parsed.missingSections)) return false;

  return parsed.suggestions.every(
    (s) =>
      typeof s.section === "string" &&
      typeof s.issue === "string" &&
      typeof s.suggestion === "string"
  );
}

async function callModelOnce(model, prompt) {
  const response = await model.invoke(prompt);
  const parsed = extractJson(response.content);

  if (!validateShape(parsed)) {
    throw new Error("LLM response did not match expected schema");
  }

  return parsed;
}

async function analyzeWithLlm(resumeText, targetRole) {
  const model = buildModel();
  const prompt = await PROMPT_TEMPLATE.format({
    resumeText,
    targetRole: targetRole || "Not specified",
    schema: RESPONSE_SCHEMA_HINT,
  });

  try {
    return await callModelOnce(model, prompt);
  } catch (firstError) {
    try {
      return await callModelOnce(model, prompt);
    } catch (secondError) {
      return {
        overallImpression:
          "Automated qualitative review is temporarily unavailable. ATS score below is still valid.",
        suggestions: [],
        missingSections: [],
      };
    }
  }
}

module.exports = { analyzeWithLlm };
