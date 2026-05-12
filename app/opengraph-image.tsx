import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Temidayo Jacob Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #04040a 0%, #0c0c18 55%, #111827 100%)",
          color: "#eeeef5",
          padding: "56px 64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 92,
              height: 92,
              border: "2px solid #e8c547",
              color: "#e8c547",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            TJ
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 16px",
              border: "1px solid rgba(232,197,71,0.22)",
              color: "#e8c547",
              fontSize: 18,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Portfolio
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 930 }}>
          <div style={{ fontSize: 68, lineHeight: 1.02, fontWeight: 300 }}>
            Temidayo Jacob
          </div>
          <div style={{ fontSize: 28, color: "#e8c547", letterSpacing: 1 }}>
            Product Manager · Digital Marketer · Software Developer
          </div>
          <div style={{ fontSize: 24, lineHeight: 1.5, color: "#b2b3c8", maxWidth: 880 }}>
            Case studies, project journeys, growth thinking, and software execution from Lagos, Nigeria.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {["Product Strategy", "Growth Marketing", "Software Engineering"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  padding: "10px 14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#d1d5db",
                  fontSize: 18,
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 18, color: "#6b7280" }}>temidayo portfolio</div>
        </div>
      </div>
    ),
    size
  );
}
