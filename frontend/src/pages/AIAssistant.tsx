import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Bot, Send, RefreshCw, AlertCircle, ChevronRight, MessageSquare, Trash2, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../services/api';
import { buildPlacementInsights } from '../utils/placementInsights';
import { calculateReadinessScore } from '../utils/readinessScore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const { currentStudent } = useSelector((state: RootState) => state.student);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const insights = buildPlacementInsights(currentStudent);
  const readinessScore = calculateReadinessScore(currentStudent);

  const suggestedPrompts = [
    "Which opportunities should I apply to first?",
    "What skills am I missing for my top matches?",
    "Create a 30-day placement preparation plan.",
    "Prepare me for a Full Stack Developer interview.",
    "Why is my match score low for some opportunities?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !currentStudent || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: messageText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setFallbackMode(false);

    try {
      const response = await api.post('/assistant/chat', {
        studentId: currentStudent._id,
        message: messageText,
        // Send up to last 10 messages for context
        conversation: messages.slice(-10)
      });
      
      const { data } = response.data;
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      
      if (data.model === 'fallback') {
        setFallbackMode(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Sorry, I encountered an error connecting to the AI service.';
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!currentStudent) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Column - Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">AI Placement Assistant</h1>
              <p className="text-blue-200 text-xs">Powered by your real PlacementOS profile</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="text-blue-200 hover:text-white p-2 transition-colors" title="Clear Conversation">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">How can I help your career today?</h3>
                <p className="text-gray-500 text-sm">
                  I can analyze your skills, explain your match scores, help you prioritize applications, or create a personalized interview prep plan.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2 text-left">
                {suggestedPrompts.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => sendMessage(prompt)}
                    className="w-full p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:text-blue-700 transition-all text-left flex items-center justify-between group shadow-sm"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {fallbackMode && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-3 text-sm text-yellow-800">
                  <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p><strong>Fallback Mode Active:</strong> The GROQ API Key is not configured on the server. The AI cannot generate dynamic responses.</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-none prose prose-sm max-w-none'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    PlacementOS AI is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your placement assistant (Shift+Enter for newline)..."
              className="w-full max-h-32 min-h-13 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-y-auto"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="bg-blue-600 text-white h-13 w-13 rounded-xl flex items-center justify-center shrink-0 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Context Snapshot (Desktop Only) */}
      <div className="hidden md:flex w-80 flex-col gap-6 shrink-0">
        <Card>
          <CardHeader className="bg-gray-50/50 pb-4">
            <CardTitle className="text-sm uppercase tracking-wider text-gray-500 font-bold">Placement Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-gray-600 text-sm font-medium">Readiness Score</span>
              <span className="text-lg font-bold text-blue-700">{readinessScore}%</span>
            </div>
            
            {insights.length > 0 ? (
              <div className="p-4 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dynamic Insights</p>
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-gray-700 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="prose prose-sm prose-p:my-0">
                      <ReactMarkdown>{insight}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center flex flex-col items-center justify-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                No insights available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
