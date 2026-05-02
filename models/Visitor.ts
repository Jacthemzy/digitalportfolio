import { Schema, model, models } from "mongoose";

// ── VISITOR MODEL ──
const ClickSchema = new Schema({
  page: String,
  element: String, // what they clicked
  timestamp: { type: Date, default: Date.now },
});

const VisitorSchema = new Schema({
  visitorId: { type: String, unique: true, required: true }, // fingerprint
  ip: String,
  email: String, // captured when they chat
  name: String,  // captured when they chat
  country: String,
  city: String,
  userAgent: String,
  device: String, // mobile / desktop / tablet
  browser: String,
  pages: [{ page: String, enteredAt: Date, timeSpent: Number }],
  clicks: [ClickSchema],
  sessions: [{ startedAt: Date, endedAt: Date, duration: Number }],
  totalVisits: { type: Number, default: 1 },
  lastSeen: { type: Date, default: Date.now },
  firstSeen: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false },
  banReason: String,
  banExpiresAt: Date, // null = permanent
  bannedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const Visitor = models.Visitor || model("Visitor", VisitorSchema);

// ── BAN MODEL ──
const BanSchema = new Schema({
  type: { type: String, enum: ["email", "ip", "visitorId"], required: true },
  value: { type: String, required: true }, // the email / ip / visitorId
  reason: String,
  bannedBy: { type: String, default: "admin" },
  durationDays: Number, // null = permanent
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  unbannedAt: Date,
  unbannedReason: String,
});

export const Ban = models.Ban || model("Ban", BanSchema);
