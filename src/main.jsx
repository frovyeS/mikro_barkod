import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { Icon, Logo } from './icons.jsx';
import { ProductArt, BarcodeSvg, ScanArt } from './art.jsx';
import {
  ART_KEYS, ART_LABELS, CATEGORIES, bestOffer, canonicalCode, digitsOnly, explainBarcode, fmtDate, fmtMoney,
  parseMoney, parseSize, resolveArt, sanitizeCodes, sanitizeProduct, sanitizeProducts, todayISO, trLower, uid,
  unitPrice, validEAN,
} from './lib.js';
import { registerSW } from './pwa.js';

/* ================= Veri ================= */

const DEMO = sanitizeProducts([
  { barcode: '8690504012344', name: 'Tam Yağlı Süt', brand: 'Demo Marka', category: 'Süt ürünleri', size: '1 L', art: 'carton', demo: true },
  { barcode: '8690000000005', name: 'Filtre Kahve', brand: 'Demo Marka', category: 'Kahve ve çay', size: '250 g', art: 'bag', demo: true },
  { barcode: '4006381333931', name: 'Kurşun Kalem', brand: 'Demo Marka', category: 'Kırtasiye', size: '1 adet', art: 'pencil', demo: true },
]);

// İlk sürümdeki geçersiz demo barkodları yeni sürümde geçerli karşılıklarına taşınır.
const LEGACY = { '8690504012345': '8690504012344', '8690000000000': '8690000000005' };
const fixCodes = (l) => sanitizeCodes(l).map((c) => LEGACY[c] || c);
const fixProducts = (l) =>
  sanitizeProducts(Array.isArray(l) ? l.map((p) => (p && LEGACY[canonicalCode(p.barcode)] ? { ...p, barcode: LEGACY[canonicalCode(p.barcode)], demo: true } : p)) : []);

function useStored(key, fallback, clean) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : clean(JSON.parse(raw));
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* depolama kapalı */ }
  }, [key, value]);
  return [value, setValue];
}

const TITLES = {
  home: 'Ana ekran', search: 'Arama', favorites: 'Favoriler', tracking: 'Fiyat takibi', recent: 'Son tarananlar', detail: 'Ürün detayı',
};
const NAV = [
  { id: 'home', icon: 'home' },
  { id: 'favorites', icon: 'heart' },
  { id: 'tracking', icon: 'trend' },
  { id: 'recent', icon: 'clock' },
];
const THEMES = [
  { id: 'system', label: 'Sistem', icon: 'monitor' },
  { id: 'light', label: 'Açık', icon: 'sun' },
  { id: 'dark', label: 'Koyu', icon: 'moon' },
];

/* ================= Küçük bileşenler ================= */

function Sheet({ title, onClose, children, footer, tone = 'default', size = 'md' }) {
  const ref = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const prev = document.activeElement;
    const root = ref.current;
    const focusables = () =>
      [...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.offsetParent !== null);
    (root.querySelector('[data-autofocus]') || root).focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (prev && prev.focus) prev.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className={`scrim ${tone}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`sheet ${tone} size-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref} tabIndex={-1}>
        <div className="sheet-grab" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Kapat" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

function Segmented({ value, options, onChange, label }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.icon && <Icon name={o.icon} size={16} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, text, children }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={26} /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

function Note({ children, tone = 'info', icon = 'info' }) {
  return (
    <div className={`note ${tone}`}>
      <Icon name={icon} size={18} />
      <span>{children}</span>
    </div>
  );
}

function PageHead({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

function SearchField({ value, onChange, onSubmit }) {
  return (
    <form className="searchfield" role="search" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <Icon name="search" size={19} />
      <input
        type="search" enterKeyHint="search" autoComplete="off" autoCorrect="off" spellCheck="false"
        placeholder="Ürün adı, marka veya barkod" aria-label="Ürün ara"
        value={value} onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="clear-btn" aria-label="Aramayı temizle" onClick={() => onChange('')}><Icon name="close" size={14} strokeWidth={2.2} /></button>
      )}
    </form>
  );
}

function ProductCard({ p, fav, onOpen, onFav }) {
  const best = bestOffer(p);
  return (
    <article className="pcard">
      <button type="button" className="pcard-main" onClick={onOpen} aria-label={`${p.name} ürün detayını aç`}>
        <span className="art-tile"><ProductArt name={p.art} size={52} /></span>
        <span className="pcard-info">
          <strong>{p.name}</strong>
          <small>{[p.brand, p.size].filter(Boolean).join(' · ') || 'Marka ve paket bilgisi yok'}</small>
          {best ? (
            <span className="pcard-price has">{fmtMoney(best.price)}<em> en düşük</em></span>
          ) : (
            <span className="pcard-price">Fiyat verisi yok</span>
          )}
        </span>
      </button>
      <button type="button" className={fav ? 'pcard-fav on' : 'pcard-fav'} aria-pressed={fav} aria-label={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'} onClick={onFav}>
        <Icon name="heart" size={18} filled={fav} />
      </button>
    </article>
  );
}

function ProductGrid({ items, favorites, onOpen, onFav }) {
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.barcode} p={p} fav={favorites.includes(p.barcode)} onOpen={() => onOpen(p.barcode)} onFav={() => onFav(p.barcode)} />
      ))}
    </div>
  );
}

/* ================= Kamera ================= */

function CameraSheet({ onClose, onResult }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cb = useRef(onResult);
  cb.current = onResult;
  const lock = useRef(false);
  const lastHint = useRef(0);
  const [status, setStatus] = useState('starting');
  const [facing, setFacing] = useState('environment');
  const [torchOk, setTorchOk] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hint, setHint] = useState('');
  const [manual, setManual] = useState('');
  const [manualError, setManualError] = useState('');

  useEffect(() => {
    let cancelled = false, timer, stream;
    setTorchOk(false); setTorchOn(false); setHint('');
    (async () => {
      setStatus('starting');
      if (!navigator.mediaDevices?.getUserMedia) { setStatus('insecure'); return; }
      if (!('BarcodeDetector' in window)) { setStatus('unsupported'); return; }
      try {
        let detector;
        try { detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }); }
        catch { detector = new window.BarcodeDetector(); }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const v = videoRef.current;
        v.srcObject = stream;
        await v.play();
        const caps = stream.getVideoTracks()[0]?.getCapabilities?.() || {};
        setTorchOk(!!caps.torch);
        setStatus('scanning');
        const tick = async () => {
          if (cancelled) return;
          try {
            if (v.readyState >= 2 && !lock.current) {
              const found = await detector.detect(v);
              for (const f of found) {
                const code = canonicalCode(f.rawValue);
                if (validEAN(code) || validEAN(digitsOnly(f.rawValue))) {
                  lock.current = true;
                  navigator.vibrate?.(35);
                  cb.current(code);
                  return;
                }
              }
              if (found.length && Date.now() - lastHint.current > 2500) {
                lastHint.current = Date.now();
                setHint('Okunan kod EAN/UPC değil. Ürün üzerindeki barkoda yönel.');
              }
            }
          } catch { /* kare okunamadı */ }
          timer = setTimeout(tick, 200);
        };
        tick();
      } catch (e) {
        if (!cancelled) setStatus(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'denied' : 'error');
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      (stream || streamRef.current)?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((t) => !t);
    } catch {
      setHint('Bu cihaz flaşı kontrol etmeye izin vermiyor.');
      setTorchOk(false);
    }
  }

  function submitManual(e) {
    e.preventDefault();
    const err = explainBarcode(manual);
    setManualError(err);
    if (!err) cb.current(canonicalCode(manual));
  }

  const messages = {
    starting: ['Kamera açılıyor…', 'Tarayıcı kamera izni isteyebilir.'],
    insecure: ['Kamera kullanılamıyor', 'Kamera yalnızca HTTPS bağlantısında çalışır. Barkodu aşağıdan elle girebilirsin.'],
    unsupported: ['Bu tarayıcı barkod okumayı desteklemiyor', 'Chrome veya Edge ile dene ya da barkodu aşağıdan elle gir.'],
    denied: ['Kamera izni verilmedi', 'Tarayıcı ayarlarından bu site için kamerayı etkinleştir veya barkodu elle gir.'],
    error: ['Kamera açılamadı', 'Başka bir uygulama kamerayı kullanıyor olabilir. Barkodu elle girebilirsin.'],
  };
  const showMsg = status !== 'scanning';

  return (
    <Sheet title="Barkod okut" onClose={onClose} tone="camera">
      <div className={showMsg ? 'viewfinder idle' : 'viewfinder'}>
        <video ref={videoRef} muted playsInline autoPlay className={status === 'scanning' ? 'live' : ''} />
        <div className="vf-frame" aria-hidden="true">
          <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
          {status === 'scanning' && <span className="vf-beam" />}
        </div>
        {showMsg && (
          <div className="vf-msg" role="status">
            <Icon name={status === 'starting' ? 'camera' : 'alert'} size={26} />
            <strong>{messages[status][0]}</strong>
            <span>{messages[status][1]}</span>
          </div>
        )}
        {status === 'scanning' && <div className="vf-hint" role="status">{hint || 'Barkodu çerçevenin içine hizala'}</div>}
        {status === 'scanning' && (
          <div className="vf-tools">
            {torchOk && (
              <button type="button" className={torchOn ? 'round on' : 'round'} aria-pressed={torchOn} aria-label={torchOn ? 'Flaşı kapat' : 'Flaşı aç'} onClick={toggleTorch}>
                <Icon name="bolt" size={20} filled={torchOn} />
              </button>
            )}
            <button type="button" className="round" aria-label="Kamerayı değiştir" onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}>
              <Icon name="flip" size={20} />
            </button>
          </div>
        )}
      </div>
      <form className="manual" onSubmit={submitManual} noValidate>
        <label htmlFor="manual-code">Barkodu elle gir</label>
        <div className="inline-field">
          <input
            id="manual-code" className="input mono" inputMode="numeric" autoComplete="off" placeholder="EAN / UPC numarası"
            data-autofocus={showMsg ? '' : undefined}
            value={manual} onChange={(e) => { setManual(e.target.value); setManualError(''); }} aria-invalid={!!manualError} aria-describedby="manual-err"
          />
          <button type="submit" className="btn primary">Ara</button>
        </div>
        <p id="manual-err" className={manualError ? 'field-error' : 'field-help'} role={manualError ? 'alert' : undefined}>
          {manualError || 'Barkod 8, 12, 13 veya 14 haneli olmalı. Kamera görüntüsü kaydedilmez.'}
        </p>
      </form>
    </Sheet>
  );
}

/* ================= Formlar ================= */

function EditSheet({ product, create, onClose, onSave, onDelete }) {
  const [name, setName] = useState(product.name || '');
  const [brand, setBrand] = useState(product.brand || '');
  const [category, setCategory] = useState(product.category || '');
  const [size, setSize] = useState(product.size || '');
  const [art, setArt] = useState(product.art || resolveArt(product));
  const [artTouched, setArtTouched] = useState(!!product.art && !create);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  const parsed = parseSize(size);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Ürün adı boş bırakılamaz.'); return; }
    onSave({ ...product, name: name.trim(), brand: brand.trim(), category: category.trim(), size: size.trim(), art });
  }

  return (
    <Sheet title={create ? 'Ürün kaydı oluştur' : 'Ürünü düzenle'} onClose={onClose}
      footer={
        <>
          {!create && (
            confirm ? (
              <button type="button" className="btn danger solid" onClick={onDelete}><Icon name="trash" size={18} />Silmeyi onayla</button>
            ) : (
              <button type="button" className="btn danger" onClick={() => setConfirm(true)}><Icon name="trash" size={18} />Ürünü sil</button>
            )
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>Vazgeç</button>
          <button type="submit" form="edit-form" className="btn primary">{create ? 'Kaydı oluştur' : 'Kaydet'}</button>
        </>
      }
    >
      <form id="edit-form" onSubmit={submit} noValidate>
        <div className="code-chip"><Icon name="barcode" size={18} /><span className="mono">{product.barcode}</span></div>
        <div className="field">
          <label htmlFor="f-name">Ürün adı</label>
          <input id="f-name" className="input" data-autofocus value={name} maxLength={120} autoComplete="off"
            onChange={(e) => { setName(e.target.value); setError(''); }} aria-invalid={!!error} />
          {error && <p className="field-error" role="alert">{error}</p>}
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-brand">Marka</label>
            <input id="f-brand" className="input" value={brand} maxLength={60} autoComplete="off" onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-size">Paket miktarı</label>
            <input id="f-size" className="input" value={size} maxLength={40} placeholder="1 L, 250 g, 6 adet" autoComplete="off" onChange={(e) => setSize(e.target.value)} />
          </div>
        </div>
        <p className="field-help flush">
          {parsed ? 'Birim fiyat ' + (parsed.unit === 'adet' ? 'adet' : parsed.unit) + ' başına hesaplanır.' : 'Miktar kg, g, L, ml veya adet ile yazılırsa birim fiyat hesaplanır.'}
        </p>
        <div className="field">
          <label htmlFor="f-cat">Kategori</label>
          <input id="f-cat" className="input" list="cat-list" value={category} maxLength={60} autoComplete="off"
            onChange={(e) => { setCategory(e.target.value); if (!artTouched) setArt(resolveArt({ category: e.target.value })); }} />
          <datalist id="cat-list">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <fieldset className="field art-field">
          <legend>Görsel</legend>
          <div className="art-picker" role="radiogroup" aria-label="Ürün görseli">
            {ART_KEYS.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={art === k} aria-label={ART_LABELS[k]} title={ART_LABELS[k]}
                className={art === k ? 'on' : ''} onClick={() => { setArt(k); setArtTouched(true); }}>
                <ProductArt name={k} size={40} />
              </button>
            ))}
          </div>
        </fieldset>
      </form>
    </Sheet>
  );
}

function OfferSheet({ product, stores, onClose, onSave }) {
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(todayISO());
  const [errors, setErrors] = useState({});

  const amount = parseMoney(price);
  const up = amount > 0 ? unitPrice(amount, product.size) : null;

  function submit(e) {
    e.preventDefault();
    const er = {};
    if (!store.trim()) er.store = 'Mağaza adını yaz.';
    if (!(amount > 0)) er.price = 'Geçerli bir fiyat gir. Örnek: 42,90';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) er.date = 'Tarihi seç.';
    else if (date > todayISO()) er.date = 'Tarih ileri bir gün olamaz.';
    setErrors(er);
    if (Object.keys(er).length) return;
    onSave({ id: uid(), store: store.trim(), price: amount, updated: date });
  }

  return (
    <Sheet title="Fiyat ekle" onClose={onClose}
      footer={<><span className="spacer" /><button type="button" className="btn" onClick={onClose}>Vazgeç</button><button type="submit" form="offer-form" className="btn primary">Fiyatı kaydet</button></>}
    >
      <form id="offer-form" onSubmit={submit} noValidate>
        <div className="mini-product">
          <span className="art-tile sm"><ProductArt name={product.art} size={34} /></span>
          <span><strong>{product.name}</strong><small>{[product.brand, product.size].filter(Boolean).join(' · ')}</small></span>
        </div>
        <div className="field">
          <label htmlFor="o-store">Mağaza</label>
          <input id="o-store" className="input" data-autofocus list="store-list" value={store} maxLength={60} autoComplete="off" placeholder="Mağaza adı"
            onChange={(e) => { setStore(e.target.value); setErrors((x) => ({ ...x, store: '' })); }} aria-invalid={!!errors.store} />
          <datalist id="store-list">{stores.map((s) => <option key={s} value={s} />)}</datalist>
          {errors.store && <p className="field-error" role="alert">{errors.store}</p>}
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="o-price">Fiyat (₺)</label>
            <input id="o-price" className="input" inputMode="decimal" value={price} autoComplete="off" placeholder="0,00"
              onChange={(e) => { setPrice(e.target.value); setErrors((x) => ({ ...x, price: '' })); }} aria-invalid={!!errors.price} />
            {errors.price && <p className="field-error" role="alert">{errors.price}</p>}
          </div>
          <div className="field">
            <label htmlFor="o-date">Görülme tarihi</label>
            <input id="o-date" className="input" type="date" value={date} max={todayISO()} onChange={(e) => { setDate(e.target.value); setErrors((x) => ({ ...x, date: '' })); }} aria-invalid={!!errors.date} />
            {errors.date && <p className="field-error" role="alert">{errors.date}</p>}
          </div>
        </div>
        <p className="field-help flush">
          {up ? `Birim fiyat: ${fmtMoney(up.value)} / ${up.unit}` : 'Birim fiyat için ürüne geçerli bir paket miktarı ekle.'}
        </p>
      </form>
    </Sheet>
  );
}

function SettingsSheet({ onClose, theme, setTheme, counts, onExport, onImport, onReset }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <Sheet title="Ayarlar" onClose={onClose}>
      <section className="set-group">
        <h3>Görünüm</h3>
        <Segmented label="Tema" value={theme} options={THEMES} onChange={setTheme} />
      </section>
      <section className="set-group">
        <h3>Veri</h3>
        <div className="list-group">
          <button type="button" className="list-row" onClick={onExport}>
            <span className="lr-icon"><Icon name="download" size={19} /></span>
            <span className="lr-text"><strong>Dışa aktar</strong><small>{counts.products} ürün, {counts.favorites} favori, {counts.tracked} takip — JSON dosyası</small></span>
            <Icon name="chevron-right" size={18} className="lr-chev" />
          </button>
          <label className="list-row" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.querySelector('input').click(); } }}>
            <span className="lr-icon"><Icon name="upload" size={19} /></span>
            <span className="lr-text"><strong>İçe aktar</strong><small>JSON dosyasındaki ürünler mevcut kayıtlarla birleştirilir</small></span>
            <Icon name="chevron-right" size={18} className="lr-chev" />
            <input hidden type="file" accept="application/json,.json" onChange={onImport} />
          </label>
          {confirm ? (
            <div className="list-row confirm-row">
              <span className="lr-text"><strong>Tüm veriler silinsin mi?</strong><small>Ürünler, favoriler, takip listesi ve geçmiş bu cihazdan silinir.</small></span>
              <span className="confirm-actions">
                <button type="button" className="btn sm" onClick={() => setConfirm(false)}>Vazgeç</button>
                <button type="button" className="btn sm danger solid" onClick={onReset}>Sil</button>
              </span>
            </div>
          ) : (
            <button type="button" className="list-row danger" onClick={() => setConfirm(true)}>
              <span className="lr-icon"><Icon name="trash" size={19} /></span>
              <span className="lr-text"><strong>Verileri sıfırla</strong><small>Örnek kayıtlara geri döner</small></span>
            </button>
          )}
        </div>
      </section>
      <section className="set-group">
        <h3>Gizlilik</h3>
        <Note icon="shield" tone="plain">Tüm veriler yalnızca bu cihazda saklanır. Kamera görüntüsü kaydedilmez ve hiçbir yere gönderilmez.</Note>
      </section>
      <p className="version">Mikro Barkod 1.0</p>
    </Sheet>
  );
}

/* ================= Uygulama ================= */

function App() {
  const [products, setProducts] = useStored('mb_products', DEMO, (l) => { const c = fixProducts(l); return c.length || (Array.isArray(l) && l.length === 0) ? c : DEMO; });
  const [favorites, setFavorites] = useStored('mb_favs', [], fixCodes);
  const [tracked, setTracked] = useStored('mb_track', [], fixCodes);
  const [recent, setRecent] = useStored('mb_recent', [], fixCodes);
  const [theme, setTheme] = useStored('mb_theme', 'system', (v) => (['system', 'light', 'dark'].includes(v) ? v : 'system'));

  const [tab, setTab] = useState('home');
  const [prev, setPrev] = useState('home');
  const [selectedCode, setSelectedCode] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('price');
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);

  const selected = useMemo(() => products.find((p) => p.barcode === selectedCode) || null, [products, selectedCode]);

  /* --- Tema --- */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0a0b' : '#f5f5f7');
    };
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, [theme]);

  /* --- Bildirim --- */
  const notify = useCallback((msg, tone = 'ok') => setToast({ id: uid(), msg, tone }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* --- Geri tuşu: ürün detayı ve pencereler tarayıcı geçmişine bağlanır --- */
  const layers = useRef(0);
  const live = useRef({});
  live.current = { sheet, tab, prev };
  const pushLayer = () => { try { history.pushState({ mb: 1 }, ''); layers.current += 1; } catch { /* yoksay */ } };
  useEffect(() => {
    const onPop = () => {
      if (layers.current <= 0) return;
      layers.current -= 1;
      const s = live.current;
      if (s.sheet) setSheet(null);
      else if (s.tab === 'detail') setTab(s.prev);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const openSheet = (s) => { setToast(null); setSheet(s); pushLayer(); };
  const closeSheet = () => { if (layers.current > 0) history.back(); else setSheet(null); };
  const dismissSheet = () => setSheet(null);

  /* --- Gezinme --- */
  const go = (t) => { setTab(t); setSheet(null); window.scrollTo({ top: 0 }); };
  const openProduct = (code) => {
    setPrev(tab === 'detail' ? live.current.prev : tab === 'search' ? 'search' : tab);
    setSelectedCode(code);
    setRecent((r) => [code, ...r.filter((x) => x !== code)].slice(0, 12));
    setTab('detail');
    pushLayer();
    window.scrollTo({ top: 0 });
  };
  const goBack = () => { if (layers.current > 0) history.back(); else setTab(prev); };

  function lookup(raw) {
    const code = canonicalCode(raw);
    if (products.some((p) => p.barcode === code)) { openProduct(code); return; }
    setQuery(code);
    setTab('search');
    window.scrollTo({ top: 0 });
  }

  /* --- Veri işlemleri --- */
  const flip = (setter, code, onMsg, offMsg) =>
    setter((l) => {
      const has = l.includes(code);
      notify(has ? offMsg : onMsg);
      return has ? l.filter((c) => c !== code) : [code, ...l];
    });
  const toggleFav = (code) => flip(setFavorites, code, 'Favorilere eklendi', 'Favorilerden çıkarıldı');
  const toggleTrack = (code) => flip(setTracked, code, 'Fiyat takibine eklendi', 'Fiyat takibinden çıkarıldı');

  function saveProduct(p, create) {
    const clean = sanitizeProduct({ ...p, demo: false });
    if (create) {
      setProducts((l) => [clean, ...l]);
      dismissSheet();
      openProduct(clean.barcode);
      notify('Ürün kaydı oluşturuldu');
    } else {
      setProducts((l) => l.map((x) => (x.barcode === clean.barcode ? { ...clean, offers: x.offers, demo: false } : x)));
      closeSheet();
      notify('Değişiklikler kaydedildi');
    }
  }

  function deleteProduct(code) {
    setProducts((l) => l.filter((p) => p.barcode !== code));
    setFavorites((l) => l.filter((c) => c !== code));
    setTracked((l) => l.filter((c) => c !== code));
    setRecent((l) => l.filter((c) => c !== code));
    dismissSheet();
    setTab(prev === 'detail' ? 'home' : prev);
    setSelectedCode(null);
    notify('Ürün silindi');
  }

  function addOffer(code, offer) {
    setProducts((l) => l.map((p) => (p.barcode === code ? { ...p, offers: [offer, ...p.offers] } : p)));
    closeSheet();
    notify('Fiyat eklendi');
  }
  const removeOffer = (code, id) => {
    setProducts((l) => l.map((p) => (p.barcode === code ? { ...p, offers: p.offers.filter((o) => o.id !== id) } : p)));
    notify('Fiyat silindi');
  };

  function exportData() {
    const payload = { app: 'mikro-barkod', version: 1, exportedAt: new Date().toISOString(), products, favorites, tracked, recent };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mikro-barkod-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    notify('Veriler dışa aktarıldı');
  }

  function importData(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => notify('Dosya okunamadı.', 'error');
    reader.onload = () => {
      try {
        const d = JSON.parse(String(reader.result));
        const incoming = fixProducts(d.products);
        if (!incoming.length && !Array.isArray(d.favorites)) throw new Error('empty');
        setProducts((cur) => {
          const map = new Map(cur.map((p) => [p.barcode, p]));
          incoming.forEach((p) => map.set(p.barcode, p));
          return [...map.values()];
        });
        const merge = (setter, list) => Array.isArray(list) && setter((cur) => sanitizeCodes([...fixCodes(list), ...cur]));
        merge(setFavorites, d.favorites);
        merge(setTracked, d.tracked);
        merge(setRecent, d.recent);
        dismissSheet();
        notify(`${incoming.length} ürün içe aktarıldı`);
      } catch {
        notify('Geçerli bir Mikro Barkod JSON dosyası seç.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    setProducts(DEMO); setFavorites([]); setTracked([]); setRecent([]);
    dismissSheet();
    go('home');
    notify('Veriler sıfırlandı');
  }

  /* --- Türetilen listeler --- */
  const byCode = (codes) => codes.map((c) => products.find((p) => p.barcode === c)).filter(Boolean);
  const results = useMemo(() => {
    const q = trLower(query.trim());
    if (!q) return products;
    return products.filter((p) => trLower([p.name, p.brand, p.barcode, p.category].join(' ')).includes(q));
  }, [products, query]);
  const stores = useMemo(() => [...new Set(products.flatMap((p) => p.offers.map((o) => o.store)))].sort((a, b) => a.localeCompare(b, 'tr')), [products]);
  const recentItems = byCode(recent);

  const offers = useMemo(() => {
    const list = (selected?.offers || []).slice();
    if (sort === 'store') return list.sort((a, b) => a.store.localeCompare(b.store, 'tr'));
    if (sort === 'fresh') return list.sort((a, b) => b.updated.localeCompare(a.updated));
    return list.sort((a, b) => a.price - b.price);
  }, [selected, sort]);

  const activeNav = tab === 'search' ? 'home' : tab === 'detail' ? prev === 'search' ? 'home' : prev : tab;
  const openCamera = () => openSheet({ type: 'camera' });
  const queryDigits = query.replace(/\s+/g, '');
  const looksLikeCode = /^\d{6,}$/.test(queryDigits);

  function submitSearch() {
    if (looksLikeCode && !explainBarcode(queryDigits)) lookup(queryDigits);
  }

  /* ================= Görünümler ================= */

  const homeView = (
    <>
      <section className="scan-card">
        <div className="scan-card-text">
          <h1>En iyi fiyatı bulmaya başla</h1>
          <p>Barkodu okut veya ürün adıyla ara.</p>
          <div className="scan-card-actions">
            <button type="button" className="btn primary lg" onClick={openCamera}><Icon name="camera" size={20} />Barkod okut</button>
            <button type="button" className="btn lg" onClick={openCamera}><Icon name="keyboard" size={20} />Elle gir</button>
          </div>
        </div>
        <ScanArt />
      </section>
      {recentItems.length > 0 && (
        <>
          <div className="section-head"><h2>Son tarananlar</h2><button type="button" className="link-btn" onClick={() => go('recent')}>Tümünü gör</button></div>
          <ProductGrid items={recentItems.slice(0, 3)} favorites={favorites} onOpen={openProduct} onFav={toggleFav} />
        </>
      )}
      <div className="section-head"><h2>Ürün kataloğu</h2><span>{products.length} kayıt</span></div>
      {products.length ? (
        <ProductGrid items={products} favorites={favorites} onOpen={openProduct} onFav={toggleFav} />
      ) : (
        <EmptyState icon="box" title="Katalog boş" text="Bir barkod okutarak ilk ürün kaydını oluştur.">
          <button type="button" className="btn primary" onClick={openCamera}><Icon name="camera" size={18} />Barkod okut</button>
        </EmptyState>
      )}
      <Note>Canlı mağaza verisi yoktur. Fiyatlar, senin eklediğin kayıtlardır ve yalnızca bu cihazda saklanır.</Note>
    </>
  );

  const searchView = (
    <>
      <div className="section-head tight"><h2>{query.trim() ? 'Arama sonuçları' : 'Tüm ürünler'}</h2><span>{results.length} sonuç</span></div>
      {results.length > 0 && <ProductGrid items={results} favorites={favorites} onOpen={openProduct} onFav={toggleFav} />}
      {results.length === 0 && looksLikeCode && !explainBarcode(queryDigits) && (
        <EmptyState icon="barcode" title="Bu barkod katalogda yok" text="Ürün bilgilerini girerek yeni bir kayıt oluşturabilirsin.">
          <div className="code-chip center"><Icon name="barcode" size={18} /><span className="mono">{canonicalCode(queryDigits)}</span></div>
          <button type="button" className="btn primary" onClick={() => openSheet({ type: 'edit', create: true, product: { barcode: canonicalCode(queryDigits) } })}>
            <Icon name="plus" size={18} />Ürün kaydı oluştur
          </button>
        </EmptyState>
      )}
      {results.length === 0 && looksLikeCode && explainBarcode(queryDigits) && (
        <EmptyState icon="alert" title="Barkod doğrulanamadı" text={explainBarcode(queryDigits)} />
      )}
      {results.length === 0 && !looksLikeCode && (
        <EmptyState icon="search" title="Eşleşen ürün yok" text="Yazımı kontrol et veya barkodunu okutarak ürünü bul." >
          <button type="button" className="btn primary" onClick={openCamera}><Icon name="camera" size={18} />Barkod okut</button>
        </EmptyState>
      )}
    </>
  );

  const listView = (id) => {
    const cfg = {
      favorites: { items: byCode(favorites), icon: 'heart', text: 'Ürün detayından veya kartlardaki kalp simgesinden favori ekleyebilirsin.', title: 'Favori ürün yok' },
      tracking: { items: byCode(tracked), icon: 'trend', text: 'Ürün detayında “Fiyat takibi” düğmesiyle izlemek istediğin ürünleri ekle.', title: 'Takip listesi boş' },
      recent: { items: recentItems, icon: 'clock', text: 'Okuttuğun veya açtığın ürünler burada listelenir.', title: 'Henüz ürün açılmadı' },
    }[id];
    return (
      <>
        <PageHead title={TITLES[id]} subtitle={cfg.items.length ? `${cfg.items.length} ürün` : undefined}>
          {id === 'recent' && cfg.items.length > 0 && (
            <button type="button" className="btn sm" onClick={() => { setRecent([]); notify('Geçmiş temizlendi'); }}>Geçmişi temizle</button>
          )}
        </PageHead>
        {cfg.items.length ? (
          <ProductGrid items={cfg.items} favorites={favorites} onOpen={openProduct} onFav={toggleFav} />
        ) : (
          <EmptyState icon={cfg.icon} title={cfg.title} text={cfg.text} />
        )}
      </>
    );
  };

  const detailView = selected && (() => {
    const p = selected;
    const fav = favorites.includes(p.barcode);
    const track = tracked.includes(p.barcode);
    const best = bestOffer(p);
    const validCode = validEAN(p.barcode);
    return (
      <>
        <button type="button" className="back-btn" onClick={goBack}><Icon name="chevron-left" size={20} strokeWidth={2.2} />{TITLES[prev] || 'Geri'}</button>
        <div className="detail">
          <div className="detail-side">
            <div className="hero-art"><ProductArt name={p.art} size={150} /></div>
            <div className="barcode-card">
              <BarcodeSvg code={p.barcode} />
              {![8, 13].includes(p.barcode.length) && <div className="barcode-plain mono">{p.barcode}</div>}
              {!validCode && <p className="field-error flush"><Icon name="alert" size={14} /> Kontrol basamağı geçersiz</p>}
            </div>
          </div>
          <div className="detail-main">
            <div className="detail-title">
              <div>
                {(p.category || p.demo) && (
                  <div className="chips">
                    {p.category && <span className="chip">{p.category}</span>}
                    {p.demo && <span className="chip muted">Örnek kayıt</span>}
                  </div>
                )}
                <h1>{p.name}</h1>
                <p className="sub">{p.brand || 'Marka belirtilmedi'}{p.size ? ` · ${p.size}` : ' · Paket bilgisi yok'}</p>
              </div>
              <button type="button" className="icon-btn bordered" aria-label="Ürünü düzenle" onClick={() => openSheet({ type: 'edit', product: p })}><Icon name="edit" /></button>
            </div>
            <div className="actions">
              <button type="button" className={fav ? 'btn on' : 'btn'} aria-pressed={fav} onClick={() => toggleFav(p.barcode)}><Icon name="heart" size={18} filled={fav} />{fav ? 'Favoride' : 'Favori'}</button>
              <button type="button" className={track ? 'btn on' : 'btn'} aria-pressed={track} onClick={() => toggleTrack(p.barcode)}><Icon name="trend" size={18} />{track ? 'Takipte' : 'Fiyat takibi'}</button>
            </div>

            <div className="section-head"><h2>Fiyat teklifleri</h2>
              <button type="button" className="btn sm primary" onClick={() => openSheet({ type: 'offer', code: p.barcode })}><Icon name="plus" size={16} strokeWidth={2.2} />Fiyat ekle</button>
            </div>
            {offers.length > 0 ? (
              <>
                <div className="sortrow">
                  <span>{offers.length} teklif</span>
                  <label className="select-wrap"><Icon name="sort" size={16} /><span className="sr">Sırala</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sırala">
                      <option value="price">Fiyat</option><option value="store">Mağaza</option><option value="fresh">Güncellik</option>
                    </select>
                  </label>
                </div>
                <ul className="offers">
                  {offers.map((o) => {
                    const up = unitPrice(o.price, p.size);
                    return (
                      <li key={o.id} className={best && o.id === best.id ? 'offer best' : 'offer'}>
                        <span className="offer-icon"><Icon name="store" size={20} /></span>
                        <span className="offer-text">
                          <strong>{o.store}</strong>
                          <small>{fmtDate(o.updated)}{up ? ` · ${fmtMoney(up.value)} / ${up.unit}` : ''}</small>
                        </span>
                        <span className="offer-price">
                          {best && o.id === best.id && offers.length > 1 && <em className="chip good">En düşük</em>}
                          <b>{fmtMoney(o.price)}</b>
                        </span>
                        <button type="button" className="icon-btn sm" aria-label={`${o.store} fiyatını sil`} onClick={() => removeOffer(p.barcode, o.id)}><Icon name="trash" size={17} /></button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <EmptyState icon="tag" title="Fiyat bulunamadı" text="Uygulama mağaza fiyatlarını kendiliğinden getirmez. Gördüğün fiyatı ekleyerek mağazaları karşılaştırabilirsin.">
                <button type="button" className="btn primary" onClick={() => openSheet({ type: 'offer', code: p.barcode })}><Icon name="plus" size={18} />Fiyat ekle</button>
              </EmptyState>
            )}
            <Note>Birim fiyat, paket miktarı ve girilen fiyata göre hesaplanır. Fiyat geçmişi grafiği bu sürümde yoktur.</Note>
          </div>
        </div>
      </>
    );
  })();

  let view;
  if (tab === 'home' || tab === 'search') view = null;
  const showSearch = tab === 'home' || tab === 'search';

  /* ================= Çerçeve ================= */

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><Logo size={40} /><div><strong>Mikro Barkod</strong><small>Akıllı fiyat keşfi</small></div></div>
        <button type="button" className="btn primary lg block" onClick={openCamera}><Icon name="camera" size={20} />Barkod okut</button>
        <nav aria-label="Ana gezinme">
          {NAV.map((n) => (
            <button key={n.id} type="button" className={activeNav === n.id ? 'nav-item active' : 'nav-item'} aria-current={activeNav === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
              <Icon name={n.icon} size={20} />
              <span>{TITLES[n.id]}</span>
              {n.id === 'favorites' && favorites.length > 0 && <em>{favorites.length}</em>}
              {n.id === 'tracking' && tracked.length > 0 && <em>{tracked.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button type="button" className="nav-item" onClick={() => openSheet({ type: 'settings' })}><Icon name="sliders" size={20} /><span>Ayarlar</span></button>
          <p><Icon name="shield" size={16} />Fiyat verileri yalnızca senin eklediğin kayıtlardan gösterilir.</p>
        </div>
      </aside>

      <div className="column">
        <header className="topbar">
          <div className="brand"><Logo size={34} /><strong>Mikro Barkod</strong></div>
          <button type="button" className="icon-btn" aria-label="Ayarlar" onClick={() => openSheet({ type: 'settings' })}><Icon name="sliders" /></button>
        </header>

        <main className="content" id="main">
          {showSearch && (
            <div className="search-bar">
              <SearchField value={query} onChange={(v) => { setQuery(v); if (v && tab !== 'search') setTab('search'); if (!v && tab === 'search') setTab('home'); }} onSubmit={submitSearch} />
            </div>
          )}
          {tab === 'home' && homeView}
          {tab === 'search' && searchView}
          {['favorites', 'tracking', 'recent'].includes(tab) && listView(tab)}
          {tab === 'detail' && (detailView || (
            <EmptyState icon="box" title="Ürün bulunamadı" text="Bu ürün silinmiş olabilir.">
              <button type="button" className="btn primary" onClick={() => go('home')}>Ana ekrana dön</button>
            </EmptyState>
          ))}
        </main>

        <footer className="footer"><span>© Mikro Barkod</span><span>Veri doğruluğu önceliklidir</span></footer>
      </div>

      <nav className="tabbar" aria-label="Alt gezinme">
        {NAV.slice(0, 2).map((n) => (
          <button key={n.id} type="button" className={activeNav === n.id ? 'tab active' : 'tab'} aria-current={activeNav === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
            <Icon name={n.icon} size={24} filled={false} /><span>{TITLES[n.id]}</span>
          </button>
        ))}
        <button type="button" className="tab scan" onClick={openCamera} aria-label="Barkod okut"><span className="scan-fab"><Icon name="scan" size={26} strokeWidth={2} /></span></button>
        {NAV.slice(2).map((n) => (
          <button key={n.id} type="button" className={activeNav === n.id ? 'tab active' : 'tab'} aria-current={activeNav === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
            <Icon name={n.icon} size={24} /><span>{TITLES[n.id]}</span>
          </button>
        ))}
      </nav>

      {sheet?.type === 'camera' && (
        <CameraSheet onClose={closeSheet} onResult={(code) => { dismissSheet(); lookup(code); }} />
      )}
      {sheet?.type === 'edit' && (
        <EditSheet key={sheet.product.barcode} product={sheet.product} create={!!sheet.create} onClose={closeSheet}
          onSave={(p) => saveProduct(p, !!sheet.create)} onDelete={() => deleteProduct(sheet.product.barcode)} />
      )}
      {sheet?.type === 'offer' && selected && (
        <OfferSheet product={selected} stores={stores} onClose={closeSheet} onSave={(o) => addOffer(sheet.code, o)} />
      )}
      {sheet?.type === 'settings' && (
        <SettingsSheet onClose={closeSheet} theme={theme} setTheme={setTheme}
          counts={{ products: products.length, favorites: favorites.length, tracked: tracked.length }}
          onExport={exportData} onImport={importData} onReset={resetAll} />
      )}

      <div className="toast-region" aria-live="polite" role="status">
        {toast && <div key={toast.id} className={`toast ${toast.tone}`}><Icon name={toast.tone === 'error' ? 'alert' : 'check'} size={18} strokeWidth={2.2} />{toast.msg}</div>}
      </div>
    </div>
  );
}

registerSW();
createRoot(document.getElementById('root')).render(<App />);
