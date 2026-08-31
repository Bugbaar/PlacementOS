"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIResponse = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Ensure it doesn't crash on boot if missing, just log a warning.
const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
let groq = null;
if (apiKey) {
    groq = new groq_sdk_1.default({ apiKey });
}
else {
    console.warn('⚠️ GROQ_API_KEY is missing. AI Placement Assistant will use fallback mode.');
}
const generateAIResponse = async (systemPrompt, userMessage, conversationHistory = []) => {
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
            messages: messages,
            model: model,
            temperature: 0.7,
            max_tokens: 1024,
        });
        return response.choices[0]?.message?.content || 'I could not generate a response at this time.';
    }
    catch (error) {
        console.error('Groq API Error:', error.message);
        throw new Error('Unable to connect to the AI service. Please try again later.');
    }
};
exports.generateAIResponse = generateAIResponse;
