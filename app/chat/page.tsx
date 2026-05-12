"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getVisitorId } from "@/hooks/useVisitorTracker";

type TickStatus = "sending" | "sent" | "delivered" | "read";
type Step = "name" | "email" | "message";

interface Msg {
  id: string;
  type: "bot" | "user" | "system" | "error";
  text: string;
  time: string;
  status?: TickStatus;
  deletedForUser?: boolean;
}

interface ServerMessage {
  id: string;
  sender: "user" | "admin" | "system";
  text: string;
  createdAt: string;
  deletedForUser?: boolean;
}

const SESSION_KEY = "tj_chat_session";
const PAGE_LOAD_TIME = Date.now();

const INIT_MSGS: Msg[] = [
  { id: "b1", type: "bot", text: "Hey! I'm Temidayo's assistant.", time: getTime() },
  { id: "b2", type: "bot", text: "Temidayo reads every message personally and can now reply here directly.", time: getTime() },
  { id: "b3", type: "bot", text: "Start by telling me your name.", time: getTime() },
];

function getTime(value?: string | Date) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
}

function DoubleTick({ color = "#8696a0" }: { color?: string }) {
  return (
    <svg width="17" height="11" viewBox="0 0 18 11" fill="none">
      <path d="M1 5.5L5 9.5L13 1.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L9 9.5L17 1.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function mapServerMessages(messages: ServerMessage[]): Msg[] {
  return messages.map((message) => ({
    id: message.id,
    type: message.sender === "user" ? "user" : message.sender === "admin" ? "bot" : "system",
    text: message.text,
    time: getTime(message.createdAt),
    status: message.sender === "user" ? "read" : undefined,
    deletedForUser: !!message.deletedForUser,
  }));
}

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>(INIT_MSGS);
  const [step, setStep] = useState<Step>("name");
  const [input, setInput] = useState("");
  const [data, setData] = useState({ name: "", email: "" });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [restoring, setRestoring] = useState(true);
  const [hasConversation, setHasConversation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const loadConversation = useCallback(async (activeSessionId: string, initial = false) => {
    const response = await fetch(`/api/chat?sessionId=${activeSessionId}`, { cache: "no-store" });
    const payload = await response.json();

    if (!payload.session) {
      if (!initial) {
        localStorage.removeItem(SESSION_KEY);
      }
      return;
    }

    const nextName = payload.session.name || "";
    const nextEmail = payload.session.email || "";
    const serverMessages = mapServerMessages(payload.messages || []);

    setData({ name: nextName, email: nextEmail });
    setBlocked(!!payload.session.blocked);
    setRestricted(!!payload.session.restricted);
    setStatusText(payload.session.blockedReason || payload.session.restrictedReason || "");
    setStep(nextName && nextEmail ? "message" : nextName ? "email" : "name");
    setHasConversation(serverMessages.length > 0);

    if (serverMessages.length > 0) {
      setMsgs([
        ...INIT_MSGS,
        { id: `restored-${activeSessionId}`, type: "system", text: "Conversation restored", time: getTime() },
        ...serverMessages,
      ]);
    } else if (nextName && nextEmail) {
      setMsgs([
        ...INIT_MSGS,
        { id: `welcome-back-${activeSessionId}`, type: "bot", text: `Welcome back, ${nextName.split(" ")[0] || nextName}. Continue the conversation below.`, time: getTime() },
      ]);
    } else if (nextName) {
      setMsgs([
        ...INIT_MSGS,
        { id: `email-prompt-${activeSessionId}`, type: "bot", text: `Welcome back, ${nextName.split(" ")[0] || nextName}. What's your email address?`, time: getTime() },
      ]);
    } else {
      setMsgs(INIT_MSGS);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setRestoring(true);

      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.sessionId) {
            setSessionId(parsed.sessionId);
            setRestoring(false);
            loadConversation(parsed.sessionId, true).catch(() => {});
            return;
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      try {
        const fingerprint = btoa([
          navigator.userAgent,
          navigator.language,
          screen.width + "x" + screen.height,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        ].join("|")).slice(0, 32);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_session",
            fingerprint,
            visitorId: getVisitorId(),
            honeypot: "",
            timingMs: Date.now() - PAGE_LOAD_TIME,
          }),
        });

        const payload = await response.json();
        if (payload.sessionId) {
          setSessionId(payload.sessionId);
          localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId: payload.sessionId }));
          if (payload.resumed) {
            loadConversation(payload.sessionId, true).catch(() => {});
          }
        }
      } catch {}

      setRestoring(false);
    };

    init();
  }, [loadConversation]);

  useEffect(() => {
    if (!sessionId) return;

    const interval = window.setInterval(() => {
      loadConversation(sessionId).catch(() => {});
    }, 6000);

    return () => window.clearInterval(interval);
  }, [loadConversation, sessionId]);

  const addUser = useCallback((text: string): string => {
    const id = Date.now().toString();
    setMsgs((current) => [...current, { id, type: "user", text, time: getTime(), status: "sending" }]);
    setTimeout(() => setMsgs((current) => current.map((message) => message.id === id ? { ...message, status: "sent" } : message)), 200);
    setTimeout(() => setMsgs((current) => current.map((message) => message.id === id ? { ...message, status: "delivered" } : message)), 600);
    setTimeout(() => setMsgs((current) => current.map((message) => message.id === id ? { ...message, status: "read" } : message)), 1200);
    return id;
  }, []);

  const botReply = useCallback((text: string, delay = 800) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((current) => [...current, { id: `${Date.now()}-bot`, type: "bot", text, time: getTime() }]);
    }, delay);
  }, []);

  const addSystem = useCallback((text: string) => {
    setMsgs((current) => [...current, { id: `${Date.now()}-system`, type: "system", text, time: getTime() }]);
  }, []);

  const sendProfileUpdate = useCallback(async (updates: Partial<{ name: string; email: string }>) => {
    if (!sessionId) return;

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_session",
        sessionId,
        visitorId: getVisitorId(),
        timingMs: Date.now() - startTime.current,
        honeypot: "",
        ...updates,
      }),
    });
  }, [sessionId]);

  const deleteOwnMessage = useCallback(async (messageId: string) => {
    if (!sessionId) return;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_message",
          sessionId,
          messageId,
        }),
      });
      if (response.ok) {
        await loadConversation(sessionId).catch(() => {});
      }
    } catch {}
  }, [loadConversation, sessionId]);

  const send = async () => {
    if (!input.trim() || loading || blocked || restricted) return;
    const value = input.trim();
    setInput("");
    inputRef.current?.focus();
    addUser(value);

    if (step === "name") {
      if (value.length < 2 || /^\d+$/.test(value)) {
        botReply("Please enter a valid full name.");
        return;
      }

      setData((current) => ({ ...current, name: value }));
      await sendProfileUpdate({ name: value }).catch(() => {});
      botReply(`Nice to meet you, ${value.split(" ")[0]}. What's your email address?`);
      setStep("email");
      startTime.current = Date.now();
      return;
    }

    if (step === "email") {
      if (!value.includes("@") || !value.includes(".")) {
        botReply("That email doesn't look right. Try again.");
        return;
      }

      const normalizedEmail = value.toLowerCase();
      setData((current) => ({ ...current, email: normalizedEmail }));

      if (sessionId) {
        const resumeResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "resume_by_email",
            email: normalizedEmail,
            sessionId,
          }),
        }).catch(() => null);

        if (resumeResponse?.ok) {
          const resumePayload = await resumeResponse.json();
          if (resumePayload?.resumed && resumePayload.sessionId) {
            setSessionId(resumePayload.sessionId);
            localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId: resumePayload.sessionId }));
            await loadConversation(resumePayload.sessionId, true).catch(() => {});
            botReply("Welcome back. I restored your previous conversation.");
            setStep("message");
            startTime.current = Date.now();
            return;
          }
        }
      }

      await sendProfileUpdate({ email: normalizedEmail }).catch(() => {});
      botReply("Perfect. What would you like to say to Temidayo?");
      setStep("message");
      startTime.current = Date.now();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          sessionId,
          visitorId: getVisitorId(),
          name: data.name,
          email: data.email,
          message: value,
          timingMs: Date.now() - startTime.current,
          honeypot: "",
        }),
      });

      const payload = await response.json();
      if (payload.blocked) {
        setBlocked(true);
        setStatusText(payload.error || "Your session has been blocked.");
        addSystem("This chat has been blocked by the admin.");
      } else if (payload.restricted) {
        setRestricted(true);
        setStatusText(payload.error || "This conversation is currently restricted.");
        addSystem("Please exercise patience while Temidayo replies.");
      } else if (response.ok) {
        setHasConversation(true);
        addSystem("Delivered to Temidayo");
        botReply("Message received. Temidayo can now reply here directly, and you will also get an email alert.");
        await loadConversation(sessionId as string).catch(() => {});
      } else {
        botReply(payload.error || "Something went wrong. Please try again.");
      }
    } catch {
      botReply("Network error. Please check your connection.");
    }
    setLoading(false);
    startTime.current = Date.now();
  };

  const placeholder = step === "name"
    ? "Type your full name..."
    : step === "email"
      ? "Type your email address..."
      : blocked
        ? "This chat is blocked"
        : restricted
          ? "This chat is restricted"
          : hasConversation
            ? "Type your reply..."
            : "Type your message...";

  const waBg = {
    backgroundColor: "#0b141a",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='14' fill='none' stroke='%23182229' stroke-width='.7'/%3E%3C/svg%3E")`,
  };

  return (
    <main className="min-h-screen pt-20 bg-[#04040a]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <ScrollReveal><div className="section-label mb-5">Direct Line</div></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="font-display font-light text-[clamp(2rem,5vw,4rem)] text-[#eeeef5] mb-2 leading-tight">Let&apos;s talk.</h1>
          <p className="text-[#7878a0] mb-8 text-sm">Your conversation stays here. Refreshing the page will bring your previous chat back.</p>
        </ScrollReveal>

        {restoring && (
          <div className="mb-4 flex items-center gap-2 text-[#3a3a5c] font-mono text-[10px] uppercase tracking-widest">
            <span className="w-3 h-3 border-2 border-[#25d366]/30 border-t-[#25d366] rounded-full animate-spin" />
            <span>Restoring conversation...</span>
          </div>
        )}

        {(blocked || restricted) && (
          <div className="bg-red-400/10 border border-red-400/20 p-4 text-center rounded-lg mb-5">
            <p className="text-red-400 font-mono text-[10px] uppercase tracking-widest mb-2">
              {blocked ? "Chat Blocked" : "Chat Restricted"}
            </p>
            <p className="text-[#7878a0] text-sm">{statusText || "This conversation is not currently open for more messages."}</p>
          </div>
        )}

        <ScrollReveal delay={0.2}>
          <div className="rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] border border-[#1a2733]">
            <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33]">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold text-sm">TJ</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25d366] border-2 border-[#202c33] rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#e9edef] font-semibold text-sm">Temidayo Jacob</p>
                <p className="text-[#25d366] text-[11px]">replies here and by email</p>
              </div>
            </div>

            <div className="h-[460px] overflow-y-auto p-4 space-y-1" style={waBg}>
              <div className="flex justify-center mb-3">
                <span className="bg-[#182229]/90 text-[#8696a0] text-[10px] px-3 py-1 rounded-full">TODAY</span>
              </div>

              <AnimatePresence initial={false}>
                {msgs.map((msg, index) => {
                  if (msg.type === "system") {
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center my-2">
                        <span className="bg-[#182229]/90 text-[#8696a0] text-[10px] px-3 py-1 rounded-full">{msg.text}</span>
                      </motion.div>
                    );
                  }

                  if (msg.type === "error") {
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center my-2">
                        <span className="bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] px-3 py-2 rounded-lg text-center max-w-xs">{msg.text}</span>
                      </motion.div>
                    );
                  }

                  const isUser = msg.type === "user";
                  const previous = msgs[index - 1];
                  const showAvatar = !isUser && (!previous || previous.type !== "bot");

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="w-8 flex-shrink-0">
                          {showAvatar && <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold text-[10px]">TJ</div>}
                        </div>
                      )}
                      <div
                        className={`relative max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${isUser ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"}`}
                        onContextMenu={
                          isUser && !msg.deletedForUser
                            ? (event) => {
                                event.preventDefault();
                                if (window.confirm("Delete this message? It will be hidden on your side; Temidayo can still see it in admin.")) {
                                  void deleteOwnMessage(msg.id);
                                }
                              }
                            : undefined
                        }
                      >
                        <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[#8696a0] text-[10px]">{msg.time}</span>
                          {isUser && <DoubleTick color={msg.status === "read" ? "#53bdeb" : "#8696a0"} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence>
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">TJ</div>
                    <div className="bg-[#202c33] px-4 py-3 rounded-lg rounded-tl-none flex gap-1 items-center">
                      {[0, 1, 2].map((index) => (
                        <motion.span
                          key={index}
                          className="w-2 h-2 rounded-full bg-[#8696a0]"
                          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 0.9, delay: index * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-[#202c33]">
              <input
                ref={inputRef}
                type={step === "email" ? "email" : "text"}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  startTime.current = Date.now();
                }}
                onKeyDown={(event) => event.key === "Enter" && send()}
                disabled={loading || blocked || restricted}
                placeholder={placeholder}
                className="flex-1 bg-[#2a3942] text-[#e9edef] text-sm px-4 py-2.5 rounded-full outline-none placeholder:text-[#8696a0] disabled:opacity-50 transition-all"
              />
              <motion.button
                onClick={send}
                disabled={loading || blocked || restricted}
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-[#00a884] hover:bg-[#00c49a] disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                )}
              </motion.button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
