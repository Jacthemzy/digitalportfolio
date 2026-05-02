"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface CvData {
  name: string; title: string; location: string; email: string;
  phone: string; linkedin: string; portfolio: string; summary: string;
  experience: { role: string; company: string; period: string; location: string; points: string[] }[];
  education: { degree: string; school: string; period: string; notes: string[] }[];
  certifications: { title: string; issuer: string; year: string }[];
  skills: Record<string, string[]>;
  tools: string[];
  projects: { title: string; desc: string; stack: string[] }[];
  languages: string[];
}

const EMPTY_CV: CvData = {
  name: "", title: "", location: "", email: "", phone: "", linkedin: "", portfolio: "", summary: "",
  experience: [], education: [], certifications: [], skills: {}, tools: [], projects: [], languages: [],
};

function Field({ label, value, onChange, multiline = false, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="input-base text-sm resize-none" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-base text-sm" />
      )}
    </div>
  );
}

export default function AdminCvEditor() {
  const router = useRouter();
  const [cv, setCv] = useState<CvData>(EMPTY_CV);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "experience" | "education" | "skills" | "projects" | "certs" | "tools">("basic");

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) { router.push("/admin"); return; }
    setToken(t);
    // Load existing CV
    fetch("/api/cv-data")
      .then((r) => r.json())
      .then((d) => { if (d.cv) setCv({ ...EMPTY_CV, ...d.cv, skills: d.cv.skills instanceof Object && !(d.cv.skills instanceof Map) ? d.cv.skills : {} }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/cv-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(cv),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const set = (key: keyof CvData, val: any) => setCv((prev) => ({ ...prev, [key]: val }));

  // Experience helpers
  const addExp = () => set("experience", [...cv.experience, { role: "", company: "", period: "", location: "", points: [""] }]);
  const removeExp = (i: number) => set("experience", cv.experience.filter((_, idx) => idx !== i));
  const updateExp = (i: number, field: string, val: string) => {
    const updated = [...cv.experience];
    (updated[i] as any)[field] = val;
    set("experience", updated);
  };
  const addExpPoint = (i: number) => { const updated = [...cv.experience]; updated[i].points.push(""); set("experience", updated); };
  const updateExpPoint = (i: number, j: number, val: string) => {
    const updated = [...cv.experience]; updated[i].points[j] = val; set("experience", updated);
  };
  const removeExpPoint = (i: number, j: number) => {
    const updated = [...cv.experience]; updated[i].points = updated[i].points.filter((_, idx) => idx !== j); set("experience", updated);
  };

  // Education helpers
  const addEdu = () => set("education", [...cv.education, { degree: "", school: "", period: "", notes: [] }]);
  const removeEdu = (i: number) => set("education", cv.education.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, field: string, val: string) => { const u = [...cv.education]; (u[i] as any)[field] = val; set("education", u); };

  // Cert helpers
  const addCert = () => set("certifications", [...cv.certifications, { title: "", issuer: "", year: "" }]);
  const removeCert = (i: number) => set("certifications", cv.certifications.filter((_, idx) => idx !== i));
  const updateCert = (i: number, field: string, val: string) => { const u = [...cv.certifications]; (u[i] as any)[field] = val; set("certifications", u); };

  // Skills helpers
  const skillCategories = Object.keys(cv.skills || {});
  const addSkillCategory = () => {
    const name = prompt("Skill category name (e.g. Technical Skills):");
    if (name) set("skills", { ...cv.skills, [name]: [] });
  };
  const removeSkillCategory = (cat: string) => { const s = { ...cv.skills }; delete s[cat]; set("skills", s); };
  const updateSkillCategory = (oldCat: string, skills: string[]) => { const s = { ...cv.skills }; s[oldCat] = skills; set("skills", s); };

  // Project helpers
  const addProj = () => set("projects", [...cv.projects, { title: "", desc: "", stack: [] }]);
  const removeProj = (i: number) => set("projects", cv.projects.filter((_, idx) => idx !== i));
  const updateProj = (i: number, field: string, val: any) => { const u = [...cv.projects]; (u[i] as any)[field] = val; set("projects", u); };

  const tabs = [
    { key: "basic", label: "Basic Info" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "projects", label: "Projects" },
    { key: "certs", label: "Certifications" },
    { key: "tools", label: "Tools" },
  ] as const;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040a]">
      <div className="w-8 h-8 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#04040a] pb-20">
      {/* Header */}
      <div className="bg-[#07070f] border-b border-[#1a1a30] px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] uppercase tracking-widest transition-colors">← Dashboard</Link>
          <div className="w-px h-4 bg-[#1a1a30]" />
          <div>
            <h1 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>CV Editor</h1>
            <p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest">Edit every section of your CV</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/cv" target="_blank" className="font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] uppercase tracking-widest transition-colors border border-[#1a1a30] px-3 py-2 hover:border-[#e8c547]/30">Preview CV ↗</Link>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] disabled:opacity-60 transition-all">
            {saving ? <span className="w-3 h-3 border-2 border-[#04040a]/30 border-t-[#04040a] rounded-full animate-spin" /> : null}
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save CV"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {saved && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6 p-4 bg-green-400/10 border border-green-400/20 text-green-400 font-mono text-[10px] uppercase tracking-widest">
            ✓ CV saved successfully! Changes are live on your portfolio.
          </motion.div>
        )}

        {/* Section tabs */}
        <div className="flex gap-1 flex-wrap mb-8 border-b border-[#1a1a30] pb-4">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 font-mono text-[9px] uppercase tracking-widest transition-all border ${
                activeTab === t.key ? "bg-[#e8c547] text-[#04040a] border-[#e8c547]" : "border-[#1a1a30] text-[#7878a0] hover:text-[#eeeef5] hover:border-[#242440]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* BASIC INFO */}
        {activeTab === "basic" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-5">
            <h2 className="font-serif text-xl text-[#eeeef5] mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" value={cv.name} onChange={(v) => set("name", v)} placeholder="Temidayo Jacob" />
              <Field label="Job Title" value={cv.title} onChange={(v) => set("title", v)} placeholder="Software Developer · Product Manager" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" value={cv.phone} onChange={(v) => set("phone", v)} placeholder="+2348106565953" />
              <Field label="Email" value={cv.email} onChange={(v) => set("email", v)} placeholder="jacobtemidayo068@gmail.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Location" value={cv.location} onChange={(v) => set("location", v)} placeholder="Lagos State, Nigeria" />
              <Field label="LinkedIn URL" value={cv.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/..." />
            </div>
            <Field label="Portfolio URL" value={cv.portfolio} onChange={(v) => set("portfolio", v)} placeholder="yoursite.vercel.app" />
            <Field label="Career Objective / Summary" value={cv.summary} onChange={(v) => set("summary", v)} multiline placeholder="Write your career objective here..." />
            <div>
              <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Languages (comma separated)</label>
              <input value={cv.languages?.join(", ")} onChange={(e) => set("languages", e.target.value.split(",").map((l) => l.trim()))} placeholder="English (Fluent), Yoruba (Native)" className="input-base text-sm" />
            </div>
          </motion.div>
        )}

        {/* EXPERIENCE */}
        {activeTab === "experience" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Work Experience</h2>
              <button onClick={addExp} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">+ Add Job</button>
            </div>
            <div className="space-y-8">
              {cv.experience.map((exp, i) => (
                <div key={i} className="bg-[#0c0c18] border border-[#1a1a30] p-6 relative">
                  <button onClick={() => removeExp(i)} className="absolute top-4 right-4 font-mono text-[9px] text-red-400/70 hover:text-red-400 border border-red-400/10 px-2 py-1 hover:border-red-400/30 transition-all">Remove</button>
                  <div className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Experience {i + 1}</div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Field label="Job Title / Role" value={exp.role} onChange={(v) => updateExp(i, "role", v)} placeholder="Front-End Developer" />
                    <Field label="Company" value={exp.company} onChange={(v) => updateExp(i, "company", v)} placeholder="Naija Prime" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <Field label="Period" value={exp.period} onChange={(v) => updateExp(i, "period", v)} placeholder="2024" />
                    <Field label="Location" value={exp.location} onChange={(v) => updateExp(i, "location", v)} placeholder="Lagos, Nigeria" />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-3">Bullet Points</label>
                    <div className="space-y-2">
                      {exp.points.map((pt, j) => (
                        <div key={j} className="flex gap-2 items-start">
                          <span className="text-[#e8c547] mt-3 flex-shrink-0 text-xs">—</span>
                          <input value={pt} onChange={(e) => updateExpPoint(i, j, e.target.value)} placeholder={`Point ${j + 1}`} className="input-base text-sm flex-1" />
                          <button onClick={() => removeExpPoint(i, j)} className="mt-2.5 text-[#3a3a5c] hover:text-red-400 transition-colors font-mono text-lg leading-none flex-shrink-0">×</button>
                        </div>
                      ))}
                      <button onClick={() => addExpPoint(i)} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest mt-2">+ Add point</button>
                    </div>
                  </div>
                </div>
              ))}
              {cv.experience.length === 0 && (
                <div className="text-center py-12 border border-dashed border-[#1a1a30]">
                  <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-3">No experience added yet</p>
                  <button onClick={addExp} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs">+ Add First Job</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* EDUCATION */}
        {activeTab === "education" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Education</h2>
              <button onClick={addEdu} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">+ Add Education</button>
            </div>
            <div className="space-y-5">
              {cv.education.map((edu, i) => (
                <div key={i} className="bg-[#0c0c18] border border-[#1a1a30] p-6 relative">
                  <button onClick={() => removeEdu(i)} className="absolute top-4 right-4 font-mono text-[9px] text-red-400/70 hover:text-red-400 border border-red-400/10 px-2 py-1 hover:border-red-400/30 transition-all">Remove</button>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Field label="Degree / Qualification" value={edu.degree} onChange={(v) => updateEdu(i, "degree", v)} placeholder="B.Sc. Computer Science" />
                    <Field label="School / Institution" value={edu.school} onChange={(v) => updateEdu(i, "school", v)} placeholder="Adonai University" />
                  </div>
                  <Field label="Period" value={edu.period} onChange={(v) => updateEdu(i, "period", v)} placeholder="2015 – 2019" />
                </div>
              ))}
              {cv.education.length === 0 && (
                <div className="text-center py-12 border border-dashed border-[#1a1a30]">
                  <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-3">No education added yet</p>
                  <button onClick={addEdu} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs">+ Add Education</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SKILLS */}
        {activeTab === "skills" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Skills</h2>
              <button onClick={addSkillCategory} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">+ Add Category</button>
            </div>
            <div className="space-y-5">
              {Object.entries(cv.skills || {}).map(([cat, skills]) => (
                <div key={cat} className="bg-[#0c0c18] border border-[#1a1a30] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] text-[#e8c547] uppercase tracking-widest">{cat}</span>
                    <button onClick={() => removeSkillCategory(cat)} className="font-mono text-[9px] text-red-400/70 hover:text-red-400 border border-red-400/10 px-2 py-1 hover:border-red-400/30 transition-all">Remove Category</button>
                  </div>
                  <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-2">Skills (comma separated)</label>
                  <input
                    value={skills.join(", ")}
                    onChange={(e) => updateSkillCategory(cat, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    placeholder="HTML, CSS, JavaScript, Python..."
                    className="input-base text-sm"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((s, i) => <span key={i} className="font-mono text-[9px] px-2.5 py-1 bg-[#07070f] border border-[#1a1a30] text-[#7878a0]">{s}</span>)}
                  </div>
                </div>
              ))}
              {Object.keys(cv.skills || {}).length === 0 && (
                <div className="text-center py-12 border border-dashed border-[#1a1a30]">
                  <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-3">No skill categories yet</p>
                  <button onClick={addSkillCategory} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs">+ Add Category</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PROJECTS */}
        {activeTab === "projects" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Projects</h2>
              <button onClick={addProj} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">+ Add Project</button>
            </div>
            <div className="space-y-5">
              {cv.projects.map((proj, i) => (
                <div key={i} className="bg-[#0c0c18] border border-[#1a1a30] p-6 relative">
                  <button onClick={() => removeProj(i)} className="absolute top-4 right-4 font-mono text-[9px] text-red-400/70 hover:text-red-400 border border-red-400/10 px-2 py-1 hover:border-red-400/30 transition-all">Remove</button>
                  <div className="space-y-3">
                    <Field label="Project Title" value={proj.title} onChange={(v) => updateProj(i, "title", v)} placeholder="BMI Calculator" />
                    <Field label="Description" value={proj.desc} onChange={(v) => updateProj(i, "desc", v)} multiline placeholder="Describe what you built and how..." />
                    <div>
                      <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Tech Stack (comma separated)</label>
                      <input value={proj.stack?.join(", ")} onChange={(e) => updateProj(i, "stack", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="HTML, CSS, JavaScript" className="input-base text-sm" />
                    </div>
                  </div>
                </div>
              ))}
              {cv.projects.length === 0 && (
                <div className="text-center py-12 border border-dashed border-[#1a1a30]">
                  <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-3">No projects added yet</p>
                  <button onClick={addProj} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs">+ Add Project</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CERTIFICATIONS */}
        {activeTab === "certs" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-[#eeeef5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Certifications</h2>
              <button onClick={addCert} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">+ Add Certification</button>
            </div>
            <div className="space-y-4">
              {cv.certifications.map((cert, i) => (
                <div key={i} className="bg-[#0c0c18] border border-[#1a1a30] p-5 relative">
                  <button onClick={() => removeCert(i)} className="absolute top-4 right-4 font-mono text-[9px] text-red-400/70 hover:text-red-400 border border-red-400/10 px-2 py-1 hover:border-red-400/30 transition-all">Remove</button>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><Field label="Certificate / Course Title" value={cert.title} onChange={(v) => updateCert(i, "title", v)} placeholder="Google Analytics Certification" /></div>
                    <Field label="Year" value={cert.year} onChange={(v) => updateCert(i, "year", v)} placeholder="2024" />
                  </div>
                  <div className="mt-3"><Field label="Issuer / Institution" value={cert.issuer} onChange={(v) => updateCert(i, "issuer", v)} placeholder="Google, NERD2FACTORY..." /></div>
                </div>
              ))}
              {cv.certifications.length === 0 && (
                <div className="text-center py-12 border border-dashed border-[#1a1a30]">
                  <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-3">No certifications added yet</p>
                  <button onClick={addCert} className="px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-xs">+ Add Certification</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TOOLS */}
        {activeTab === "tools" && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <h2 className="font-serif text-xl text-[#eeeef5] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Tools & Technologies</h2>
            <div className="bg-[#0c0c18] border border-[#1a1a30] p-6">
              <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-2">Tools (comma separated)</label>
              <textarea
                value={cv.tools?.join(", ")}
                onChange={(e) => set("tools", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                placeholder="Microsoft Office Suite, Git, VS Code, Photoshop..."
                rows={4}
                className="input-base text-sm resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {cv.tools?.map((t, i) => (
                  <span key={i} className="font-mono text-[9px] px-2.5 py-1 bg-[#07070f] border border-[#1a1a30] text-[#7878a0] flex items-center gap-2">
                    {t}
                    <button onClick={() => set("tools", cv.tools.filter((_, idx) => idx !== i))} className="text-[#3a3a5c] hover:text-red-400 transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Save button bottom */}
        <div className="mt-10 flex items-center justify-between pt-6 border-t border-[#1a1a30]">
          <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest">Changes save to MongoDB and update your live CV instantly</p>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] disabled:opacity-60 transition-all">
            {saving ? <span className="w-4 h-4 border-2 border-[#04040a]/30 border-t-[#04040a] rounded-full animate-spin" /> : null}
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save CV →"}
          </button>
        </div>
      </div>
    </div>
  );
}
