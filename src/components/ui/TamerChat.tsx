'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = {
  en: [
    { icon: 'rocket_launch', text: 'What does Tamer do?' },
    { icon: 'code', text: 'Which technologies?' },
    { icon: 'psychology', text: 'Any AI projects?' },
  ],
  tr: [
    { icon: 'rocket_launch', text: 'Tamer ne yapıyor?' },
    { icon: 'code', text: 'Hangi teknolojiler?' },
    { icon: 'psychology', text: 'AI projeleri var mı?' },
  ],
};

function PulseRing() {
  return (
    <div className="relative w-2 h-2">
      <div className="absolute inset-0 rounded-full bg-emerald-400" />
      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-[chat-pulse_2s_ease-in-out_infinite]" />
    </div>
  );
}

function NeuralLoader() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-primary/70"
            animate={{
              height: [8, 16, 8, 20, 8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.12,
              ease: 'easeInOut',
            }}
            style={{ height: 8 }}
          />
        ))}
      </div>
      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tracking-wider chat-shimmer">
        processing
      </span>
    </div>
  );
}

function parseMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const parseLine = (line: string, key: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index));
        }
        parts.push(<strong key={`${key}-b-${partKey++}`} className="font-semibold">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(remaining);
        break;
      }
    }
    return <span key={key}>{parts}</span>;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-1.5">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.slice(2);
      listItems.push(<li key={`li-${i}`}>{parseLine(content, `li-c-${i}`)}</li>);
    } else {
      flushList();
      if (trimmed) {
        elements.push(<p key={`p-${i}`} className="my-1">{parseLine(trimmed, `p-c-${i}`)}</p>);
      }
    }
  });
  flushList();

  return <>{elements}</>;
}

function MessageItem({ message, isLast }: { message: ChatMessage; isLast: boolean }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp);
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

  return (
    <motion.div
      className={`relative group ${isUser ? 'pl-8' : 'pr-6'}`}
      initial={isLast ? { opacity: 0, y: 12, filter: 'blur(4px)' } : false}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {!isUser && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
      )}

      <div className={`relative ${isUser ? 'ml-auto' : 'ml-3'}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[12px] text-primary/60">auto_awesome</span>
            <span className="text-[10px] font-mono text-primary/50 tracking-wider uppercase">tamer.ai</span>
            <span className="text-[9px] text-slate-400/50 dark:text-slate-600/50 font-mono ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {timeStr}
            </span>
          </div>
        )}

        <div
          className={`text-[13px] leading-[1.65] ${
            isUser
              ? 'chat-user-bubble text-white px-4 py-2.5 rounded-2xl rounded-tr-sm'
              : 'text-slate-600 dark:text-slate-300/90 px-1'
          }`}
        >
          {isUser ? message.text : parseMarkdown(message.text)}
        </div>

        {isUser && (
          <div className="flex justify-end mt-0.5">
            <span className="text-[9px] text-slate-400/40 dark:text-slate-600/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {timeStr}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TamerChat() {
  const language = useAppStore((s) => s.language);
  const siteData = useAppStore((s) => s.siteData);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setHasInteracted(true);
    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));

      let data: { reply?: string; error?: string } | null = null;
      const MAX_RETRIES = 2;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), history, siteData, language }),
        });
        data = await res.json();

        if (data?.error === 'rate_limit' && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        break;
      }

      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data!.reply!, timestamp: Date.now() },
        ]);
      } else if (data?.error === 'rate_limit') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: language === 'tr'
              ? 'Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin.'
              : 'Too many requests. Please wait a few seconds and try again.',
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: language === 'tr'
              ? 'Şu anda yanıt veremiyorum, lütfen tekrar deneyin.'
              : 'I cannot respond right now, please try again.',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: language === 'tr'
            ? 'Bağlantı hatası oluştu, tekrar deneyin.'
            : 'Connection error, please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language, messages, siteData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const suggestions = SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.en;

  return (
    <div className="flex flex-col h-full chat-container">
      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none chat-scanlines rounded-2xl z-20" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 pb-3 mb-1 border-b border-slate-200/30 dark:border-slate-700/20">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-cyan-400 flex items-center justify-center chat-icon-glow">
            <span className="material-symbols-outlined text-white text-[18px]">neurology</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold tracking-tight truncate">
              Tamer AI
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10">
              <PulseRing />
              <span className="text-[9px] font-semibold tracking-wide text-emerald-500">
                online
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wide mt-0.5">
            {language === 'tr' ? 'kişisel asistan' : 'personal assistant'}
          </p>
        </div>
        <div className="flex gap-[3px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-primary/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0 space-y-4 py-3 pr-1 chat-scroll relative z-10">
        {!hasInteracted && (
          <motion.div
            className="flex flex-col items-center justify-center h-full gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {/* Neural icon */}
            <div className="relative">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 via-blue-400/5 to-cyan-400/10 flex items-center justify-center border border-primary/10"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="material-symbols-outlined text-primary/60 text-3xl">hub</span>
              </motion.div>
              <motion.div
                className="absolute -inset-2 rounded-3xl bg-primary/5 -z-10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {language === 'tr' ? 'Tamer hakkında her şeyi biliyorum' : 'I know everything about Tamer'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                {language === 'tr' ? 'bir soru ile başlayın' : 'start with a question'}
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-col gap-2 w-full">
              {suggestions.map((q, i) => (
                <motion.button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="group w-full text-left px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-slate-200/40 dark:border-slate-700/20 hover:border-primary/30 dark:hover:border-primary/20 hover:bg-primary/[0.03] transition-all duration-300 flex items-center gap-3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <span className="material-symbols-outlined text-primary/50 text-sm group-hover:text-primary/80 transition-colors">
                      {q.icon}
                    </span>
                  </div>
                  <span className="text-[12px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    {q.text}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-700 ml-auto group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageItem key={`${msg.timestamp}-${i}`} message={msg} isLast={i === messages.length - 1} />
          ))}
        </AnimatePresence>

        {isLoading && <NeuralLoader />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative z-10 mt-2">
        <div className="relative chat-input-wrapper rounded-xl overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'tr' ? 'Tamer hakkında sor...' : 'Ask about Tamer...'}
            disabled={isLoading}
            className="w-full h-11 pl-4 pr-12 bg-white/50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-slate-700/20 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400/70 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:bg-white/70 dark:focus:bg-white/[0.05] transition-all duration-300 disabled:opacity-40 font-mono"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white disabled:opacity-20 disabled:grayscale hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-90"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
          </button>
        </div>
      </form>
    </div>
  );
}
