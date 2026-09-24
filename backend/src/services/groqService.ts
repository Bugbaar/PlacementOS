import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Ensure it doesn't crash on boot if missing, just log a warning.
const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

let groq: Groq | null = null;

if (apiKey) {
  groq = new Groq({ apiKey });
} else {
  console.warn('⚠️ GROQ_API_KEY is missing. AI Placement Assistant will use fallback mode.');
}

export const generateAIResponse = async (systemPrompt: string, userMessage: string, conversationHistory: any[] = []): Promise<string> => {
  if (!groq) {
    throw new Error('AI service is not configured (missing GROQ_API_KEY).');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await groq.chat.completions.create({
      messages: messages as any,
      model: model,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content || 'I could not generate a response at this time.';
  } catch (error: any) {
    console.error('Groq API Error:', error.message);
    throw new Error('Unable to connect to the AI service. Please try again later.');
  }
};
