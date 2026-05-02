import { Schema, model, models } from "mongoose";

// Chat messages
const MessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
export const Message = models.Message || model("Message", MessageSchema);

// Projects
const ProjectSchema = new Schema({
  num: String,
  title: { type: String, required: true },
  tag: { type: String, default: "Product" },
  tagColor: { type: String, default: "#e8c547" },
  year: String,
  problem: String,
  strategy: String,
  execution: String,
  results: [String],
  stack: [String],
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
export const Project = models.Project || model("Project", ProjectSchema);

// Achievements (certificates, awards, press)
const AchievementSchema = new Schema({
  type: { type: String, enum: ["certificate", "award", "press"], required: true },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: String,
  credentialId: String,
  credentialUrl: String,
  description: String,
  icon: { type: String, default: "🏅" },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
export const Achievement = models.Achievement || model("Achievement", AchievementSchema);

// CV Sessions
const CvSessionSchema = new Schema({
  sessionId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});
export const CvSession = models.CvSession || model("CvSession", CvSessionSchema);

// Analytics
const AnalyticsSchema = new Schema({
  page: String,
  timeSpent: { type: Number, default: 0 },
  interaction: { type: String, default: "pageview" },
  createdAt: { type: Date, default: Date.now },
});
export const Analytics = models.Analytics || model("Analytics", AnalyticsSchema);
