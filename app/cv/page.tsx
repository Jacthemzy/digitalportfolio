"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Stage = "gate" | "loading" | "viewing" | "expired";

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

const DEFAULT_CV: CvData = {
  name: "Temidayo Jacob",
  title: "Software Developer · Product Manager · Digital Marketer",
  location: "Lagos State, Nigeria",
  email: "jacobtemidayo068@gmail.com",
  phone: "+2348106565953",
  linkedin: "linkedin.com/in/temidayo-j-210a752a9",
  portfolio: "portfolio-wine-pi-54.vercel.app",
  summary: "A versatile software developer with a strong foundation in computer science and hands-on experience in software development. Proficient in HTML, CSS, JavaScript, PHP, and Python, with a keen eye for detail and a passion for creating efficient, scalable and maintainable code. Also skilled in digital marketing strategies and tools, with experience in SEO, content creation and audience management. With growing experience as a Product Manager, I bring an understanding of product lifecycle, user-centered design, and business goals.",
  experience: [
    { role: "Front-End Developer", company: "Naija Prime", period: "2024", location: "Lagos, Nigeria", points: ["Developed a movie dashboard with user authentication, movie selection and payment gateway integration", "Designed a user-friendly interface for users to browse and pay for movies at discounted prices", "Created a content management system for creators to upload and manage movies", "Implemented responsive design and ensured a seamless user experience"] },
    { role: "Junior Software Engineer (Trainee)", company: "Sail Innovation Lab", period: "2023", location: "Lagos, Nigeria", points: ["Contributed to front-end development using HTML, CSS, and JavaScript", "Utilized Git for version control, actively participating in code reviews on GitHub", "Engaged in writing unit tests and ensuring code quality through various testing methodologies", "Demonstrated adaptability by quickly learning and incorporating new technologies", "Took ownership of specific tasks and features within projects"] },
  ],
  education: [{ degree: "B.Sc. Computer Science", school: "Adonai University", period: "2015 – 2019", notes: [] }],
  certifications: [
    { title: "Digital Marketing & Content Creation", issuer: "AI – Multimedia Academy", year: "2025" },
    { title: "Product Management", issuer: "NERD2FACTORY", year: "2024" },
    { title: "Software Development", issuer: "Sail Innovation Lab", year: "2023" },
    { title: "Graphics Design", issuer: "Douglo Computer Training", year: "2019 – 2022" },
  ],
  skills: {
    "Technical Skills": ["HTML", "CSS", "JavaScript", "PHP", "Python", "SQL", "Git", "VS Code", "XAMPP", "Advanced Excel"],
    "Product Management": ["Product Strategy", "Product Lifecycle", "User-Centered Design", "Market Research", "Campaign Management", "Problem Solving"],
    "Digital Marketing": ["SEO & SEM", "Social Media Strategy", "Content Creation", "Google Analytics", "Meta Ads Manager", "SEMrush", "Ahrefs"],
  },
  tools: ["Microsoft Office Suite", "Git", "VS Code", "Sublime Text", "XAMPP", "Corel Draw", "Photoshop", "Google Analytics", "Meta Ads Manager", "SEMrush", "Ahrefs", "GitHub"],
  projects: [
    { title: "BMI Calculator", desc: "A BMI calculator tool with user-friendly interface using JavaScript, HTML, and CSS. Implemented BMI calculation formula accurately to provide precise results. Designed interactive features including sliders, real-time result updates, and visual feedback.", stack: ["HTML", "CSS", "JavaScript"] },
    { title: "Naija Prime Movie Dashboard", desc: "A full movie platform with user authentication, movie browsing, payment gateway integration, and a CMS for creators to upload and manage content.", stack: ["HTML", "CSS", "JavaScript", "PHP"] },
  ],
  languages: ["English (Fluent)", "Yoruba (Native)"],
};

export default function CvPage() {
  const [stage, setStage] = useState<Stage>("gate");
  const [captcha, setCaptcha] = useState({ a: 0, b: 0, input: "" });
  const [captchaErr, setCaptchaErr] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [cv, setCv] = useState<CvData>(DEFAULT_CV);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    setCaptcha({ a, b, input: "" });
    fetch("/api/cv-data").then((r) => r.json()).then((d) => { if (d.cv) setCv(d.cv); }).catch(() => {});
  }, []);

  const unlock = async () => {
    if (parseInt(captcha.input) !== captcha.a + captcha.b) { setCaptchaErr(true); return; }
    setCaptchaErr(false); setStage("loading");
    try { await fetch("/api/cv", { method: "POST" }); } catch {}
    setStage("viewing"); setTimeLeft(90);
  };

  useEffect(() => {
    if (stage !== "viewing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current!); setStage("expired"); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [stage]);

  const reset = () => {
    const a = Math.floor(Math.random() * 12) + 1; const b = Math.floor(Math.random() * 12) + 1;
    setCaptcha({ a, b, input: "" }); setStage("gate"); setCaptchaErr(false);
  };

  const skillsObj: Record<string, string[]> = cv.skills instanceof Map ? Object.fromEntries(cv.skills as any) : (cv.skills || {});

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="section-label mb-5">Curriculum Vitae</div>
        <h1 className="font-display font-light text-[clamp(2.5rem,5vw,5rem)] text-[#eeeef5] mb-3 leading-tight">Temidayo&apos;s CV</h1>
        <p className="text-[#7878a0] mb-12 font-mono text-sm">View-only · 90-second session · No download · Solve to access</p>

        <AnimatePresence mode="wait">
          {stage === "gate" && (
            <motion.div key="gate" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="max-w-sm mx-auto">
              <div className="bg-[#0c0c18] border border-[#1a1a30] p-10 text-center">
                <div className="w-16 h-16 border border-[#e8c547]/30 flex items-center justify-center mx-auto mb-6 text-3xl">🔒</div>
                <h3 className="font-display text-2xl text-[#eeeef5] mb-2">Access Verification</h3>
                <p className="text-[#7878a0] text-sm mb-8">Solve the equation to unlock the CV for 90 seconds.</p>
                <div className="bg-[#07070f] border border-[#1a1a30] px-6 py-4 mb-4">
                  <p className="font-mono text-[#e8c547] text-xl">What is {captcha.a} + {captcha.b}?</p>
                </div>
                <input type="number" value={captcha.input} onChange={(e) => setCaptcha((c) => ({ ...c, input: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && unlock()} placeholder="Your answer" className="input-base text-center text-xl font-mono mb-3" />
                {captchaErr && <p className="font-mono text-[10px] text-red-400 mb-3">Incorrect. Try again.</p>}
                <button onClick={unlock} className="w-full py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all">Unlock CV →</button>
                <p className="font-mono text-[9px] text-[#3a3a5c] mt-4 uppercase tracking-widest">View-only · 90s · No download</p>
              </div>
            </motion.div>
          )}

          {stage === "loading" && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="text-center py-24">
              <div className="w-8 h-8 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin mx-auto mb-3" />
              <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">Unlocking...</p>
            </motion.div>
          )}

          {stage === "viewing" && (
            <motion.div key="viewing" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="sticky top-[68px] z-30 bg-[#04040a]/95 backdrop-blur-xl border-b border-[#1a1a30] py-3 mb-8 -mx-6 px-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest">Session active · Do not refresh</span>
                  <span className={`font-mono text-sm font-bold ${timeLeft <= 15 ? "text-red-400" : "text-[#e8c547]"}`}>{timeLeft}s remaining</span>
                </div>
                <div className="h-0.5 bg-[#1a1a30] overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${timeLeft <= 15 ? "bg-red-400" : "bg-[#e8c547]"}`} style={{ width: `${(timeLeft / 90) * 100}%` }} />
                </div>
              </div>

              <div className="bg-[#07070f] border border-[#1a1a30]" style={{ userSelect: "none", WebkitUserSelect: "none" as any }}>
                <div className="p-10 border-b border-[#1a1a30] bg-gradient-to-r from-[#0c0c18] to-[#07070f]">
                  <h2 className="font-display text-[3rem] font-light text-[#eeeef5] leading-none mb-2">{cv.name}</h2>
                  <p className="font-mono text-sm text-[#e8c547] mb-4 tracking-wide">{cv.title}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1">{[cv.phone, cv.email, cv.location].map((v, i) => <span key={i} className="font-mono text-[10px] text-[#7878a0]">{v}</span>)}</div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">{[cv.portfolio, cv.linkedin].map((v, i) => <span key={i} className="font-mono text-[10px] text-[#3a3a5c]">{v}</span>)}</div>
                </div>

                <div className="p-10 space-y-10">
                  <section>
                    <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-5">Career Objective</h3>
                    <p className="text-[#7878a0] leading-relaxed text-[14px]">{cv.summary}</p>
                  </section>

                  {cv.experience?.length > 0 && (
                    <section>
                      <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-6">Work Experience</h3>
                      <div className="space-y-8">
                        {cv.experience.map((exp, i) => (
                          <div key={i} className="relative pl-5 border-l border-[#1a1a30]">
                            <div className="absolute -left-1 top-1.5 w-2 h-2 bg-[#e8c547] rounded-full" />
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                              <div><h4 className="text-[#eeeef5] font-semibold text-base">{exp.role}</h4><p className="text-[#7878a0] text-sm">{exp.company} · {exp.location}</p></div>
                              <span className="font-mono text-[10px] text-[#3a3a5c] flex-shrink-0">{exp.period}</span>
                            </div>
                            <ul className="space-y-1.5">{exp.points?.map((pt, j) => <li key={j} className="text-[#7878a0] text-sm leading-relaxed flex gap-2"><span className="text-[#e8c547] flex-shrink-0 mt-0.5">—</span>{pt}</li>)}</ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {cv.projects?.length > 0 && (
                    <section>
                      <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-6">Projects</h3>
                      <div className="space-y-5">
                        {cv.projects.map((proj, i) => (
                          <div key={i} className="relative pl-5 border-l border-[#1a1a30]">
                            <div className="absolute -left-1 top-1.5 w-2 h-2 bg-[#e8c547] rounded-full" />
                            <h4 className="text-[#eeeef5] font-semibold text-sm mb-2">{proj.title}</h4>
                            <p className="text-[#7878a0] text-sm leading-relaxed mb-2">{proj.desc}</p>
                            <div className="flex flex-wrap gap-2">{proj.stack?.map((s, j) => <span key={j} className="font-mono text-[9px] px-2 py-0.5 border border-[#1a1a30] text-[#3a3a5c]">{s}</span>)}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {Object.keys(skillsObj).length > 0 && (
                    <section>
                      <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-6">Area of Expertise</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {Object.entries(skillsObj).map(([cat, skills]) => (
                          <div key={cat}><p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-3">{cat}</p><div className="flex flex-wrap gap-1.5">{skills?.map((s, i) => <span key={i} className="font-mono text-[9px] px-2 py-1 border border-[#1a1a30] text-[#7878a0]">{s}</span>)}</div></div>
                        ))}
                      </div>
                    </section>
                  )}

                  {cv.tools?.length > 0 && (
                    <section>
                      <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-5">Tools & Technologies</h3>
                      <div className="flex flex-wrap gap-2">{cv.tools.map((t, i) => <span key={i} className="font-mono text-[9px] px-2.5 py-1 border border-[#1a1a30] text-[#7878a0]">{t}</span>)}</div>
                    </section>
                  )}

                  {cv.education?.length > 0 && (
                    <section>
                      <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-6">Education</h3>
                      {cv.education.map((edu, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                          <div><h4 className="text-[#eeeef5] font-semibold">{edu.degree}</h4><p className="text-[#7878a0] text-sm">{edu.school}</p>{edu.notes?.map((n, j) => <p key={j} className="text-[#7878a0] text-xs flex gap-2 mt-1"><span className="text-[#e8c547]">✓</span>{n}</p>)}</div>
                          <span className="font-mono text-[10px] text-[#3a3a5c]">{edu.period}</span>
                        </div>
                      ))}
                    </section>
                  )}

                  {cv.certifications?.length > 0 && (
                    <section>
                      <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-5">Education / Certifications</h3>
                      <div className="space-y-3">
                        {cv.certifications.map((c, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-[#e8c547] flex-shrink-0 mt-0.5">✓</span>
                            <div><p className="text-[#eeeef5] text-sm font-medium">{c.title}</p><p className="font-mono text-[9px] text-[#3a3a5c]">{c.issuer} · {c.year}</p></div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {cv.languages?.length > 0 && (
                    <section>
                      <h3 className="font-mono text-[9px] uppercase tracking-[4px] text-[#e8c547] pb-3 border-b border-[#1a1a30] mb-4">Languages</h3>
                      <div className="flex gap-6">{cv.languages.map((l, i) => <span key={i} className="text-[#7878a0] text-sm">{l}</span>)}</div>
                    </section>
                  )}
                </div>

                <div className="border-t border-[#1a1a30] px-10 py-5 flex justify-between items-center">
                  <span className="font-mono text-[9px] text-[#3a3a5c]">{cv.name} — Portfolio CV · {new Date().getFullYear()}</span>
                  <span className="font-mono text-[9px] text-[#3a3a5c]">View-only · No download</span>
                </div>
              </div>
            </motion.div>
          )}

          {stage === "expired" && (
            <motion.div key="expired" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="max-w-sm mx-auto text-center py-16">
              <div className="text-5xl mb-5">⏱️</div>
              <h3 className="font-display text-2xl text-[#eeeef5] mb-3">Session Expired</h3>
              <p className="text-[#7878a0] text-sm mb-8">Your 90-second window has ended.</p>
              <button onClick={reset} className="px-8 py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all">Verify Again →</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
