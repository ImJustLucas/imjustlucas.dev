import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  OWNER_HANDLE,
  OWNER_LOCALITY,
  OWNER_NAME,
  SITE_URL,
} from "@/config/site";
import { routing } from "@/i18n/routing";

/**
 * The link preview of every page of a Locale (Open Graph, and X through its
 * Open Graph fallback): the banner as a player card, the chibi on his stage
 * beside Lucas's real name, his handle and his role. Electric navy palette
 * (DESIGN.md); generated once per Locale at build time.
 */

export const alt = `${OWNER_NAME} · ${OWNER_HANDLE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** One image per Locale, generated at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const NAVY_FRAME = "#05081c";
const NAVY = "#0a0f2e";
const NAVY_RAISED = "#141c48";
const NAVY_SEAM = "#2a3a7a";
const OFF_WHITE = "#f6f3ea";
const NAVY_HAZE = "#aab6e6";
const ELECTRIC_GLOW = "#6f97ff";

type Font = { name: string; data: ArrayBuffer; weight: 500 | 600 | 700 };

/**
 * A Google Fonts face subset to `text` (the CSS API serves TrueType to a
 * client that asks for no other format).
 */
async function googleFont(
  family: string,
  weight: Font["weight"],
  text: string,
): Promise<Font> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
  ).then((response) => response.text());
  const source = css.match(
    /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/,
  );
  if (!source) throw new Error(`No ${family} ${weight} font file`);
  const data = await fetch(source[1]).then((response) =>
    response.arrayBuffer(),
  );
  return { name: family, data, weight };
}

/**
 * The site's faces: Unbounded for the name, Geist for the rest. All or none:
 * a face subset to the name must never stand in for the other text, so if one
 * cannot be read the image uses the renderer's own Geist throughout.
 */
async function siteFonts(name: string, rest: string): Promise<Font[]> {
  try {
    return await Promise.all([
      googleFont("Unbounded", 700, name),
      googleFont("Geist", 500, rest),
      googleFont("Geist", 600, rest),
    ]);
  } catch {
    return [];
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: param } = await params;
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "Home" });

  const handle = `@${OWNER_HANDLE}`;
  const role = t("role");
  const place = `${SITE_URL.host.replace(/^www\./, "")} · ${OWNER_LOCALITY.city}`;
  const [chibi, fonts] = await Promise.all([
    // The banner pose as PNG: the renderer cannot decode WebP
    readFile(join(process.cwd(), "public/images/og/chibi-banner.png")),
    siteFonts(OWNER_NAME, `${handle}${role}${place}`),
  ]);
  const displayFont = fonts.length > 0 ? "Unbounded" : undefined;
  const bodyFont = fonts.length > 0 ? "Geist" : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 24,
          background: NAVY_FRAME,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 48,
            padding: "32px 64px 32px 40px",
            borderRadius: 32,
            border: `4px solid ${NAVY_SEAM}`,
            background: NAVY_RAISED,
            boxShadow: "inset 0 2px 0 rgba(246, 243, 234, 0.07)",
          }}
        >
          {/* The chibi on his stage disc */}
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 440,
              height: 440,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 26,
                right: 26,
                top: 62,
                bottom: 18,
                borderRadius: 9999,
                background: NAVY,
              }}
            />
            {}
            <img
              src={`data:image/png;base64,${chibi.toString("base64")}`}
              alt=""
              width={440}
              height={440}
            />
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              minWidth: 0,
              fontFamily: bodyFont,
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 20px",
                borderRadius: 9999,
                border: `3px solid ${NAVY_SEAM}`,
                background: NAVY,
                color: ELECTRIC_GLOW,
                fontSize: 30,
                fontWeight: 600,
              }}
            >
              {handle}
            </div>
            <div
              style={{
                display: "flex",
                color: OFF_WHITE,
                fontFamily: displayFont,
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {OWNER_NAME}
            </div>
            <div
              style={{
                display: "flex",
                color: NAVY_HAZE,
                fontSize: 36,
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {role}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                color: NAVY_HAZE,
                fontSize: 28,
                letterSpacing: "0.02em",
              }}
            >
              {place}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
