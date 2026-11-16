/* Blue Banana product page
   Gallery (thumbnails, arrows, swipe, dots, hover zoom), colour swatches, size selects with stock badge,
   quantity, Klarna message, Add to Cart (into the shared cart from main.js) with the "Added to Cart" panel,
   the mobile sticky bar and size sheet, pop-ups, offers, and the next-day countdown with Shipping Options.
   Everything marked DEMO is sample data; the rest is ready to be fed by the platform. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');

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

  // Hover zoom: the image follows the pointer at 2x (Web 1920 – 3)
  slides.forEach((slide) => {
    const move = (e) => {
      const box = slide.getBoundingClientRect();
      slide.style.setProperty('--zx', `${((e.clientX - box.left) / box.width) * 100}%`);
      slide.style.setProperty('--zy', `${((e.clientY - box.top) / box.height) * 100}%`);
    };
    slide.addEventListener('pointerenter', (e) => {
      if (!fineHover.matches || e.pointerType !== 'mouse') return;
      move(e);
      slide.classList.add('is-zooming');
    });
    slide.addEventListener('pointermove', (e) => { if (slide.classList.contains('is-zooming')) move(e); });
    slide.addEventListener('pointerleave', () => slide.classList.remove('is-zooming'));
  });

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

  variantSelects.forEach((select) => {
    markEmpty(select);
    select.addEventListener('change', () => {
      markEmpty(select);
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

  $$('.pdp-dialog').forEach((dialog) => {
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
