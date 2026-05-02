import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { Schema, model, models } from "mongoose";

// CV Model
const CvDataSchema = new Schema({
  name: String,
  title: String,
  location: String,
  email: String,
  phone: String,
  linkedin: String,
  portfolio: String,
  summary: String,
  experience: [
    {
      role: String,
      company: String,
      period: String,
      location: String,
      points: [String],
    },
  ],
  education: [
    {
      degree: String,
      school: String,
      period: String,
      notes: [String],
    },
  ],
  certifications: [
    {
      title: String,
      issuer: String,
      year: String,
    },
  ],
  skills: { type: Map, of: [String] },
  tools: [String],
  projects: [
    {
      title: String,
      desc: String,
      stack: [String],
    },
  ],
  languages: [String],
  updatedAt: { type: Date, default: Date.now },
});

const CvData = models.CvData || model("CvData", CvDataSchema);

// Default CV data
const DEFAULT_CV = {
  name: "Temidayo Jacob",
  title: "Software Developer · Product Manager · Digital Marketer",
  location: "Lagos State, Nigeria",
  email: "jacobtemidayo068@gmail.com",
  phone: "+2348106565953",
  linkedin: "linkedin.com/in/temidayo-j-210a752a9",
  portfolio: "portfolio-wine-pi-54.vercel.app",
  summary:
    "A versatile software developer with a strong foundation in computer science and hands-on experience in software development. Proficient in HTML, CSS, JavaScript, PHP, and Python, with a keen eye for detail and a passion for creating efficient, scalable and maintainable code. Also skilled in digital marketing strategies and tools, with experience in SEO, content creation and audience management. With growing experience as a Product Manager, I bring an understanding of product lifecycle, user-centered design, and business goals.",
  experience: [
    {
      role: "Front-End Developer",
      company: "Naija Prime",
      period: "2024",
      location: "Lagos, Nigeria",
      points: [
        "Developed a movie dashboard with user authentication, movie selection and payment gateway integration",
        "Designed a user-friendly interface for users to browse and pay for movies at discounted prices",
        "Created a content management system for creators to upload and manage movies",
        "Implemented responsive design and ensured a seamless user experience",
      ],
    },
    {
      role: "Junior Software Engineer (Trainee)",
      company: "Sail Innovation Lab",
      period: "2023",
      location: "Lagos, Nigeria",
      points: [
        "Contributed to front-end development using HTML, CSS, and JavaScript",
        "Utilized Git for version control, actively participating in code reviews on GitHub",
        "Engaged in writing unit tests and ensuring code quality through various testing methodologies",
        "Demonstrated adaptability by quickly learning and incorporating new technologies",
        "Took ownership of specific tasks and features within projects",
      ],
    },
  ],
  education: [
    {
      degree: "B.Sc. Computer Science",
      school: "Adonai University",
      period: "2015 – 2019",
      notes: [],
    },
  ],
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
    {
      title: "BMI Calculator",
      desc: "A BMI calculator tool with user-friendly interface using JavaScript, HTML, and CSS. Implemented BMI calculation formula accurately to provide precise results.",
      stack: ["HTML", "CSS", "JavaScript"],
    },
    {
      title: "Naija Prime Movie Dashboard",
      desc: "A full movie platform with user authentication, movie browsing, payment gateway integration, and a CMS for creators to upload and manage content.",
      stack: ["HTML", "CSS", "JavaScript", "PHP"],
    },
  ],
  languages: ["English (Fluent)", "Yoruba (Native)"],
};

// GET - fetch CV (public, used by cv page)
export async function GET() {
  try {
    await connectDB();
    let cv = await CvData.findOne();
    if (!cv) {
      cv = await CvData.create(DEFAULT_CV);
    }
    return NextResponse.json({ cv });
  } catch {
    return NextResponse.json({ cv: DEFAULT_CV });
  }
}

// PUT - update CV (admin only)
export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await connectDB();
    let cv = await CvData.findOne();
    if (cv) {
      Object.assign(cv, body, { updatedAt: new Date() });
      await cv.save();
    } else {
      cv = await CvData.create({ ...body, updatedAt: new Date() });
    }
    return NextResponse.json({ success: true, cv });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save CV" }, { status: 500 });
  }
}
