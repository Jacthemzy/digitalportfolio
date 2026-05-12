"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Tab = "overview"|"messages"|"audit"|"home"|"about"|"skills"|"projects"|"thinking"|"impact"|"achievements"|"cv"|"analytics"|"settings";
type ContentSectionKey = "home" | "about" | "skills" | "productThinking" | "socialImpact" | "settings";

interface ThreadMessage {
  _id: string;
  sender: "user" | "admin" | "system";
  message: string;
  createdAt: string;
  readByAdmin: boolean;
  readByUser: boolean;
  deletedByUserAt?: string | null;
  deletedForUser?: boolean;
}

interface Msg {
  _id: string;
  sessionId: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  unreadCount: number;
  createdAt: string;
  blocked: boolean;
  blockedReason?: string;
  restricted: boolean;
  restrictedReason?: string;
  messages: ThreadMessage[];
}

interface ChatAudit {
  _id: string;
  action: string;
  actor: "admin" | "user" | "system";
  sessionId?: string;
  messageId?: string;
  createdAt: string;
}

const NAV_ITEMS: {key:Tab; label:string; icon:string; group:string}[] = [
  {key:"overview",label:"Overview",icon:"◈",group:"dashboard"},
  {key:"messages",label:"Messages",icon:"💬",group:"dashboard"},
  {key:"audit",label:"Audit Logs",icon:"🧾",group:"dashboard"},
  {key:"analytics",label:"Analytics",icon:"△",group:"dashboard"},
  {key:"home",label:"Home Page",icon:"🏠",group:"pages"},
  {key:"about",label:"About Page",icon:"👤",group:"pages"},
  {key:"skills",label:"Skills Page",icon:"🛠",group:"pages"},
  {key:"thinking",label:"Product Thinking",icon:"🧠",group:"pages"},
  {key:"impact",label:"Social Impact",icon:"🌍",group:"pages"},
  {key:"projects",label:"Projects",icon:"📁",group:"content"},
  {key:"achievements",label:"Achievements",icon:"🏆",group:"content"},
  {key:"cv",label:"CV Editor",icon:"📄",group:"content"},
  {key:"settings",label:"Settings",icon:"⚙",group:"system"},
];

const SECTION_BY_TAB: Partial<Record<Tab, ContentSectionKey>> = {
  home: "home",
  about: "about",
  skills: "skills",
  thinking: "productThinking",
  impact: "socialImpact",
  settings: "settings",
};

function Field({label,value,onChange,multiline=false,placeholder=""}:{label:string;value:string;onChange:(v:string)=>void;multiline?:boolean;placeholder?:string}) {
  return (
    <div>
      <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} className="input-base text-sm resize-none"/>
        : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input-base text-sm"/>
      }
    </div>
  );
}

function SaveBar({saving,saved,onSave,color="#e8c547"}:{saving:boolean;saved:boolean;onSave:()=>void;color?:string}) {
  return (
    <div className="sticky bottom-0 bg-[#07070f] border-t border-[#1a1a30] px-6 py-4 flex items-center justify-between z-20 -mx-6">
      <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest">Changes save to MongoDB and update your portfolio instantly</p>
      <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 font-bold text-xs text-[#04040a] disabled:opacity-60 transition-all" style={{background:color}}>
        {saving && <span className="w-3 h-3 border-2 border-[#04040a]/30 border-t-[#04040a] rounded-full animate-spin"/>}
        {saving?"Saving...":saved?"✓ Saved!":"Save Changes →"}
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [audits, setAudits] = useState<ChatAudit[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<Msg|null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [analytics, setAnalytics] = useState<any>({pages:[],daily:[],total:0});
  const [projectCount, setProjectCount] = useState(0);
  const [achCount, setAchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [siteData, setSiteData] = useState<Record<string,any>>({});
  const [loadedSections, setLoadedSections] = useState<Record<string, boolean>>({});
  const [loadedResources, setLoadedResources] = useState<Record<string, boolean>>({});
  const [mobileNav, setMobileNav] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [auditActorFilter, setAuditActorFilter] = useState<"all" | "admin" | "user" | "system">("all");
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [auditFromDate, setAuditFromDate] = useState("");
  const [auditToDate, setAuditToDate] = useState("");

  const h = useCallback(()=>({
    "Content-Type":"application/json",
    Authorization:`Bearer ${token}`,
  }),[token]);

  useEffect(()=>{
    const t = localStorage.getItem("admin_token");
    if(!t){router.push("/admin");return;}
    setToken(t);
  },[router]);

  const fetchOverview = useCallback(async()=>{
    if(!token) return;
    setLoading(true);
    try {
      const [msgR,anaR,projR,achR] = await Promise.all([
        fetch("/api/admin/messages",{headers:h()}),
        fetch("/api/admin/analytics",{headers:h()}),
        fetch("/api/admin/projects",{headers:h()}),
        fetch("/api/admin/achievements",{headers:h()}),
      ]);
      if(msgR.status===401){router.push("/admin");return;}
      const [md,ad,pd,acd] = await Promise.all([msgR.json(),anaR.json(),projR.json(),achR.json()]);
      const threads = md.threads || md.messages || [];
      setMessages(threads);
      setAudits(md.audits || []);
      setSelectedMsg((current)=> {
        if (!current) return threads[0] || null;
        return threads.find((thread: Msg) => thread.sessionId === current.sessionId) || threads[0] || null;
      });
      setAnalytics(ad);
      setProjectCount((pd.projects||[]).length);
      setAchCount((acd.achievements||[]).length);
      setLoadedResources((current) => ({
        ...current,
        overview: true,
        messages: true,
        analytics: true,
        projects: true,
        achievements: true,
      }));
    } catch{}
    setLoading(false);
  },[token,h,router]);

  const fetchSection = useCallback(async(section: string)=>{
    if(!section || loadedSections[section]) return;
    setSectionLoading(true);
    try {
      const res = await fetch(`/api/site-content?section=${section}`);
      const data = await res.json();
      setSiteData((current)=>({ ...current, [section]: data.data || {} }));
      setLoadedSections((current)=>({ ...current, [section]: true }));
    } catch {}
    setSectionLoading(false);
  },[loadedSections]);

  useEffect(()=>{fetchOverview();},[fetchOverview]);

  useEffect(()=>{
    const section = SECTION_BY_TAB[tab];
    if(section) fetchSection(section);
  },[tab, fetchSection]);

  const saveSection = async(section:string, data:any)=>{
    setSaving(true);
    try {
      await fetch("/api/site-content",{
        method:"PUT",
        headers:h(),
        body:JSON.stringify({section,data}),
      });
      setSaved(true);
      setTimeout(()=>setSaved(false),3000);
    } catch{}
    setSaving(false);
  };

  const get = (section:string) => siteData[section] || {};
  const setSection = (section:string, val:any) => setSiteData(p=>({...p,[section]:val}));
  const setField = (section:string, key:string, val:any) => setSiteData(p=>({...p,[section]:{...p[section],[key]:val}}));

  const logout = ()=>{localStorage.removeItem("admin_token");router.push("/admin");};
  const unread = messages.reduce((total, thread) => total + (thread.unreadCount || 0), 0);

  const markRead = async(sessionId:string)=>{
    await fetch("/api/admin/messages",{method:"PATCH",headers:h(),body:JSON.stringify({sessionId, action:"mark_read"})});
    fetchOverview();
  };
  const deleteMsg = async(sessionId:string)=>{
    await fetch("/api/admin/messages",{method:"DELETE",headers:h(),body:JSON.stringify({sessionId})});
    setSelectedMsg(null);fetchOverview();
  };
  const moderateThread = async(action:"block"|"unblock"|"restrict"|"unrestrict", sessionId:string)=>{
    const reason = action === "block"
      ? "Blocked by admin."
      : action === "restrict"
        ? "Replies are currently restricted."
        : "";
    await fetch("/api/admin/messages",{method:"PATCH",headers:h(),body:JSON.stringify({sessionId, action, reason})});
    fetchOverview();
  };
  const sendReply = async()=>{
    if(!selectedMsg || !replyText.trim() || replying) return;
    setReplying(true);
    try {
      await fetch("/api/admin/messages",{
        method:"POST",
        headers:h(),
        body:JSON.stringify({sessionId:selectedMsg.sessionId, message:replyText}),
      });
      setReplyText("");
      fetchOverview();
    } catch {}
    setReplying(false);
  };

  const exportChats = async () => {
    const response = await fetch("/api/admin/messages/export", { headers: h() });
    if (!response.ok) return;
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const applyRetention = async () => {
    setRetentionLoading(true);
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: h(),
        body: JSON.stringify({ action: "apply_retention", days: retentionDays }),
      });
      fetchOverview();
    } catch {}
    setRetentionLoading(false);
  };

  const filteredAudits = audits.filter((audit) => {
    if (auditActorFilter !== "all" && audit.actor !== auditActorFilter) return false;
    if (auditActionFilter !== "all" && audit.action !== auditActionFilter) return false;
    const createdAt = new Date(audit.createdAt).getTime();
    if (auditFromDate) {
      const from = new Date(auditFromDate).getTime();
      if (createdAt < from) return false;
    }
    if (auditToDate) {
      const to = new Date(auditToDate).getTime() + (24 * 60 * 60 * 1000 - 1);
      if (createdAt > to) return false;
    }
    return true;
  });

  const uniqueAuditActions = Array.from(new Set(audits.map((audit) => audit.action))).sort();

  const exportFilteredAudits = () => {
    const blob = new Blob([JSON.stringify({
      exportedAt: new Date().toISOString(),
      filters: {
        actor: auditActorFilter,
        action: auditActionFilter,
        from: auditFromDate || null,
        to: auditToDate || null,
      },
      count: filteredAudits.length,
      items: filteredAudits,
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const deleteThreadMessage = async (messageId: string) => {
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: h(),
      body: JSON.stringify({ messageId }),
    });
    fetchOverview();
  };

  if(loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040a]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin mx-auto mb-3"/>
        <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">Loading dashboard...</p>
      </div>
    </div>
  );

  const groups = [
    {label:"Dashboard",keys:["overview","messages","audit","analytics"]},
    {label:"Edit Pages",keys:["home","about","skills","thinking","impact"]},
    {label:"Content",keys:["projects","achievements","cv"]},
    {label:"System",keys:["settings"]},
  ];

  const Sidebar = ()=>(
    <aside className="w-56 bg-[#07070f] border-r border-[#1a1a30] flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-[#1a1a30] flex items-center gap-3">
        <div className="w-8 h-8 border border-[#e8c547] flex items-center justify-center font-serif font-bold text-[#e8c547] text-sm" style={{fontFamily:"'Cormorant Garamond',serif"}}>TJ</div>
        <div><p className="text-[#eeeef5] text-xs font-semibold">Admin Panel</p><p className="font-mono text-[7px] text-[#3a3a5c] uppercase tracking-widest">Portfolio System</p></div>
      </div>
      <nav className="flex-1 p-3">
        {groups.map(g=>(
          <div key={g.label} className="mb-4">
            <p className="font-mono text-[7px] text-[#3a3a5c] uppercase tracking-[3px] px-2 mb-2">{g.label}</p>
            {NAV_ITEMS.filter(i=>g.keys.includes(i.key)).map(item=>(
              <button key={item.key} onClick={()=>{setTab(item.key);setMobileNav(false);}}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all rounded-sm border mb-0.5 ${tab===item.key?"bg-[#e8c547]/10 border-[#e8c547]/20 text-[#e8c547]":"border-transparent text-[#7878a0] hover:text-[#eeeef5] hover:bg-[#1a1a30]/50"}`}>
                <span className="text-sm">{item.icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest">{item.label}</span>
                {item.key==="messages" && unread>0 && <span className="ml-auto bg-red-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-[#1a1a30]">
        <Link href="/" target="_blank" className="w-full flex items-center gap-2 px-3 py-2 font-mono text-[9px] text-[#3a3a5c] hover:text-[#e8c547] transition-colors uppercase tracking-widest">
          <span>↗</span> View Portfolio
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 font-mono text-[9px] text-[#3a3a5c] hover:text-red-400 transition-colors uppercase tracking-widest text-left">
          <span>←</span> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#04040a]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 z-50"><Sidebar/></div>

      {/* Mobile nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#07070f] border-b border-[#1a1a30] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-[#e8c547] flex items-center justify-center font-serif font-bold text-[#e8c547] text-xs" style={{fontFamily:"'Cormorant Garamond',serif"}}>TJ</div>
          <span className="font-mono text-[9px] text-[#eeeef5] uppercase tracking-widest">Admin · {NAV_ITEMS.find(i=>i.key===tab)?.label}</span>
        </div>
        <button onClick={()=>setMobileNav(!mobileNav)} className="text-[#7878a0] hover:text-[#eeeef5] p-1">
          {mobileNav ? "✕" : "☰"}
        </button>
      </div>
      <AnimatePresence>
        {mobileNav && (
          <motion.div initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{duration:0.3}}
            className="lg:hidden fixed inset-0 z-40 pt-14">
            <div className="w-64 h-full bg-[#07070f] border-r border-[#1a1a30]"><Sidebar/></div>
            <div className="flex-1 bg-[#04040a]/80" onClick={()=>setMobileNav(false)}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 min-h-screen overflow-y-auto pt-14 lg:pt-0">
        <div className="p-5 md:p-8 pb-24">

          {/* ── OVERVIEW ── */}
          {tab==="overview" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Dashboard</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Welcome back, Temidayo.</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  {label:"Messages",value:messages.length,color:"#e8c547",sub:"All time"},
                  {label:"Unread",value:unread,color:unread>0?"#f87171":"#4ade80",sub:unread>0?"Action needed":"All clear"},
                  {label:"Projects",value:projectCount,color:"#a78bfa",sub:"In portfolio"},
                  {label:"Achievements",value:achCount,color:"#4fc3f7",sub:"Published"},
                ].map((s,i)=>(
                  <div key={i} className="bg-[#0c0c18] border border-[#1a1a30] p-4 md:p-5">
                    <p className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest mb-3">{s.label}</p>
                    <div className="font-serif text-4xl font-light mb-1" style={{color:s.color,fontFamily:"'Cormorant Garamond',serif"}}>{s.value}</div>
                    <p className="font-mono text-[8px] text-[#3a3a5c]">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#0c0c18] border border-[#1a1a30] p-5 mb-5">
                <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {label:"New Project",icon:"📁",href:"/admin/projects/editor"},
                    {label:"Edit CV",icon:"📄",action:()=>setTab("cv")},
                    {label:"Edit Home",icon:"🏠",action:()=>setTab("home")},
                    {label:"Messages",icon:"💬",action:()=>setTab("messages")},
                  ].map((a,i)=>(
                    a.href
                      ? <Link key={i} href={a.href} className="flex items-center gap-2 p-3 border border-[#1a1a30] hover:border-[#e8c547]/30 hover:text-[#e8c547] transition-all font-mono text-[9px] text-[#7878a0] uppercase tracking-widest"><span>{a.icon}</span>{a.label}</Link>
                      : <button key={i} onClick={a.action} className="flex items-center gap-2 p-3 border border-[#1a1a30] hover:border-[#e8c547]/30 hover:text-[#e8c547] transition-all font-mono text-[9px] text-[#7878a0] uppercase tracking-widest text-left"><span>{a.icon}</span>{a.label}</button>
                  ))}
                </div>
              </div>
              <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Recent Messages</h3>
                {messages.slice(0,5).map(m=>(
                  <div key={m.sessionId} className="flex items-center gap-3 py-2.5 border-b border-[#1a1a30] last:border-0 cursor-pointer hover:bg-[#0c0c18]" onClick={()=>{setSelectedMsg(m);setTab("messages");}}>
                    {m.unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#e8c547] flex-shrink-0"/>}
                    <div className="flex-1 min-w-0"><p className="text-[#eeeef5] text-sm font-medium">{m.name}</p><p className="text-[#7878a0] text-xs truncate">{m.message}</p></div>
                    <span className="font-mono text-[9px] text-[#3a3a5c] flex-shrink-0">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
                {messages.length===0 && <p className="font-mono text-[10px] text-[#3a3a5c] py-4 text-center uppercase tracking-widest">No messages yet</p>}
              </div>
            </motion.div>
          )}

          {/* ── MESSAGES ── */}
          {tab==="messages" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Messages</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">{unread} unread · {messages.length} conversations</p>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {messages.map(m=>(
                    <div key={m.sessionId} onClick={()=>{setSelectedMsg(m);if(m.unreadCount>0)markRead(m.sessionId);}}
                      className={`p-4 border cursor-pointer transition-all ${selectedMsg?.sessionId===m.sessionId?"border-[#e8c547]/30 bg-[#0c0c18]":"border-[#1a1a30] bg-[#07070f] hover:border-[#242440]"}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {m.unreadCount>0 && <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] flex-shrink-0"/>}
                            <span className="text-[#eeeef5] text-sm font-semibold">{m.name}</span>
                            {m.restricted && <span className="font-mono text-[8px] px-2 py-0.5 border border-yellow-400/20 text-yellow-400">Restricted</span>}
                            {m.blocked && <span className="font-mono text-[8px] px-2 py-0.5 border border-red-400/20 text-red-400">Blocked</span>}
                          </div>
                          <p className="font-mono text-[9px] text-[#3a3a5c] mb-1">{m.email}</p>
                          <p className="text-[#7878a0] text-xs truncate">{m.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-mono text-[9px] text-[#3a3a5c] block">{new Date(m.createdAt).toLocaleDateString()}</span>
                          {m.unreadCount>0 && <span className="font-mono text-[9px] text-[#e8c547]">{m.unreadCount} new</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.length===0 && <p className="font-mono text-[10px] text-[#3a3a5c] py-8 text-center uppercase tracking-widest">No messages yet</p>}
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5 h-fit lg:sticky lg:top-8">
                  {selectedMsg ? (
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-xl text-[#eeeef5]" style={{fontFamily:"'Cormorant Garamond',serif"}}>{selectedMsg.name}</h3>
                          <a href={`mailto:${selectedMsg.email}`} className="font-mono text-[10px] text-[#e8c547] hover:underline">{selectedMsg.email}</a>
                        </div>
                        <button onClick={()=>deleteMsg(selectedMsg.sessionId)} className="font-mono text-[9px] text-red-400 border border-red-400/20 px-3 py-1.5 hover:bg-red-400/10 transition-all">Delete</button>
                      </div>
                      <p className="font-mono text-[9px] text-[#3a3a5c] mb-4">{new Date(selectedMsg.createdAt).toLocaleString()}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={()=>markRead(selectedMsg.sessionId)} className="font-mono text-[9px] text-[#e8c547] border border-[#e8c547]/20 px-3 py-1.5 hover:bg-[#e8c547]/10 transition-all">Mark Read</button>
                        <button onClick={()=>moderateThread(selectedMsg.restricted ? "unrestrict" : "restrict", selectedMsg.sessionId)} className="font-mono text-[9px] text-yellow-400 border border-yellow-400/20 px-3 py-1.5 hover:bg-yellow-400/10 transition-all">
                          {selectedMsg.restricted ? "Unrestrict" : "Restrict"}
                        </button>
                        <button onClick={()=>moderateThread(selectedMsg.blocked ? "unblock" : "block", selectedMsg.sessionId)} className="font-mono text-[9px] text-red-400 border border-red-400/20 px-3 py-1.5 hover:bg-red-400/10 transition-all">
                          {selectedMsg.blocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                      {(selectedMsg.restrictedReason || selectedMsg.blockedReason) && (
                        <div className="bg-[#07070f] border border-[#1a1a30] p-3 mb-4">
                          <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-1">Moderation status</p>
                          <p className="text-[#7878a0] text-xs">{selectedMsg.blockedReason || selectedMsg.restrictedReason}</p>
                        </div>
                      )}
                      <div className="space-y-3 mb-4 max-h-[360px] overflow-y-auto pr-1">
                        {selectedMsg.messages.map((threadMsg)=>(
                          <div key={threadMsg._id} className={`p-4 border ${threadMsg.sender==="admin"?"bg-[#0b1516] border-[#1f3931]":"bg-[#07070f] border-[#1a1a30]"}`}>
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <span className={`font-mono text-[9px] uppercase tracking-widest ${threadMsg.sender==="admin"?"text-[#25d366]":"text-[#e8c547]"}`}>{threadMsg.sender==="admin"?"Admin reply":"Visitor message"}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] text-[#3a3a5c]">{new Date(threadMsg.createdAt).toLocaleString()}</span>
                                <button
                                  onClick={() => deleteThreadMessage(threadMsg._id)}
                                  className="font-mono text-[8px] text-red-400 border border-red-400/20 px-2 py-1 hover:bg-red-400/10 transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <p className="text-[#eeeef5] text-sm leading-relaxed whitespace-pre-wrap">{threadMsg.message}</p>
                            {threadMsg.deletedByUserAt && (
                              <p className="mt-2 font-mono text-[9px] text-yellow-400">
                                User deleted this message from their view.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#07070f] border border-[#1a1a30] p-3 mb-4">
                        <p className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest mb-2">Recent Audit Activity</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {audits.slice(0, 8).map((audit) => (
                            <div key={audit._id} className="text-xs text-[#7878a0]">
                              <span className="text-[#eeeef5]">{audit.action}</span> · {audit.actor} · {new Date(audit.createdAt).toLocaleString()}
                            </div>
                          ))}
                          {audits.length === 0 && <p className="text-xs text-[#3a3a5c]">No audit logs yet.</p>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <textarea value={replyText} onChange={(e)=>setReplyText(e.target.value)} rows={4} placeholder="Reply to this person here. They will see it in chat and get an email notification." className="input-base text-sm resize-none" />
                        <button onClick={sendReply} disabled={replying || !replyText.trim()} className="flex items-center justify-center gap-2 w-full py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] disabled:opacity-60 transition-all">
                          {replying ? "Sending..." : "Send Reply →"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16"><p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">Select a message to view</p></div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── AUDIT LOGS ── */}
          {tab==="audit" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Audit Logs</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">{filteredAudits.length} entries shown · {audits.length} total</p>

              <div className="bg-[#0c0c18] border border-[#1a1a30] p-5 mb-4">
                <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Filters</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Actor</label>
                    <select value={auditActorFilter} onChange={(event)=>setAuditActorFilter(event.target.value as "all" | "admin" | "user" | "system")} className="input-base text-sm">
                      <option value="all">All actors</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Action</label>
                    <select value={auditActionFilter} onChange={(event)=>setAuditActionFilter(event.target.value)} className="input-base text-sm">
                      <option value="all">All actions</option>
                      {uniqueAuditActions.map((action) => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">From date</label>
                    <input type="date" value={auditFromDate} onChange={(event)=>setAuditFromDate(event.target.value)} className="input-base text-sm" />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">To date</label>
                    <input type="date" value={auditToDate} onChange={(event)=>setAuditToDate(event.target.value)} className="input-base text-sm" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={()=>{setAuditActorFilter("all");setAuditActionFilter("all");setAuditFromDate("");setAuditToDate("");}} className="px-3 py-2 border border-[#1a1a30] text-[#7878a0] font-mono text-[9px] uppercase tracking-widest hover:text-[#eeeef5] hover:border-[#242440] transition-all">
                    Reset Filters
                  </button>
                  <button onClick={exportFilteredAudits} className="px-3 py-2 border border-[#e8c547]/20 text-[#e8c547] font-mono text-[9px] uppercase tracking-widest hover:bg-[#e8c547]/10 transition-all">
                    Export Filtered Logs
                  </button>
                </div>
              </div>

              <div className="bg-[#0c0c18] border border-[#1a1a30] p-0 overflow-hidden">
                <div className="max-h-[520px] overflow-y-auto">
                  {filteredAudits.map((audit) => (
                    <div key={audit._id} className="border-b border-[#1a1a30] last:border-0 px-5 py-4">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-[#eeeef5] text-sm">{audit.action}</p>
                        <span className="font-mono text-[9px] text-[#3a3a5c]">{new Date(audit.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 font-mono text-[9px]">
                        <span className="px-2 py-1 border border-[#1a1a30] text-[#7878a0]">actor: {audit.actor}</span>
                        {audit.sessionId && <span className="px-2 py-1 border border-[#1a1a30] text-[#7878a0]">session: {audit.sessionId}</span>}
                        {audit.messageId && <span className="px-2 py-1 border border-[#1a1a30] text-[#7878a0]">message: {audit.messageId}</span>}
                      </div>
                    </div>
                  ))}
                  {filteredAudits.length===0 && <p className="font-mono text-[10px] text-[#3a3a5c] py-10 text-center uppercase tracking-widest">No audit logs match these filters</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── HOME PAGE EDITOR ── */}
          {tab==="home" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Edit Home Page</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Changes update your live portfolio instantly</p>
              <div className="space-y-5">
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Hero Section</h3>
                  <div className="space-y-4">
                    <Field label="Hero Title" value={get("home").heroTitle||""} onChange={v=>setField("home","heroTitle",v)} placeholder="Building what the world needs most."/>
                    <Field label="Hero Subtitle" value={get("home").heroSubtitle||""} onChange={v=>setField("home","heroSubtitle",v)} multiline placeholder="Short description of who you are..."/>
                    <div><label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Animated Roles (comma separated)</label>
                    <input value={(get("home").roles||[]).join(", ")} onChange={e=>setField("home","roles",e.target.value.split(",").map((r:string)=>r.trim()))} placeholder="Software Developer, Product Manager, Digital Marketer" className="input-base text-sm"/></div>
                  </div>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Stats Row</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(get("home").stats||[]).map((stat:any,i:number)=>(
                      <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-3 space-y-2 relative">
                        <button onClick={()=>{const s=(get("home").stats||[]).filter((_:any,idx:number)=>idx!==i);setField("home","stats",s);}} className="absolute top-2 right-2 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                        <Field label={`Stat ${i+1} Value`} value={stat.value||""} onChange={v=>{const s=[...(get("home").stats||[])];s[i]={...s[i],value:v};setField("home","stats",s);}} placeholder="5+"/>
                        <Field label="Label" value={stat.label||""} onChange={v=>{const s=[...(get("home").stats||[])];s[i]={...s[i],label:v};setField("home","stats",s);}} placeholder="Years Experience"/>
                        <Field label="Sub" value={stat.sub||""} onChange={v=>{const s=[...(get("home").stats||[])];s[i]={...s[i],sub:v};setField("home","stats",s);}} placeholder="Across 3 disciplines"/>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setField("home","stats",[...(get("home").stats||[]),{value:"",label:"",sub:""}])} className="mt-3 font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Stat</button>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Services Section</h3>
                  <div className="space-y-3">
                    {(get("home").services||[]).map((svc:any,i:number)=>(
                      <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-4 space-y-3 relative">
                        <button onClick={()=>{const s=(get("home").services||[]).filter((_:any,idx:number)=>idx!==i);setField("home","services",s);}} className="absolute top-2 right-2 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Title" value={svc.title||""} onChange={v=>{const s=[...(get("home").services||[])];s[i]={...s[i],title:v};setField("home","services",s);}} placeholder="Software Development"/>
                          <Field label="Tag" value={svc.tag||""} onChange={v=>{const s=[...(get("home").services||[])];s[i]={...s[i],tag:v};setField("home","services",s);}} placeholder="Dev"/>
                        </div>
                        <Field label="Description" value={svc.desc||""} onChange={v=>{const s=[...(get("home").services||[])];s[i]={...s[i],desc:v};setField("home","services",s);}} multiline placeholder="What you offer..."/>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setField("home","services",[...(get("home").services||[]),{title:"",tag:"",desc:""}])} className="mt-3 font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Service</button>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Testimonials</h3>
                  <div className="space-y-3">
                    {(get("home").testimonials||[]).map((t:any,i:number)=>(
                      <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-4 space-y-3 relative">
                        <button onClick={()=>{const s=(get("home").testimonials||[]).filter((_:any,idx:number)=>idx!==i);setField("home","testimonials",s);}} className="absolute top-2 right-2 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                        <Field label="Quote" value={t.text||""} onChange={v=>{const s=[...(get("home").testimonials||[])];s[i]={...s[i],text:v};setField("home","testimonials",s);}} multiline placeholder="What they said..."/>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Author Name" value={t.author||""} onChange={v=>{const s=[...(get("home").testimonials||[])];s[i]={...s[i],author:v};setField("home","testimonials",s);}} placeholder="John Doe"/>
                          <Field label="Author Role" value={t.role||""} onChange={v=>{const s=[...(get("home").testimonials||[])];s[i]={...s[i],role:v};setField("home","testimonials",s);}} placeholder="CEO, Company"/>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>setField("home","testimonials",[...(get("home").testimonials||[]),{stars:5,text:"",author:"",role:""}])} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Testimonial</button>
                  </div>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">CTA Section</h3>
                  <div className="space-y-3">
                    <Field label="CTA Title" value={get("home").ctaTitle||""} onChange={v=>setField("home","ctaTitle",v)} placeholder="Let's create something..."/>
                    <Field label="CTA Subtitle" value={get("home").ctaSubtitle||""} onChange={v=>setField("home","ctaSubtitle",v)} placeholder="Message me directly..."/>
                  </div>
                </div>
              </div>
              <SaveBar saving={saving} saved={saved} onSave={()=>saveSection("home",get("home"))}/>
            </motion.div>
          )}

          {/* ── ABOUT PAGE EDITOR ── */}
          {tab==="about" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Edit About Page</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Your story, philosophy & timeline</p>
              <div className="space-y-5">
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Hero Text</h3>
                  <div className="space-y-3">
                    <Field label="Main Headline" value={get("about").headline||""} onChange={v=>setField("about","headline",v)} placeholder="I exist at the edges of disciplines."/>
                    <Field label="Bio Paragraph 1" value={get("about").bio1||""} onChange={v=>setField("about","bio1",v)} multiline placeholder="First paragraph about yourself..."/>
                    <Field label="Bio Paragraph 2" value={get("about").bio2||""} onChange={v=>setField("about","bio2",v)} multiline placeholder="Second paragraph..."/>
                  </div>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Philosophy Cards</h3>
                  <div className="space-y-3">
                    {(get("about").philosophy||[]).map((p:any,i:number)=>(
                      <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Icon" value={p.icon||""} onChange={v=>{const s=[...(get("about").philosophy||[])];s[i]={...s[i],icon:v};setField("about","philosophy",s);}} placeholder="◈"/>
                          <Field label="Title" value={p.title||""} onChange={v=>{const s=[...(get("about").philosophy||[])];s[i]={...s[i],title:v};setField("about","philosophy",s);}} placeholder="Systems Thinking"/>
                        </div>
                        <Field label="Description" value={p.desc||""} onChange={v=>{const s=[...(get("about").philosophy||[])];s[i]={...s[i],desc:v};setField("about","philosophy",s);}} multiline placeholder="What this principle means to you..."/>
                      </div>
                    ))}
                    <button onClick={()=>setField("about","philosophy",[...(get("about").philosophy||[]),{icon:"◈",title:"",desc:""}])} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Philosophy Card</button>
                  </div>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Experience Timeline</h3>
                  <div className="space-y-3">
                    {(get("about").timeline||[]).map((t:any,i:number)=>(
                      <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-4 space-y-3 relative">
                        <button onClick={()=>{const s=(get("about").timeline||[]).filter((_:any,idx:number)=>idx!==i);setField("about","timeline",s);}} className="absolute top-3 right-3 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Year / Period" value={t.year||""} onChange={v=>{const s=[...(get("about").timeline||[])];s[i]={...s[i],year:v};setField("about","timeline",s);}} placeholder="2024"/>
                          <Field label="Role / Title" value={t.role||""} onChange={v=>{const s=[...(get("about").timeline||[])];s[i]={...s[i],role:v};setField("about","timeline",s);}} placeholder="Front-End Developer"/>
                        </div>
                        <Field label="Company / Institution" value={t.place||""} onChange={v=>{const s=[...(get("about").timeline||[])];s[i]={...s[i],place:v};setField("about","timeline",s);}} placeholder="Naija Prime"/>
                        <Field label="Description" value={t.desc||""} onChange={v=>{const s=[...(get("about").timeline||[])];s[i]={...s[i],desc:v};setField("about","timeline",s);}} multiline placeholder="What you did..."/>
                      </div>
                    ))}
                    <button onClick={()=>setField("about","timeline",[...(get("about").timeline||[]),{year:"",role:"",place:"",desc:""}])} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Timeline Entry</button>
                  </div>
                </div>
              </div>
              <SaveBar saving={saving} saved={saved} onSave={()=>saveSection("about",get("about"))}/>
            </motion.div>
          )}

          {/* ── SKILLS PAGE EDITOR ── */}
          {tab==="skills" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Edit Skills Page</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Skill categories, percentages & tools</p>
              <div className="space-y-5">
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Skill Categories</h3>
                  {(get("skills").categories||[]).map((cat:any,ci:number)=>(
                    <div key={ci} className="bg-[#07070f] border border-[#1a1a30] p-4 mb-3 relative">
                      <button onClick={()=>{const c=(get("skills").categories||[]).filter((_:any,idx:number)=>idx!==ci);setField("skills","categories",c);}} className="absolute top-2 right-2 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Category Name" value={cat.label||""} onChange={v=>{const c=[...(get("skills").categories||[])];c[ci]={...c[ci],label:v};setField("skills","categories",c);}} placeholder="Technical Skills"/>
                        <Field label="Color (hex)" value={cat.color||""} onChange={v=>{const c=[...(get("skills").categories||[])];c[ci]={...c[ci],color:v};setField("skills","categories",c);}} placeholder="#a78bfa"/>
                      </div>
                      <div className="space-y-2">
                        {(cat.skills||[]).map((sk:any,si:number)=>(
                          <div key={si} className="flex gap-2 items-center">
                            <input value={sk.name||""} onChange={e=>{const c=[...(get("skills").categories||[])];c[ci].skills[si]={...c[ci].skills[si],name:e.target.value};setField("skills","categories",c);}} placeholder="Skill name" className="input-base text-sm flex-1"/>
                            <input type="number" value={sk.level||0} onChange={e=>{const c=[...(get("skills").categories||[])];c[ci].skills[si]={...c[ci].skills[si],level:parseInt(e.target.value)};setField("skills","categories",c);}} placeholder="85" className="input-base text-sm w-20"/>
                            <span className="font-mono text-[9px]" style={{color:cat.color}}>{sk.level}%</span>
                            <button onClick={()=>{const c=[...(get("skills").categories||[])];c[ci].skills=c[ci].skills.filter((_:any,idx:number)=>idx!==si);setField("skills","categories",c);}} className="text-[#3a3a5c] hover:text-red-400 font-mono text-lg">×</button>
                          </div>
                        ))}
                        <button onClick={()=>{const c=[...(get("skills").categories||[])];c[ci].skills=[...(c[ci].skills||[]),{name:"",level:80}];setField("skills","categories",c);}} className="font-mono text-[9px] hover:underline uppercase tracking-widest" style={{color:cat.color}}>+ Add Skill</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setField("skills","categories",[...(get("skills").categories||[]),{label:"New Category",color:"#e8c547",skills:[]}])} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Category</button>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-3">Tools (comma separated)</h3>
                  <textarea value={(get("skills").tools||[]).join(", ")} onChange={e=>setField("skills","tools",e.target.value.split(",").map((t:string)=>t.trim()).filter(Boolean))} rows={3} className="input-base text-sm resize-none" placeholder="VS Code, Git, Photoshop..."/>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-3">Soft Skills (comma separated)</h3>
                  <input value={(get("skills").softSkills||[]).join(", ")} onChange={e=>setField("skills","softSkills",e.target.value.split(",").map((t:string)=>t.trim()).filter(Boolean))} className="input-base text-sm" placeholder="Problem Solving, Communication..."/>
                </div>
              </div>
              <SaveBar saving={saving} saved={saved} onSave={()=>saveSection("skills",get("skills"))}/>
            </motion.div>
          )}

          {/* ── PRODUCT THINKING EDITOR ── */}
          {tab==="thinking" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Edit Product Thinking</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Frameworks & decision logic</p>
              <div className="space-y-5">
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Frameworks</h3>
                  {(get("thinking")?.frameworks||[{code:"FW-001",title:"The Problem Stack",desc:"",steps:[""]},{code:"FW-002",title:"Opportunity Scoring",desc:"",steps:[""]},{code:"FW-003",title:"The Narrative Arc",desc:"",steps:[""]},{code:"FW-004",title:"Feedback Loops",desc:"",steps:[""]}]).map((fw:any,i:number)=>(
                    <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-4 mb-3 space-y-3 relative">
                      <button onClick={()=>{const f=(get("thinking")?.frameworks||[]).filter((_:any,idx:number)=>idx!==i);setField("thinking","frameworks",f);}} className="absolute top-2 right-2 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Code" value={fw.code||""} onChange={v=>{const f=[...(get("thinking")?.frameworks||[])];f[i]={...f[i],code:v};setField("thinking","frameworks",f);}} placeholder="FW-001"/>
                        <Field label="Title" value={fw.title||""} onChange={v=>{const f=[...(get("thinking")?.frameworks||[])];f[i]={...f[i],title:v};setField("thinking","frameworks",f);}} placeholder="The Problem Stack"/>
                      </div>
                      <Field label="Description" value={fw.desc||""} onChange={v=>{const f=[...(get("thinking")?.frameworks||[])];f[i]={...f[i],desc:v};setField("thinking","frameworks",f);}} multiline placeholder="What this framework is about..."/>
                      <div><label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Steps (comma separated)</label>
                      <input value={(fw.steps||[]).join(", ")} onChange={e=>{const f=[...(get("thinking")?.frameworks||[])];f[i]={...f[i],steps:e.target.value.split(",").map((s:string)=>s.trim())};setField("thinking","frameworks",f);}} className="input-base text-sm" placeholder="Step 1, Step 2, Step 3..."/></div>
                    </div>
                  ))}
                  <button onClick={()=>setField("thinking","frameworks",[...(get("thinking")?.frameworks||[]),{code:"",title:"",desc:"",steps:[""]}])} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Framework</button>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Decision Logic Q&A</h3>
                  {(get("thinking")?.decisions||[{q:"Build vs. Buy?",a:""},{q:"Ship fast vs. Ship right?",a:""},{q:"Data vs. Instinct?",a:""},{q:"Feature vs. Outcome?",a:""}]).map((d:any,i:number)=>(
                    <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-4 mb-3 space-y-3 relative">
                      <button onClick={()=>{const ds=(get("thinking")?.decisions||[]).filter((_:any,idx:number)=>idx!==i);setField("thinking","decisions",ds);}} className="absolute top-2 right-2 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                      <Field label="Question" value={d.q||""} onChange={v=>{const ds=[...(get("thinking")?.decisions||[])];ds[i]={...ds[i],q:v};setField("thinking","decisions",ds);}} placeholder="Build vs. Buy?"/>
                      <Field label="Answer" value={d.a||""} onChange={v=>{const ds=[...(get("thinking")?.decisions||[])];ds[i]={...ds[i],a:v};setField("thinking","decisions",ds);}} multiline placeholder="Your answer..."/>
                    </div>
                  ))}
                  <button onClick={()=>setField("thinking","decisions",[...(get("thinking")?.decisions||[]),{q:"",a:""}])} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Q&A</button>
                </div>
              </div>
              <SaveBar saving={saving} saved={saved} onSave={()=>saveSection("thinking",get("thinking"))}/>
            </motion.div>
          )}

          {/* ── SOCIAL IMPACT EDITOR ── */}
          {tab==="impact" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Edit Social Impact</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Impact stories & mission statement</p>
              <div className="space-y-5">
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Page Header</h3>
                  <div className="space-y-3">
                    <Field label="Headline" value={get("social_impact").headline||""} onChange={v=>setField("social_impact","headline",v)} placeholder="Technology should lift all boats."/>
                    <Field label="Subtitle" value={get("social_impact").subtitle||""} onChange={v=>setField("social_impact","subtitle",v)} multiline placeholder="What drives your social mission..."/>
                    <Field label="Mission Statement" value={get("social_impact").missionText||""} onChange={v=>setField("social_impact","missionText",v)} multiline placeholder="Your mission in one sentence..."/>
                  </div>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Impact Stories</h3>
                  {(get("social_impact").items||[]).map((item:any,i:number)=>(
                    <div key={i} className="bg-[#07070f] border border-[#1a1a30] p-4 mb-3 relative space-y-3">
                      <button onClick={()=>setField("social_impact","items",(get("social_impact").items||[]).filter((_:any,idx:number)=>idx!==i))} className="absolute top-3 right-3 font-mono text-[8px] text-red-400/50 hover:text-red-400 border border-red-400/10 px-2 py-1 transition-all">×</button>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Metric Value" value={item.metric||""} onChange={v=>{const s=[...(get("social_impact").items||[])];s[i]={...s[i],metric:v};setField("social_impact","items",s);}} placeholder="240+"/>
                        <Field label="Metric Label" value={item.metricLabel||""} onChange={v=>{const s=[...(get("social_impact").items||[])];s[i]={...s[i],metricLabel:v};setField("social_impact","items",s);}} placeholder="Lives Changed"/>
                        <Field label="Color" value={item.color||""} onChange={v=>{const s=[...(get("social_impact").items||[])];s[i]={...s[i],color:v};setField("social_impact","items",s);}} placeholder="#e8c547"/>
                      </div>
                      <Field label="Problem" value={item.problem||""} onChange={v=>{const s=[...(get("social_impact").items||[])];s[i]={...s[i],problem:v};setField("social_impact","items",s);}} placeholder="Youth unemployment in Lagos"/>
                      <Field label="Action Taken" value={item.action||""} onChange={v=>{const s=[...(get("social_impact").items||[])];s[i]={...s[i],action:v};setField("social_impact","items",s);}} multiline placeholder="What you did..."/>
                      <Field label="Result" value={item.result||""} onChange={v=>{const s=[...(get("social_impact").items||[])];s[i]={...s[i],result:v};setField("social_impact","items",s);}} placeholder="240+ graduates placed in tech roles"/>
                    </div>
                  ))}
                  <button onClick={()=>setField("social_impact","items",[...(get("social_impact").items||[]),{num:String((get("social_impact").items||[]).length+1).padStart(2,"0"),color:"#e8c547",metric:"",metricLabel:"",problem:"",action:"",result:""}])} className="font-mono text-[9px] text-[#e8c547] hover:underline uppercase tracking-widest">+ Add Impact Story</button>
                </div>
              </div>
              <SaveBar saving={saving} saved={saved} onSave={()=>saveSection("social_impact",get("social_impact"))}/>
            </motion.div>
          )}

          {/* ── PROJECTS ── */}
          {tab==="projects" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Projects</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Manage your portfolio case studies with full journey</p>
              <div className="flex gap-3 mb-6">
                <Link href="/admin/projects/editor" className="px-5 py-2.5 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all">+ New Project</Link>
                <Link href="/admin/projects" className="px-5 py-2.5 border border-[#1a1a30] text-[#7878a0] font-mono text-[9px] hover:border-[#242440] hover:text-[#eeeef5] transition-all uppercase tracking-widest">View All Projects →</Link>
              </div>
              <div className="bg-[#0c0c18] border border-[#1a1a30] p-6 text-center">
                <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-2">Full project journey editor</p>
                <p className="text-[#7878a0] text-sm mb-4">Create projects with complete phases: Planning → Design → Development → Testing → Deployment → Results</p>
                <Link href="/admin/projects/editor" className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all">Open Project Editor →</Link>
              </div>
            </motion.div>
          )}

          {/* ── ACHIEVEMENTS ── */}
          {tab==="achievements" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Achievements</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Certificates, awards & press — shown on About page</p>
              <AchievementsTab token={token} h={h}/>
            </motion.div>
          )}

          {/* ── CV ── */}
          {tab==="cv" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>CV Editor</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Edit every section of your CV</p>
              <div className="bg-[#0c0c18] border border-[#1a1a30] p-6 text-center">
                <p className="text-6xl mb-4">📄</p>
                <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-2">Full CV Editor Available</p>
                <p className="text-[#7878a0] text-sm mb-6">Edit your work experience, education, skills, projects, certifications and more — all from a dedicated editor page.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/admin/cv" className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8c547] text-[#04040a] font-bold text-sm hover:bg-[#f5e070] transition-all">Open CV Editor →</Link>
                  <Link href="/cv" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a1a30] text-[#7878a0] text-sm hover:border-[#242440] hover:text-[#eeeef5] transition-all">Preview CV ↗</Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS ── */}
          {tab==="analytics" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Analytics</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">{analytics.total} total events</p>
              <div className="bg-[#0c0c18] border border-[#1a1a30] p-5 mb-5">
                <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-5">Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={analytics.daily}>
                    <XAxis dataKey="day" tick={{fill:"#3a3a5c",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#3a3a5c",fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"#07070f",border:"1px solid #1a1a30",borderRadius:2,color:"#eeeef5",fontSize:11}}/>
                    <Bar dataKey="count" fill="#e8c547" fillOpacity={0.85} radius={[2,2,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-5">Page Performance</h3>
                <div className="space-y-3">
                  {analytics.pages.map((p:any,i:number)=>(
                    <div key={i} className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-[#eeeef5] w-28 flex-shrink-0">{p.page}</span>
                      <div className="flex-1 h-1.5 bg-[#1a1a30] rounded-full overflow-hidden">
                        <div className="h-full bg-[#e8c547] rounded-full" style={{width:`${Math.min(100,(p.views/(analytics.pages[0]?.views||1))*100)}%`}}/>
                      </div>
                      <span className="font-mono text-[10px] text-[#3a3a5c] w-16 text-right">{p.views} views</span>
                      <span className="font-mono text-[10px] text-[#3a3a5c] w-16 text-right">{p.avgTime}s avg</span>
                    </div>
                  ))}
                  {analytics.pages.length===0 && <p className="font-mono text-[10px] text-[#3a3a5c] text-center py-8 uppercase tracking-widest">No data yet. Start getting visitors!</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SETTINGS ── */}
          {tab==="settings" && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
              <h1 className="font-serif text-3xl text-[#eeeef5] mb-1" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>Settings</h1>
              <p className="font-mono text-[9px] text-[#3a3a5c] mb-6 uppercase tracking-widest">Site configuration & personal info</p>
              <div className="space-y-5">
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" value={get("settings").siteName||""} onChange={v=>setField("settings","siteName",v)} placeholder="Temidayo Jacob"/>
                    <Field label="Tagline" value={get("settings").siteTagline||""} onChange={v=>setField("settings","siteTagline",v)} placeholder="Software Developer · Product Manager"/>
                    <Field label="Location" value={get("settings").location||""} onChange={v=>setField("settings","location",v)} placeholder="Lagos, Nigeria"/>
                    <Field label="Email" value={get("settings").email||""} onChange={v=>setField("settings","email",v)} placeholder="jacobtemidayo068@gmail.com"/>
                    <Field label="Phone" value={get("settings").phone||""} onChange={v=>setField("settings","phone",v)} placeholder="+2348106565953"/>
                    <Field label="LinkedIn URL" value={get("settings").linkedin||""} onChange={v=>setField("settings","linkedin",v)} placeholder="linkedin.com/in/..."/>
                    <Field label="Notification Email" value={get("settings").notificationEmail||""} onChange={v=>setField("settings","notificationEmail",v)} placeholder="Where message alerts go"/>
                  </div>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-4">Availability Status</h3>
                  <div className="flex items-center justify-between p-4 bg-[#07070f] border border-[#1a1a30] mb-3">
                    <div>
                      <p className="font-mono text-[10px] text-[#eeeef5] uppercase tracking-widest">Available for Hire</p>
                      <p className="font-mono text-[9px] text-[#3a3a5c] mt-1">Shows green badge in navbar</p>
                    </div>
                    <button onClick={()=>setField("settings","isAvailable",!get("settings").isAvailable)}
                      className="w-12 h-6 rounded-full relative transition-colors duration-300" style={{background:get("settings").isAvailable!==false?"#25d366":"#3a3a5c"}}>
                      <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300" style={{left:get("settings").isAvailable!==false?"calc(100% - 20px)":"4px"}}/>
                    </button>
                  </div>
                  <Field label="Availability Text" value={get("settings").availableText||""} onChange={v=>setField("settings","availableText",v)} placeholder="Available for hire"/>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-3">Change Admin Password</h3>
                  <p className="text-[#7878a0] text-sm mb-3">Generate a new bcrypt hash and update ADMIN_PASSWORD_HASH in your .env.local file:</p>
                  <code className="block bg-[#07070f] border border-[#1a1a30] p-3 font-mono text-[10px] text-[#e8c547]">
                    node -e &quot;const b=require(&apos;bcryptjs&apos;); console.log(b.hashSync(&apos;NewPassword&apos;,10))&quot;
                  </code>
                </div>
                <div className="bg-[#0c0c18] border border-[#1a1a30] p-5">
                  <h3 className="font-mono text-[9px] text-[#e8c547] uppercase tracking-widest mb-3">Chat Data Controls</h3>
                  <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div>
                      <label className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Retention (days)</label>
                      <input
                        type="number"
                        min={1}
                        value={retentionDays}
                        onChange={(event) => setRetentionDays(Number(event.target.value || 1))}
                        className="input-base text-sm w-36"
                      />
                    </div>
                    <button onClick={applyRetention} disabled={retentionLoading} className="px-4 py-2 border border-[#e8c547]/20 text-[#e8c547] font-mono text-[9px] uppercase tracking-widest hover:bg-[#e8c547]/10 disabled:opacity-60 transition-all">
                      {retentionLoading ? "Applying..." : "Apply Retention"}
                    </button>
                  </div>
                  <button onClick={exportChats} className="px-4 py-2 border border-[#1a1a30] text-[#7878a0] font-mono text-[9px] uppercase tracking-widest hover:text-[#eeeef5] hover:border-[#242440] transition-all">
                    Export All Chat Data (JSON)
                  </button>
                </div>
              </div>
              <SaveBar saving={saving} saved={saved} onSave={()=>saveSection("settings",get("settings"))}/>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

// Achievements sub-component
function AchievementsTab({token,h}:{token:string;h:()=>Record<string,string>}) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetch_ = useCallback(async()=>{
    const r = await fetch("/api/admin/achievements",{headers:h()});
    const d = await r.json();
    setAchievements(d.achievements||[]);
  },[h]);

  useEffect(()=>{fetch_();},[fetch_]);

  const save = async(a:any)=>{
    setSaving(true);
    const method = a._id?"PUT":"POST";
    const body = a._id?{id:a._id,...a}:a;
    await fetch("/api/admin/achievements",{method,headers:h(),body:JSON.stringify(body)});
    setSaving(false);setShowForm(false);setEdit(null);fetch_();
  };

  const del = async(id:string)=>{
    if(!confirm("Delete?"))return;
    await fetch("/api/admin/achievements",{method:"DELETE",headers:h(),body:JSON.stringify({id})});
    fetch_();
  };

  const typeColor:Record<string,string> = {certificate:"#e8c547",award:"#a78bfa",press:"#4fc3f7"};
  const EMPTY = {type:"certificate",title:"",issuer:"",date:"",credentialId:"",credentialUrl:"",description:"",icon:"🏅",order:0,published:true};

  return (
    <div>
      <button onClick={()=>{setEdit({...EMPTY});setShowForm(true);}} className="px-5 py-2.5 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all mb-5">+ Add Achievement</button>
      <div className="space-y-px">
        {achievements.map(a=>(
          <div key={a._id} className="bg-[#0c0c18] border border-[#1a1a30] p-4 flex items-center gap-3 hover:border-[#242440] transition-all">
            <div className="w-9 h-9 bg-[#07070f] border border-[#1a1a30] flex items-center justify-center text-lg flex-shrink-0">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[#eeeef5] text-sm font-medium truncate">{a.title}</span>
                <span className="font-mono text-[8px] px-2 py-0.5 border rounded-sm flex-shrink-0" style={{borderColor:(typeColor[a.type]||"#e8c547")+"40",color:typeColor[a.type]||"#e8c547"}}>{a.type}</span>
              </div>
              <p className="font-mono text-[9px] text-[#3a3a5c]">{a.issuer} · {a.date}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={()=>{setEdit(a);setShowForm(true);}} className="font-mono text-[9px] text-[#7878a0] hover:text-[#eeeef5] border border-[#1a1a30] px-3 py-1.5 hover:border-[#242440] transition-all">Edit</button>
              <button onClick={()=>del(a._id)} className="font-mono text-[9px] text-red-400/70 hover:text-red-400 border border-red-400/10 px-3 py-1.5 hover:border-red-400/30 transition-all">Delete</button>
            </div>
          </div>
        ))}
        {achievements.length===0 && <div className="text-center py-12 border border-dashed border-[#1a1a30]"><p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">No achievements yet</p></div>}
      </div>
      <AnimatePresence>
        {showForm && edit && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-[#04040a]/92 backdrop-blur-xl flex items-start justify-center p-6 overflow-y-auto">
            <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}} className="bg-[#0c0c18] border border-[#1a1a30] w-full max-w-lg p-7 my-8">
              <div className="flex justify-between mb-5">
                <h2 className="font-serif text-2xl text-[#eeeef5]" style={{fontFamily:"'Cormorant Garamond',serif"}}>{edit._id?"Edit":"New"} Achievement</h2>
                <button onClick={()=>{setShowForm(false);setEdit(null);}} className="text-[#3a3a5c] hover:text-[#eeeef5] text-2xl">×</button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Type</label>
                  <select value={edit.type} onChange={e=>setEdit({...edit,type:e.target.value})} className="input-base text-sm"><option value="certificate">Certificate</option><option value="award">Award</option><option value="press">Press</option></select></div>
                  <div><label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Icon (emoji)</label><input value={edit.icon} onChange={e=>setEdit({...edit,icon:e.target.value})} className="input-base text-sm"/></div>
                </div>
                <div><label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Title</label><input value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})} className="input-base text-sm" placeholder="Certificate / Award title"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Issuer</label><input value={edit.issuer} onChange={e=>setEdit({...edit,issuer:e.target.value})} className="input-base text-sm" placeholder="Google, TechCabal..."/></div>
                  <div><label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Date</label><input value={edit.date} onChange={e=>setEdit({...edit,date:e.target.value})} className="input-base text-sm" placeholder="2024"/></div>
                </div>
                <div><label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Credential ID (optional)</label><input value={edit.credentialId||""} onChange={e=>setEdit({...edit,credentialId:e.target.value})} className="input-base text-sm"/></div>
                <div><label className="font-mono text-[8px] text-[#3a3a5c] uppercase tracking-widest block mb-1.5">Credential URL (optional)</label><input value={edit.credentialUrl||""} onChange={e=>setEdit({...edit,credentialUrl:e.target.value})} className="input-base text-sm" placeholder="https://..."/></div>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={edit.published} onChange={e=>setEdit({...edit,published:e.target.checked})} className="accent-[#e8c547]"/><span className="font-mono text-[10px] text-[#7878a0]">Published (visible on About page)</span></label>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>save(edit)} disabled={saving} className="flex-1 py-3 bg-[#e8c547] text-[#04040a] font-bold text-xs hover:bg-[#f5e070] transition-all flex items-center justify-center gap-2">
                    {saving && <span className="w-3 h-3 border-2 border-[#04040a]/30 border-t-[#04040a] rounded-full animate-spin"/>}
                    {saving?"Saving...":"Save Achievement"}
                  </button>
                  <button onClick={()=>{setShowForm(false);setEdit(null);}} className="flex-1 py-3 border border-[#1a1a30] text-[#7878a0] text-xs hover:text-[#eeeef5] transition-all">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
