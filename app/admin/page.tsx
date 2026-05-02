"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin/dashboard");
      } else { setError(data.error || "Invalid credentials"); }
    } catch { setError("Network error. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "#04040a" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(232,197,71,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(232,197,71,.025) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#e8c547]/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:[0.16,1,0.3,1] }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 border border-[#e8c547] flex items-center justify-center mx-auto mb-5">
            <span className="font-serif font-bold text-[#e8c547] text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>TJ</span>
          </div>
          <h1 className="text-3xl text-[#eeeef5] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Admin Portal</h1>
          <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Temidayo Jacob · Portfolio System</p>
        </div>
        <form onSubmit={handleLogin} className="bg-[#0c0c18] border border-[#1a1a30] p-8 space-y-5">
          <div>
            <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@temidayo.com" className="input-base" />
          </div>
          <div>
            <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••••" className="input-base" />
          </div>
          {error && <p className="font-mono text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-2.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-[#04040a]/30 border-t-[#04040a] rounded-full animate-spin" />}
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
        <p className="text-center font-mono text-[9px] text-[#3a3a5c] mt-5 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Restricted access · Authorised personnel only</p>
      </motion.div>
    </div>
  );
}
