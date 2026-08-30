import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt =
  "Aila Ecosystem — Build the Future with AI";

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
          position: "relative",
          overflow: "hidden",
          background: "#030303",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(135deg, #030303 0%, #07111f 45%, #14091f 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            top: -260,
            right: -100,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.35) 0%, rgba(59,130,246,0.12) 45%, transparent 72%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            bottom: -300,
            left: 150,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.30) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 36,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 34,
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            padding: "76px 86px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                background: "#22d3ee",
                boxShadow: "0 0 30px #22d3ee",
              }}
            />

            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              AILA ECOSYSTEM
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 72,
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: "-0.05em",
              }}
            >
              Build the Future
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 72,
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                marginTop: 8,
                background:
                  "linear-gradient(90deg, #22d3ee, #60a5fa, #c084fc)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              with AI.
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 30,
                fontSize: 25,
                lineHeight: 1.5,
                color: "#b8b8c2",
                maxWidth: 850,
              }}
            >
              AI-powered websites, applications, automation systems
              and intelligent digital experiences.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 20,
              color: "#8b8b96",
            }}
          >
            <div style={{ display: "flex" }}>
              AI • WEB • APPS • AUTOMATION
            </div>

            <div
              style={{
                display: "flex",
                color: "#67e8f9",
              }}
            >
              ailaluxe.com
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}