"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface Phase {
  name: string;
  icon: string;
  status: "completed" | "in-progress" | "planned";
  duration: string;
  description: string;
  tasks: string[];
  tools: string[];
  outcome: string;
}
interface Metric { label: string; value: string; change: string; positive: boolean; }
interface Project {
  _id: string; num: string; title: string; type: string; tag: string; tagColor: string;
  year: string; status: string; duration: string; role: string; team: string; client: string;
  overview: string; problem: string; solution: string; impact: string;
  phases: Phase[]; metrics: Metric[]; stack: string[];
  links: { live: string; github: string; caseStudy: string };
}

const typeColors: Record<string, string> = {
  software: "#a78bfa", product: "#e8c547", marketing: "#4fc3f7", design: "#f97316",
};
const typeIcons: Record<string, string> = {
  software: "💻", product: "📋", marketing: "📈", design: "🎨",
};
const statusColors: Record<string, string> = {
  completed: "#4ade80", "in-progress": "#facc15", planned: "#3a3a5c",
};

export default function ProjectJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/projects/${params.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.project) setProject(d.project); else router.push("/projects"); })
      .catch(() => router.push("/projects"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-8 h-8 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin" />
    </div>
  );

  if (!project) return null;

  const color = typeColors[project.type] || "#e8c547";
  const icon = typeIcons[project.type] || "📋";
  const completedPhases = project.phases?.filter((p) => p.status === "completed").length || 0;
  const totalPhases = project.phases?.length || 0;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  return (
    <main className="min-h-screen pt-20">
      {/* Back */}
      <div className="max-w-screen-xl mx-auto px-8 pt-8 pb-4">
        <Link href="/projects" className="inline-flex items-center gap-2 font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] uppercase tracking-widest transition-colors">
          ← Back to Projects
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pb-16">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}40, transparent)` }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-5" style={{ background: color }} />

        <div className="max-w-screen-xl mx-auto px-8 pt-10">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            {/* Tags */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <span className="font-mono text-[9px] px-3 py-1.5 border rounded-sm uppercase tracking-widest" style={{ borderColor: color + "40", color }}>
                {icon} {project.type === "software" ? "Software Developer" : project.type === "product" ? "Product Manager" : project.type}
              </span>
              <span className={`font-mono text-[9px] px-2.5 py-1 border rounded-sm ${project.status === "completed" ? "border-green-400/30 text-green-400" : "border-yellow-400/30 text-yellow-400"}`}>
                {project.status === "completed" ? "✓ Completed" : "⚡ In Progress"}
              </span>
              {project.year && <span className="font-mono text-[9px] text-[#3a3a5c]">{project.year}</span>}
              {project.duration && <span className="font-mono text-[9px] text-[#3a3a5c]">· {project.duration}</span>}
            </div>

            <h1 className="font-display font-light text-[clamp(2.5rem,6vw,5.5rem)] text-[#eeeef5] leading-[0.93] mb-6">
              {project.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-6 mb-8">
              {project.role && <div><p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest mb-1">My Role</p><p className="text-[#eeeef5] text-sm">{project.role}</p></div>}
              {project.team && <div><p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest mb-1">Team</p><p className="text-[#eeeef5] text-sm">{project.team}</p></div>}
              {project.client && <div><p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest mb-1">Client</p><p className="text-[#eeeef5] text-sm">{project.client}</p></div>}
            </div>

            {/* Progress */}
            {totalPhases > 0 && (
              <div className="max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest">Project Progress</span>
                  <span className="font-mono text-[9px]" style={{ color }}>{completedPhases}/{totalPhases} phases</span>
                </div>
                <div className="h-1 bg-[#1a1a30] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full" style={{ background: color }} />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Overview cards */}
      {(project.overview || project.problem || project.solution) && (
        <section className="border-t border-[#1a1a30] py-16">
          <div className="max-w-screen-xl mx-auto px-8">
            <div className="grid md:grid-cols-3 gap-px bg-[#1a1a30]">
              {[
                { label: "Overview", content: project.overview, icon: "◈" },
                { label: "Problem", content: project.problem, icon: "◎" },
                { label: "Solution", content: project.solution, icon: "◇" },
              ].filter(b => b.content).map((block, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="bg-[#04040a] p-8 h-full">
                    <div className="text-[#e8c547] text-xl mb-4">{block.icon}</div>
                    <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color }}>{block.label}</p>
                    <p className="text-[#7878a0] text-sm leading-relaxed">{block.content}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* THE JOURNEY - Main section */}
      {project.phases?.length > 0 && (
        <section className="border-t border-[#1a1a30] py-20">
          <div className="max-w-screen-xl mx-auto px-8">
            <ScrollReveal>
              <div className="section-label mb-6">Project Journey</div>
              <h2 className="font-display font-light text-[clamp(2rem,4vw,3.5rem)] text-[#eeeef5] mb-4 leading-tight">
                From start to <em className="not-italic" style={{ color }}>finish.</em>
              </h2>
              <p className="text-[#7878a0] mb-16 max-w-xl">Every phase of how this project was built — the thinking, the doing, and the learning.</p>
            </ScrollReveal>

            {/* Phase selector */}
            <div className="flex gap-2 flex-wrap mb-12">
              {project.phases.map((phase, i) => (
                <button key={i} onClick={() => setActivePhase(i)}
                  className={`flex items-center gap-2 px-4 py-2.5 border font-mono text-[9px] uppercase tracking-widest transition-all ${
                    activePhase === i ? "text-[#04040a] border-transparent" : "border-[#1a1a30] text-[#7878a0] hover:text-[#eeeef5] hover:border-[#242440]"
                  }`}
                  style={activePhase === i ? { background: color } : {}}>
                  <span>{phase.icon}</span>
                  <span>{phase.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[phase.status] || "#3a3a5c" }} />
                </button>
              ))}
            </div>

            {/* Phase detail + full timeline */}
            <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
              {/* Timeline */}
              <div className="space-y-0">
                {project.phases.map((phase, i) => (
                  <ScrollReveal key={i} delay={i * 0.08} direction="left">
                    <div
                      onClick={() => setActivePhase(i)}
                      className={`relative pl-10 pb-10 cursor-pointer group ${i === project.phases.length - 1 ? "pb-0" : ""}`}>
                      {/* Vertical line */}
                      {i < project.phases.length - 1 && (
                        <div className="absolute left-[13px] top-6 bottom-0 w-px" style={{ background: i < activePhase ? color : "#1a1a30" }} />
                      )}
                      {/* Circle */}
                      <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition-all ${
                        i === activePhase ? "scale-110" : ""
                      }`} style={{
                        borderColor: phase.status === "completed" ? color : phase.status === "in-progress" ? "#facc15" : "#1a1a30",
                        background: phase.status === "completed" ? color + "20" : "transparent",
                      }}>
                        {phase.status === "completed" ? <span style={{ color }} className="text-xs">✓</span> :
                         phase.status === "in-progress" ? <span className="text-yellow-400 text-xs">●</span> :
                         <span className="text-[#3a3a5c] text-xs">○</span>}
                      </div>

                      {/* Content */}
                      <div className={`ml-2 p-5 border transition-all ${i === activePhase ? "bg-[#0c0c18] border-[#e8c547]/20" : "border-transparent hover:border-[#1a1a30]"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{phase.icon}</span>
                          <h3 className="font-display text-xl text-[#eeeef5] group-hover:text-[#e8c547] transition-colors">{phase.name}</h3>
                          {phase.duration && <span className="font-mono text-[9px] text-[#3a3a5c] ml-auto">{phase.duration}</span>}
                        </div>
                        {phase.description && <p className="text-[#7878a0] text-sm leading-relaxed mb-3">{phase.description}</p>}

                        {/* Tasks */}
                        {phase.tasks?.length > 0 && (
                          <ul className="space-y-1.5 mb-3">
                            {phase.tasks.map((task, ti) => (
                              <li key={ti} className="flex items-start gap-2 text-[#7878a0] text-sm">
                                <span style={{ color }} className="flex-shrink-0 mt-0.5">—</span>{task}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Tools used */}
                        {phase.tools?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {phase.tools.map((t, ti) => (
                              <span key={ti} className="font-mono text-[8px] px-2 py-0.5 bg-[#07070f] border border-[#1a1a30] text-[#3a3a5c]">{t}</span>
                            ))}
                          </div>
                        )}

                        {/* Outcome */}
                        {phase.outcome && (
                          <div className="mt-3 pt-3 border-t border-[#1a1a30]">
                            <p className="font-mono text-[8px] uppercase tracking-widest mb-1" style={{ color }}>Outcome</p>
                            <p className="text-[#eeeef5] text-sm">{phase.outcome}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Active phase detail card - sticky */}
              <div className="sticky top-24">
                <motion.div key={activePhase} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.4 }}
                  className="bg-[#0c0c18] border p-7" style={{ borderColor: color + "30" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{project.phases[activePhase]?.icon}</span>
                    <div>
                      <h3 className="font-display text-2xl text-[#eeeef5]">{project.phases[activePhase]?.name}</h3>
                      <p className="font-mono text-[9px] uppercase tracking-widest mt-0.5" style={{ color }}>
                        Phase {activePhase + 1} of {totalPhases}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between font-mono text-[9px]">
                      <span className="text-[#3a3a5c] uppercase tracking-widest">Status</span>
                      <span style={{ color: statusColors[project.phases[activePhase]?.status] }}>
                        {project.phases[activePhase]?.status === "completed" ? "✓ Completed" :
                         project.phases[activePhase]?.status === "in-progress" ? "⚡ In Progress" : "Planned"}
                      </span>
                    </div>
                    {project.phases[activePhase]?.duration && (
                      <div className="flex justify-between font-mono text-[9px]">
                        <span className="text-[#3a3a5c] uppercase tracking-widest">Duration</span>
                        <span className="text-[#7878a0]">{project.phases[activePhase].duration}</span>
                      </div>
                    )}
                    {project.phases[activePhase]?.tools?.length > 0 && (
                      <div className="flex justify-between font-mono text-[9px]">
                        <span className="text-[#3a3a5c] uppercase tracking-widest">Tools</span>
                        <span className="text-[#7878a0]">{project.phases[activePhase].tools.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Navigate phases */}
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => setActivePhase(Math.max(0, activePhase - 1))} disabled={activePhase === 0}
                      className="flex-1 py-2 border border-[#1a1a30] font-mono text-[9px] text-[#7878a0] hover:text-[#eeeef5] hover:border-[#242440] disabled:opacity-30 transition-all">
                      ← Prev
                    </button>
                    <button onClick={() => setActivePhase(Math.min(totalPhases - 1, activePhase + 1))} disabled={activePhase === totalPhases - 1}
                      className="flex-1 py-2 font-mono text-[9px] text-[#04040a] font-bold transition-all disabled:opacity-30"
                      style={{ background: color }}>
                      Next →
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Metrics */}
      {project.metrics?.length > 0 && (
        <section className="border-t border-[#1a1a30] py-20">
          <div className="max-w-screen-xl mx-auto px-8">
            <ScrollReveal><div className="section-label mb-6">Results & Impact</div></ScrollReveal>
            <ScrollReveal delay={0.1}><h2 className="font-display font-light text-[clamp(2rem,4vw,3.5rem)] text-[#eeeef5] mb-16">The numbers that matter.</h2></ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {project.metrics.map((m, i) => (
                <ScrollReveal key={i} delay={i * 0.08} direction="up">
                  <div className="bg-[#0c0c18] border border-[#1a1a30] p-6 text-center hover:border-[#e8c547]/20 transition-all">
                    <div className="font-display text-[2.5rem] font-light mb-1 leading-none" style={{ color }}>{m.value}</div>
                    {m.change && <div className={`font-mono text-[9px] mb-2 ${m.positive ? "text-green-400" : "text-red-400"}`}>{m.change}</div>}
                    <div className="font-mono text-[9px] text-[#7878a0] uppercase tracking-widest">{m.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Impact & Stack */}
      <section className="border-t border-[#1a1a30] py-16">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16">
            {project.impact && (
              <ScrollReveal>
                <p className="font-mono text-[9px] uppercase tracking-widest mb-4" style={{ color }}>Impact</p>
                <p className="text-[#7878a0] leading-relaxed">{project.impact}</p>
              </ScrollReveal>
            )}
            {project.stack?.length > 0 && (
              <ScrollReveal delay={0.1}>
                <p className="font-mono text-[9px] uppercase tracking-widest mb-4" style={{ color }}>Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((s, i) => <span key={i} className="font-mono text-[10px] px-3 py-1.5 border border-[#1a1a30] text-[#7878a0]">{s}</span>)}
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Links */}
          {(project.links?.live || project.links?.github) && (
            <div className="flex gap-4 mt-12 pt-12 border-t border-[#1a1a30]">
              {project.links.live && (
                <a href={project.links.live} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm text-[#04040a] hover:opacity-90 transition-all" style={{ background: color }}>
                  View Live Project ↗
                </a>
              )}
              {project.links.github && (
                <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a1a30] text-[#7878a0] text-sm hover:border-[#242440] hover:text-[#eeeef5] transition-all">
                  View Code ↗
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Next project CTA */}
      <section className="border-t border-[#1a1a30] py-16 bg-[#07070f]">
        <div className="max-w-screen-xl mx-auto px-8 text-center">
          <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-4">Explore More</p>
          <h3 className="font-display text-3xl text-[#eeeef5] mb-6">Want to see more of my work?</h3>
          <Link href="/projects" className="inline-flex items-center gap-2 px-8 py-4 font-bold text-sm text-[#04040a] hover:opacity-90 transition-all" style={{ background: color }}>
            View All Projects →
          </Link>
        </div>
      </section>
    </main>
  );
}
