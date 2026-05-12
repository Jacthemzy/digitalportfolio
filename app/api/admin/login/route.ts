import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const submittedEmail = String(email ?? "").trim().toLowerCase();
    const submittedPassword = String(password ?? "");
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@temidayo.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminHash = process.env.ADMIN_PASSWORD_HASH || "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

    if (!submittedEmail || !submittedPassword) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (submittedEmail !== adminEmail) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = adminPassword
      ? submittedPassword === adminPassword
      : await bcrypt.compare(submittedPassword, adminHash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ email: submittedEmail, role: "admin" });
    const res = NextResponse.json({ success: true, token });
    res.cookies.set("admin_token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
