import { Schema, model, models } from "mongoose";

const PhaseSchema = new Schema({
  name: String,        // e.g. "Discovery", "Development"
  icon: String,        // emoji icon
  status: { type: String, enum: ["completed", "in-progress", "planned"], default: "completed" },
  duration: String,    // e.g. "2 weeks"
  description: String,
  tasks: [String],     // bullet points of what was done
  tools: [String],     // tools used in this phase
  outcome: String,     // what came out of this phase
});

const MetricSchema = new Schema({
  label: String,   // e.g. "Users Acquired"
  value: String,   // e.g. "2,400+"
  change: String,  // e.g. "+120%"
  positive: { type: Boolean, default: true },
});

const ProjectSchema = new Schema({
  num: String,
  title: { type: String, required: true },
  slug: String,
  type: { type: String, enum: ["software", "product", "marketing", "design"], default: "software" },
  tag: { type: String, default: "Development" },
  tagColor: { type: String, default: "#e8c547" },
  year: String,
  status: { type: String, enum: ["completed", "in-progress", "concept"], default: "completed" },
  duration: String,     // e.g. "3 months"
  role: String,         // e.g. "Lead Developer & Product Manager"
  team: String,         // e.g. "Solo project" or "Team of 5"
  client: String,
  overview: String,     // Short summary
  problem: String,
  solution: String,
  impact: String,
  phases: [PhaseSchema],  // The full journey
  metrics: [MetricSchema], // Key results
  stack: [String],
  links: {
    live: String,
    github: String,
    caseStudy: String,
  },
  coverImage: String,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate slug from title
ProjectSchema.pre("save", function () {
  if (this.title && !this.slug) {
    this.slug = (this.title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
});

export const Project = models.ProjectV2 || model("ProjectV2", ProjectSchema);
