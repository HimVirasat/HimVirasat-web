import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Same snow-capped ridgeline as components/mistral/logo-mark.tsx. */
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

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fbfbf8",
        }}
      >
        <svg width="64" height="64" viewBox="0 0 32 32">
          {TILES.map(([col, row, step]) => (
            <rect
              key={`${col}-${row}`}
              x={col * 8}
              y={row * 8}
              width={8}
              height={8}
              fill={PEAK[step]}
            />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
