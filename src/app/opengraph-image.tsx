import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — Software Engineer`;

/**
 * Built with the built-in font rather than a fetched one, so the image
 * renders at build time without network access.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0c",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 14, height: 40, background: "#e0a458" }} />
          <div
            style={{
              fontSize: 26,
              color: "#8a8a85",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            {profile.handle}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 116,
              color: "#edeae4",
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            {profile.name}
          </div>
          {/* One interpolated string, not three nodes — Satori requires an
              explicit display on any element with more than one child. */}
          <div style={{ fontSize: 38, color: "#8a8a85", marginTop: 22 }}>
            {`${profile.roles[0]} · ${profile.location}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #24242a",
            paddingTop: 26,
            fontSize: 24,
            color: "#8a8a85",
          }}
        >
          <div>{profile.ssh}</div>
          <div>{profile.email}</div>
        </div>
      </div>
    ),
    size,
  );
}
