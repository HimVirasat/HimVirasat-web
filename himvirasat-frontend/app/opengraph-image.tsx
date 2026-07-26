import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = "HimVirasat · Open language preservation for Himachal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CANVAS = "#fbfbf8";
const INK = "#07070b";
const MUTED = "#5a5a63";
const HAIRLINE = "#e4e3de";
/** summit → base: glacier, sage, forest, pine, timber. */
const PEAK = ["#7ec6c6", "#7fb69b", "#2e7358", "#1c5341", "#6e4e36"];

/** The wider Deodar ramp, used for the tile band. */
const DEODAR = [
  "#7fb69b",
  "#4e9578",
  "#2e7358",
  "#1c5341",
  "#0f3a2e",
  "#7ec6c6",
  "#3e9ca3",
  "#a98363",
  "#6e4e36",
];

/** Snow-capped ridgeline, matching components/mistral/logo-mark.tsx. */
const MARK_TILES: Array<[number, number, number]> = [
  [2, 0, 0],
  [1, 1, 1],
  [2, 1, 1],
  [0, 2, 2],
  [1, 2, 2],
  [2, 2, 2],
  [3, 2, 3],
  [0, 3, 4],
  [1, 3, 4],
  [2, 3, 3],
  [3, 3, 4],
];

/* Deterministic tile band along the bottom edge. */
const BAND = Array.from({ length: 20 }, (_, i) => DEODAR[(i * 7 + 3) % 9]);

async function loadGoogleFont(family: string): Promise<ArrayBuffer> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((res) => res.text());
  const match = css.match(/url\((https:[^)]+\.(?:ttf|woff))\)/);
  if (!match) throw new Error("No usable font URL in Google Fonts CSS");
  const font = await fetch(match[1]);
  if (!font.ok) throw new Error("Font download failed");
  return font.arrayBuffer();
}

function composition(withDevanagari: boolean) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        padding: "0 96px",
        backgroundColor: CANVAS,
        fontFamily: withDevanagari ? "Geist" : "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 3,
            color: MUTED,
          }}
        >
          OPEN LANGUAGE PRESERVATION
        </div>

        {withDevanagari ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Noto Serif Devanagari",
              fontSize: 104,
              lineHeight: 1.2,
              marginTop: 24,
              color: INK,
            }}
          >
            {site.nativeName}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: 52,
            marginTop: withDevanagari ? 8 : 36,
            color: INK,
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            marginTop: 20,
            color: MUTED,
          }}
        >
          Open language preservation for Himachal
        </div>
      </div>

      {/* Mosaic mark */}
      <div
        style={{
          display: "flex",
          width: 264,
          height: 264,
          position: "relative",
        }}
      >
        {MARK_TILES.map(([col, row, step]) => (
          <div
            key={`${col}-${row}`}
            style={{
              position: "absolute",
              left: col * 66,
              top: row * 66,
              width: 66,
              height: 66,
              backgroundColor: PEAK[step],
            }}
          />
        ))}
      </div>

      {/* Hairline above the tile band */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 48,
          height: 1,
          backgroundColor: HAIRLINE,
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 48,
          display: "flex",
        }}
      >
        {BAND.map((fill, i) => (
          <div
            key={i}
            style={{ width: 60, height: 48, backgroundColor: fill }}
          />
        ))}
      </div>
    </div>
  );
}

export default async function OpengraphImage() {
  try {
    const [deva, display, takri] = await Promise.all([
      loadGoogleFont("Noto+Serif+Devanagari:wght@600&subset=devanagari"),
      loadGoogleFont("Geist:wght@500"),
      // css2 subset param is unreliable for Takri; the default TTF covers it.
      loadGoogleFont("Noto+Sans+Takri:wght@400"),
    ]);
    return new ImageResponse(composition(true), {
      ...size,
      fonts: [
        {
          name: "Noto Serif Devanagari",
          data: deva,
          style: "normal",
          weight: 600,
        },
        { name: "Geist", data: display, style: "normal", weight: 500 },
        { name: "Noto Sans Takri", data: takri, style: "normal", weight: 400 },
      ],
    });
  } catch {
    // Font fetch failed — satori cannot shape Devanagari without a loaded
    // font, so fall back to a Latin-only composition with system fonts.
    return new ImageResponse(composition(false), size);
  }
}
