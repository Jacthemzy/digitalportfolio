import { Schema, model, models } from "mongoose";

const ChatSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  ip: String,
  fingerprint: String,
  visitorId: String,
  name: String,
  email: String,
  messageCount: { type: Number, default: 0 },
  lastMessage: Date,
  lastAdminReplyAt: Date,
  completed: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  blockedReason: String,
  restricted: { type: Boolean, default: false },
  restrictedReason: String,
  outstandingUserMessages: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
});
export const ChatSession = models.ChatSession || model("ChatSession", ChatSessionSchema);

const MessageSchema = new Schema({
  sessionId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  sender: { type: String, enum: ["user", "admin", "system"], default: "user", index: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  readByAdmin: { type: Boolean, default: false, index: true },
  readByUser: { type: Boolean, default: false, index: true },
  replyNotifiedAt: Date,
  meta: { type: Schema.Types.Mixed, default: {} },
  deletedByUserAt: Date,
  deletedByAdminAt: Date,
  deletedForUser: { type: Boolean, default: false },
  deleteReason: String,
  createdAt: { type: Date, default: Date.now, index: true },
});
export const Message = models.Message || model("Message", MessageSchema);

const ChatAuditLogSchema = new Schema({
  action: { type: String, required: true, index: true },
  actor: { type: String, enum: ["admin", "user", "system"], required: true, index: true },
  sessionId: { type: String, index: true },
  messageId: String,
  details: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
});
export const ChatAuditLog = models.ChatAuditLog || model("ChatAuditLog", ChatAuditLogSchema);

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

const CvSessionSchema = new Schema({
  sessionId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});
export const CvSession = models.CvSession || model("CvSession", CvSessionSchema);

const AnalyticsSchema = new Schema({
  page: String,
  timeSpent: { type: Number, default: 0 },
  interaction: { type: String, default: "pageview" },
  createdAt: { type: Date, default: Date.now },
});
export const Analytics = models.Analytics || model("Analytics", AnalyticsSchema);
