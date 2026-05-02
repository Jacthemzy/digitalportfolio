import { Schema, model, models } from "mongoose";

const SiteContentSchema = new Schema({
  section: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

export const SiteContent = models.SiteContent || model("SiteContent", SiteContentSchema);
