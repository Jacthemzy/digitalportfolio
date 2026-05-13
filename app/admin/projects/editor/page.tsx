"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Phase {
  name: string; icon: string;
  status: "completed" | "in-progress" | "planned";
  duration: string; description: string;
  tasks: string[]; tools: string[]; outcome: string;
}
interface Metric { label: string; value: string; change: string; positive: boolean; }
interface ProjectData {
  _id?: string; num: string; title: string; slug: string;
  type: "software" | "product" | "marketing" | "design";
  tag: string; tagColor: string; year: string;
  status: "completed" | "in-progress" | "concept";
  duration: string; role: string; team: string; client: string;
  overview: string; problem: string; solution: string; impact: string;
  phases: Phase[]; metrics: Metric[]; stack: string[];
  links: { live: string; github: string; caseStudy: string };
  featured: boolean; order: number;
}

const EMPTY_PROJECT: ProjectData = {
  num: "", title: "", slug: "", type: "software", tag: "Development",
  tagColor: "#a78bfa", year: new Date().getFullYear().toString(),
  status: "completed", duration: "", role: "", team: "", client: "",
  overview: "", problem: "", solution: "", impact: "",
  phases: [], metrics: [], stack: [],
  links: { live: "", github: "", caseStudy: "" },
  featured: false, order: 0,
};

const PHASE_TEMPLATES = {
  software: [
    { name: "Planning", icon: "📋", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Design", icon: "🎨", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Development", icon: "💻", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Testing", icon: "🧪", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Deployment", icon: "🚀", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Results", icon: "📊", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
  ],
  product: [
    { name: "Discovery", icon: "🔍", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Research", icon: "📚", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Strategy", icon: "🎯", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Roadmap", icon: "🗺️", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Execution", icon: "⚙️", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Launch", icon: "🚀", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Results", icon: "📊", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
  ],
  marketing: [
    { name: "Research", icon: "🔍", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Strategy", icon: "🎯", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Creative", icon: "🎨", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Launch", icon: "🚀", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Optimise", icon: "⚡", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
    { name: "Results", icon: "📊", status: "completed" as const, duration: "", description: "", tasks: [], tools: [], outcome: "" },
  ],
};

const typeColors: Record<string, string> = {
  software: "#a78bfa", product: "#e8c547", marketing: "#4fc3f7", design: "#f97316",
};

function Field({ label, value, onChange, multiline = false, placeholder = "", type = "text" }: any) {
  return (
    <div>
      <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="input-base text-sm resize-none" />
      ) : (
        <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} className="input-base text-sm" />
      )}
    </div>
  );
}

function AdminProjectEditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [project, setProject] = useState<ProjectData>(EMPTY_PROJECT);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "phases" | "metrics" | "stack" | "links">("info");
  const [editingPhase, setEditingPhase] = useState<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) { router.push("/admin"); return; }
    setToken(t);
    if (editId) {
      setLoading(true);
      fetch(`/api/projects/${editId}`)
        .then((r) => r.json())
        .then((d) => { if (d.project) setProject({ ...EMPTY_PROJECT, ...d.project }); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [editId, router]);

  const set = (key: keyof ProjectData, val: any) => setProject((p) => ({ ...p, [key]: val }));

  const applyTemplate = (type: "software" | "product" | "marketing") => {
    const template = PHASE_TEMPLATES[type] || PHASE_TEMPLATES.software;
    set("phases", template.map(p => ({ ...p })));
    set("type", type);
    set("tagColor", typeColors[type]);
  };

  const save = async () => {
    if (!project.title.trim()) { alert("Please enter a project title."); return; }
    setSaving(true);
    try {
      const method = project._id ? "PUT" : "POST";
      const body = project._id ? { id: project._id, ...project } : project;
      const res = await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        if (!project._id && data.project?._id) {
          setProject((p) => ({ ...p, _id: data.project._id }));
          router.replace(`/admin/projects/editor?id=${data.project._id}`);
        }
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  // Phase helpers
  const addPhase = () => set("phases", [...project.phases, { name: "", icon: "📋", status: "planned", duration: "", description: "", tasks: [""], tools: [], outcome: "" }]);
  const removePhase = (i: number) => { set("phases", project.phases.filter((_, idx) => idx !== i)); if (editingPhase === i) setEditingPhase(null); };
  const updatePhase = (i: number, key: keyof Phase, val: any) => {
    const updated = [...project.phases]; (updated[i] as any)[key] = val; set("phases", updated);
  };
  const addPhaseTask = (i: number) => { const u = [...project.phases]; u[i].tasks.push(""); set("phases", u); };
  const updatePhaseTask = (pi: number, ti: number, val: string) => { const u = [...project.phases]; u[pi].tasks[ti] = val; set("phases", u); };
  const removePhaseTask = (pi: number, ti: number) => { const u = [...project.phases]; u[pi].tasks = u[pi].tasks.filter((_, idx) => idx !== ti); set("phases", u); };

  // Metric helpers
  const addMetric = () => set("metrics", [...project.metrics, { label: "", value: "", change: "", positive: true }]);
  const removeMetric = (i: number) => set("metrics", project.metrics.filter((_, idx) => idx !== i));
  const updateMetric = (i: number, key: keyof Metric, val: any) => { const u = [...project.metrics]; (u[i] as any)[key] = val; set("metrics", u); };

  const color = typeColors[project.type] || "#e8c547";

  const tabs = [
    { key: "info", label: "Project Info", icon: "◈" },
    { key: "phases", label: "Journey Phases", icon: "◎" },
    { key: "metrics", label: "Metrics", icon: "△" },
    { key: "stack", label: "Stack & Tools", icon: "◇" },
    { key: "links", label: "Links", icon: "↗" },
  ] as const;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040a]">
      <div className="w-8 h-8 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#04040a] pb-24">
      {/* Header */}
      <div className="bg-[#07070f] border-b border-[#1a1a30] px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] uppercase tracking-widest transition-colors">← Dashboard</Link>
          <div className="w-px h-4 bg-[#1a1a30]" />
          <div>
            <h1 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
              {project._id ? "Edit Project" : "New Project"}
            </h1>
            <p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest">Define the full journey</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {project._id && (
            <Link href={`/projects/${project._id}`} target="_blank" className="font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] uppercase tracking-widest transition-colors border border-[#1a1a30] px-3 py-2 hover:border-[#e8c547]/30">
              Preview ↗
            </Link>
          )}
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 font-bold text-xs text-[#04040a] disabled:opacity-60 transition-all" style={{ background: color }}>
            {saving ? <span className="w-3 h-3 border-2 border-[#04040a]/30 border-t-[#04040a] rounded-full animate-spin" /> : null}
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Project"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {saved && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-5 p-4 bg-green-400/10 border border-green-400/20 text-green-400 font-mono text-[10px] uppercase tracking-widest">
            ✓ Project saved! It&apos;s now live on your portfolio.
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-8 border-b border-[#1a1a30] pb-4">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-[9px] uppercase tracking-widest transition-all border ${
                activeTab === t.key ? "text-[#04040a] border-transparent" : "border-[#1a1a30] text-[#7878a0] hover:text-[#eeeef5] hover:border-[#242440]"
              }`} style={activeTab === t.key ? { background: color } : {}}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ── PROJECT INFO ── */}
        {activeTab === "info" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-6">
            <h2 className="font-serif text-xl text-[#eeeef5] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Project Information</h2>

            {/* Project type with template buttons */}
            <div>
              <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-3">Project Type & Journey Template</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: "software", label: "💻 Software Dev", desc: "Plan→Design→Dev→Test→Deploy→Results" },
                  { type: "product", label: "📋 Product Manager", desc: "Discovery→Research→Strategy→Roadmap→Execution→Launch→Results" },
                  { type: "marketing", label: "📈 Marketing", desc: "Research→Strategy→Creative→Launch→Optimise→Results" },
                  { type: "design", label: "🎨 Design", desc: "Brief→Research→Concept→Design→Review→Deliver" },
                ].map((item) => (
                  <button key={item.type} onClick={() => applyTemplate(item.type as any)}
                    className={`p-4 border text-left transition-all ${project.type === item.type ? "border-transparent" : "border-[#1a1a30] hover:border-[#242440]"}`}
                    style={project.type === item.type ? { borderColor: typeColors[item.type] + "50", background: typeColors[item.type] + "10" } : {}}>
                    <p className="font-mono text-[10px] font-bold mb-1" style={{ color: typeColors[item.type] }}>{item.label}</p>
                    <p className="font-mono text-[8px] text-[#3a3a5c] leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[8px] text-[#3a3a5c] mt-2">↑ Click a type to auto-fill journey phases</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Project Number" value={project.num} onChange={(v: string) => set("num", v)} placeholder="01" />
              <Field label="Year" value={project.year} onChange={(v: string) => set("year", v)} placeholder="2024" />
            </div>
            <Field label="Project Title *" value={project.title} onChange={(v: string) => set("title", v)} placeholder="Naija Prime Movie Platform" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tag Label" value={project.tag} onChange={(v: string) => set("tag", v)} placeholder="Full-Stack Dev" />
              <div>
                <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Status</label>
                <select value={project.status} onChange={(e) => set("status", e.target.value)} className="input-base text-sm">
                  <option value="completed">✓ Completed</option>
                  <option value="in-progress">⚡ In Progress</option>
                  <option value="concept">💡 Concept</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Duration" value={project.duration} onChange={(v: string) => set("duration", v)} placeholder="3 months" />
              <Field label="My Role" value={project.role} onChange={(v: string) => set("role", v)} placeholder="Lead Developer & Product Manager" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Team" value={project.team} onChange={(v: string) => set("team", v)} placeholder="Solo project / Team of 5" />
              <Field label="Client (optional)" value={project.client} onChange={(v: string) => set("client", v)} placeholder="Client name or Internal" />
            </div>
            <Field label="Project Overview" value={project.overview} onChange={(v: string) => set("overview", v)} multiline placeholder="A short summary of what this project is..." />
            <Field label="The Problem" value={project.problem} onChange={(v: string) => set("problem", v)} multiline placeholder="What problem did this project solve?" />
            <Field label="The Solution" value={project.solution} onChange={(v: string) => set("solution", v)} multiline placeholder="How did you solve it?" />
            <Field label="Impact" value={project.impact} onChange={(v: string) => set("impact", v)} multiline placeholder="What was the overall impact?" />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={project.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[#e8c547]" />
              <span className="font-mono text-[10px] text-[#7878a0]">Featured project (shown prominently on homepage)</span>
            </label>
          </motion.div>
        )}

        {/* ── JOURNEY PHASES ── */}
        {activeTab === "phases" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Journey Phases</h2>
                <p className="font-mono text-[9px] text-[#3a3a5c] mt-1">Define every step of how you built this project</p>
              </div>
              <button onClick={addPhase} className="px-4 py-2.5 font-bold text-xs text-[#04040a] hover:opacity-90 transition-all" style={{ background: color }}>
                + Add Phase
              </button>
            </div>

            {project.phases.length === 0 && (
              <div className="text-center py-16 border border-dashed border-[#1a1a30] mb-6">
                <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-3">No phases yet</p>
                <p className="text-[#7878a0] text-sm mb-5">Go to Project Info tab and select a project type to auto-fill phases, or add manually.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {(["software", "product", "marketing"] as const).map((t) => (
                    <button key={t} onClick={() => { applyTemplate(t); }}
                      className="px-4 py-2 border border-[#1a1a30] font-mono text-[9px] text-[#7878a0] hover:text-[#eeeef5] hover:border-[#242440] transition-all uppercase tracking-widest">
                      Use {t} template
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase list */}
            <div className="space-y-3">
              {project.phases.map((phase, i) => (
                <div key={i} className="bg-[#0c0c18] border border-[#1a1a30] overflow-hidden">
                  {/* Phase header */}
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#10101e] transition-colors"
                    onClick={() => setEditingPhase(editingPhase === i ? null : i)}>
                    <span className="text-2xl">{phase.icon || "📋"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[#eeeef5] font-medium text-sm">{phase.name || `Phase ${i + 1}`}</span>
                        <span className={`font-mono text-[8px] px-2 py-0.5 border rounded-sm ${
                          phase.status === "completed" ? "border-green-400/30 text-green-400" :
                          phase.status === "in-progress" ? "border-yellow-400/30 text-yellow-400" :
                          "border-[#1a1a30] text-[#3a3a5c]"
                        }`}>{phase.status}</span>
                        {phase.duration && <span className="font-mono text-[8px] text-[#3a3a5c]">{phase.duration}</span>}
                        {phase.tasks?.length > 0 && <span className="font-mono text-[8px] text-[#3a3a5c]">{phase.tasks.length} tasks</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); removePhase(i); }}
                        className="font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">
                        Remove
                      </button>
                      <span className="font-mono text-[10px] text-[#3a3a5c]">{editingPhase === i ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Phase detail editor */}
                  <AnimatePresence>
                    {editingPhase === i && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                        transition={{ duration: 0.3 }} className="overflow-hidden border-t border-[#1a1a30]">
                        <div className="p-6 space-y-4">
                          <div className="grid grid-cols-4 gap-3">
                            <Field label="Phase Name" value={phase.name} onChange={(v: string) => updatePhase(i, "name", v)} placeholder="Development" />
                            <Field label="Icon (emoji)" value={phase.icon} onChange={(v: string) => updatePhase(i, "icon", v)} placeholder="💻" />
                            <Field label="Duration" value={phase.duration} onChange={(v: string) => updatePhase(i, "duration", v)} placeholder="2 weeks" />
                            <div>
                              <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Status</label>
                              <select value={phase.status} onChange={(e) => updatePhase(i, "status", e.target.value as any)} className="input-base text-sm">
                                <option value="completed">✓ Completed</option>
                                <option value="in-progress">⚡ In Progress</option>
                                <option value="planned">Planned</option>
                              </select>
                            </div>
                          </div>
                          <Field label="Phase Description" value={phase.description} onChange={(v: string) => updatePhase(i, "description", v)} multiline placeholder="What happened in this phase?" />

                          {/* Tasks */}
                          <div>
                            <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-3">Tasks / What Was Done</label>
                            <div className="space-y-2">
                              {phase.tasks.map((task, ti) => (
                                <div key={ti} className="flex gap-2 items-center">
                                  <span className="text-[#e8c547] text-sm flex-shrink-0">—</span>
                                  <input value={task} onChange={(e) => updatePhaseTask(i, ti, e.target.value)}
                                    placeholder={`Task ${ti + 1}`} className="input-base text-sm flex-1" />
                                  <button onClick={() => removePhaseTask(i, ti)} className="text-[#3a3a5c] hover:text-red-400 transition-colors font-mono text-lg leading-none">×</button>
                                </div>
                              ))}
                              <button onClick={() => addPhaseTask(i)} className="font-mono text-[9px] hover:underline uppercase tracking-widest mt-1" style={{ color }}>
                                + Add task
                              </button>
                            </div>
                          </div>

                          {/* Tools in this phase */}
                          <div>
                            <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Tools Used (comma separated)</label>
                            <input value={phase.tools?.join(", ")} onChange={(e) => updatePhase(i, "tools", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                              placeholder="VS Code, GitHub, Figma..." className="input-base text-sm" />
                          </div>

                          <Field label="Phase Outcome" value={phase.outcome} onChange={(v: string) => updatePhase(i, "outcome", v)} placeholder="What was achieved at the end of this phase?" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {project.phases.length > 0 && (
              <div className="mt-6 p-4 bg-[#07070f] border border-[#1a1a30]">
                <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-3">Journey Preview</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {project.phases.map((phase, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-mono text-[9px] flex items-center gap-1.5" style={{ color: phase.status === "completed" ? "#4ade80" : phase.status === "in-progress" ? "#facc15" : "#3a3a5c" }}>
                        {phase.icon} {phase.name}
                      </span>
                      {i < project.phases.length - 1 && <span className="text-[#1a1a30]">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── METRICS ── */}
        {activeTab === "metrics" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Key Metrics & Results</h2>
                <p className="font-mono text-[9px] text-[#3a3a5c] mt-1">Numbers that show the impact of this project</p>
              </div>
              <button onClick={addMetric} className="px-4 py-2.5 font-bold text-xs text-[#04040a]" style={{ background: color }}>+ Add Metric</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {project.metrics.map((m, i) => (
                <div key={i} className="bg-[#0c0c18] border border-[#1a1a30] p-5 relative">
                  <button onClick={() => removeMetric(i)} className="absolute top-3 right-3 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                  <div className="space-y-3">
                    <Field label="Metric Label" value={m.label} onChange={(v: string) => updateMetric(i, "label", v)} placeholder="Users Acquired" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Value" value={m.value} onChange={(v: string) => updateMetric(i, "value", v)} placeholder="2,400+" />
                      <Field label="Change (optional)" value={m.change} onChange={(v: string) => updateMetric(i, "change", v)} placeholder="+120%" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={m.positive} onChange={(e) => updateMetric(i, "positive", e.target.checked)} className="accent-[#4ade80]" />
                      <span className="font-mono text-[9px] text-[#7878a0]">Positive change (green)</span>
                    </label>
                  </div>
                  {/* Preview */}
                  <div className="mt-4 pt-4 border-t border-[#1a1a30] text-center">
                    <div className="font-serif text-3xl font-light mb-0.5" style={{ color, fontFamily: "'Cormorant Garamond', serif" }}>{m.value || "—"}</div>
                    <div className="font-mono text-[8px] text-[#7878a0] uppercase tracking-widest">{m.label || "Metric Label"}</div>
                  </div>
                </div>
              ))}
            </div>
            {project.metrics.length === 0 && (
              <div className="text-center py-16 border border-dashed border-[#1a1a30]">
                <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-3">No metrics yet</p>
                <button onClick={addMetric} className="px-4 py-2 font-bold text-xs text-[#04040a]" style={{ background: color }}>+ Add First Metric</button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STACK & TOOLS ── */}
        {activeTab === "stack" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <h2 className="font-serif text-xl text-[#eeeef5] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Stack & Tools</h2>
            <div className="bg-[#0c0c18] border border-[#1a1a30] p-6">
              <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-2">Tech Stack (comma separated)</label>
              <textarea value={project.stack.join(", ")} onChange={(e) => set("stack", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                placeholder="HTML, CSS, JavaScript, PHP, React, Node.js..." rows={3} className="input-base text-sm resize-none" />
              <div className="flex flex-wrap gap-2 mt-4">
                {project.stack.map((s, i) => (
                  <span key={i} className="font-mono text-[9px] px-2.5 py-1 bg-[#07070f] border border-[#1a1a30] text-[#7878a0] flex items-center gap-1.5">
                    {s}
                    <button onClick={() => set("stack", project.stack.filter((_, idx) => idx !== i))} className="text-[#3a3a5c] hover:text-red-400 transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── LINKS ── */}
        {activeTab === "links" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <h2 className="font-serif text-xl text-[#eeeef5] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Project Links</h2>
            <div className="bg-[#0c0c18] border border-[#1a1a30] p-6 space-y-4">
              <Field label="Live Project URL" value={project.links.live} onChange={(v: string) => set("links", { ...project.links, live: v })} placeholder="https://yourproject.com" />
              <Field label="GitHub Repository" value={project.links.github} onChange={(v: string) => set("links", { ...project.links, github: v })} placeholder="https://github.com/..." />
              <Field label="Case Study URL (optional)" value={project.links.caseStudy} onChange={(v: string) => set("links", { ...project.links, caseStudy: v })} placeholder="https://..." />
            </div>
          </motion.div>
        )}

        {/* Bottom save */}
        <div className="mt-10 flex items-center justify-between pt-6 border-t border-[#1a1a30]">
          <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest">Saves to MongoDB · Updates live portfolio instantly</p>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 font-bold text-sm text-[#04040a] disabled:opacity-60 transition-all" style={{ background: color }}>
            {saving ? <span className="w-4 h-4 border-2 border-[#04040a]/30 border-t-[#04040a] rounded-full animate-spin" /> : null}
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Project →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjectEditor() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#04040a]">
        <div className="w-8 h-8 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin" />
      </div>
    }>
      <AdminProjectEditorInner />
    </Suspense>
  );
}
