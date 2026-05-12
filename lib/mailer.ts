import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

function getTimestamp() {
  return new Date().toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function sendNotificationEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const transporter = getTransporter();
  const timestamp = getTimestamp();

  await transporter.sendMail({
    from: `"Portfolio Inbox" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `New chat message from ${name}`,
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:640px;margin:0 auto;background:#0c0c18;color:#eeeef5;border:1px solid #1e1e35;border-radius:14px;overflow:hidden">
        <div style="padding:24px 28px;background:#07070f;border-bottom:1px solid #1e1e35">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#e8c547">Portfolio Chat</div>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:600">New incoming message</h1>
        </div>
        <div style="padding:24px 28px">
          <p style="margin:0 0 10px"><strong>Name:</strong> ${name}</p>
          <p style="margin:0 0 10px"><strong>Email:</strong> ${email}</p>
          <p style="margin:0 0 18px"><strong>Received:</strong> ${timestamp}</p>
          <div style="background:#07070f;border:1px solid #1e1e35;border-radius:12px;padding:18px;white-space:pre-wrap;line-height:1.7">${message}</div>
        </div>
      </div>
    `,
    text: `New chat message from ${name} (${email}) at ${timestamp}\n\n${message}`,
  });
}

export async function sendReplyNotificationEmail({
  name,
  email,
  reply,
}: {
  name: string;
  email: string;
  reply: string;
}) {
  const transporter = getTransporter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await transporter.sendMail({
    from: `"Temidayo Jacob" <${process.env.EMAIL_USER}>`,
    to: email,
    replyTo: process.env.EMAIL_TO || process.env.EMAIL_USER,
    subject: "Temidayo replied to your portfolio message",
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:640px;margin:0 auto;background:#0c0c18;color:#eeeef5;border:1px solid #1e1e35;border-radius:14px;overflow:hidden">
        <div style="padding:24px 28px;background:#07070f;border-bottom:1px solid #1e1e35">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#e8c547">Portfolio Reply</div>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:600">Temidayo sent you a reply</h1>
        </div>
        <div style="padding:24px 28px">
          <p style="margin:0 0 16px">Hi ${name},</p>
          <p style="margin:0 0 18px">There is a new reply waiting for you in the chat.</p>
          <div style="background:#07070f;border:1px solid #1e1e35;border-radius:12px;padding:18px;white-space:pre-wrap;line-height:1.7">${reply}</div>
          <div style="margin-top:22px">
            <a href="${siteUrl}/chat" style="display:inline-block;background:#e8c547;color:#04040a;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Open chat</a>
          </div>
        </div>
      </div>
    `,
    text: `Hi ${name},\n\nTemidayo replied to your portfolio message:\n\n${reply}\n\nOpen chat: ${siteUrl}/chat`,
  });
}
