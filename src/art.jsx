import React from 'react';
import { eanModules } from './lib.js';

/* ---------- Ürün illüstrasyonları (96x96) ----------
   Renkler CSS değişkenlerinden gelir; açık/koyu temada uyum sağlar. */

const I = { fill: 'none', stroke: 'var(--art-ink)', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ART = {
  carton: (
    <>
      <path d="M27 38h42v43a3 3 0 0 1-3 3H30a3 3 0 0 1-3-3z" fill="var(--art-tint)" />
      <path d="M27 38 35 21h26l8 17z" fill="var(--art-tint-2)" />
      <path d="M39 21v-6h18v6" fill="var(--art-tint-2)" />
      <rect x="27" y="52" width="42" height="17" fill="var(--accent-solid)" opacity=".9" />
      <path d="M48 54.5c2.6 3 4.2 4.8 4.2 7a4.2 4.2 0 0 1-8.4 0c0-2.2 1.6-4 4.2-7z" fill="var(--art-paper)" />
      <path d="M27 38h42v43a3 3 0 0 1-3 3H30a3 3 0 0 1-3-3zM27 38 35 21h26l8 17M39 21v-6h18v6M35 21l-8 17M61 21l8 17" {...I} />
    </>
  ),
  bottle: (
    <>
      <path d="M42 28h12c0 7 11 8 11 18v34a4 4 0 0 1-4 4H35a4 4 0 0 1-4-4V46c0-10 11-11 11-18z" fill="var(--art-tint)" />
      <rect x="31" y="54" width="34" height="20" fill="var(--art-paper)" />
      <path d="M31 62c5-3 8 3 13 0s8 3 13 0 6-1 8 0v6c-2-1-5-3-8 0s-8-3-13 0-8-3-13 0z" fill="var(--accent-solid)" opacity=".9" />
      <rect x="40.5" y="14" width="15" height="7" rx="2" fill="var(--accent-solid)" />
      <rect x="42" y="21" width="12" height="7" fill="var(--art-tint-2)" />
      <path d="M42 28h12c0 7 11 8 11 18v34a4 4 0 0 1-4 4H35a4 4 0 0 1-4-4V46c0-10 11-11 11-18zM40.5 14h15a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zM31 54h34M31 74h34" {...I} />
    </>
  ),
  cup: (
    <>
      <path d="M62 45h5.5a8.5 8.5 0 0 1 0 17H61" fill="none" stroke="var(--art-ink)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 41h40v21a17 17 0 0 1-17 17h-6a17 17 0 0 1-17-17z" fill="var(--art-tint)" />
      <path d="M24 52h40v5H24z" fill="var(--accent-solid)" opacity=".9" />
      <ellipse cx="44" cy="84" rx="27" ry="4.2" fill="var(--art-tint-2)" />
      <path d="M24 41h40v21a17 17 0 0 1-17 17h-6a17 17 0 0 1-17-17zM17 84c0-2.5 12-4.2 27-4.2S71 81.500 71 84s-12 4.200-27 4.200S17 86.500 17 84z" {...I} />
      <path d="M36 32c-3-4 3-6 0-11M45 32c-3-4 3-6 0-11M54 32c-3-4 3-6 0-11" {...I} strokeWidth="1.6" />
    </>
  ),
  pencil: (
    <g transform="rotate(38 48 48)">
      <rect x="39" y="24" width="18" height="46" fill="var(--art-tint)" />
      <rect x="45.500" y="24" width="5" height="46" fill="var(--accent-solid)" opacity=".9" />
      <path d="M39 24 48 6l9 18z" fill="var(--art-tint-2)" />
      <path d="M44.200 14.400 48 6l3.800 8.400z" fill="var(--art-ink)" />
      <rect x="39" y="70" width="18" height="6" fill="var(--art-tint-2)" />
      <path d="M39 76h18v6a3 3 0 0 1-3 3H42a3 3 0 0 1-3-3z" fill="var(--accent-solid)" />
      <path d="M39 24h18v46H39zM39 24 48 6l9 18M39 70h18v6H39zM39 76h18v6a3 3 0 0 1-3 3H42a3 3 0 0 1-3-3zM39 24h18" {...I} />
    </g>
  ),
  can: (
    <>
      <path d="M28 26v48c0 3.500 9 7 20 7s20-3.500 20-7V26z" fill="var(--art-tint)" />
      <path d="M28 40v24c0 3.500 9 7 20 7s20-3.500 20-7V40c0 3.500-9 7-20 7s-20-3.500-20-7z" fill="var(--accent-solid)" opacity=".9" />
      <ellipse cx="48" cy="26" rx="20" ry="7" fill="var(--art-tint-2)" />
      <ellipse cx="48" cy="26" rx="13" ry="4.200" {...I} strokeWidth="1.400" />
      <path d="M28 26v48c0 3.500 9 7 20 7s20-3.500 20-7V26M28 40c0 3.500 9 7 20 7s20-3.500 20-7M28 64c0 3.500 9 7 20 7s20-3.500 20-7" {...I} />
      <ellipse cx="48" cy="26" rx="20" ry="7" {...I} />
    </>
  ),
  bag: (
    <>
      <path d="M27 24h42l2 6v48a5 5 0 0 1-5 5H30a5 5 0 0 1-5-5V30z" fill="var(--art-tint)" />
      <path d="M25 24h46v10H25z" fill="var(--art-tint-2)" />
      <rect x="33" y="44" width="30" height="26" rx="5" fill="var(--art-paper)" />
      <ellipse cx="48" cy="57" rx="6.500" ry="9" transform="rotate(35 48 57)" fill="var(--accent-solid)" />
      <path d="M44.500 62c3-1.500 4-5 7-8" fill="none" stroke="var(--art-paper)" strokeWidth="1.600" strokeLinecap="round" />
      <path d="M27 24h42l2 6v48a5 5 0 0 1-5 5H30a5 5 0 0 1-5-5V30zM25 34h46M30 24v10M35 24v10M40 24v10M45 24v10M50 24v10M55 24v10M60 24v10M65 24v10" {...I} />
      <rect x="33" y="44" width="30" height="26" rx="5" {...I} />
    </>
  ),
  pump: (
    <>
      <rect x="29" y="42" width="38" height="42" rx="8" fill="var(--art-tint)" />
      <rect x="35" y="54" width="26" height="18" rx="4" fill="var(--art-paper)" />
      <path d="M48 57c2.500 3 4 4.600 4 6.800a4 4 0 0 1-8 0c0-2.200 1.500-3.800 4-6.800z" fill="var(--accent-solid)" />
      <rect x="43" y="32" width="10" height="10" fill="var(--art-tint-2)" />
      <path d="M38 22h20a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H38a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" fill="var(--accent-solid)" />
      <path d="M61 24h8a3 3 0 0 1 3 3v2" {...I} />
      <rect x="29" y="42" width="38" height="42" rx="8" {...I} />
      <rect x="35" y="54" width="26" height="18" rx="4" {...I} strokeWidth="1.400" />
      <path d="M43 32v10M53 32v10M38 22h20a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H38a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" {...I} />
    </>
  ),
  box: (
    <>
      <path d="M48 17 77 31v34L48 80 19 65V31z" fill="var(--art-tint)" />
      <path d="M48 17 77 31 48 45 19 31z" fill="var(--art-tint-2)" />
      <path d="M48 45 77 31v34L48 80z" fill="var(--art-tint)" opacity=".55" />
      <path d="M40 21.500 67 35.500 61 38.500 34 24.500z" fill="var(--accent-solid)" opacity=".9" />
      <path d="M54 56v14M58 54v14M62 52v14M66 50v14" {...I} strokeWidth="1.600" />
      <path d="M48 17 77 31v34L48 80 19 65V31zM19 31l29 14 29-14M48 45v35" {...I} />
    </>
  ),
};

export function ProductArt({ name = 'box', size = 64, className = '' }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={`art ${className}`} aria-hidden="true" focusable="false">
      {ART[name] || ART.box}
    </svg>
  );
}

/* ---------- EAN barkod çizimi ---------- */

export function BarcodeSvg({ code, className = '' }) {
  const enc = eanModules(code);
  if (!enc) return null;
  const { modules, kind } = enc;
  const quietL = kind === 13 ? 11 : 7;
  const quietR = 7;
  const W = quietL + modules.length + quietR;
  const top = 4;
  const barH = 46;
  const guardH = 53;
  const guard = (i) => i < 3 || (i >= (kind === 13 ? 45 : 31) && i < (kind === 13 ? 50 : 36)) || i >= modules.length - 3;

  const rects = [];
  let i = 0;
  while (i < modules.length) {
    if (modules[i] === '1') {
      let j = i;
      while (j < modules.length && modules[j] === '1' && guard(j) === guard(i)) j++;
      rects.push(<rect key={i} x={quietL + i} y={top} width={j - i} height={guard(i) ? guardH : barH} />);
      i = j;
    } else i++;
  }

  const digits = [];
  const leftStart = quietL + 3;
  if (kind === 13) {
    digits.push({ ch: code[0], x: quietL - 5 });
    for (let k = 1; k <= 6; k++) digits.push({ ch: code[k], x: leftStart + (k - 1) * 7 + 3.5 });
    const rightStart = quietL + 3 + 42 + 5;
    for (let k = 7; k <= 12; k++) digits.push({ ch: code[k], x: rightStart + (k - 7) * 7 + 3.5 });
  } else {
    for (let k = 0; k < 4; k++) digits.push({ ch: code[k], x: leftStart + k * 7 + 3.5 });
    const rightStart = quietL + 3 + 28 + 5;
    for (let k = 4; k < 8; k++) digits.push({ ch: code[k], x: rightStart + (k - 4) * 7 + 3.5 });
  }
  const H = top + guardH + 3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`barcode-svg ${className}`} role="img" aria-label={`Barkod ${code}`}>
      <rect width={W} height={H} fill="#fff" />
      <g fill="#111">{rects}</g>
      <g fill="#111" fontSize="7.200" textAnchor="middle" fontFamily="'OCR-B','Courier New',ui-monospace,monospace">
        {digits.map((d, k) => (
          <text key={k} x={d.x} y={top + guardH - 0.8}>{d.ch}</text>
        ))}
      </g>
    </svg>
  );
}

/* ---------- Ana ekran tarama illüstrasyonu ---------- */

export function ScanArt() {
  const bars = [[0, 3], [5, 1.5], [8, 4], [14, 1.5], [17, 3], [22, 1.5], [25, 5], [32, 1.5], [35, 3], [40, 4], [46, 1.5], [49, 3], [54, 1.5], [57, 5], [64, 3], [69, 1.5], [72, 4], [78, 1.5], [81, 3]];
  return (
    <svg viewBox="0 0 120 84" className="scan-art" aria-hidden="true" focusable="false">
      <g transform="translate(15 20)" fill="var(--art-ink)">
        {bars.map(([x, w], i) => (
          <rect key={i} x={x} y="0" width={w} height="44" rx=".4" opacity=".88" />
        ))}
      </g>
      <g fill="none" stroke="var(--accent-solid)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 24V14a6 6 0 0 1 6-6h10" />
        <path d="M96 8h10a6 6 0 0 1 6 6v10" />
        <path d="M112 60v10a6 6 0 0 1-6 6H96" />
        <path d="M24 76H14a6 6 0 0 1-6-6V60" />
      </g>
      <rect x="10" y="40.500" width="100" height="3" rx="1.500" fill="var(--accent-solid)" className="scan-beam" />
    </svg>
  );
}
