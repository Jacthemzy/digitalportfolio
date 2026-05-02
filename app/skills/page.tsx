"use client";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

const skillCategories = [
  {
    label: "Technical Skills",
    color: "#a78bfa",
    skills: [
      { name: "HTML & CSS", level: 95 },
      { name: "JavaScript", level: 90 },
      { name: "PHP", level: 80 },
      { name: "Python", level: 75 },
      { name: "SQL", level: 78 },
      { name: "Git & Version Control", level: 85 },
    ],
  },
  {
    label: "Product Management",
    color: "#e8c547",
    skills: [
      { name: "Product Strategy", level: 88 },
      { name: "Product Lifecycle", level: 85 },
      { name: "User-Centered Design", level: 82 },
      { name: "Market Research", level: 80 },
      { name: "Campaign Management", level: 83 },
      { name: "Roadmap Planning", level: 86 },
    ],
  },
  {
    label: "Digital Marketing",
    color: "#4fc3f7",
    skills: [
      { name: "SEO & SEM", level: 85 },
      { name: "Social Media Strategy", level: 88 },
      { name: "Content Creation", level: 90 },
      { name: "Google Analytics", level: 82 },
      { name: "Meta Ads Manager", level: 85 },
      { name: "SEMrush / Ahrefs", level: 78 },
    ],
  },
];

const tools = [
  "Microsoft Office Suite", "Git", "VS Code", "Sublime Text",
  "XAMPP", "Corel Draw", "Photoshop", "Google Analytics",
  "Meta Ads Manager", "SEMrush", "Ahrefs", "GitHub",
  "Control Panel", "Advanced Excel",
];

const softSkills = [
  { icon: "🧠", label: "Problem Solving" },
  { icon: "💬", label: "Communication" },
  { icon: "🤝", label: "Team Collaboration" },
  { icon: "⚡", label: "Adaptability" },
  { icon: "⏰", label: "Time Management" },
  { icon: "🎯", label: "Attention to Detail" },
  { icon: "📚", label: "Continuous Learning" },
  { icon: "🔥", label: "Self-Motivation" },
  { icon: "💡", label: "Critical Thinking" },
  { icon: "👥", label: "Customer Focus" },
];

export default function SkillsPage() {
  return (
    <main className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 md:w-[400px] h-64 md:h-[400px] bg-[#4fc3f7]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="section-label mb-6">My Expertise</div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display font-light text-[clamp(2.5rem,8vw,6rem)] leading-[0.93] text-[#eeeef5] mb-5">
              Skills that<br />
              <em className="text-[#4fc3f7] not-italic">compound.</em>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[#7878a0] text-base md:text-lg max-w-xl leading-relaxed">
              Three disciplines mastered independently — now deployed as one integrated superpower.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Skill categories */}
      <section className="border-t border-[#1a1a30] py-14 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 space-y-14 md:space-y-20">
          {skillCategories.map((cat, ci) => (
            <ScrollReveal key={ci} delay={0.05}>
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-8 rounded-sm" style={{ background: cat.color }} />
                  <h3 className="font-display text-2xl md:text-3xl text-[#eeeef5]">{cat.label}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {cat.skills.map((skill, si) => (
                    <ScrollReveal key={si} delay={si * 0.05} direction="up">
                      <div className="p-4 md:p-5 bg-[#0c0c18] border border-[#1a1a30] hover:border-opacity-50 transition-all rounded-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[#eeeef5] text-sm font-medium">{skill.name}</span>
                          <span className="font-mono text-xs" style={{ color: cat.color }}>{skill.level}%</span>
                        </div>
                        <div className="h-1 bg-[#1a1a30] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: si * 0.05, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: cat.color }}
                          />
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="border-t border-[#1a1a30] py-14 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="section-label mb-5">Tools & Platforms</div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-light text-[clamp(1.8rem,4vw,3rem)] text-[#eeeef5] mb-10">
              The toolkit I rely on daily.
            </h2>
          </ScrollReveal>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {tools.map((tool, i) => (
              <ScrollReveal key={i} delay={i * 0.03} direction="up">
                <div className="px-3 md:px-4 py-2 bg-[#0c0c18] border border-[#1a1a30] text-[#7878a0] font-mono text-[10px] md:text-xs hover:border-[#e8c547]/40 hover:text-[#e8c547] transition-all cursor-default rounded-sm">
                  {tool}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Soft Skills */}
      <section className="border-t border-[#1a1a30] py-14 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="section-label mb-5">Soft Skills</div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-light text-[clamp(1.8rem,4vw,3rem)] text-[#eeeef5] mb-10">
              Beyond the technical.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {softSkills.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.05} direction="up">
                <div className="p-4 bg-[#0c0c18] border border-[#1a1a30] text-center hover:border-[#e8c547]/25 transition-all group rounded-sm">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className="font-mono text-[9px] md:text-[10px] text-[#7878a0] group-hover:text-[#eeeef5] transition-colors uppercase tracking-wider">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1a1a30] py-16 md:py-24 text-center">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <h2 className="font-display font-light text-[clamp(2rem,5vw,4rem)] text-[#eeeef5] mb-5">
              Want to work together?
            </h2>
            <p className="text-[#7878a0] mb-8 max-w-md mx-auto">Let&apos;s combine these skills to build something great.</p>
            <a href="/chat" className="inline-flex items-center gap-2 px-8 py-4 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all">
              Start a Conversation →
            </a>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
