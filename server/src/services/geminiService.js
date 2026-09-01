import config from '../config/index.js';
import logger from '../utils/logger.js';

class GeminiService {
  constructor() {
    this.apiKey = config.geminiApiKey;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    this.timeout = 30000;
  }

  async generateContent(prompt, systemInstruction = '') {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not configured. Please add your API key to .env file.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(systemInstruction && {
            systemInstruction: { parts: [{ text: systemInstruction }] },
          }),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`Gemini API Error ${response.status}: ${errorBody}`);
        
        if (response.status === 404) {
          throw new Error('Gemini model not found. Please check model name or API version.');
        } else if (response.status === 400) {
          throw new Error('Invalid request to Gemini API. Check your prompt format.');
        } else if (response.status === 403) {
          throw new Error('Gemini API key invalid or expired. Please get a valid key from https://aistudio.google.com/app/apikey');
        } else if (response.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please wait and try again.');
        } else if (response.status >= 500) {
          throw new Error('Gemini API server error. Please try again later.');
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message}`);
      }
      
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!outputText) {
        throw new Error('Gemini API returned empty response');
      }
      
      return outputText;
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        logger.error(`Gemini API timeout after ${this.timeout}ms`);
        throw new Error(`Gemini API request timed out after ${this.timeout}ms`);
      }
      
      logger.error('Gemini API Error: ' + err.message);
      throw err;
    }
  }

  async analyzeResume(resumeText, targetRole = 'Software Engineer') {
    const systemPrompt = `You are an expert Technical Recruiter and ATS (Applicant Tracking System) intelligence engine for campus placements.
Analyze the provided resume text thoroughly and output ONLY valid JSON matching this exact structure:
{
  "atsScore": number between 45 and 98,
  "parsedSkills": ["Skill 1", "Skill 2", ...],
  "strengths": ["Clear strength 1 with explanation", "Strength 2", ...],
  "improvements": ["Actionable improvement 1", "Improvement 2", ...],
  "summary": "2-3 sentence overview of candidate profile quality",
  "missingKeywords": ["Crucial keyword 1", "Keyword 2", ...]
}`;

    const userPrompt = `Target Role: ${targetRole}\n\nResume Content:\n${resumeText}`;
    const rawResponse = await this.generateContent(userPrompt, systemPrompt);

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in Gemini response');
    } catch (parseErr) {
      logger.error('Failed to parse Gemini JSON: ' + parseErr.message);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  async chatAssistant(messages, userContext = {}) {
    const systemPrompt = `You are "PlacementOS AI Coach", an empathetic, highly skilled campus placement mentor and technical interview advisor.
You help college students with DSA, System Design, STAR behavioral tips, and placement roadmaps.
Context about student:
Name: ${userContext.name || 'Student'}
Branch: ${userContext.branch || 'Engineering'}
CGPA: ${userContext.cgpa || 'N/A'}
Skills: ${(userContext.skills || []).join(', ') || 'Software Development'}
`;

    const conversation = messages.map(m => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n\n');
    const fullPrompt = `${conversation}\n\nCoach:`;

    const aiResponse = await this.generateContent(fullPrompt, systemPrompt);
    return aiResponse.trim();
  }
}

export default new GeminiService();
