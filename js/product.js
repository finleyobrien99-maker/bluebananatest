/* Blue Banana product page
   Gallery (thumbnails, arrows, swipe, dots) and the full-screen image viewer, colour swatches, size selects with stock badge,
   quantity, Klarna message, Add to Cart (into the shared cart from main.js) with the "Added to Cart" panel,
   the mobile sticky bar and size sheet, pop-ups, offers, and the next-day countdown with Shipping Options.
   Everything marked DEMO is sample data; the rest is ready to be fed by the platform. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Hand-off: these come from the product feed and the store's settings. */
  const PRODUCT = {
    id: 'plasma-gold-hinged-segment-ring',
    baseName: 'Blue Banana Plasma Gold 1.2mm Hinged Segment Ring',
    price: 5.99,
    was: 8.99,
    url: 'https://www.bluebanana.com/en_GB/section/body-jewellery',
  };
  const KLARNA_MIN = 30;          // £: Klarna's minimum basket for Pay in 3 (confirm with Klarna)
  const MAX_QTY = 10;
  const LOW_STOCK = 3;            // show "Only X Left In Stock" at or below this
  const DISPATCH_CUTOFF_HOUR = 14; // matches the cart page

  const announcer = $('[data-pdp-announce]');
  function announce(message) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 50);
  }

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value == null) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else node.setAttribute(key, value === true ? '' : value);
    });
    node.append(...children.filter((child) => child != null));
    return node;
  }
  const icon = (id) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  };
  function priceEl(product, className) {
    if (!product.was) return el('p', { class: className }, el('span', { class: 'price', text: gbp.format(product.price) }));
    return el('p', { class: className },
      el('span', { class: 'price price--sale' }, el('span', { class: 'sr-only', text: 'Now ' }), gbp.format(product.price)),
      ' ',
      el('s', { class: 'price price--was' }, el('span', { class: 'sr-only', text: 'was ' }), gbp.format(product.was)));
  }

  /* ---------- Gallery ---------- */
  const gallery = $('[data-gallery]');
  const track = $('[data-gallery-track]', gallery);
  const slides = $$('[data-gallery-slide]', gallery);
  const thumbs = $$('[data-gallery-thumb]', gallery);
  const dots = $$('[data-gallery-dots] li', gallery);
  const prevBtn = $('[data-gallery-prev]', gallery);
  const nextBtn = $('[data-gallery-next]', gallery);
  let current = 0;

  gallery.classList.toggle('is-single', slides.length < 2);

  function goTo(index, smooth = true) {
    const i = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: i * track.clientWidth, behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto' });
  }

  function syncGallery() {
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (i === current && thumbs[i] && thumbs[i].classList.contains('is-active')) return;
    current = i;
    thumbs.forEach((thumb, n) => {
      thumb.classList.toggle('is-active', n === i);
      if (n === i) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    dots.forEach((dot, n) => dot.classList.toggle('is-active', n === i));
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === slides.length - 1;
  }

  thumbs.forEach((thumb) => thumb.addEventListener('click', () => goTo(Number(thumb.dataset.galleryThumb))));
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  track.addEventListener('scroll', syncGallery, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => goTo(current, false)).observe(track);
  prevBtn.disabled = true;
  nextBtn.disabled = slides.length < 2;

  /* ---------- Full-screen image viewer ----------
     Click a gallery image to open it. Zoom: double-click / double-tap, scroll wheel, pinch, + and - (buttons or keys).
     Drag to move around a zoomed image. Arrows, arrow keys or a swipe (when not zoomed) change image. */
  const viewer = $('#image-viewer');
  const stage = $('[data-viewer-stage]', viewer);
  const viewerImg = $('[data-viewer-img]', viewer);
  const viewerCount = $('[data-viewer-count]', viewer);
  const viewerPrev = $('[data-viewer-prev]', viewer);
  const viewerNext = $('[data-viewer-next]', viewer);
  const zoomBtns = $$('[data-viewer-zoom]', viewer);
  const images = slides.map((slide) => {
    const link = $('[data-viewer-open]', slide);
    return { src: link.dataset.full || link.getAttribute('href'), alt: $('img', slide).alt };
  });
  const MAX_ZOOM = 4;
  const STEP = 1.6;            // + / - zoom factor per step
  let vIndex = 0;
  let zoom = 1;
  let tx = 0;
  let ty = 0;

  viewer.classList.toggle('is-single', images.length < 2);
  if (window.matchMedia('(pointer: coarse)').matches) $('[data-viewer-hint]', viewer).textContent = 'Double-tap or pinch to zoom';

  // The image is drawn at translate(tx, ty) scale(zoom) from its top-left corner; keep it covering the box.
  function applyZoom(live = false) {
    const box = stage.clientWidth;
    tx = Math.min(0, Math.max(box - box * zoom, tx));
    ty = Math.min(0, Math.max(box - box * zoom, ty));
    stage.classList.toggle('is-live', live);
    stage.classList.toggle('is-zoomed', zoom > 1.001);
    viewerImg.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
    zoomBtns[0].disabled = zoom <= 1.001;
    zoomBtns[1].disabled = zoom >= MAX_ZOOM - 0.001;
  }
  // Zoom to `next`, keeping the point (x, y) inside the box where it is
  function zoomAt(next, x, y, live = false) {
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    tx = x - ((x - tx) / zoom) * z;
    ty = y - ((y - ty) / zoom) * z;
    zoom = z;
    applyZoom(live);
  }
  const centre = () => stage.clientWidth / 2;
  function resetZoom() { zoom = 1; tx = 0; ty = 0; applyZoom(); }

  function showImage(i) {
    vIndex = Math.max(0, Math.min(images.length - 1, i));
    viewerImg.src = images[vIndex].src;
    viewerImg.alt = images[vIndex].alt;
    viewerCount.textContent = `${vIndex + 1} / ${images.length}`;
    viewerPrev.disabled = vIndex === 0;
    viewerNext.disabled = vIndex === images.length - 1;
    resetZoom();
    // Keep the gallery behind in step, and hand focus back to this image's link on close
    if (viewer.open) {
      goTo(vIndex, false);
      opener.set(viewer, $('[data-viewer-open]', slides[vIndex]));
    }
  }

  $$('[data-viewer-open]', gallery).forEach((link) => link.addEventListener('click', (e) => {
    e.preventDefault();
    showImage(Number(link.dataset.viewerOpen));
    openDialog('image-viewer', link);
  }));
  viewerPrev.addEventListener('click', () => showImage(vIndex - 1));
  viewerNext.addEventListener('click', () => showImage(vIndex + 1));
  zoomBtns.forEach((btn) => btn.addEventListener('click', () => {
    zoomAt(Number(btn.dataset.viewerZoom) > 0 ? zoom * STEP : zoom / STEP, centre(), centre());
  }));

  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(vIndex - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); showImage(vIndex + 1); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(zoom * STEP, centre(), centre()); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomAt(zoom / STEP, centre(), centre()); }
    else if (e.key === '0') { e.preventDefault(); resetZoom(); }
  });

  const local = (e) => {
    const box = stage.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  // Scroll wheel / trackpad
  let wheelTimer = 0;
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = local(e);
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(zoom * Math.exp(-delta * 0.002), p.x, p.y, true);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => stage.classList.remove('is-live'), 120);
  }, { passive: false });

  // Double-click (mouse) toggles between fitted and 2.5x at the pointer
  const toggleZoom = (p) => (zoom > 1.001 ? resetZoom() : zoomAt(2.5, p.x, p.y));
  stage.addEventListener('dblclick', (e) => { e.preventDefault(); toggleZoom(local(e)); });

  // Pointers: drag to pan, two fingers to pinch, double-tap and swipe on touch
  const pointers = new Map();
  let drag = null;
  let pinch = null;
  let lastTap = 0;

  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, local(e));
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      drag = null;
    } else if (pointers.size === 1) {
      drag = { start: local(e), tx, ty, moved: false };
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const p = local(e);
    pointers.set(e.pointerId, p);
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(pinch.zoom * (dist / pinch.dist), (a.x + b.x) / 2, (a.y + b.y) / 2, true);
    } else if (drag) {
      const dx = p.x - drag.start.x;
      const dy = p.y - drag.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (zoom > 1.001 && drag.moved) {
        stage.classList.add('is-dragging');
        tx = drag.tx + dx;
        ty = drag.ty + dy;
        applyZoom(true);
      }
    }
  });
  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    const p = local(e);
    pointers.delete(e.pointerId);
    stage.classList.remove('is-dragging', 'is-live');
    if (pinch) {
      if (pointers.size < 2) pinch = null;
      drag = null;
      return;
    }
    if (!drag) return;
    const dx = p.x - drag.start.x;
    if (zoom <= 1.001 && drag.moved && Math.abs(dx) > 50 && e.pointerType !== 'mouse') {
      showImage(vIndex + (dx < 0 ? 1 : -1)); // swipe
    } else if (!drag.moved && e.pointerType !== 'mouse') {
      const now = Date.now();
      if (now - lastTap < 300) { toggleZoom(p); lastTap = 0; } else lastTap = now; // double-tap
    }
    drag = null;
  };
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (viewer.open) resetZoom(); }).observe(stage);

  /* ---------- Colour swatches ----------
     Each swatch is a link to its own product page. DEMO: here the page updates in place. */
  const swatches = $$('[data-colour]');
  const titleEl = $('[data-product-title]');
  const crumbName = $('[data-crumb-name]');
  const colourLabel = $('[data-colour-label]');
  const specColour = $('[data-spec-colour]');
  let colour = swatches.find((s) => s.classList.contains('is-current'))?.dataset.colour || 'gold';

  const productName = () => `${PRODUCT.baseName} (${colourName()})`;
  const colourName = () => swatches.find((s) => s.dataset.colour === colour)?.dataset.colourName || '';

  function setColour(key, { smooth = true, push = true } = {}) {
    const swatch = swatches.find((s) => s.dataset.colour === key);
    if (!swatch) return;
    colour = key;
    swatches.forEach((s) => {
      const on = s === swatch;
      s.classList.toggle('is-current', on);
      if (on) s.setAttribute('aria-current', 'true');
      else s.removeAttribute('aria-current');
    });
    colourLabel.textContent = swatch.dataset.colourName;
    specColour.textContent = swatch.dataset.colourName;
    titleEl.textContent = productName();
    crumbName.textContent = productName();
    document.title = `${productName()} | Blue Banana`;
    goTo(Number(swatch.dataset.slide), smooth);
    if (push) history.replaceState(null, '', swatch.getAttribute('href'));
  }

  swatches.forEach((swatch) => swatch.addEventListener('click', (e) => {
    e.preventDefault();
    setColour(swatch.dataset.colour);
    announce(`Colour: ${swatch.dataset.colourName}`);
  }));
  const startColour = new URLSearchParams(location.search).get('colour');
  if (startColour && startColour !== colour) setColour(startColour, { smooth: false, push: false });

  /* ---------- Size selects, stock badge ---------- */
  const form = $('[data-pdp-form]');
  const gaugeSelect = $('#pdp-gauge');
  const sizeSelect = $('#pdp-size');
  const sizeError = $('[data-size-error]');
  const stockBadge = $('[data-stock]');
  const variantSelects = [gaugeSelect, sizeSelect];

  function markEmpty(select) { select.classList.toggle('is-empty', !select.value); }

  // Sold-out sizes can't be chosen
  $$('option[data-stock]', sizeSelect).forEach((option) => {
    if (Number(option.dataset.stock) === 0) {
      option.disabled = true;
      option.textContent += ' - Out Of Stock';
    }
  });

  function updateStock() {
    const option = sizeSelect.selectedOptions[0];
    const left = option && option.dataset.stock ? Number(option.dataset.stock) : null;
    const low = left !== null && left > 0 && left <= LOW_STOCK;
    stockBadge.hidden = !low;
    if (low) stockBadge.textContent = `Only ${left} Left In Stock`;
  }

  function setInvalid(select, errorEl, invalid) {
    errorEl.hidden = !invalid;
    if (invalid) select.setAttribute('aria-invalid', 'true');
    else select.removeAttribute('aria-invalid');
  }

  // The "Selected from size helper" tick: set by the Find Your Size helper, cleared when the shopper changes size themselves
  const quizApplied = $('[data-quiz-applied]');
  let applyingHelper = false;

  variantSelects.forEach((select) => {
    markEmpty(select);
    select.addEventListener('change', () => {
      markEmpty(select);
      if (!applyingHelper) quizApplied.hidden = true;
      if (select === sizeSelect) {
        updateStock();
        syncQty();
        if (select.value) setInvalid(sizeSelect, sizeError, false);
      }
      syncMirrors();
    });
  });
  updateStock();

  // The phone size sheet mirrors the two selects
  const mirrors = $$('[data-mirror]');
  mirrors.forEach((mirror) => {
    const source = document.getElementById(mirror.dataset.mirror);
    mirror.replaceChildren(...Array.from(source.options).map((o) => o.cloneNode(true)));
    mirror.addEventListener('change', () => {
      source.value = mirror.value;
      source.dispatchEvent(new Event('change'));
      if (mirror.value) setInvalid(mirror, $('[data-sheet-error]'), false);
    });
  });
  function syncMirrors() {
    mirrors.forEach((mirror) => {
      mirror.value = document.getElementById(mirror.dataset.mirror).value;
      markEmpty(mirror);
    });
  }
  syncMirrors();

  const variantText = () => variantSelects.map((s) => s.value).filter(Boolean).join(' x ');
  const isChosen = () => variantSelects.every((s) => s.value);

  /* ---------- Quantity + Klarna ---------- */
  const qtyInput = $('[data-qty]');
  const qtyButtons = $$('[data-qty-step]');
  const klarna = $('[data-klarna]');
  const klarnaAmount = $('[data-klarna-amount]');

  // Can't order more than the chosen size has in stock
  function maxQty() {
    const option = sizeSelect.selectedOptions[0];
    return option && option.dataset.stock ? Math.max(1, Math.min(MAX_QTY, Number(option.dataset.stock))) : MAX_QTY;
  }
  function getQty() {
    const n = Math.round(Number(qtyInput.value));
    return Number.isFinite(n) ? Math.min(maxQty(), Math.max(1, n)) : 1;
  }
  function syncQty() {
    const qty = getQty();
    qtyInput.value = String(qty);
    qtyInput.max = String(maxQty());
    qtyButtons.forEach((btn) => { btn.disabled = Number(btn.dataset.qtyStep) < 0 ? qty <= 1 : qty >= maxQty(); });
    const total = qty * PRODUCT.price;
    klarna.hidden = total < KLARNA_MIN;
    klarnaAmount.textContent = gbp.format(Math.floor((total / 3) * 100) / 100);
  }
  qtyButtons.forEach((btn) => btn.addEventListener('click', () => {
    qtyInput.value = String(getQty() + Number(btn.dataset.qtyStep));
    syncQty();
    announce(`Quantity ${qtyInput.value}`);
  }));
  qtyInput.addEventListener('change', syncQty);
  syncQty();

  /* ---------- Dialogs (native <dialog>) ---------- */
  // The page scroll lock is counted, as the size guide can open on top of the size sheet.
  const opener = new Map();   // open dialog -> element to return focus to

  function openDialog(id, trigger) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    if (opener.size === 0) {
      const root = document.documentElement;
      root.style.setProperty('--scrollbar-w', `${window.innerWidth - root.clientWidth}px`);
      root.classList.add('is-locked');
    }
    opener.set(dialog, trigger || document.activeElement);
    dialog.showModal();
  }
  // Runs from closeDialog and from the 'close' event (Esc), whichever comes first. The event alone
  // isn't enough: it can arrive late, or not at all, while the page is in a background tab.
  function released(dialog) {
    if (!opener.has(dialog)) return;
    const back = opener.get(dialog);
    opener.delete(dialog);
    if (opener.size === 0) document.documentElement.classList.remove('is-locked');
    if (back && document.contains(back) && back.getClientRects().length) back.focus();
  }
  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
    released(dialog);
  }

  $$('.pdp-dialog, .pdp-viewer').forEach((dialog) => {
    dialog.addEventListener('close', () => released(dialog));
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(dialog); }); // Esc
    // Click on the dark backdrop closes it
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(dialog); });
    $$('[data-dialog-close]', dialog).forEach((btn) => btn.addEventListener('click', () => closeDialog(dialog)));
  });
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-dialog-open]');
    if (trigger) openDialog(trigger.dataset.dialogOpen, trigger);
  });

  // Size guide: mm / inches
  $$('[data-unit]').forEach((btn) => btn.addEventListener('click', () => {
    const unit = btn.dataset.unit;
    $$('[data-unit]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    $$('[data-mm]').forEach((cell) => {
      const mm = Number(cell.dataset.mm);
      cell.textContent = unit === 'in' ? `${(mm / 25.4).toFixed(2)}in` : `${mm}mm`;
    });
  }));

  /* ---------- Add to Cart ---------- */
  const imageFor = (key) => `images/product/plasma-gold-hinged-segment-ring-${key}-480.jpg`;
  const addedItem = $('[data-added-item]');
  const addedUpsell = $('[data-added-upsell]');

  function lineFor() {
    return {
      id: PRODUCT.id,
      key: `${PRODUCT.id}|${colour}|${variantText()}`,
      name: productName(),
      variant: variantText(),
      price: PRODUCT.price,
      was: PRODUCT.was,
      image: imageFor(colour),
      url: PRODUCT.url,
    };
  }

  function addToCart() {
    const line = lineFor();
    const qty = getQty();
    if (window.bbCart) window.bbCart.add(line, qty);
    renderAdded(line, qty);
    openDialog('added-panel', $('[data-add-main]'));
  }

  function requireSize(select, errorEl) {
    if (isChosen()) return true;
    setInvalid(select, errorEl, true);
    select.focus();
    announce('Please choose your size');
    return false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!requireSize(sizeSelect, sizeError)) {
      sizeSelect.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      return;
    }
    addToCart();
  });

  // Mobile sticky bar: adds straight away if a size is chosen, otherwise asks for one in the sheet
  const sticky = $('[data-sticky]');
  $('[data-sticky-add]').addEventListener('click', (e) => {
    if (isChosen()) addToCart();
    else openDialog('size-sheet', e.currentTarget);
  });
  $('[data-sheet-add]').addEventListener('click', () => {
    const sheetSize = $('#sheet-size');
    if (!requireSize(sheetSize, $('[data-sheet-error]'))) return;
    closeDialog($('#size-sheet'));
    addToCart();
  });

  const mainAdd = $('[data-add-main]');
  if ('IntersectionObserver' in window) {
    sticky.hidden = false;
    new IntersectionObserver(([entry]) => {
      sticky.classList.toggle('is-visible', !entry.isIntersecting);
      sticky.inert = entry.isIntersecting;
    }).observe(mainAdd);
  }

  /* ---------- Added to Cart panel ---------- */
  // DEMO: "Have you thought about these?" picks. Hand-off: fill from the recommendations feed.
  const UPSELL = [
    { id: 'pro-pierce-ultimate-advanced-aftercare-solution', name: 'Pro Pierce Ultimate Advanced Aftercare Solution', variant: '100ml', price: 7.99 },
    { id: 'blue-banana-gold-plated-silver-1-0mm-cylinder-closure-ring', name: 'Blue Banana Silver 1.0mm Cylinder Closure Ring (Gold Plated)', price: 3.99 },
    { id: 'polished-titanium-silver-snake-hinged-segment-ring', name: 'Blue Banana Polished Titanium Snake Hinged Segment Ring (Silver)', price: 19.99 },
  ];
  const PRODUCT_URL = 'https://www.bluebanana.com/en_GB/products/';

  function stepper(name, start, onChange) {
    let qty = start;
    const value = el('span', { class: 'qty__value', text: String(qty) });
    const dec = el('button', { type: 'button', 'aria-label': `Decrease quantity of ${name}` }, '−');
    const inc = el('button', { type: 'button', 'aria-label': `Increase quantity of ${name}` }, '+');
    const sync = () => {
      value.textContent = String(qty);
      dec.disabled = qty <= 1;
      inc.disabled = qty >= MAX_QTY;
    };
    const change = (d) => {
      qty = Math.min(MAX_QTY, Math.max(1, qty + d));
      sync();
      onChange(qty);
    };
    dec.addEventListener('click', () => change(-1));
    inc.addEventListener('click', () => change(1));
    sync();
    return { node: el('div', { class: 'qty', role: 'group', 'aria-label': `Quantity of ${name}` }, dec, value, inc), get: () => qty };
  }

  function renderAdded(line, qty) {
    const url = line.url;
    const step = stepper(line.name, qty, (n) => {
      if (window.bbCart) window.bbCart.setQty(line.key, n);
      announce(`${line.name}, quantity ${n}`);
    });
    const badge = el('p', { class: 'added-item__badge' }, 'Added', icon('i-tick'));
    const remove = el('button', { class: 'added-item__remove', type: 'button', text: 'Remove' });
    const item = el('li', { class: 'added-item' },
      el('a', { class: 'added-item__media', href: url, tabindex: '-1', 'aria-hidden': 'true' },
        el('img', { src: line.image, alt: '', width: '146', height: '146' })),
      el('div', {},
        el('a', { class: 'added-item__name', href: url, text: line.name }),
        line.variant ? el('p', { class: 'added-item__variant', text: line.variant }) : null,
        priceEl(line, 'added-item__price'),
        el('div', { class: 'added-item__row' }, step.node, remove),
        badge));
    remove.addEventListener('click', () => {
      if (window.bbCart) window.bbCart.remove(line.key);
      item.classList.add('is-removed');
      badge.replaceChildren('Removed');
      remove.remove();
      step.node.remove();
      announce(`${line.name} removed from your cart`);
      $('#added-panel [data-dialog-close]').focus();
    });
    addedItem.replaceChildren(item);
    announce(`${line.name} added to your cart`);

    addedUpsell.replaceChildren(...UPSELL.map((product) => {
      const key = product.id;
      let inCart = false;
      const st = stepper(product.name, 1, (n) => { if (inCart && window.bbCart) window.bbCart.setQty(key, n); });
      const add = el('button', { class: 'added-item__add', type: 'button' }, '+ Add To Cart');
      const rm = el('button', { class: 'added-item__remove', type: 'button', text: 'Remove', hidden: true });
      add.addEventListener('click', () => {
        if (inCart) return;
        inCart = true;
        if (window.bbCart) window.bbCart.add({ ...product, key }, st.get());
        add.classList.add('is-added');
        add.replaceChildren('Added', icon('i-tick'));
        rm.hidden = false;
        announce(`${product.name} added to your cart`);
      });
      rm.addEventListener('click', () => {
        inCart = false;
        if (window.bbCart) window.bbCart.remove(key);
        add.classList.remove('is-added');
        add.replaceChildren('+ Add To Cart');
        rm.hidden = true;
        add.focus();
        announce(`${product.name} removed from your cart`);
      });
      const href = PRODUCT_URL + product.id;
      return el('li', { class: 'added-item' },
        el('a', { class: 'added-item__media', href, tabindex: '-1', 'aria-hidden': 'true' },
          el('img', { src: `images/products/${product.id}-480.jpg`, alt: '', width: '146', height: '146', loading: 'lazy' })),
        el('div', {},
          el('a', { class: 'added-item__name', href, text: product.name }),
          priceEl(product, 'added-item__price'),
          el('div', { class: 'added-item__row' }, st.node, rm),
          add));
    }));
  }

  /* ---------- Find Your Size: What's My Gauge? helper ----------
     Pick a body part, then a piercing: the helper shows the recommended gauge and, if this product comes in it,
     selects that gauge and the nearest size in the drop-downs above.
     PLACEHOLDER figures from the size guide mockup. Hand-off: replace GUIDES with the piercers' sizes from the system. */
  const GUIDES = {
    ring: {
      sizeWord: 'diameter',
      piercings: [
        { name: 'Ear Lobe', area: 'Ear', g: 1.2, s: 10 }, { name: 'Helix', area: 'Ear', g: 1.2, s: 8 },
        { name: 'Tragus', area: 'Ear', g: 1.2, s: 8 }, { name: 'Daith', area: 'Ear', g: 1.2, s: 8 },
        { name: 'Conch', area: 'Ear', g: 1.2, s: 10 }, { name: 'Nose', area: 'Nose', g: 0.8, s: 8 },
        { name: 'Septum', area: 'Nose', g: 1.2, s: 10 }, { name: 'Lip', area: 'Mouth', g: 1.6, s: 10 },
      ],
    },
    bar: {
      sizeWord: 'length',
      piercings: [
        { name: 'Industrial', area: 'Ear', g: 1.6, s: 38 }, { name: 'Tragus', area: 'Ear', g: 1.2, s: 6 },
        { name: 'Helix', area: 'Ear', g: 1.2, s: 6 }, { name: 'Rook', area: 'Ear', g: 1.2, s: 8 },
        { name: 'Eyebrow', area: 'Face', g: 1.2, s: 8 }, { name: 'Tongue', area: 'Mouth', g: 1.6, s: 16 },
        { name: 'Navel', area: 'Body', g: 1.6, s: 10 }, { name: 'Nipple', area: 'Body', g: 1.6, s: 14 },
      ],
    },
  };
  const AREA_ORDER = ['Ear', 'Nose', 'Face', 'Mouth', 'Body'];
  const SHOP_URL = 'https://www.bluebanana.com/en_GB/section/body-jewellery'; // Hand-off: link to the gauge + piercing type listing

  const fys = $('#find-your-size');
  const guideType = GUIDES[fys.dataset.guide] ? fys.dataset.guide : 'ring';
  const guide = GUIDES[guideType];
  const helper = $('[data-gauge-helper]', fys);
  const areaSelect = $('[data-fys-area]', fys);
  const piercingSelect = $('[data-fys-piercing]', fys);
  const result = $('[data-fys-result]', fys);
  const mm = (n) => n.toFixed(1);

  $$('[data-guide-show]', fys).forEach((node) => { node.hidden = node.dataset.guideShow !== guideType; });
  helper.hidden = false;

  const option = (value, text, attrs = {}) => el('option', { value, ...attrs }, text);
  function resetHelper() {
    const areas = AREA_ORDER.filter((a) => guide.piercings.some((p) => p.area === a));
    areaSelect.replaceChildren(option('', 'Select a body part', { selected: true }), ...areas.map((a) => option(a, a)));
    fillPiercings('');
    result.hidden = true;
    result.replaceChildren();
    markEmpty(areaSelect);
  }
  function fillPiercings(area) {
    if (!area) {
      piercingSelect.replaceChildren(option('', 'Choose a body part first', { selected: true }));
      piercingSelect.disabled = true;
    } else {
      piercingSelect.replaceChildren(option('', 'Select a piercing', { selected: true }),
        ...guide.piercings.map((p, i) => (p.area === area ? option(String(i), p.name) : null)).filter(Boolean));
      piercingSelect.disabled = false;
    }
    markEmpty(piercingSelect);
  }

  // Options this product can actually be bought in, as numbers
  const choices = (select) => Array.from(select.options)
    .filter((o) => o.value && !o.disabled)
    .map((o) => ({ value: o.value, n: parseFloat(o.value) }));

  function flash(select) {
    select.classList.remove('is-flash');
    void select.offsetWidth;
    select.classList.add('is-flash');
    setTimeout(() => select.classList.remove('is-flash'), 1600);
  }
  function setVariant(select, value) {
    applyingHelper = true;
    select.value = value;
    select.dispatchEvent(new Event('change'));
    applyingHelper = false;
    flash(select);
  }

  function recommend(piercing) {
    const gauge = choices(gaugeSelect).find((c) => c.n === piercing.g);
    const sizes = choices(sizeSelect);
    let status;
    let actions;
    if (gauge && sizes.length) {
      // Exact size if stocked, otherwise the nearest (the larger one on a tie)
      const pick = sizes.reduce((best, c) => {
        const d = Math.abs(c.n - piercing.s);
        const bd = Math.abs(best.n - piercing.s);
        return d < bd || (d === bd && c.n > best.n) ? c : best;
      });
      setVariant(gaugeSelect, gauge.value);
      setVariant(sizeSelect, pick.value);
      quizApplied.hidden = false;
      const size = `${mm(piercing.g)} x ${pick.n}mm`;
      status = el('div', { class: 'fys__status fys__status--ok' }, icon('i-tick'),
        el('span', {}, 'We’ve selected ', el('strong', { text: size }),
          pick.n === piercing.s ? ' in the size options above.' : `, the closest ${guide.sizeWord} we stock in this gauge.`));
      const go = el('button', { class: 'btn btn--yellow', type: 'button' }, 'Continue To Add To Cart');
      go.addEventListener('click', () => {
        $('[data-buy]').scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        $('[data-add-main]').focus({ preventScroll: true });
      });
      actions = [go];
      announce(`Recommended gauge ${mm(piercing.g)}mm. ${size} selected.`);
    } else {
      quizApplied.hidden = true;
      status = el('div', { class: 'fys__status fys__status--warn' },
        el('span', {}, `This item isn’t available in ${mm(piercing.g)}mm. Try our ${piercing.name.toLowerCase()} jewellery instead.`));
      actions = [el('a', { class: 'btn btn--yellow', href: SHOP_URL, 'data-todo-url': true }, `Shop ${mm(piercing.g)}mm ${piercing.name} Jewellery`)];
      announce(`Recommended gauge ${mm(piercing.g)}mm. This item isn’t available in that gauge.`);
    }
    const reset = el('button', { class: 'fys__reset', type: 'button', text: 'Start Again' });
    reset.addEventListener('click', () => {
      resetHelper();
      areaSelect.focus();
    });
    result.replaceChildren(
      el('p', { class: 'fys__result-k', text: piercing.name }),
      el('p', { class: 'fys__result-big' }, 'Your recommended gauge is ', el('strong', { text: `${mm(piercing.g)}mm` })),
      status,
      el('div', { class: 'fys__actions' }, ...actions, reset));
    result.hidden = false;
  }

  areaSelect.addEventListener('change', () => {
    markEmpty(areaSelect);
    fillPiercings(areaSelect.value);
    result.hidden = true;
  });
  piercingSelect.addEventListener('change', () => {
    markEmpty(piercingSelect);
    if (piercingSelect.value !== '') recommend(guide.piercings[Number(piercingSelect.value)]);
  });
  resetHelper();

  // "I don't know my size": scroll to the block, pulse the helper and put focus on its first question
  $('[data-find-size]').addEventListener('click', (e) => {
    e.preventDefault();
    fys.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    fys.classList.remove('is-pulse');
    void fys.offsetWidth;
    fys.classList.add('is-pulse');
    areaSelect.focus({ preventScroll: true });
  });

  /* ---------- Next-day countdown + Shipping Options ----------
     Hand-off: bank holidays aren't handled; the platform should supply the cut-off and delivery dates. */
  const timer = $('[data-dispatch-timer]');
  const dateOut = $('[data-dispatch-date]');
  const isWorkingDay = (d) => d.getDay() !== 0 && d.getDay() !== 6;
  const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });
  const longFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const pad = (n) => String(n).padStart(2, '0');

  function nextCutoff(now) {
    const cutoff = new Date(now);
    cutoff.setHours(DISPATCH_CUTOFF_HOUR, 0, 0, 0);
    while (cutoff <= now || !isWorkingDay(cutoff)) {
      cutoff.setDate(cutoff.getDate() + 1);
      cutoff.setHours(DISPATCH_CUTOFF_HOUR, 0, 0, 0);
    }
    return cutoff;
  }
  function addWorkingDays(from, days) {
    const day = new Date(from);
    for (let n = 0; n < days;) {
      day.setDate(day.getDate() + 1);
      if (isWorkingDay(day)) n++;
    }
    return day;
  }

  let lastDay = '';
  function tick() {
    const now = new Date();
    const cutoff = nextCutoff(now);
    const left = Math.max(0, Math.floor((cutoff - now) / 1000));
    timer.textContent = `${pad(Math.floor(left / 3600))}:${pad(Math.floor(left / 60) % 60)}:${pad(left % 60)}`;
    const day = cutoff.toDateString();
    if (day === lastDay) return;
    lastDay = day;
    dateOut.textContent = dayFormat.format(addWorkingDays(cutoff, 1));
    $$('[data-shipping-list] li').forEach((li) => {
      $('[data-ship-date]', li).textContent = longFormat.format(addWorkingDays(cutoff, Number(li.dataset.days)));
    });
  }
  tick();
  setInterval(tick, 1000);

  const shipToggle = $('[data-shipping-toggle]');
  const shipping = $('#pdp-shipping');
  function setShipping(open) {
    shipping.hidden = !open;
    shipToggle.setAttribute('aria-expanded', String(open));
    shipToggle.textContent = open ? '(Hide Options)' : '(View Options)';
  }
  shipToggle.addEventListener('click', () => setShipping(shipping.hidden));
  $('[data-shipping-close]').addEventListener('click', () => {
    setShipping(false);
    shipToggle.focus();
  });
})();
