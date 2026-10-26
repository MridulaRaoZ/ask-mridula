import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

// The card LinkedIn, WhatsApp, Slack, and email show when the site's link is shared.
export const alt = "Mridula Rao, Senior Product Manager";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const photo = fs.readFileSync(path.join(process.cwd(), "public/mridula.jpg")).toString("base64");

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#fdf8f5", padding: 64, gap: 56, alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/jpeg;base64,${photo}`}
          alt=""
          width={380}
          height={380}
          style={{ borderRadius: 40, objectFit: "cover", objectPosition: "50% 18%" }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 30, color: "#d85a30", fontWeight: 600 }}>Senior Product Manager · 15+ yrs</div>
          <div style={{ fontSize: 84, color: "#2a2522", fontWeight: 700, letterSpacing: -2, marginTop: 8 }}>Mridula Rao</div>
          <div style={{ fontSize: 32, color: "#6f6660", marginTop: 16, lineHeight: 1.35 }}>
            Security and access platforms at Morgan Stanley. Fintech, enterprise SaaS, and consumer growth.
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
            {["Ask my AI about my career", "Check my fit for your role"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", flexShrink: 0, whiteSpace: "nowrap", fontSize: 22, background: "#e1f5ee", color: "#085041", borderRadius: 999, padding: "12px 24px" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
