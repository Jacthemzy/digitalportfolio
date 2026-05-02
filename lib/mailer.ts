import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function sendNotificationEmail({
  name, email, message,
}: { name: string; email: string; message: string }) {
  const timestamp = new Date().toLocaleString("en-NG", {
    timeZone: "Africa/Lagos", weekday: "long",
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const timeShort = new Date().toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" });

  await transporter.sendMail({
    from: `"📬 Portfolio Alert" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `💬 New Chat Message from ${name} — Temidayo Portfolio`,
    html: `
<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
  <div style="background:linear-gradient(135deg,#0c0c18,#12121f);border:1px solid #1e1e35;border-radius:12px 12px 0 0;padding:28px 32px;display:flex;align-items:center;gap:16px;">
    <div style="width:48px;height:48px;background:#e8c547;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#04040a;flex-shrink:0;">TJ</div>
    <div><p style="margin:0;color:#e8c547;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:monospace;">Temidayo Jacob Portfolio</p><p style="margin:4px 0 0;color:#eeeef5;font-size:18px;font-weight:600;">New Chat Message 💬</p></div>
  </div>
  <div style="background:#0c0c18;border:1px solid #1e1e35;border-top:none;padding:14px 32px;display:flex;align-items:center;gap:10px;">
    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#25d366;"></span>
    <span style="font-family:monospace;font-size:10px;color:#25d366;letter-spacing:2px;text-transform:uppercase;">Via WhatsApp Chat</span>
    <span style="margin-left:auto;font-family:monospace;font-size:9px;color:#3a3a5c;">${timestamp}</span>
  </div>
  <div style="background:#10101e;border:1px solid #1e1e35;border-top:none;padding:24px 32px;">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
      <div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#1a2a1a,#128c7e);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#fff;">${initials}</div>
      <div><p style="margin:0;color:#eeeef5;font-size:15px;font-weight:600;">${name}</p><a href="mailto:${email}" style="color:#e8c547;font-size:12px;text-decoration:none;">${email}</a></div>
    </div>
  </div>
  <div style="background:#0b141a;border:1px solid #1e1e35;border-top:none;padding:24px 32px;">
    <p style="margin:0 0 12px;font-family:monospace;font-size:9px;color:#3a3a5c;text-transform:uppercase;letter-spacing:3px;">Message</p>
    <div style="background:#202c33;border-radius:0 12px 12px 12px;padding:14px 18px;position:relative;display:inline-block;max-width:100%;box-sizing:border-box;width:100%;">
      <div style="position:absolute;top:0;left:-8px;width:0;height:0;border-right:8px solid #202c33;border-top:8px solid transparent;"></div>
      <p style="margin:0;color:#e9edef;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:6px;">
        <span style="color:#8696a0;font-size:10px;">${timeShort}</span>
        <svg width="17" height="11" viewBox="0 0 18 11" fill="none"><path d="M1 5.5L5 9.5L13 1.5" stroke="#53bdeb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5.5L9 9.5L17 1.5" stroke="#53bdeb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  </div>
  <div style="background:#0c0c18;border:1px solid #1e1e35;border-top:none;padding:18px 32px;display:flex;gap:10px;flex-wrap:wrap;">
    <a href="mailto:${email}?subject=Re: Your message on my portfolio" style="display:inline-block;padding:11px 22px;background:#e8c547;color:#04040a;font-weight:700;font-size:12px;text-decoration:none;border-radius:4px;">Reply Now →</a>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/dashboard" style="display:inline-block;padding:11px 22px;background:transparent;border:1px solid #1e1e35;color:#7878a0;font-size:12px;text-decoration:none;border-radius:4px;">View in Dashboard</a>
  </div>
  <div style="background:#07070f;border:1px solid #1e1e35;border-top:none;border-radius:0 0 12px 12px;padding:14px 32px;text-align:center;">
    <p style="margin:0;font-family:monospace;font-size:9px;color:#3a3a5c;letter-spacing:2px;text-transform:uppercase;">Temidayo Jacob Portfolio · Automated Notification</p>
  </div>
</div>
</body></html>`,
    text: `New chat message from ${name} (${email}):\n\n${message}\n\nTime: ${timestamp}`,
  });
}
