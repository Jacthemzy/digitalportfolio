"use client";
import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

const philosophy = [
  { icon: "◈", title: "Systems Thinking", desc: "I don't see isolated problems — I see interconnected systems. Every decision I make considers upstream causes and downstream effects." },
  { icon: "◎", title: "User Obsession", desc: "Great products are built for humans first. I start with the person and work backwards to the solution, never the other way around." },
  { icon: "◇", title: "Data + Intuition", desc: "Numbers tell you what happened. Intuition tells you why. The best decisions live at the intersection of both." },
  { icon: "△", title: "Relentless Iteration", desc: "Version one is never the answer. I ship, measure, learn, and improve — every single time, without exception." },
];

const timeline = [
  { year: "2024 – Now", role: "Senior Product Manager", place: "Stealth Startup · Lagos", desc: "Leading product strategy for a B2B SaaS platform targeting African SMEs. Managing cross-functional squad of 8 across product, design, and engineering." },
  { year: "2022 – 2024", role: "Digital Marketing Lead", place: "Growth Studio · Remote", desc: "Scaled 5 client brands to $500K+ MRR. Managed $2M+ annual ad spend across Meta, Google, and TikTok with average 6.4x ROAS." },
  { year: "2020 – 2022", role: "Full-Stack Developer", place: "Freelance", desc: "Delivered 20+ production web applications for clients across fintech, e-commerce, and edtech. React · Node.js · MongoDB · PostgreSQL." },
  { year: "2016 – 2020", role: "B.Sc. Computer Science", place: "University of Lagos · First Class Honours", desc: "CGPA 4.71/5.00 · President, Tech Innovation Society · Best Final Year Project Award — AI-based fraud detection system." },
];

interface Achievement {
  _id: string;
  type: "certificate" | "award" | "press";
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  icon: string;
}

const typeColors: Record<string, { border: string; text: string }> = {
  certificate: { border: "rgba(232,197,71,0.3)", text: "#e8c547" },
  award: { border: "rgba(167,139,250,0.3)", text: "#a78bfa" },
  press: { border: "rgba(79,195,247,0.3)", text: "#4fc3f7" },
};

const fallbackAchievements: Achievement[] = [
  { _id: "1", type: "certificate", title: "Google Analytics Individual Qualification", issuer: "Google", date: "2023", credentialId: "GA-2023-XXXX", icon: "🏅" },
  { _id: "2", type: "certificate", title: "Meta Blueprint — Media Buying Professional", issuer: "Meta", date: "2022", credentialId: "MB-2022-XXXX", icon: "🎯" },
  { _id: "3", type: "award", title: "Best Final Year Project — AI Fraud Detection", issuer: "University of Lagos", date: "2020", icon: "🏆" },
  { _id: "4", type: "certificate", title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2021", credentialId: "AWS-2021-XXXX", icon: "☁️" },
  { _id: "5", type: "press", title: "Top 30 Product Managers to Watch in Africa", issuer: "TechCabal", date: "January 2024", icon: "📰" },
  { _id: "6", type: "award", title: "Young Innovator of the Year — Lagos Tech Fest", issuer: "Lagos Tech Community", date: "2023", icon: "⭐" },
];

export default function AboutPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(fallbackAchievements);
  const [achFilter, setAchFilter] = useState<"all" | "certificate" | "award" | "press">("all");

  useEffect(() => {
    fetch("/api/admin/achievements")
      .then((r) => r.json())
      .then((d) => { if (d.achievements?.length) setAchievements(d.achievements); })
      .catch(() => {});
  }, []);

  const filtered = achFilter === "all" ? achievements : achievements.filter((a) => a.type === achFilter);

  return (
    <main className="min-h-screen pt-20">
      {/* HERO */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e8c547]/[0.04] rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-8">
          <ScrollReveal><div className="section-label mb-8">About Me</div></ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollReveal delay={0.1}>
                <h1 className="font-display font-light text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] text-[#eeeef5] mb-8">
                  I exist at the <em className="text-[#e8c547] not-italic">edges</em> of disciplines.
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-[#7878a0] text-lg leading-relaxed mb-5">
                  I&apos;m Temidayo Jacob — a rare triple-threat who speaks the language of product, marketing, and engineering fluently. Not as separate skills, but as one unified approach.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <p className="text-[#7878a0] text-lg leading-relaxed mb-10">
                  Based in Lagos, Nigeria. I&apos;ve spent years learning how great products are conceived, validated, built, and grown — bringing that full lifecycle thinking to every project.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.4}>
                <div className="flex gap-4">
                  <a href="/chat" className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all">Work With Me →</a>
                  <a href="/cv" className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a1a30] text-[#7878a0] text-sm hover:border-[#e8c547]/40 hover:text-[#eeeef5] transition-all">View CV</a>
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.2} direction="left">
              <div className="relative">
                <div className="w-full aspect-[3/4] max-w-sm mx-auto bg-[#0c0c18] border border-[#1a1a30] overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[8rem] text-[#1a1a30] select-none">TJ</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#04040a] to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="font-mono text-[9px] text-[#e8c547] tracking-widest uppercase">Temidayo Jacob</p>
                    <p className="font-mono text-[9px] text-[#3a3a5c]">Lagos, Nigeria</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#e8c547]/15 -z-10" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24 border-t border-[#1a1a30]">
        <div className="max-w-screen-xl mx-auto px-8">
          <ScrollReveal><div className="section-label mb-6">My Philosophy</div></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 className="font-display font-light text-[clamp(2rem,4vw,3.5rem)] text-[#eeeef5] mb-16 max-w-lg leading-tight">Principles that guide every decision.</h2></ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {philosophy.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.08} direction="up">
                <div className="p-8 bg-[#0c0c18] border border-[#1a1a30] card-hover">
                  <div className="text-[#e8c547] text-2xl mb-5">{p.icon}</div>
                  <h3 className="font-display text-2xl text-[#eeeef5] mb-3">{p.title}</h3>
                  <p className="text-[#7878a0] text-sm leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 border-t border-[#1a1a30]">
        <div className="max-w-screen-xl mx-auto px-8">
          <ScrollReveal><div className="section-label mb-6">Experience</div></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 className="font-display font-light text-[clamp(2rem,4vw,3.5rem)] text-[#eeeef5] mb-16 max-w-lg leading-tight">The journey that built me.</h2></ScrollReveal>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#e8c547] via-[#1a1a30] to-transparent hidden md:block" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.1} direction="left">
                  <div className="md:pl-10 relative">
                    <div className="absolute left-0 top-2 w-2 h-2 bg-[#e8c547] rounded-full -translate-x-[3px] hidden md:block" />
                    <div className="font-mono text-[9px] text-[#e8c547] mb-2 tracking-widest uppercase">{item.year}</div>
                    <h3 className="font-display text-2xl text-[#eeeef5] mb-1">{item.role}</h3>
                    <p className="font-mono text-[8px] text-[#3a3a5c] mb-3 uppercase tracking-wider">{item.place}</p>
                    <p className="text-[#7878a0] text-sm leading-relaxed max-w-2xl">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="py-24 border-t border-[#1a1a30]">
        <div className="max-w-screen-xl mx-auto px-8">
          <ScrollReveal><div className="section-label mb-6">Achievements</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-light text-[clamp(2rem,4vw,3.5rem)] text-[#eeeef5] mb-6 max-w-xl leading-tight">
              Certificates, awards &amp; press <em className="text-[#e8c547] not-italic">recognition.</em>
            </h2>
          </ScrollReveal>

          {/* Filter buttons */}
          <ScrollReveal delay={0.15}>
            <div className="flex gap-2 flex-wrap mb-12">
              {(["all", "certificate", "award", "press"] as const).map((f) => (
                <button key={f} onClick={() => setAchFilter(f)}
                  className={`px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest border transition-all ${
                    achFilter === f ? "bg-[#e8c547] text-[#04040a] border-[#e8c547]" : "border-[#1a1a30] text-[#7878a0] hover:border-[#e8c547]/30 hover:text-[#eeeef5]"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ach, i) => {
              const colors = typeColors[ach.type];
              return (
                <ScrollReveal key={ach._id} delay={i * 0.07} direction="up">
                  <div className="p-6 bg-[#0c0c18] border border-[#1a1a30] card-hover relative overflow-hidden h-full flex flex-col">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-20" style={{ background: colors.text }} />

                    <div className="flex items-start justify-between mb-4">
                      <span className="font-mono text-[8px] px-2.5 py-1 border uppercase tracking-[2px]" style={{ borderColor: colors.border, color: colors.text }}>
                        {ach.type}
                      </span>
                      <span className="text-2xl">{ach.icon}</span>
                    </div>

                    {/* Icon/image placeholder */}
                    <div className="w-full h-20 bg-[#07070f] border border-[#1a1a30] flex items-center justify-center mb-5 text-3xl">
                      {ach.icon}
                    </div>

                    <h3 className="font-display text-lg text-[#eeeef5] mb-2 leading-snug flex-1">{ach.title}</h3>
                    <p className="font-mono text-[9px] text-[#7878a0] mb-1">{ach.issuer}</p>
                    {ach.date && <p className="font-mono text-[9px] text-[#3a3a5c] mb-3">{ach.date}</p>}
                    {ach.credentialId && <p className="font-mono text-[8px] text-[#3a3a5c] mb-2">ID: {ach.credentialId}</p>}
                    {ach.credentialUrl ? (
                      <a href={ach.credentialUrl} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[9px] mt-2 transition-colors hover:underline self-start"
                        style={{ color: colors.text }}>
                        View Credential →
                      </a>
                    ) : (
                      <span className="font-mono text-[9px] mt-2 self-start" style={{ color: colors.text }}>
                        {ach.type === "press" ? "Read Article →" : "Verified ✓"}
                      </span>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 border border-dashed border-[#1a1a30]">
              <p className="font-mono text-[11px] text-[#3a3a5c] uppercase tracking-widest">No achievements in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
