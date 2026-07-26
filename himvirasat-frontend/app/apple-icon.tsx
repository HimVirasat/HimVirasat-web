import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Same snow-capped ridgeline as components/mistral/logo-mark.tsx and
 * app/icon.tsx. Satori cannot import the React component, so the tile
 * table is duplicated in all three — change one, change all three.
 */
const TILES: Array<[number, number, number]> = [
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

/** summit → base: glacier, sage, forest, pine, timber. */
const PEAK = ["#7ec6c6", "#7fb69b", "#2e7358", "#1c5341", "#6e4e36"];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbfbf8",
        }}
      >
        {/* 4 x 36px tiles, centred in the 180px canvas with a 18px margin. */}
        <div style={{ display: "flex", position: "relative", width: 144, height: 144 }}>
          {TILES.map(([col, row, step]) => (
            <div
              key={`${col}-${row}`}
              style={{
                position: "absolute",
                left: col * 36,
                top: row * 36,
                width: 36,
                height: 36,
                backgroundColor: PEAK[step],
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
