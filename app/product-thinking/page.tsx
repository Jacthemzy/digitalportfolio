"use client";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

const frameworks = [
  { code: "FW-001", title: "The Problem Stack", desc: "Before writing a single line of code or creating one slide, I map the full problem stack — surface symptom → root cause → systemic driver. Most people solve symptoms. I solve causes.", steps: ["Identify surface symptoms", "Map root causes", "Find systemic drivers", "Design from the bottom up"] },
  { code: "FW-002", title: "Opportunity Scoring", desc: "I score every feature request against a 4-axis model: User Impact × Business Value × Feasibility × Strategic Alignment. No gut-feel prioritisation.", steps: ["Score user impact (1–10)", "Score business value (1–10)", "Assess feasibility (1–10)", "Align with strategy (1–10)"] },
  { code: "FW-003", title: "The Narrative Arc", desc: "Every product decision has a story. I write the press release before writing the brief. If I can't explain the value in one paragraph, the idea isn't ready.", steps: ["Write the press release first", "Define who benefits and how", "Articulate the before & after", "Get alignment before building"] },
  { code: "FW-004", title: "Feedback Loops", desc: "I design feedback loops into every product — not just at launch. Weekly qualitative interviews. Monthly quantitative reviews. Quarterly hypothesis resets.", steps: ["Weekly: Qualitative signals", "Monthly: Quantitative review", "Quarterly: Hypothesis reset", "Annually: Strategic pivot check"] },
];

const decisions = [
  { q: "Build vs. Buy?", a: "Build only when it's a core competency or competitive moat. Buy when the market has already solved it better than you can in 6 months." },
  { q: "Ship fast vs. Ship right?", a: "Neither. Ship the minimum that proves the hypothesis. Speed matters only if you're learning something valuable." },
  { q: "Data vs. Instinct?", a: "Data tells you what happened. Instinct tells you what to look for. Use both — but let data have the final vote." },
  { q: "Feature vs. Outcome?", a: "Always outcome. A feature is a bet. An outcome is a goal. Teams that ship features drift. Teams that chase outcomes grow." },
];

export default function ProductThinkingPage() {
  return (
    <main className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-[600px] h-64 md:h-[600px] border border-[#1a1a30] rounded-full opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 md:w-[400px] h-48 md:h-[400px] border border-[#e8c547]/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 md:w-[200px] h-32 md:h-[200px] border border-[#e8c547]/20 rounded-full" />
        </div>
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 relative z-10">
          <ScrollReveal><div className="section-label mb-6">Product Thinking</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display font-light text-[clamp(2.5rem,8vw,6rem)] leading-[0.93] text-[#eeeef5] mb-5 max-w-3xl">
              How I think before I build.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[#7878a0] text-base md:text-lg max-w-xl leading-relaxed">
              Product thinking is a discipline, not a title. These are the frameworks, mental models, and decision heuristics I use every day.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Frameworks */}
      <section className="border-t border-[#1a1a30] py-14 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal><div className="section-label mb-5">Frameworks</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-light text-[clamp(1.8rem,4vw,3.5rem)] text-[#eeeef5] mb-12 md:mb-16 max-w-lg leading-tight">
              The mental models I live by.
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-8">
            {frameworks.map((fw, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction="up">
                <div className="p-6 md:p-8 bg-[#0c0c18] border border-[#1a1a30] hover:border-[#e8c547]/20 transition-all h-full rounded-sm">
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="font-display text-xl md:text-2xl text-[#eeeef5]">{fw.title}</h3>
                    <span className="font-mono text-[9px] text-[#3a3a5c] bg-[#07070f] px-2 py-1 border border-[#1a1a30] flex-shrink-0 ml-3">{fw.code}</span>
                  </div>
                  <p className="text-[#7878a0] text-sm leading-relaxed mb-5">{fw.desc}</p>
                  <div className="space-y-2">
                    {fw.steps.map((step, j) => (
                      <motion.div key={j} initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay: j * 0.08 }} className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-[#e8c547] w-5 flex-shrink-0">{String(j+1).padStart(2,"0")}</span>
                        <span className="text-[#7878a0] text-xs md:text-sm">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Decision Logic */}
      <section className="border-t border-[#1a1a30] py-14 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal><div className="section-label mb-5">Decision Logic</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-light text-[clamp(1.8rem,4vw,3.5rem)] text-[#eeeef5] mb-12 md:mb-16 max-w-lg leading-tight">
              How I navigate hard trade-offs.
            </h2>
          </ScrollReveal>
          <div className="space-y-px">
            {decisions.map((d, i) => (
              <ScrollReveal key={i} delay={i * 0.08} direction="left">
                <div className="grid md:grid-cols-[1fr_2fr] bg-[#0c0c18] border border-[#1a1a30] hover:border-[#e8c547]/20 transition-all group">
                  <div className="p-5 md:p-8 md:border-r border-b md:border-b-0 border-[#1a1a30]">
                    <p className="font-display text-lg md:text-xl text-[#e8c547] group-hover:text-[#f5e070] transition-colors">{d.q}</p>
                  </div>
                  <div className="p-5 md:p-8">
                    <p className="text-[#7878a0] text-sm md:text-base leading-relaxed">{d.a}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-[#1a1a30] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
          <ScrollReveal>
            <p className="font-display font-light text-[clamp(1.5rem,4vw,3rem)] text-[#eeeef5] leading-snug mb-6">
              &ldquo;The best product managers make the team feel like they already knew the answer —
              <em className="text-[#e8c547] not-italic"> they just needed someone to ask the right question.</em>&rdquo;
            </p>
            <p className="font-mono text-[10px] text-[#3a3a5c] tracking-widest uppercase">— Temidayo Jacob</p>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
