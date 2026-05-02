"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Project {
  _id: string; num: string; title: string; type: string;
  tagColor: string; year: string; status: string; featured: boolean;
  phases: { name: string; status: string }[];
}

const typeColors: Record<string,string> = { software:"#a78bfa", product:"#e8c547", marketing:"#4fc3f7", design:"#f97316" };
const typeIcons: Record<string,string> = { software:"💻", product:"📋", marketing:"📈", design:"🎨" };

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) { router.push("/admin"); return; }
    setToken(t);
  }, [router]);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push("/admin"); return; }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {}
    setLoading(false);
  }, [token, router]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-[#04040a] pb-20">
      {/* Header */}
      <div className="bg-[#07070f] border-b border-[#1a1a30] px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] uppercase tracking-widest transition-colors">← Dashboard</Link>
          <div className="w-px h-4 bg-[#1a1a30]" />
          <div>
            <h1 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300 }}>Projects</h1>
            <p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest">{projects.length} total</p>
          </div>
        </div>
        <Link href="/admin/projects/editor" className="px-5 py-2.5 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">
          + New Project
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">Loading projects...</p>
          </div>
        ) : (
          <div className="space-y-px">
            {projects.map((p, i) => {
              const color = typeColors[p.type] || "#e8c547";
              const icon = typeIcons[p.type] || "📋";
              const completed = p.phases?.filter(ph => ph.status === "completed").length || 0;
              const total = p.phases?.length || 0;
              return (
                <motion.div key={p._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                  className="bg-[#0c0c18] border border-[#1a1a30] p-5 flex items-center justify-between gap-4 hover:border-[#242440] transition-all">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="font-mono text-[9px] text-[#3a3a5c] flex-shrink-0">{p.num || String(i+1).padStart(2,"0")}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[#eeeef5] font-medium text-sm truncate">{p.title}</span>
                        <span className="font-mono text-[8px] px-2 py-0.5 border rounded-sm flex-shrink-0" style={{ borderColor: color+"40", color }}>{icon} {p.type}</span>
                        {p.featured && <span className="font-mono text-[8px] px-2 py-0.5 border border-[#e8c547]/30 text-[#e8c547] flex-shrink-0">Featured</span>}
                        <span className={`font-mono text-[8px] px-2 py-0.5 border rounded-sm flex-shrink-0 ${p.status==="completed"?"border-green-400/30 text-green-400":p.status==="in-progress"?"border-yellow-400/30 text-yellow-400":"border-[#1a1a30] text-[#3a3a5c]"}`}>{p.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-[#3a3a5c]">{p.year}</span>
                        {total > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1 bg-[#1a1a30] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:`${(completed/total)*100}%`, background: color }} />
                            </div>
                            <span className="font-mono text-[8px] text-[#3a3a5c]">{completed}/{total} phases</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/projects/${p._id}`} target="_blank" className="font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] border border-[#1a1a30] px-3 py-1.5 hover:border-[#e8c547]/30 transition-all">View ↗</Link>
                    <Link href={`/admin/projects/editor?id=${p._id}`} className="font-mono text-[9px] text-[#7878a0] hover:text-[#eeeef5] border border-[#1a1a30] px-3 py-1.5 hover:border-[#242440] transition-all">Edit</Link>
                    <button onClick={() => deleteProject(p._id)} className="font-mono text-[9px] text-red-400/70 hover:text-red-400 border border-red-400/10 px-3 py-1.5 hover:border-red-400/30 transition-all">Delete</button>
                  </div>
                </motion.div>
              );
            })}
            {projects.length === 0 && (
              <div className="text-center py-20 border border-dashed border-[#1a1a30]">
                <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-4">No projects yet</p>
                <Link href="/admin/projects/editor" className="px-5 py-2.5 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">+ Create First Project</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
