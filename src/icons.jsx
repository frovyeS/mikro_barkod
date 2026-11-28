import React from 'react';

// Tek tip çizgi ikon seti — 24x24 ızgara, 1.75 çizgi, yuvarlak uçlar.
const P = {
  home: <><path d="M4 11.2 12 4.5l8 6.7" /><path d="M6 10v8.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V10" /><path d="M10 20v-5h4v5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  scan: <><path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M20 16v2a2 2 0 0 1-2 2h-2" /><path d="M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M7.5 12h9" /></>,
  camera: <><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" /><circle cx="12" cy="13" r="3.2" /></>,
  heart: <path d="M12 19.8s-7.2-4.4-7.2-10.1a4.1 4.1 0 0 1 7.2-2.6 4.1 4.1 0 0 1 7.2 2.6c0 5.7-7.2 10.1-7.2 10.1z" />,
  trend: <><path d="M4 17l5.5-5.5 3.5 3.5L20 7.5" /><path d="M15 7.5h5V12.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.2" /><path d="M12 7.5V12l3 1.8" /></>,
  barcode: <path d="M4.5 6v12M7.5 6v12M10 6v12M13.5 6v12M16 6v12M19.5 6v12" />,
  sun: <><circle cx="12" cy="12" r="3.6" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.9 5.9l1.4 1.4M16.7 16.7l1.4 1.4M18.1 5.9l-1.4 1.4M7.3 16.7l-1.4 1.4" /></>,
  moon: <path d="M20 14.2A8 8 0 1 1 9.8 4a6.5 6.5 0 0 0 10.2 10.2z" />,
  monitor: <><rect x="3.5" y="5" width="17" height="11" rx="2" /><path d="M9 20h6M12 16v4" /></>,
  sliders: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14" />,
  upload: <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M5 7h14M10 4h4" /><path d="M7 7l.8 11.2a1.5 1.5 0 0 0 1.5 1.3h5.4a1.5 1.5 0 0 0 1.5-1.3L17 7" /><path d="M10.5 11v5M13.5 11v5" /></>,
  edit: <><path d="M5 19l.8-3.7L15.7 5.4a1.8 1.8 0 0 1 2.5 0l.4.4a1.8 1.8 0 0 1 0 2.5L8.7 18.2z" /><path d="M13.9 7.2l2.9 2.9" /></>,
  'chevron-left': <path d="M14.5 6 8.5 12l6 6" />,
  'chevron-right': <path d="M9.5 6l6 6-6 6" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><circle cx="12" cy="8.1" r=".6" fill="currentColor" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  alert: <><path d="M10.6 5.2 3.4 17.6A1.6 1.6 0 0 0 4.8 20h14.4a1.6 1.6 0 0 0 1.4-2.4L13.4 5.2a1.6 1.6 0 0 0-2.8 0z" /><path d="M12 10v4" /><circle cx="12" cy="16.9" r=".6" fill="currentColor" /></>,
  bolt: <path d="M13 3.5 6 13h5l-1 7.5L18 11h-5z" />,
  flip: <><path d="M4 12a8 8 0 0 1 13.6-5.7L20 8.5" /><path d="M20 4v4.5h-4.5" /><path d="M20 12a8 8 0 0 1-13.6 5.7L4 15.5" /><path d="M4 20v-4.5h4.5" /></>,
  store: <><path d="M4 9.5 5.5 5h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 12.5V19h13v-6.5" /><path d="M10 19v-4h4v4" /></>,
  box: <><path d="M12 3.5 20 8v8l-8 4.5L4 16V8z" /><path d="M4 8l8 4.5L20 8M12 12.5v8" /></>,
  tag: <><path d="M3.8 12.4V5.8a2 2 0 0 1 2-2h6.6l8 8a2 2 0 0 1 0 2.8l-5.8 5.8a2 2 0 0 1-2.8 0z" /><circle cx="8.2" cy="8.2" r="1.2" /></>,
  sort: <path d="M8 5v14M4.5 8.5 8 5l3.5 3.5M16 19V5M12.5 15.5 16 19l3.5-3.5" />,
  shield: <><path d="M12 3.5l7 2.8v5.4c0 4.3-2.9 7.3-7 8.8-4.1-1.5-7-4.5-7-8.8V6.3z" /><path d="M9 12.2l2.3 2.3L15.2 10" /></>,
  keyboard: <><rect x="3.5" y="6.5" width="17" height="11" rx="2" /><path d="M7 10.5h.01M10 10.5h.01M13 10.5h.01M16 10.5h.01M8 14h8" /></>,
  layers: <><path d="M12 4 3.5 8.5 12 13l8.5-4.5z" /><path d="M3.5 12.5 12 17l8.5-4.5M3.5 16 12 20.5l8.5-4.5" /></>,
};

export function Icon({ name, size = 20, strokeWidth = 1.75, filled = false, className, ...rest }) {
  const body = P[name];
  if (!body) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {body}
    </svg>
  );
}

// Marka işareti: yuvarlatılmış kare + tarama köşeleri + barkod çubukları
export function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="logo-mark">
      <rect width="48" height="48" rx="12" className="logo-bg" />
      <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 19v-3.5A2.5 2.5 0 0 1 15.5 13H19" />
        <path d="M29 13h3.5a2.5 2.5 0 0 1 2.5 2.5V19" />
        <path d="M35 29v3.5a2.5 2.5 0 0 1-2.5 2.5H29" />
        <path d="M19 35h-3.5A2.5 2.5 0 0 1 13 32.5V29" />
      </g>
      <g fill="#fff">
        <rect x="18" y="19" width="2" height="10" rx=".6" />
        <rect x="21.6" y="19" width="1.4" height="10" rx=".5" />
        <rect x="24.6" y="19" width="2.6" height="10" rx=".6" />
        <rect x="28.4" y="19" width="1.6" height="10" rx=".5" />
      </g>
    </svg>
  );
}
