"use client";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

const impacts = [
  { num: "01", color: "#e8c547", metric: "240+", metricLabel: "Lives Changed", problem: "Youth unemployment in Lagos", action: "Co-founded a 12-week digital skills bootcamp training young people in product management and digital marketing fundamentals.", result: "240+ graduates placed in tech roles across Lagos" },
  { num: "02", color: "#4fc3f7", metric: "3.8K", metricLabel: "Students Reached", problem: "Education access gap in rural communities", action: "Built and donated an offline-first learning platform to 4 rural schools across Ogun State, enabling curriculum delivery without internet.", result: "3,800+ students with access to quality digital content" },
  { num: "03", color: "#a78bfa", metric: "30", metricLabel: "Businesses Saved", problem: "Small businesses lacking digital presence post-COVID", action: "Led a pro-bono digital transformation sprint for 30 small businesses — building websites, setting up e-commerce, and running initial marketing.", result: "30 businesses digitalised, avg. 3x revenue growth in 6 months" },
  { num: "04", color: "#e8c547", metric: "85", metricLabel: "Women Mentored", problem: "Women underrepresented in tech & digital roles", action: "Launched a mentorship programme pairing aspiring female developers and PMs with senior practitioners across Africa.", result: "85 women mentored, 60%+ reported career advancement" },
];

export default function SocialImpactPage() {
  return (
    <main className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8c547]/30 to-transparent" />
          <div className="absolute top-1/3 right-0 w-64 md:w-[400px] h-64 md:h-[400px] bg-[#4fc3f7]/[0.04] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 relative z-10">
          <ScrollReveal><div className="section-label mb-6">Social Impact</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display font-light text-[clamp(2.5rem,8vw,6rem)] leading-[0.93] text-[#eeeef5] mb-5 max-w-3xl">
              Technology should<br />
              <em className="text-[#e8c547] not-italic">lift all boats.</em>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[#7878a0] text-base md:text-lg max-w-xl leading-relaxed">
              Beyond clients and commerce, I believe deeply in using skills to create systemic change — especially across Africa&apos;s emerging communities.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Impact stories */}
      <section className="border-t border-[#1a1a30] py-14 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 space-y-16 md:space-y-28">
          {impacts.map((item, i) => (
            <ScrollReveal key={i} delay={0.05}>
              <div className={`grid lg:grid-cols-2 gap-8 md:gap-12 items-center ${i % 2 === 1 ? "lg:[grid-template-areas:'b_a']" : ""}`}>
                {/* Metric card */}
                <motion.div
                  initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
                  viewport={{ once:true }} transition={{ duration:0.6 }}
                  className={`p-8 md:p-12 border rounded-sm relative overflow-hidden ${i % 2 === 1 ? "lg:[grid-area:b]" : ""}`}
                  style={{ borderColor: item.color + "20", background: item.color + "05" }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-20" style={{ background: item.color }} />
                  <div className="relative z-10">
                    <div className="font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: item.color }}>Initiative {item.num}</div>
                    <div className="font-display font-light leading-none mb-2" style={{ fontSize: "clamp(4rem,10vw,6rem)", color: item.color }}>{item.metric}</div>
                    <div className="font-mono text-sm text-[#7878a0] uppercase tracking-widest">{item.metricLabel}</div>
                  </div>
                </motion.div>

                {/* Story */}
                <ScrollReveal delay={0.15} direction={i % 2 === 0 ? "left" : "right"}>
                  <div className={i % 2 === 1 ? "lg:[grid-area:a]" : ""}>
                    <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-3">Problem</p>
                    <h3 className="font-display text-xl md:text-2xl text-[#eeeef5] mb-5">{item.problem}</h3>
                    <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-2">Action Taken</p>
                    <p className="text-[#7878a0] text-sm md:text-base leading-relaxed mb-5">{item.action}</p>
                    <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-2">Impact</p>
                    <p className="font-medium leading-relaxed text-sm md:text-base" style={{ color: item.color }}>→ {item.result}</p>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Mission statement */}
      <section className="border-t border-[#1a1a30] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
          <ScrollReveal>
            <div className="section-label justify-center mb-6">The Mission</div>
            <p className="font-display font-light text-[clamp(1.8rem,4.5vw,3.5rem)] text-[#eeeef5] leading-snug mb-6">
              Every system I build, every product I launch —
              <em className="text-[#e8c547] not-italic"> must leave the world slightly better</em> than I found it.
            </p>
            <p className="text-[#7878a0] text-base md:text-lg">That&apos;s not a tagline. That&apos;s the filter I run every opportunity through.</p>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
