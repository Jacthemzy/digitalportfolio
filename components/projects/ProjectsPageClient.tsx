"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { PortfolioProject } from "@/lib/projects";

const typeConfig = {
  software: { label: "Software Dev", color: "#a78bfa", icon: "💻" },
  product: { label: "Product Manager", color: "#e8c547", icon: "📋" },
  marketing: { label: "Marketing", color: "#4fc3f7", icon: "📈" },
  design: { label: "Design", color: "#f97316", icon: "🎨" },
};

export default function ProjectsPageClient({ initialProjects }: { initialProjects: PortfolioProject[] }) {
  const [filter, setFilter] = useState<"all" | "software" | "product" | "marketing" | "design">("all");
  const filtered = filter === "all" ? initialProjects : initialProjects.filter((project) => project.type === filter);

  return (
    <main className="min-h-screen pt-20">
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e8c547]/[0.04] rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-8">
          <ScrollReveal><div className="section-label mb-8">My Work</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display font-light text-[clamp(2.5rem,6vw,6rem)] leading-[0.93] text-[#eeeef5] mb-6">
              Every project.<br />
              <em className="text-[#e8c547] not-italic">Full story.</em>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[#7878a0] text-lg max-w-2xl leading-relaxed">
              From the first line of code to the final deployment, every project here shows the complete journey, not just the outcome.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="border-t border-b border-[#1a1a30] bg-[#07070f] sticky top-[64px] z-30 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-8 py-4 flex gap-2 flex-wrap">
          {([["all", "All Projects", "#e8c547"], ["software", "💻 Software Dev", "#a78bfa"], ["product", "📋 Product Manager", "#e8c547"], ["marketing", "📈 Marketing", "#4fc3f7"]] as const).map(([key, label, color]) => (
            <button key={key} onClick={() => setFilter(key as any)}
              className={`px-4 py-2 font-mono text-[9px] uppercase tracking-widest border transition-all ${
                filter === key ? "text-[#04040a] border-transparent" : "border-[#1a1a30] text-[#7878a0] hover:text-[#eeeef5]"
              }`}
              style={filter === key ? { background: color } : {}}>
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 font-mono text-[9px] text-[#3a3a5c]">
            <span>{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-8">
          <AnimatePresence mode="wait">
            <motion.div className="space-y-6">
              {filtered.map((project, i) => {
                const tc = typeConfig[project.type] || typeConfig.software;
                return (
                  <motion.div key={project._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                    <Link href={`/projects/${project._id}`} className="block group">
                      <div className="bg-[#0c0c18] border border-[#1a1a30] hover:border-[#e8c547]/25 transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                        <div className="p-8 md:p-10">
                          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap mb-4">
                                <span className="font-mono text-[9px] text-[#3a3a5c]">{project.num || String(i + 1).padStart(2, "0")}</span>
                                <span className="font-mono text-[9px] px-2.5 py-1 border rounded-sm uppercase tracking-widest" style={{ borderColor: tc.color + "40", color: tc.color }}>
                                  {tc.icon} {tc.label}
                                </span>
                                <span className={`font-mono text-[9px] px-2 py-0.5 border rounded-sm ${project.status === "completed" ? "border-green-400/30 text-green-400" : project.status === "in-progress" ? "border-yellow-400/30 text-yellow-400" : "border-[#1a1a30] text-[#3a3a5c]"}`}>
                                  {project.status === "completed" ? "✓ Completed" : project.status === "in-progress" ? "⚡ In Progress" : "Concept"}
                                </span>
                                {project.year && <span className="font-mono text-[9px] text-[#3a3a5c]">{project.year}</span>}
                                {project.duration && <span className="font-mono text-[9px] text-[#3a3a5c]">· {project.duration}</span>}
                              </div>

                              <h2 className="font-display font-light text-[clamp(1.8rem,3vw,2.8rem)] text-[#eeeef5] mb-3 group-hover:text-[#e8c547] transition-colors duration-300">
                                {project.title}
                              </h2>

                              {project.role && (
                                <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-4">
                                  Role: <span className="text-[#7878a0]">{project.role}</span>
                                </p>
                              )}

                              <p className="text-[#7878a0] text-sm leading-relaxed mb-6 max-w-xl">
                                {project.overview || project.problem}
                              </p>

                              {project.phases?.length > 0 && (
                                <div className="mb-6">
                                  <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-3">Project Journey</p>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {project.phases.map((phase, phaseIndex) => (
                                      <div key={phaseIndex} className="flex items-center gap-1">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[10px] font-mono rounded-sm ${
                                          phase.status === "completed" ? "border-green-400/20 bg-green-400/5 text-green-400" :
                                          phase.status === "in-progress" ? "border-yellow-400/20 bg-yellow-400/5 text-yellow-400" :
                                          "border-[#1a1a30] text-[#3a3a5c]"
                                        }`}>
                                          <span>{phase.icon}</span>
                                          <span>{phase.name}</span>
                                        </div>
                                        {phaseIndex < project.phases.length - 1 && <span className="text-[#1a1a30] text-xs">→</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {project.stack?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {project.stack.map((stack, stackIndex) => (
                                    <span key={stackIndex} className="font-mono text-[9px] px-2 py-1 bg-[#07070f] border border-[#1a1a30] text-[#3a3a5c]">{stack}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {project.metrics?.length > 0 && (
                              <div className="lg:w-64 flex-shrink-0">
                                <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-3">Key Metrics</p>
                                <div className="space-y-3">
                                  {project.metrics.slice(0, 3).map((metric, metricIndex) => (
                                    <div key={metricIndex} className="bg-[#07070f] border border-[#1a1a30] p-3">
                                      <div className="font-display text-2xl font-light mb-0.5" style={{ color: tc.color }}>{metric.value}</div>
                                      <div className="font-mono text-[9px] text-[#7878a0] uppercase tracking-widest">{metric.label}</div>
                                      {metric.change && <div className={`font-mono text-[9px] mt-1 ${metric.positive ? "text-green-400" : "text-red-400"}`}>{metric.change}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-[#1a1a30] px-10 py-4 flex items-center justify-between bg-[#07070f]/50">
                          <span className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest">
                            {project.phases?.filter((phase) => phase.status === "completed").length || 0}/{project.phases?.length || 0} phases completed
                          </span>
                          <span className="font-mono text-[9px] text-[#e8c547] group-hover:translate-x-1 transition-transform duration-300 inline-block">
                            View Full Journey →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-24 border border-dashed border-[#1a1a30]">
                  <p className="font-mono text-[11px] text-[#3a3a5c] uppercase tracking-widest mb-2">No projects in this category yet</p>
                  <p className="text-[#7878a0] text-sm">Add projects from the admin panel</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
