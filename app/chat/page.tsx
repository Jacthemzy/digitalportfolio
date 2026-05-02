"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

type TickStatus = "sending" | "sent" | "delivered" | "read";
type Step = "name" | "email" | "message" | "done";

interface Msg {
  id: string;
  type: "bot" | "user" | "system" | "error";
  text: string;
  time: string;
  status?: TickStatus;
}

const getTime = () => new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
const SESSION_KEY = "tj_chat_session";

// Track when page loaded (for timing check)
const PAGE_LOAD_TIME = Date.now();

function DoubleTick({ color = "#8696a0" }: { color?: string }) {
  return (
    <svg width="17" height="11" viewBox="0 0 18 11" fill="none">
      <path d="M1 5.5L5 9.5L13 1.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L9 9.5L17 1.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const INIT_MSGS: Msg[] = [
  { id: "b1", type: "bot", text: "Hey! 👋 I'm Temidayo's assistant.", time: getTime() },
  { id: "b2", type: "bot", text: "He reads every message personally — usually within minutes 😊", time: getTime() },
  { id: "b3", type: "bot", text: "Start by telling me your name 👇", time: getTime() },
];

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>(INIT_MSGS);
  const [step, setStep] = useState<Step>("name");
  const [input, setInput] = useState("");
  const [data, setData] = useState({ name: "", email: "" });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(Date.now());

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  // ── INIT: Create or resume session ──
  useEffect(() => {
    const init = async () => {
      setInitLoading(true);

      // Check localStorage for existing session
      const savedSession = localStorage.getItem(SESSION_KEY);
      let resumeSessionId: string | null = null;

      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          resumeSessionId = parsed.sessionId;

          // Verify session is still valid on server
          const verifyRes = await fetch(`/api/chat?sessionId=${parsed.sessionId}`);
          const verifyData = await verifyRes.json();

          if (verifyData.session?.completed) {
            // Already completed — restore done state
            setSessionId(parsed.sessionId);
            setStep("done");
            setData({ name: verifyData.session.name || "", email: verifyData.session.email || "" });
            setMsgs([
              ...INIT_MSGS,
              { id: "restored", type: "system", text: "Previous conversation restored", time: getTime() },
              { id: "done1", type: "bot", text: "✅ Your message was already sent! Temidayo will get back to you personally.", time: getTime() },
              { id: "done2", type: "bot", text: "Feel free to explore the portfolio while you wait 👇", time: getTime() },
            ]);
            setInitLoading(false);
            return;
          } else if (verifyData.session) {
            // Resume incomplete session
            setSessionId(parsed.sessionId);
            setData({ name: verifyData.session.name || "", email: verifyData.session.email || "" });

            // Figure out where they left off
            if (verifyData.session.name && verifyData.session.email) {
              setStep("message");
              setMsgs([
                ...INIT_MSGS,
                { id: "resumed", type: "system", text: "Session resumed", time: getTime() },
                { id: "rb1", type: "bot", text: `Welcome back, ${verifyData.session.name}! 👋 What would you like to say to Temidayo?`, time: getTime() },
              ]);
            } else if (verifyData.session.name) {
              setStep("email");
              setData(d => ({ ...d, name: verifyData.session.name }));
              setMsgs([
                ...INIT_MSGS,
                { id: "resumed", type: "system", text: "Session resumed", time: getTime() },
                { id: "rb1", type: "bot", text: `Welcome back, ${verifyData.session.name}! 👋 What's your email address?`, time: getTime() },
              ]);
            }

            setInitLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      // Create new session
      try {
        // Generate browser fingerprint (basic)
        const fingerprint = btoa([
          navigator.userAgent,
          navigator.language,
          screen.width + "x" + screen.height,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        ].join("|")).slice(0, 32);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_session",
            fingerprint,
            honeypot: "", // Always empty — bots fill this
          }),
        });

        const d = await res.json();

        if (res.status === 429) {
          setBlocked(true);
          setMsgs([
            { id: "rl1", type: "error", text: d.error || "Too many requests. Please try again later.", time: getTime() },
          ]);
          setInitLoading(false);
          return;
        }

        if (d.sessionId) {
          setSessionId(d.sessionId);
          localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId: d.sessionId, createdAt: Date.now() }));

          if (d.resumed) {
            // Resumed existing session
            setData({ name: d.name || "", email: d.email || "" });
            if (d.completed) {
              setStep("done");
              setMsgs([
                ...INIT_MSGS,
                { id: "resumed", type: "system", text: "Previous session restored", time: getTime() },
                { id: "rb1", type: "bot", text: "✅ You already sent a message! Temidayo will get back to you.", time: getTime() },
              ]);
            } else if (d.name && d.email) {
              setStep("message");
              setMsgs([...INIT_MSGS, { id: "rb1", type: "bot", text: `Welcome back, ${d.name}! What would you like to say to Temidayo?`, time: getTime() }]);
            } else if (d.name) {
              setStep("email");
              setMsgs([...INIT_MSGS, { id: "rb1", type: "bot", text: `Welcome back, ${d.name}! What's your email?`, time: getTime() }]);
            }
          }
        }
      } catch {
        // Continue without session (fallback mode)
      }

      setInitLoading(false);
    };

    init();
  }, []);

  const addUser = useCallback((text: string): string => {
    const id = Date.now().toString();
    setMsgs(p => [...p, { id, type: "user", text, time: getTime(), status: "sending" }]);
    setTimeout(() => setMsgs(p => p.map(m => m.id === id ? { ...m, status: "sent" } : m)), 400);
    setTimeout(() => setMsgs(p => p.map(m => m.id === id ? { ...m, status: "delivered" } : m)), 900);
    setTimeout(() => setMsgs(p => p.map(m => m.id === id ? { ...m, status: "read" } : m)), 1800);
    return id;
  }, []);

  const botReply = useCallback((text: string, delay = 1000) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, { id: Date.now() + "b", type: "bot", text, time: getTime() }]);
    }, delay);
  }, []);

  const addSystem = useCallback((text: string) => {
    setMsgs(p => [...p, { id: Date.now() + "s", type: "system", text, time: getTime() }]);
  }, []);

  const send = async () => {
    if (!input.trim() || loading || step === "done" || blocked) return;
    const val = input.trim();
    setInput("");
    inputRef.current?.focus();

    // Timing check — how long since they started typing
    const timingMs = Date.now() - startTime.current;

    addUser(val);

    if (step === "name") {
      // Basic validation
      if (val.length < 2) { botReply("Please enter your full name. 😊", 600); return; }
      if (/^\d+$/.test(val)) { botReply("That doesn't look like a name. Please enter your full name.", 600); return; }

      const newName = val;
      setData(d => ({ ...d, name: newName }));

      // Send to server
      if (sessionId) {
        try {
          await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "send_message",
              sessionId,
              name: newName,
              message: `[Name provided: ${newName}]`,
              timingMs,
              honeypot: "",
            }),
          });
        } catch {}
      }

      botReply(`Nice to meet you, ${newName.split(" ")[0]}! 😊 What's your email so Temidayo can reply?`);
      setStep("email");
      startTime.current = Date.now();

    } else if (step === "email") {
      if (!val.includes("@") || !val.includes(".")) { botReply("That email doesn't look right. Try again? 🙏", 700); return; }

      const newEmail = val;
      setData(d => ({ ...d, email: newEmail }));

      if (sessionId) {
        try {
          await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "send_message",
              sessionId,
              email: newEmail,
              message: `[Email provided: ${newEmail}]`,
              timingMs,
              honeypot: "",
            }),
          });
        } catch {}
      }

      botReply("Perfect! 🎯 What would you like to say to Temidayo?");
      setStep("message");
      startTime.current = Date.now();

    } else if (step === "message") {
      setLoading(true);
      botReply("Sending your message... 📨", 700);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_message",
            sessionId,
            name: data.name,
            email: data.email,
            message: val,
            timingMs,
            honeypot: "",
          }),
        });

        const result = await res.json();

        if (result.blocked) {
          setBlocked(true);
          setTimeout(() => setMsgs(p => [...p, { id: "block1", type: "error", text: "⚠️ Your session has been flagged. Please contact Temidayo directly at jacobtemidayo068@gmail.com", time: getTime() }]), 1200);
        } else if (res.status === 429) {
          setTimeout(() => setMsgs(p => [...p, { id: "rl1", type: "error", text: result.error || "Slow down! Please wait before sending another message.", time: getTime() }]), 1200);
        } else if (res.ok) {
          // Update local storage with completed flag
          const saved = localStorage.getItem(SESSION_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            localStorage.setItem(SESSION_KEY, JSON.stringify({ ...parsed, completed: true }));
          }

          setTimeout(() => addSystem(`Delivered to Temidayo · ${getTime()}`), 1400);
          setTimeout(() => botReply("✅ Message received! Temidayo will get back to you personally.", 200), 2000);
          setTimeout(() => botReply("Feel free to explore the portfolio while you wait 👇", 200), 3200);
          setStep("done");
        } else {
          botReply(result.error || "Something went wrong. Please try again.", 1000);
        }
      } catch {
        botReply("Network error. Please check your connection.", 1000);
      }
      setLoading(false);
    }
  };

  const placeholders: Record<Step, string> = {
    name: "Type your full name...",
    email: "Type your email address...",
    message: "Type your message...",
    done: "Message sent successfully ✅",
  };

  const waBg = {
    backgroundColor: "#0b141a",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='14' fill='none' stroke='%23182229' stroke-width='.7'/%3E%3C/svg%3E")`,
  };

  if (initLoading) return (
    <main className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#25d366]/30 border-t-[#25d366] rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">Loading chat...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pt-20 bg-[#04040a]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <ScrollReveal><div className="section-label mb-5">Direct Line</div></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="font-display font-light text-[clamp(2rem,5vw,4rem)] text-[#eeeef5] mb-2 leading-tight">Let&apos;s talk.</h1>
          <p className="text-[#7878a0] mb-8 text-sm">The only way to reach Temidayo directly. Every message is read personally.</p>
        </ScrollReveal>

        {blocked ? (
          <div className="bg-red-400/10 border border-red-400/20 p-6 text-center rounded-lg">
            <p className="text-red-400 font-mono text-[10px] uppercase tracking-widest mb-2">⚠️ Session Blocked</p>
            <p className="text-[#7878a0] text-sm mb-4">Suspicious activity detected. Please contact Temidayo directly:</p>
            <a href="mailto:jacobtemidayo068@gmail.com" className="text-[#e8c547] font-mono text-sm hover:underline">jacobtemidayo068@gmail.com</a>
          </div>
        ) : (
          <ScrollReveal delay={0.2}>
            {/* Hidden honeypot - bots fill this, humans don't see it */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
              <input tabIndex={-1} name="website" id="honeypot_field" autoComplete="off" />
            </div>

            <div className="rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] border border-[#1a2733]">
              {/* WhatsApp Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33]">
                <svg className="w-5 h-5 text-[#aebac1] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold text-sm">TJ</div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25d366] border-2 border-[#202c33] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#e9edef] font-semibold text-sm">Temidayo Jacob</p>
                  <p className="text-[#25d366] text-[11px]">online</p>
                </div>
                <div className="flex items-center gap-4 text-[#aebac1]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[460px] overflow-y-auto p-4 space-y-1" style={waBg}>
                <div className="flex justify-center mb-3">
                  <span className="bg-[#182229]/90 text-[#8696a0] text-[10px] px-3 py-1 rounded-full">TODAY</span>
                </div>

                <AnimatePresence initial={false}>
                  {msgs.map((msg, idx) => {
                    if (msg.type === "system") return (
                      <motion.div key={msg.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="flex justify-center my-2">
                        <span className="bg-[#182229]/90 text-[#8696a0] text-[10px] px-3 py-1 rounded-full">{msg.text}</span>
                      </motion.div>
                    );

                    if (msg.type === "error") return (
                      <motion.div key={msg.id} initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex justify-center my-2">
                        <span className="bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] px-3 py-2 rounded-lg text-center max-w-xs">{msg.text}</span>
                      </motion.div>
                    );

                    const isUser = msg.type === "user";
                    const prevMsg = msgs[idx - 1];
                    const showAvatar = !isUser && (!prevMsg || prevMsg.type !== "bot");

                    return (
                      <motion.div key={msg.id} initial={{ opacity:0, y:10, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                        transition={{ duration:0.25 }} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                        {!isUser && (
                          <div className="w-8 flex-shrink-0">
                            {showAvatar && <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold text-[10px]">TJ</div>}
                          </div>
                        )}
                        <div className={`relative max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${isUser ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"}`} style={{ minWidth:"80px" }}>
                          {isUser && <div className="absolute -top-0 -right-2 w-0 h-0" style={{ borderLeft:"8px solid #005c4b", borderTop:"8px solid transparent" }} />}
                          {!isUser && showAvatar && <div className="absolute -top-0 -left-2 w-0 h-0" style={{ borderRight:"8px solid #202c33", borderTop:"8px solid transparent" }} />}
                          <p className="text-[13px] leading-relaxed break-words">{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[#8696a0] text-[10px]">{msg.time}</span>
                            {isUser && <DoubleTick color={msg.status === "read" ? "#53bdeb" : "#8696a0"} />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {typing && (
                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="flex items-end gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">TJ</div>
                      <div className="bg-[#202c33] px-4 py-3 rounded-lg rounded-tl-none flex gap-1 items-center">
                        {[0,1,2].map(i => (
                          <motion.span key={i} className="w-2 h-2 rounded-full bg-[#8696a0]"
                            animate={{ y:[0,-5,0], opacity:[0.4,1,0.4] }}
                            transition={{ repeat:Infinity, duration:0.9, delay:i*0.2 }} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#202c33]">
                <button className="text-[#aebac1] p-1 flex-shrink-0 hover:text-[#e9edef] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                </button>
                <input
                  ref={inputRef}
                  type={step === "email" ? "email" : "text"}
                  value={input}
                  onChange={e => { setInput(e.target.value); startTime.current = Date.now(); }}
                  onKeyDown={e => e.key === "Enter" && send()}
                  disabled={step === "done" || loading || blocked}
                  placeholder={placeholders[step]}
                  className="flex-1 bg-[#2a3942] text-[#e9edef] text-sm px-4 py-2.5 rounded-full outline-none placeholder:text-[#8696a0] disabled:opacity-50 transition-all"
                />
                <button className="text-[#aebac1] p-1 flex-shrink-0 hover:text-[#e9edef] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                </button>
                <motion.button onClick={send} disabled={step === "done" || loading || blocked} whileTap={{ scale:0.9 }}
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-[#00a884] hover:bg-[#00c49a] disabled:opacity-50 transition-all">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  }
                </motion.button>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Info cards */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon:"⚡", label:"Response", val:"Within minutes" },
              { icon:"🔒", label:"Secured", val:"Anti-spam protected" },
              { icon:"📬", label:"Delivery", val:"Email + Dashboard" },
            ].map((item,i) => (
              <div key={i} className="p-4 bg-[#0c0c18] border border-[#1a1a30] text-center rounded-lg">
                <div className="text-lg mb-2">{item.icon}</div>
                <p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest">{item.label}</p>
                <p className="text-[#eeeef5] text-xs mt-1">{item.val}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
