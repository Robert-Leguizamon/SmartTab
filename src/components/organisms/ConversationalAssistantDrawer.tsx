import React, { useEffect, useRef, useState } from 'react';
import { Bot, ExternalLink, Send, Sparkles, User, X } from 'lucide-react';
import { ChatMessage } from '../../../shared/types';
import { sendChatMessageApi } from '../../api/archiveApi';
import { useArchiveStore } from '../../store/useArchiveStore';
import { Button } from '../atoms/Button';

export const ConversationalAssistantDrawer: React.FC = () => {
  const { isChatOpen, setIsChatOpen, setSelectedArchive } = useArchiveStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Hi! I am **Smart Tab Copilot**. Ask me anything about your saved tabs, research notes, YouTube videos, and AI chats (e.g. *"What did the video on AI agents conclude?"* or *"Summarize the Rust borrow checker concepts"*).',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isChatOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const reply = await sendChatMessageApi({ messages: history });
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue retrieving insights. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/50">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
              <span>Smart Tab Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </h3>
            <p className="text-xs text-neutral-400 font-mono">Hybrid Vector + Gemini Memory</p>
          </div>
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
              {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-indigo-400" />}
              <span>{m.role === 'user' ? 'You' : 'Smart Tab Copilot'}</span>
            </div>

            <div
              className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs'
                  : 'bg-neutral-850 text-neutral-200 border border-neutral-750 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Citations list */}
              {m.citedArchives && m.citedArchives.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-neutral-750/70 space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase text-indigo-400 tracking-wider">
                    Cited Archives:
                  </div>
                  {m.citedArchives.map((cite) => (
                    <div
                      key={cite.id}
                      className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-750 text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-1 font-medium text-neutral-200">
                        <span className="truncate">{cite.title}</span>
                        <a
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-neutral-400 text-[10px] line-clamp-1">{cite.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
            <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Searching vector memory and synthesizing insights...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-neutral-800 bg-neutral-850 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question across all your tabs..."
          disabled={isLoading}
          className="flex-1 rounded-xl bg-neutral-900 border border-neutral-750 px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!input.trim() || isLoading}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
