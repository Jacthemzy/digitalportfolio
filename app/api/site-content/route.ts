import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { SiteContent } from "@/models/SiteContent";
import { isAdminAuthenticated } from "@/lib/auth";

const DEFAULTS: Record<string, any> = {
  home: {
    heroHeadline: "Building what the world needs most.",
    heroSub: "I'm Temidayo — a rare triple-threat at the intersection of product, marketing, and engineering. I don't build features. I build systems that move people.",
    heroLocation: "Lagos, Nigeria · Available for opportunities",
    stats: [
      { value: "5+", label: "Years Experience", sub: "Across 3 disciplines" },
      { value: "30+", label: "Projects", sub: "Shipped & scaled" },
      { value: "15+", label: "Clients", sub: "Across 4 continents" },
      { value: "$2M+", label: "Ad Spend", sub: "Managed & optimised" },
    ],
    services: [
      { num: "01", tag: "Product", color: "#e8c547", title: "Product Strategy", desc: "Translating vision into executable roadmaps with clear metrics and user-centric decisions." },
      { num: "02", tag: "Marketing", color: "#4fc3f7", title: "Growth Marketing", desc: "Data-first campaigns that drive the right people to the right moment, at the right cost." },
      { num: "03", tag: "Dev", color: "#a78bfa", title: "Software Engineering", desc: "Full-stack products built to scale — from backend architecture to polished frontends." },
    ],
    testimonials: [
      { stars: 5, text: "Temidayo doesn't just deliver work — he delivers transformation.", author: "Sarah O.", role: "CEO, TechStartNG" },
      { stars: 5, text: "The most comprehensive product thinker I've worked with.", author: "David K.", role: "CTO, GrowthStudio" },
      { stars: 5, text: "He took our marketing from chaotic guesswork to a precision machine.", author: "Amaka F.", role: "Founder, AfriCommerce" },
    ],
    ctaHeadline: "Let's create something the world will remember.",
    ctaSub: "Message me directly through the chat — I respond personally, within minutes.",
    marqueeItems: ["Product Strategy","Growth Marketing","Software Engineering","User Research","Data Analytics","Brand Building","System Design","Conversion Optimisation"],
  },
  about: {
    headline: "I exist at the edges of disciplines.",
    bio1: "I'm Temidayo Jacob — a rare triple-threat who speaks the language of product, marketing, and engineering fluently.",
    bio2: "Based in Lagos, Nigeria. I've spent years learning how great products are conceived, validated, built, and grown.",
    philosophy: [
      { icon: "◈", title: "Systems Thinking", desc: "I don't see isolated problems — I see interconnected systems." },
      { icon: "◎", title: "User Obsession", desc: "Great products are built for humans first." },
      { icon: "◇", title: "Data + Intuition", desc: "Numbers tell you what happened. Intuition tells you why." },
      { icon: "△", title: "Relentless Iteration", desc: "Version one is never the answer. I ship, measure, learn, and improve." },
    ],
    timeline: [
      { year: "2024", role: "Front-End Developer", place: "Naija Prime · Lagos", desc: "Developed a movie dashboard with user authentication and payment gateway integration." },
      { year: "2023", role: "Junior Software Engineer (Trainee)", place: "Sail Innovation Lab · Lagos", desc: "Contributed to front-end development, version control and team collaboration." },
      { year: "2015 – 2019", role: "B.Sc. Computer Science", place: "Adonai University", desc: "Foundation in computer science, programming, and software development." },
    ],
    quote: "Every system I build must leave the world slightly better than I found it.",
  },
  skills: {
    headline: "Skills that compound.",
    sub: "Three disciplines mastered independently — now deployed as one integrated superpower.",
    categories: [
      { label: "Technical Skills", color: "#a78bfa", skills: [{ name: "HTML & CSS", level: 95 },{ name: "JavaScript", level: 90 },{ name: "PHP", level: 80 },{ name: "Python", level: 75 },{ name: "SQL", level: 78 },{ name: "Git & Version Control", level: 85 }] },
      { label: "Product Management", color: "#e8c547", skills: [{ name: "Product Strategy", level: 88 },{ name: "Product Lifecycle", level: 85 },{ name: "User-Centered Design", level: 82 },{ name: "Market Research", level: 80 },{ name: "Roadmap Planning", level: 86 }] },
      { label: "Digital Marketing", color: "#4fc3f7", skills: [{ name: "SEO & SEM", level: 85 },{ name: "Social Media Strategy", level: 88 },{ name: "Content Creation", level: 90 },{ name: "Google Analytics", level: 82 },{ name: "Meta Ads Manager", level: 85 }] },
    ],
    tools: ["Microsoft Office Suite","Git","VS Code","Sublime Text","XAMPP","Corel Draw","Photoshop","Google Analytics","Meta Ads Manager","SEMrush","Ahrefs","GitHub","Advanced Excel"],
    softSkills: [{ icon: "🧠", label: "Problem Solving" },{ icon: "💬", label: "Communication" },{ icon: "🤝", label: "Team Collaboration" },{ icon: "⚡", label: "Adaptability" },{ icon: "⏰", label: "Time Management" },{ icon: "🎯", label: "Attention to Detail" }],
  },
  productThinking: {
    headline: "How I think before I build.",
    sub: "Product thinking is a discipline, not a title.",
    frameworks: [
      { code: "FW-001", title: "The Problem Stack", desc: "Map the full problem stack — surface symptom → root cause → systemic driver.", steps: ["Identify surface symptoms","Map root causes","Find systemic drivers","Design from the bottom up"] },
      { code: "FW-002", title: "Opportunity Scoring", desc: "Score every feature request against a 4-axis model.", steps: ["Score user impact (1–10)","Score business value (1–10)","Assess feasibility (1–10)","Align with strategy (1–10)"] },
      { code: "FW-003", title: "The Narrative Arc", desc: "Write the press release before writing the brief.", steps: ["Write the press release first","Define who benefits and how","Articulate the before & after","Get alignment before building"] },
      { code: "FW-004", title: "Feedback Loops", desc: "Design feedback loops into every product.", steps: ["Weekly: Qualitative signals","Monthly: Quantitative review","Quarterly: Hypothesis reset","Annually: Strategic pivot check"] },
    ],
    decisions: [
      { q: "Build vs. Buy?", a: "Build only when it's a core competency. Buy when the market has already solved it better." },
      { q: "Ship fast vs. Ship right?", a: "Ship the minimum that proves the hypothesis." },
      { q: "Data vs. Instinct?", a: "Use both — but let data have the final vote." },
      { q: "Feature vs. Outcome?", a: "Always outcome. Teams that ship features drift. Teams that chase outcomes grow." },
    ],
    quote: "The best product managers make the team feel like they already knew the answer.",
  },
  socialImpact: {
    headline: "Technology should lift all boats.",
    sub: "Beyond clients and commerce, I believe deeply in using skills to create systemic change.",
    impacts: [
      { num: "01", color: "#e8c547", metric: "240+", metricLabel: "Lives Changed", problem: "Youth unemployment in Lagos", action: "Co-founded a 12-week digital skills bootcamp.", result: "240+ graduates placed in tech roles" },
      { num: "02", color: "#4fc3f7", metric: "3.8K", metricLabel: "Students Reached", problem: "Education access gap in rural communities", action: "Built an offline-first learning platform for 4 rural schools.", result: "3,800+ students with quality digital content" },
      { num: "03", color: "#a78bfa", metric: "30", metricLabel: "Businesses Saved", problem: "Small businesses lacking digital presence", action: "Led a pro-bono digital transformation sprint.", result: "30 businesses digitalised, avg. 3x revenue growth" },
      { num: "04", color: "#e8c547", metric: "85", metricLabel: "Women Mentored", problem: "Women underrepresented in tech", action: "Launched a mentorship programme.", result: "85 women mentored, 60%+ reported career advancement" },
    ],
    missionStatement: "Every system I build must leave the world slightly better than I found it.",
  },
  settings: {
    siteTitle: "Temidayo Jacob",
    siteName: "Temidayo Jacob",
    siteTagline: "Software Developer · Product Manager · Digital Marketer",
    availableForHire: true,
    isAvailable: true,
    location: "Lagos, Nigeria",
    email: "jacobtemidayo068@gmail.com",
    phone: "+2348106565953",
    linkedin: "https://www.linkedin.com/in/temidayo-j-210a752a9/",
    github: "",
    twitter: "",
    notificationEmail: "jacobtemidayo068@gmail.com",
    cvTimerSeconds: 90,
    availableText: "Available for hire",
  },
};

export async function GET(req: NextRequest) {
  const section = new URL(req.url).searchParams.get("section");
  try {
    await connectDB();
    if (section) {
      const doc: any = await SiteContent.findOne({ section }).lean();
      return NextResponse.json({ data: doc?.data ?? DEFAULTS[section] ?? {} });
    }
    const all: any[] = await SiteContent.find().lean();
    const result: Record<string, any> = { ...DEFAULTS };
    all.forEach((d) => { result[d.section] = d.data; });
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ data: section ? (DEFAULTS[section] ?? {}) : DEFAULTS });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { section, data } = await req.json();
  if (!section) return NextResponse.json({ error: "Section required" }, { status: 400 });
  try {
    await connectDB();
    await SiteContent.findOneAndUpdate({ section }, { section, data, updatedAt: new Date() }, { upsert: true, new: true });
    if (section === "settings") {
      revalidateTag("site-settings", "max");
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
