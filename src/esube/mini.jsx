// Satır ve kutucuklardaki küçük trend çizgisi (APK'daki mini grafikler).
import React, { useMemo } from "react";

/** Sembolden türetilen sabit bir seri: her yenilemede aynı çizgi çizilir. */
const seriesFor = (seed, change, count) => {
  let state = 0;
  for (let i = 0; i < seed.length; i += 1) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const drift = (Number(change) || 0) >= 0 ? 1 : -1;
  const points = [];
  let value = 50;
  for (let i = 0; i < count; i += 1) {
    value += (rand() - 0.5) * 9 + drift * 1.7;
    points.push(value);
  }
  return points;
};

const path = (values, width, height) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const at = (i) => [i * step, height - ((values[i] - min) / span) * (height - 4) - 2];
  let d = "";
  for (let i = 0; i < values.length; i += 1) {
    const [x, y] = at(i);
    if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
    const [px, py] = at(i - 1);
    const cx = (px + x) / 2;
    d += `C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
};

export default function MiniSpark({ code = "", change = 0, width = 62, height = 34, points = 22, fill = true }) {
  const up = Number(change) >= 0;
  const line = up ? "#22c55e" : "#e5484d";
  const id = `mkg-${up ? "u" : "d"}`;
  const d = useMemo(() => path(seriesFor(code || "X", change, points), width, height), [code, change, points, width, height]);
  return (
    <svg className="mini-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity=".28" />
              <stop offset="100%" stopColor={line} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d}L${width} ${height}L0 ${height}Z`} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" stroke={line} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
