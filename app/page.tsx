"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useEffect, useRef, useState } from "react";

const roles = ["Product Manager", "Digital Marketer", "Software Developer"];
const stats = [
  { value: "5+", label: "Years Experience", sub: "Across 3 disciplines" },
  { value: "30+", label: "Projects", sub: "Shipped & scaled" },
  { value: "15+", label: "Clients", sub: "Across 4 continents" },
  { value: "$2M+", label: "Ad Spend", sub: "Managed & optimised" },
];
const services = [
  { num: "01", tag: "Product", color: "#e8c547", title: "Product Strategy", desc: "Translating vision into executable roadmaps with clear metrics, ruthless prioritisation, and user-centric decisions that move the needle." },
  { num: "02", tag: "Marketing", color: "#4fc3f7", title: "Growth Marketing", desc: "Data-first campaigns that drive the right people to the right moment, at the right cost — and convert them into loyal customers." },
  { num: "03", tag: "Dev", color: "#a78bfa", title: "Software Engineering", desc: "Full-stack products built to scale. From architecting backends to polishing frontends — I ship code that works in production." },
];
const testimonials = [
  { stars: 5, text: "Temidayo doesn't just deliver work — he delivers transformation. Our product went from struggling to market leader in 8 months under his guidance.", author: "Sarah O.", role: "CEO, TechStartNG · Lagos" },
  { stars: 5, text: "The most comprehensive product thinker I've worked with. He speaks business, design, and engineering fluently — and makes it all feel effortless.", author: "David K.", role: "CTO, GrowthStudio · London" },
  { stars: 5, text: "He took our marketing from chaotic guesswork to a precision machine. $800K in revenue attributed directly to his strategy in 6 months.", author: "Amaka F.", role: "Founder, AfriCommerce · Lagos" },
];
const marqueeItems = ["Product Strategy","Growth Marketing","Software Engineering","User Research","Data Analytics","Brand Building","System Design","Conversion Optimisation"];

export default function HomePage() {
  const [roleIdx, setRoleIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setRoleIdx((i) => (i + 1) % roles.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <main>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-[#e8c547]/[0.04] blur-[140px] animate-pulse2" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#4fc3f7]/[0.03] blur-[140px] animate-pulse2 [animation-delay:2s]" />
        </div>

        <motion.div className="relative z-10 max-w-screen-xl mx-auto px-8 pt-28 pb-20 w-full">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="section-label mb-10">
            Lagos, Nigeria · Available for opportunities
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.3, ease:[0.16,1,0.3,1] }}
            className="font-display font-light text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] tracking-tight text-[#eeeef5] mb-6">
            Building what the<br />
            world <em className="text-[#e8c547] not-italic relative">needs
              <motion.span initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.8, delay:1.1 }}
                className="absolute bottom-1 left-0 right-0 h-px bg-[#e8c547] origin-left" />
            </em> most.
          </motion.h1>

          {/* Animated role */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }} className="mb-10 h-10 flex items-center gap-2 overflow-hidden">
            <span className="font-mono text-[#3a3a5c] text-sm">~/</span>
            <div className="relative h-full flex items-center">
              {roles.map((r, i) => (
                <motion.span key={r} initial={{ y:40, opacity:0 }}
                  animate={i === roleIdx ? { y:0, opacity:1 } : { y:-40, opacity:0 }}
                  transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
                  className="absolute font-mono text-sm text-[#e8c547] tracking-wider whitespace-nowrap"
                >{r}</motion.span>
              ))}
            </div>
          </motion.div>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
            className="max-w-2xl text-[#7878a0] text-lg leading-relaxed mb-12">
            I&apos;m Temidayo — a rare triple-threat at the intersection of product, marketing, and engineering.
            I don&apos;t build features. I build <strong className="text-[#eeeef5] font-normal">systems that move people</strong>.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.75 }} className="flex flex-wrap gap-4 items-center mb-8">
            <Link href="/projects" className="inline-flex items-center gap-2 px-8 py-4 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all hover:-translate-y-0.5">
              Explore My Work <span>→</span>
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 border border-[#242440] text-[#7878a0] text-sm hover:border-[#e8c547]/40 hover:text-[#eeeef5] transition-all">
              My Story
            </Link>
          </motion.div>

          {/* Live visitors */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#1a1a30] font-mono text-[9px] text-[#7878a0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4fc3f7] animate-blink" />
            <span>Trusted by teams across product, marketing, and software delivery</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
          className="absolute bottom-12 right-8 flex flex-col items-center gap-3">
          <span className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-[4px] [writing-mode:vertical-lr]">Scroll to explore</span>
          <motion.div animate={{ y:[0,10,0] }} transition={{ repeat:Infinity, duration:2 }} className="w-px h-12 bg-gradient-to-b from-[#e8c547]/40 to-transparent" />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#1a1a30] bg-[#07070f]">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#1a1a30]">
          {stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="px-8 py-10 hover:bg-[#0c0c18] transition-colors">
                <div className="font-display text-[3.2rem] font-light text-[#e8c547] leading-none mb-1">{s.value}</div>
                <div className="font-mono text-[9px] text-[#eeeef5] uppercase tracking-widest mb-0.5">{s.label}</div>
                <div className="font-mono text-[9px] text-[#3a3a5c]">{s.sub}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-36">
        <div className="max-w-screen-xl mx-auto px-8">
          <ScrollReveal><div className="section-label mb-6">What I Do</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-light text-[clamp(2.5rem,5vw,4.5rem)] text-[#eeeef5] mb-20 max-w-xl leading-tight">
              Three disciplines.<br /><em className="text-[#e8c547] not-italic">One unified vision.</em>
            </h2>
          </ScrollReveal>
          <div className="grid lg:grid-cols-3 gap-px bg-[#1a1a30]">
            {services.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.12} direction="up">
                <div className="bg-[#04040a] p-10 lg:p-12 group hover:bg-[#0c0c18] transition-all duration-500 h-full flex flex-col">
                  <div className="font-mono text-[9px] text-[#3a3a5c] mb-8">{s.num}</div>
                  <span className="font-mono text-[8px] px-2.5 py-1 border rounded-sm uppercase tracking-[3px] mb-5 self-start"
                    style={{ borderColor: s.color + "30", color: s.color }}>{s.tag}</span>
                  <h3 className="font-display text-3xl text-[#eeeef5] mb-5 group-hover:text-[#e8c547] transition-colors duration-300">{s.title}</h3>
                  <p className="text-[#7878a0] text-sm leading-relaxed flex-1">{s.desc}</p>
                  <div className="mt-10 h-px bg-[#1a1a30] group-hover:bg-[#e8c547]/20 transition-colors duration-500" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-5 border-y border-[#1a1a30] overflow-hidden bg-[#07070f]">
        <div className="flex gap-12 animate-marquee whitespace-nowrap w-max">
          {[...marqueeItems, ...marqueeItems].map((t, i) => (
            <span key={i} className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest flex items-center gap-12">
              {t} <span className="text-[#e8c547]">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-36">
        <div className="max-w-screen-xl mx-auto px-8">
          <ScrollReveal><div className="section-label mb-6">What People Say</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-light text-[clamp(2rem,4vw,4rem)] text-[#eeeef5] mb-16 max-w-xl leading-tight">
              Results that <em className="text-[#e8c547] not-italic">speak louder</em> than words.
            </h2>
          </ScrollReveal>
          <div className="grid lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction="up">
                <div className="p-8 bg-[#0c0c18] border border-[#1a1a30] card-hover h-full">
                  <div className="text-[#e8c547] text-sm mb-4">{"★".repeat(t.stars)}</div>
                  <p className="font-display text-3xl text-[#1a1a30] leading-none mb-3">&ldquo;</p>
                  <p className="text-[#7878a0] text-sm leading-relaxed italic mb-6">{t.text}</p>
                  <div className="border-t border-[#1a1a30] pt-4">
                    <p className="font-mono text-[10px] text-[#e8c547] uppercase tracking-widest">{t.author}</p>
                    <p className="font-mono text-[9px] text-[#3a3a5c] mt-1">{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-36 border-t border-[#1a1a30] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#e8c547]/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-screen-xl mx-auto px-8 text-center relative z-10">
          <ScrollReveal>
            <p className="section-label justify-center mb-8">Ready to build?</p>
            <h2 className="font-display font-light text-[clamp(2.5rem,6vw,5.5rem)] text-[#eeeef5] mb-6 leading-tight max-w-3xl mx-auto">
              Let&apos;s create something the world will <em className="text-[#e8c547] not-italic">remember.</em>
            </h2>
            <p className="text-[#7878a0] text-lg mb-12 max-w-xl mx-auto">
              Message me directly through the chat — I respond personally, within minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/chat" className="inline-flex items-center gap-2 px-8 py-4 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all hover:-translate-y-0.5">
                Start a Conversation →
              </Link>
              <Link href="/cv" className="inline-flex items-center gap-2 px-8 py-4 border border-[#242440] text-[#7878a0] text-sm hover:border-[#e8c547]/40 hover:text-[#eeeef5] transition-all">
                View My CV
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
