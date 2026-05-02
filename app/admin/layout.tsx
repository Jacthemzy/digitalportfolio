import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", background: "#04040a" }}>{children}</div>;
}
