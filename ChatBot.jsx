import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { Tooltip } from './Tooltip';
import { HAMCSLogo } from './HAMCSLogo';
import { HiOutlineRefresh, HiOutlineExclamation, HiOutlineLink, HiOutlineInformationCircle, HiSparkles } from 'react-icons/hi';
import { IoSend } from 'react-icons/io5';

// Simple markdown parser for basic formatting
function renderMarkdown(text) {
  if (!text) return '';

  // Process the text line by line for better control
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeContent = [];

  lines.forEach((line, i) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-slate-100 rounded-lg p-3 my-2 overflow-x-auto text-xs border border-slate-200">
            <code className="text-sky-700">{codeContent.join('\n')}</code>
          </pre>
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-slate-900 font-semibold mt-3 mb-1">{line.slice(4)}</h3>);
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-slate-900 font-semibold text-lg mt-3 mb-1">{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-slate-900 font-bold text-xl mt-3 mb-1">{line.slice(2)}</h1>);
      return;
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-sky-600">•</span>
          <span>{parseInline(line.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-sky-600 min-w-[1.5rem]">{numberedMatch[1]}.</span>
          <span>{parseInline(numberedMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(<p key={i} className="my-0.5">{parseInline(line)}</p>);
  });

  return elements;
}

// Parse inline markdown (bold, italic, code, links)
function parseInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic *text*
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    // Inline code `code`
    const codeMatch = remaining.match(/`([^`]+)`/);

    // Find the earliest match
    let earliest = null;
    let earliestIndex = remaining.length;

    if (boldMatch && boldMatch.index < earliestIndex) {
      earliest = { type: 'bold', match: boldMatch };
      earliestIndex = boldMatch.index;
    }
    if (codeMatch && codeMatch.index < earliestIndex) {
      earliest = { type: 'code', match: codeMatch };
      earliestIndex = codeMatch.index;
    }
    if (italicMatch && italicMatch.index < earliestIndex && (!boldMatch || italicMatch.index !== boldMatch.index)) {
      earliest = { type: 'italic', match: italicMatch };
      earliestIndex = italicMatch.index;
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    // Add text before match
    if (earliestIndex > 0) {
      parts.push(remaining.slice(0, earliestIndex));
    }

    // Add formatted element
    const { type, match } = earliest;
    if (type === 'bold') {
      parts.push(<strong key={key++} className="font-semibold text-slate-900">{match[1]}</strong>);
    } else if (type === 'italic') {
      parts.push(<em key={key++} className="italic text-slate-700">{match[1]}</em>);
    } else if (type === 'code') {
      parts.push(<code key={key++} className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 text-xs border border-slate-200">{match[1]}</code>);
    }

    remaining = remaining.slice(earliestIndex + match[0].length);
  }

  return parts;
}

export function ChatBot({ decisions }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your HAMCS assistant. I can help you make decisions based on your past reasoning patterns. What would you like to know?",
      sender: 'bot',
      references: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      references: []
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const result = await api.chat(input);

      const botMessage = {
        id: messages.length + 2,
        text: result.response,
        sender: 'bot',
        references: result.relevantMemories || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err.message);
      const errorMessage = {
        id: messages.length + 2,
        text: err.message || 'Something went wrong. Please try again.',
        sender: 'error',
        references: [],
        retryAfter: err.retryAfter || null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      text: "Chat cleared. How can I help you?",
      sender: 'bot',
      references: []
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
            <HAMCSLogo className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-900">AI Assistant</span>
        </div>
        <Tooltip text="Clear Chat" position="bottom">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="fade-in">
              {msg.sender === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-sky-600 rounded-2xl rounded-br-md px-4 py-2.5">
                    <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ) : msg.sender === 'error' ? (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <HiOutlineExclamation className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-bl-md px-4 py-3">
                      <p className="text-sm text-amber-900 leading-relaxed">{msg.text}</p>
                      {msg.retryAfter && (
                        <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1">
                          <HiOutlineRefresh className="w-3 h-3" />
                          Try again in about {msg.retryAfter} seconds
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                    <HAMCSLogo className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2.5">
                      <div className="text-sm text-slate-900 leading-relaxed">
                        {renderMarkdown(msg.text)}
                      </div>
                    </div>

                    {msg.references && msg.references.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium flex items-center gap-1">
                          <HiOutlineLink className="w-3 h-3" />
                          References
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.references.map((ref) => (
                            <div
                              key={ref.id}
                              className="text-[10px] bg-sky-100 border border-sky-200 rounded-lg px-2 py-1 text-sky-900"
                            >
                              {ref.summary}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 fade-in">
              <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                <HAMCSLogo className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-sky-500 rounded-full pulse-soft" />
                  <div className="w-2 h-2 bg-sky-500 rounded-full pulse-soft" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-sky-500 rounded-full pulse-soft" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <form onSubmit={handleSend} className="relative">
            <div className="bg-slate-50 border border-slate-300 rounded-2xl focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={loading}
                rows={1}
                className="w-full bg-transparent px-4 py-2.5 pr-12 text-sm text-slate-900 placeholder-slate-400 resize-none outline-none"
                style={{ maxHeight: '150px' }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`absolute right-3 bottom-2.5 p-1.5 rounded-lg transition-all ${loading || !input.trim()
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95'
                  }`}
              >
                <IoSend className="w-4 h-4" />
              </button>
            </div>

            {decisions.length === 0 && (
              <p className="text-[10px] text-slate-600 mt-1.5 text-center flex items-center justify-center gap-1">
                <HiOutlineInformationCircle className="w-3 h-3" />
                Log decisions for personalized responses
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
