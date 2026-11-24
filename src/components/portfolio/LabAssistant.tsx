'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLang } from '@/lib/lang';
import s from './LabAssistant.module.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTIONS = {
  en: ['What does Tamer do?', 'Which technologies does he use?', 'Which projects use AI?'],
  tr: ['Tamer ne yapıyor?', 'Hangi teknolojileri kullanıyor?', 'Hangi projelerde yapay zekâ var?'],
};

const TEXT = {
  en: {
    label: 'Question',
    placeholder: 'Ask about projects, skills, experience…',
    send: 'Ask',
    thinking: 'Reading the archive…',
    you: 'You',
    archive: 'Archive',
    error: 'I can’t answer right now. Please try again in a moment.',
    busy: 'The AI service is busy right now. Please try again shortly.',
    connection: 'Connection error. Please try again.',
    limit: (sec: number) => `Rate limit reached. Try again in ${sec} seconds.`,
    wait: (sec: number) => `Wait ${sec}s`,
    log: 'Conversation',
    try: 'Try',
  },
  tr: {
    label: 'Soru',
    placeholder: 'Projeler, yetenekler, deneyim hakkında sorun…',
    send: 'Sor',
    thinking: 'Arşiv okunuyor…',
    you: 'Siz',
    archive: 'Arşiv',
    error: 'Şu anda yanıt veremiyorum. Lütfen birazdan tekrar deneyin.',
    busy: 'Yapay zekâ servisi şu anda yoğun. Lütfen kısa süre sonra tekrar deneyin.',
    connection: 'Bağlantı hatası. Lütfen tekrar deneyin.',
    limit: (sec: number) => `İstek sınırına ulaşıldı. ${sec} saniye sonra tekrar deneyin.`,
    wait: (sec: number) => `${sec} sn bekleyin`,
    log: 'Sohbet',
    try: 'Deneyin',
  },
};

/** Minimal markdown: paragraphs, "- " / "* " lists and **bold** — nothing else is interpreted. */
function renderReply(text: string) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const inline = (line: string, key: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={`${key}-${i}`}>{part}</span>
      )
    );
  const flush = () => {
    if (!list.length) return;
    const items = list;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {items.map((item, i) => (
          <li key={i}>{inline(item, `li-${blocks.length}-${i}`)}</li>
        ))}
      </ul>
    );
    list = [];
  };
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (/^[-*]\s+/.test(line)) list.push(line.replace(/^[-*]\s+/, ''));
    else {
      flush();
      if (line) blocks.push(<p key={`p-${i}`}>{inline(line, `p-${i}`)}</p>);
    }
  });
  flush();
  return blocks;
}

export function LabAssistant({ context }: { context: Record<string, unknown> }) {
  const lang = useLang();
  const t = TEXT[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldown(left);
      if (left <= 0) setCooldownUntil(0);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const coolingDown = cooldown > 0;

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading || coolingDown) return;
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      setMessages((prev) => [...prev, { role: 'user', text: question }]);
      setInput('');
      setLoading(true);
      const reply = (msg: string) => setMessages((prev) => [...prev, { role: 'assistant', text: msg }]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question, history, siteData: context, language: lang }),
        });
        const data = (await res.json()) as { reply?: string; error?: string; retryAfterSec?: number };
        if (data.reply) reply(data.reply);
        else if (data.error === 'rate_limit') {
          const sec = data.retryAfterSec ?? 60;
          setCooldownUntil(Date.now() + sec * 1000);
          reply(t.limit(sec));
        } else if (data.error === 'service_unavailable') reply(t.busy);
        else reply(t.error);
      } catch {
        reply(t.connection);
      } finally {
        setLoading(false);
      }
    },
    [context, coolingDown, lang, loading, messages, t]
  );

  return (
    <div className={s.panel}>
      <div
        ref={logRef}
        className={s.log}
        role="log"
        aria-live="polite"
        aria-label={t.log}
        tabIndex={messages.length ? 0 : -1}
      >
        {messages.length === 0 ? (
          <div className={s.empty}>
            <p className="meta">{t.try}</p>
            <ul className={s.suggestions}>
              {SUGGESTIONS[lang].map((q) => (
                <li key={q}>
                  <button type="button" className={s.suggestion} onClick={() => send(q)}>
                    {q}
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`${s.msg} ${m.role === 'user' ? s.user : s.bot}`}>
              <span className={`${s.who} meta`}>{m.role === 'user' ? t.you : t.archive}</span>
              <div className={s.text}>{m.role === 'user' ? <p>{m.text}</p> : renderReply(m.text)}</div>
            </div>
          ))
        )}
        {loading && (
          <p className={`${s.thinking} meta`} role="status">
            {t.thinking}
          </p>
        )}
      </div>

      <form
        className={s.form}
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          {t.label}
        </label>
        <input
          id={inputId}
          className={s.input}
          type="text"
          value={input}
          maxLength={500}
          onChange={(e) => setInput(e.target.value)}
          placeholder={coolingDown ? t.wait(cooldown) : t.placeholder}
          disabled={loading || coolingDown}
          autoComplete="off"
        />
        <button type="submit" className={s.send} disabled={!input.trim() || loading || coolingDown}>
          {t.send}
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
      </form>
    </div>
  );
}
