import Groq from 'groq-sdk';

const DEFAULT_MODEL = 'qwen/qwen3.8-27b';

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('AI service is not configured (missing GROQ_API_KEY).');
  }
  return new Groq({ apiKey });
}

export const generateAIResponse = async (
  systemPrompt: string,
  userMessage: string,
  conversationHistory: any[] = []
): Promise<string> => {
  const groq = getGroqClient();
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await groq.chat.completions.create({
      messages: messages as any,
      model,
      temperature: 0.6,
      max_completion_tokens: 2048,
      top_p: 0.95,
    });

    return response.choices[0]?.message?.content || 'I could not generate a response at this time.';
  } catch (error: any) {
    console.error('Groq API Error:', error.message);
    throw new Error('Unable to connect to the AI service. Please try again later.', { cause: error });
  }
};
