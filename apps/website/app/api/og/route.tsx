import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "SkyHelper";
  const description = searchParams.get("description") || "Your companion for Sky: Children of the Light";
  const pathname = searchParams.get("pathname") || "/";

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            padding: "60px",
            position: "relative",
          }}
        >
          {/* Top Left - Logo and Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "60px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "16px",
              }}
            >
              <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/boticon.svg`} />
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              SkyHelper
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: "900px",
            }}
          >
            <h1
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "white",
                margin: "0 0 24px 0",
                lineHeight: "1.1",
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: "32px",
                color: "rgba(255,255,255,0.7)",
                margin: "0",
                lineHeight: "1.4",
              }}
            >
              {description}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                background: "rgba(88, 101, 242, 0.2)",
                border: "1px solid rgba(88, 101, 242, 0.3)",
                borderRadius: "50px",
                padding: "12px 24px",
                display: "flex",
                minWidth: "100px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  color: "#a5b4fc",
                  fontWeight: "500",
                }}
              >
                {pathname}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "60px",
              right: "40px",
            }}
          >
            <span
              style={{
                fontSize: "30px",
                color: "#a5b4fc",
                fontWeight: "500",
              }}
            >
              skyhelper.xyz
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
