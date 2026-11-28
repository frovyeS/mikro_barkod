// Mikro Barkod — saf yardımcı fonksiyonlar (arayüzden bağımsız)

export const CATEGORIES = [
  'Süt ürünleri',
  'İçecek',
  'Kahve ve çay',
  'Temel gıda',
  'Atıştırmalık',
  'Konserve',
  'Temizlik',
  'Kişisel bakım',
  'Kırtasiye',
  'Diğer',
];

export const ART_KEYS = ['carton', 'bottle', 'cup', 'pencil', 'can', 'bag', 'pump', 'box'];

export const ART_LABELS = {
  carton: 'Süt kutusu',
  bottle: 'Şişe',
  cup: 'Fincan',
  pencil: 'Kalem',
  can: 'Konserve',
  bag: 'Paket',
  pump: 'Pompalı şişe',
  box: 'Koli',
};

const EMOJI_ART = {
  '🥛': 'carton', '🧈': 'carton', '🧀': 'carton',
  '☕': 'cup', '🍵': 'cup',
  '✏️': 'pencil', '✏': 'pencil', '🖊️': 'pencil', '🖍️': 'pencil', '📝': 'pencil',
  '🥤': 'bottle', '🍼': 'bottle', '🧃': 'bottle', '🍶': 'bottle', '💧': 'bottle',
  '🥫': 'can',
  '🍞': 'bag', '🥖': 'bag', '🍪': 'bag', '🍫': 'bag', '🍿': 'bag', '🌾': 'bag',
  '🧴': 'pump', '🧼': 'pump', '🧽': 'pump',
  '📦': 'box',
};

function artFromCategory(category = '') {
  const c = category.toLocaleLowerCase('tr');
  if (/süt|yoğurt|peynir|ayran|kefir/.test(c)) return 'carton';
  if (/kahve|çay/.test(c)) return 'cup';
  if (/içecek|su\b|meşrubat|gazoz|meyve suyu/.test(c)) return 'bottle';
  if (/kırtasiye|kalem|defter/.test(c)) return 'pencil';
  if (/konserve/.test(c)) return 'can';
  if (/atıştırmalık|bakliyat|makarna|temel|bisküvi|çikolata/.test(c)) return 'bag';
  if (/temizlik|bakım|deterjan|şampuan|sabun/.test(c)) return 'pump';
  return 'box';
}

export function resolveArt(p) {
  if (ART_KEYS.includes(p?.art)) return p.art;
  if (p?.image && EMOJI_ART[p.image]) return EMOJI_ART[p.image];
  return artFromCategory(p?.category);
}

/* ---------- Barkod ---------- */

export const digitsOnly = (s) => String(s ?? '').replace(/\D/g, '');

export function validEAN(s) {
  if (!/^\d+$/.test(s) || ![8, 12, 13, 14].includes(s.length)) return false;
  const body = s.slice(0, -1).split('').reverse().map(Number);
  const sum = body.reduce((a, x, i) => a + x * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(s.at(-1));
}

// UPC-A (12 hane) ile EAN-13 aynı ürünü gösterir: tek biçime indirgenir.
export function canonicalCode(raw) {
  const d = digitsOnly(raw);
  return d.length === 12 ? '0' + d : d;
}

export function explainBarcode(raw) {
  const s = String(raw ?? '').replace(/\s+/g, '');
  if (!s) return 'Barkod numarasını gir.';
  if (!/^\d+$/.test(s)) return 'Barkod yalnızca rakamlardan oluşmalı.';
  if (![8, 12, 13, 14].includes(s.length)) return 'Barkod 8, 12, 13 veya 14 haneli olmalı.';
  if (!validEAN(s)) return 'Kontrol basamağı geçersiz. Numarayı kontrol et.';
  return '';
}

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const R = L.map((c) => c.split('').map((b) => (b === '1' ? '0' : '1')).join(''));
const G = R.map((c) => c.split('').reverse().join(''));
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

// 0/1 modül dizisi üretir. 8 ve 13 hane desteklenir; diğerleri null döner.
export function eanModules(code) {
  if (!/^\d+$/.test(code)) return null;
  if (code.length === 13) {
    const first = Number(code[0]);
    const par = PARITY[first];
    let m = '101';
    for (let i = 0; i < 6; i++) m += (par[i] === 'L' ? L : G)[Number(code[i + 1])];
    m += '01010';
    for (let i = 7; i < 13; i++) m += R[Number(code[i])];
    m += '101';
    return { modules: m, kind: 13 };
  }
  if (code.length === 8) {
    let m = '101';
    for (let i = 0; i < 4; i++) m += L[Number(code[i])];
    m += '01010';
    for (let i = 4; i < 8; i++) m += R[Number(code[i])];
    m += '101';
    return { modules: m, kind: 8 };
  }
  return null;
}

/* ---------- Paket / birim fiyat ---------- */

// "250 g" -> { qty: 0.25, unit: 'kg' }, "500 ml" -> { qty: 0.5, unit: 'L' }, "6 adet" -> { qty: 6, unit: 'adet' }
export function parseSize(size = '', fallbackUnit = '') {
  const m = String(size).toLocaleLowerCase('tr').match(/(\d+(?:[.,]\d+)?)\s*(kg|gr|g|lt|ml|cl|l|adet|ad)\b/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  if (!(n > 0)) return null;
  switch (m[2]) {
    case 'kg': return { qty: n, unit: 'kg' };
    case 'g': case 'gr': return { qty: n / 1000, unit: 'kg' };
    case 'l': case 'lt': return { qty: n, unit: 'L' };
    case 'ml': return { qty: n / 1000, unit: 'L' };
    case 'cl': return { qty: n / 100, unit: 'L' };
    default: return { qty: n, unit: 'adet' };
  }
}

export function unitPrice(price, size) {
  const s = parseSize(size);
  if (!s || !(price > 0)) return null;
  return { value: price / s.qty, unit: s.unit };
}

const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
export const fmtMoney = (n) => money.format(n);

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
export function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return '';
  return dateFmt.format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// "12,50", "12.5", "1.250,75" -> sayı; geçersizse NaN
export function parseMoney(raw) {
  let s = String(raw ?? '').replace(/[^\d.,]/g, '');
  if (!s) return NaN;
  if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

export const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));

export const trLower = (s) => String(s ?? '').toLocaleLowerCase('tr');

/* ---------- Veri doğrulama / geçiş ---------- */

const str = (v, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function sanitizeOffer(o) {
  if (!o || typeof o !== 'object') return null;
  const price = Number(o.price);
  const store = str(o.store, 60);
  if (!(price > 0) || !store) return null;
  return {
    id: typeof o.id === 'string' && o.id ? o.id : uid(),
    store,
    price: Math.round(price * 100) / 100,
    updated: /^\d{4}-\d{2}-\d{2}/.test(o.updated || '') ? o.updated.slice(0, 10) : todayISO(),
  };
}

export function sanitizeProduct(p) {
  if (!p || typeof p !== 'object') return null;
  const barcode = canonicalCode(p.barcode);
  if (![8, 13, 14].includes(barcode.length)) return null;
  const size = str(p.size, 40);
  const parsed = parseSize(size);
  return {
    barcode,
    name: str(p.name, 120) || 'Adsız ürün',
    brand: str(p.brand, 60),
    category: str(p.category, 60),
    size,
    unit: parsed?.unit || str(p.unit, 10),
    art: resolveArt(p),
    demo: p.demo === true,
    offers: Array.isArray(p.offers) ? p.offers.map(sanitizeOffer).filter(Boolean) : [],
  };
}

export function sanitizeProducts(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const p = sanitizeProduct(raw);
    if (p && !seen.has(p.barcode)) {
      seen.add(p.barcode);
      out.push(p);
    }
  }
  return out;
}

export function sanitizeCodes(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const c of list) {
    const k = canonicalCode(c);
    if (k && !out.includes(k)) out.push(k);
  }
  return out;
}

export function bestOffer(p) {
  if (!p?.offers?.length) return null;
  return p.offers.reduce((a, b) => (b.price < a.price ? b : a));
}
