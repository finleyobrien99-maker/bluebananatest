/* Blue Banana cart page
   Cart lines (quantity, remove with undo, clear cart), free delivery meter,
   order summary, discount code / gift card forms, next-day countdown,
   "You May Also Like" add buttons, and the mobile checkout bar with its
   Express Checkout pop-up.
   Header, menus and the product scroller come from main.js. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const page = $('[data-cart-page]');
  if (!page) return;

  /* ---------- Settings ----------
     Hand-off: confirm these against the live delivery rules. */
  const FREE_DELIVERY_THRESHOLD = 50;   // £, standard UK delivery
  const FREE_DELIVERY_EXCLUDES_FOOTWEAR = true;
  const DISPATCH_CUTOFF_HOUR = 14;      // order before 2pm on a weekday for next-day delivery
  const MAX_QTY = 10;
  const PRODUCT_URL = 'https://www.bluebanana.com/en_GB/products/';

  /* DEMO DATA: the same four items as the cart drawer in main.js. Replace with
     the platform's basket API and send quantity / remove / add / coupon
     actions to it. */
  const DEMO_CART = [
    { id: 'killstar-chapel-iris-dress', name: 'Killstar Chapel Iris Dress (Black)', variant: 'Size: S', price: 67.99, qty: 1 },
    { id: 'dr-martens-vegan-1460-black-boots', name: 'Dr Martens Vegan 1460 Boots (Black Felix Rub Off)', variant: 'Size: UK 6', price: 124.99, was: 127.99, qty: 1, footwear: true },
    // No longer listed on the live site, so this one links to the jewellery section.
    { id: 'plasma-gold-hinged-segment-ring', name: 'Blue Banana Plasma Gold 1.2mm Hinged Segment Ring (Gold)', variant: 'Gauge: 1.2mm', price: 5.99, was: 8.99, qty: 1, stock: 1, url: 'https://www.bluebanana.com/en_GB/section/body-jewellery' },
    { id: 'pro-pierce-ultimate-advanced-aftercare-solution', name: 'Pro Pierce Ultimate Advanced Aftercare Solution', variant: 'Size: 100ml', price: 7.99, qty: 1 },
  ];

  // From the product page XD ("Use Code DRMARTENS10 for £10 Off").
  const DEMO_CODES = {
    DRMARTENS10: { amount: 10 },
  };

  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const imageFor = (id) => `images/products/${id}-480.jpg`;
  const urlFor = (product) => product.url || PRODUCT_URL + product.id;
  const limitFor = (item) => Math.min(MAX_QTY, item.stock || MAX_QTY);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

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

  function priceEl(product, tag, className) {
    if (!product.was) return el(tag, { class: className }, el('span', { class: 'price', text: gbp.format(product.price) }));
    return el(tag, { class: className },
      el('span', { class: 'price price--sale' }, el('span', { class: 'sr-only', text: 'Now ' }), gbp.format(product.price)),
      ' ',
      el('s', { class: 'price price--was' }, el('span', { class: 'sr-only', text: 'was ' }), gbp.format(product.was)));
  }

  // Disabling a focused button drops focus to <body>; hand it to a sibling control first.
  function setDisabled(button, disabled, fallback) {
    if (disabled && document.activeElement === button && fallback) fallback.focus();
    button.disabled = disabled;
  }

  const announcer = $('[data-cart-announce]');
  function announce(message) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 50);
  }

  /* ---------- State ---------- */
  let cart = DEMO_CART.map((item) => ({ ...item }));
  let discount = null; // { code, amount }

  const list = $('[data-cart-lines]');
  const lines = new Map();

  /* ---------- Cart lines ---------- */
  function createLine(item) {
    const value = el('span', { class: 'qty__value', text: String(item.qty) });
    const dec = el('button', { type: 'button', 'aria-label': `Decrease quantity of ${item.name}` }, '−');
    const inc = el('button', { type: 'button', 'aria-label': `Increase quantity of ${item.name}` }, '+');
    const remove = el('button', { type: 'button', class: 'text-link text-link--muted cart-line__remove', 'aria-label': `Remove ${item.name}`, text: 'Remove' });
    const sum = el('span', { class: 'price' });
    const saving = el('span', { class: 'cart-line__saving' });

    const line = el('li', { class: 'cart-line', 'data-id': item.id },
      el('a', { class: 'cart-line__media', href: urlFor(item), tabindex: '-1', 'aria-hidden': 'true' },
        el('img', { src: imageFor(item.id), alt: '', width: '120', height: '120', decoding: 'async' })),
      el('div', { class: 'cart-line__info' },
        el('a', { class: 'cart-line__name', href: urlFor(item), text: item.name }),
        item.variant ? el('p', { class: 'cart-line__variant', text: item.variant }) : null,
        item.stock && item.stock <= 3 ? el('p', { class: 'cart-line__badge', text: `Only ${item.stock} left in stock` }) : null,
        item.footwear && FREE_DELIVERY_EXCLUDES_FOOTWEAR ? el('p', { class: 'cart-line__note', text: 'Footwear doesn’t count towards free delivery' }) : null,
        priceEl(item, 'p', 'cart-line__each')),
      priceEl(item, 'div', 'cart-line__price'),
      el('div', { class: 'cart-line__qty' },
        el('div', { class: 'qty', role: 'group', 'aria-label': `Quantity of ${item.name}` }, dec, value, inc)),
      // Its own grid item: under the details on desktop, beside the quantity box on phones.
      remove,
      el('p', { class: 'cart-line__sum' }, el('span', { class: 'sr-only', text: 'Line total ' }), sum, saving));

    const sync = () => {
      value.textContent = String(item.qty);
      sum.textContent = gbp.format(item.qty * item.price);
      saving.textContent = item.was ? `Save ${gbp.format(item.qty * (item.was - item.price))}` : '';
      setDisabled(dec, item.qty <= 1, inc);
      setDisabled(inc, item.qty >= limitFor(item), dec);
    };

    const change = (delta) => {
      item.qty = Math.min(limitFor(item), Math.max(1, item.qty + delta));
      sync();
      update();
      announce(`${item.name}, quantity ${item.qty}`);
    };

    dec.addEventListener('click', () => change(-1));
    inc.addEventListener('click', () => change(1));
    remove.addEventListener('click', () => removeItem(item));

    lines.set(item.id, { line, sync, remove });
    sync();
    return line;
  }

  function renderLines() {
    lines.clear();
    list.replaceChildren(...cart.map(createLine));
  }

  /* ---------- Remove, clear and undo ---------- */
  const toast = $('[data-toast]');
  const toastText = $('[data-toast-text]');
  const toastUndo = $('[data-toast-undo]');
  let undoState = null;
  let toastTimer = 0;

  function showToast(message, restore) {
    undoState = restore;
    toastText.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 7000);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    toast.hidden = true;
    undoState = null;
  }

  // Keep focus on something sensible once a line has gone.
  function focusAfterRemoval(index) {
    const next = cart[index] || cart[index - 1];
    if (next) lines.get(next.id).remove.focus();
    else $('.cart-empty-state a').focus();
  }

  function removeItem(item) {
    const index = cart.indexOf(item);
    cart.splice(index, 1);
    lines.get(item.id).line.remove();
    lines.delete(item.id);
    update();
    focusAfterRemoval(index);
    announce(`${item.name} removed from your cart`);
    showToast(`Removed ${item.name}`, () => {
      cart.splice(Math.min(index, cart.length), 0, item);
      renderLines();
      update();
      lines.get(item.id).remove.focus();
      announce(`${item.name} is back in your cart`);
    });
  }

  $('[data-cart-clear]').addEventListener('click', () => {
    const previous = cart;
    cart = [];
    renderLines();
    update();
    $('.cart-empty-state a').focus();
    announce('Your cart has been cleared');
    showToast(`Removed ${plural(previous.length, 'item')}`, () => {
      cart = previous;
      renderLines();
      update();
      $('[data-cart-clear]').focus();
      announce('Your items are back in your cart');
    });
  });

  toastUndo.addEventListener('click', () => {
    const restore = undoState;
    hideToast();
    if (restore) restore();
  });

  /* ---------- Add from "You May Also Like" ---------- */
  $$('[data-add]').forEach((button) => {
    let resetTimer = 0;
    button.addEventListener('click', () => {
      const { id, name, variant } = button.dataset;
      const product = {
        id,
        name,
        variant: variant || null,
        price: parseFloat(button.dataset.price),
        was: button.dataset.was ? parseFloat(button.dataset.was) : null,
        url: button.previousElementSibling.href,
      };
      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.qty = Math.min(limitFor(existing), existing.qty + 1);
        lines.get(id).sync();
      } else {
        cart.push({ ...product, qty: 1 });
        list.append(createLine(cart[cart.length - 1]));
      }
      update();
      announce(`${name} added to your cart`);

      button.classList.add('is-added');
      button.textContent = 'Added ✓';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        button.classList.remove('is-added');
        button.textContent = 'Add to Cart';
      }, 1600);
    });
  });

  /* ---------- Discount code + gift card ----------
     Hand-off: send these to the platform's coupon / gift card endpoints. */
  function setMessage(node, text, kind) {
    node.textContent = text;
    node.classList.toggle('is-error', kind === 'error');
    node.classList.toggle('is-success', kind === 'success');
  }

  function bindCodeForm(form, message, apply) {
    const input = $('input', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = input.value.trim().toUpperCase();
      const result = apply(code);
      input.setAttribute('aria-invalid', String(result.kind === 'error'));
      setMessage(message, result.text, result.kind);
      if (result.kind === 'error') input.focus();
      else input.value = '';
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') !== 'true') return;
      input.removeAttribute('aria-invalid');
      setMessage(message, '', null);
    });
  }

  const codeMsg = $('[data-code-msg]');
  bindCodeForm($('[data-code-form]'), codeMsg, (code) => {
    if (!code) return { kind: 'error', text: 'Please enter a discount code.' };
    const promo = DEMO_CODES[code];
    if (!promo) return { kind: 'error', text: `Sorry, ${code} isn’t a valid discount code.` };
    discount = { code, amount: promo.amount };
    update();
    return { kind: 'success', text: `${code} applied: ${gbp.format(promo.amount)} off your order.` };
  });

  bindCodeForm($('[data-gift-form]'), $('[data-gift-msg]'), (code) => {
    if (!code) return { kind: 'error', text: 'Please enter your gift card code.' };
    return { kind: 'error', text: 'We couldn’t find a gift card with that code. Check it and try again.' };
  });

  $('[data-code-remove]').addEventListener('click', () => {
    const code = discount && discount.code;
    discount = null;
    update();
    setMessage(codeMsg, '', null);
    $('#discount-code').focus();
    if (code) announce(`${code} removed`);
  });

  /* ---------- Totals, summary and delivery meter ---------- */
  const meter = $('[data-delivery-meter]');
  const meterText = $('[data-delivery-text]');
  const meterFill = $('[data-delivery-fill]');
  const out = {
    headingCount: $('[data-cart-heading-count]'),
    items: $('[data-summary-items]'),
    subtotal: $('[data-summary-subtotal]'),
    savingRow: $('[data-summary-saving-row]'),
    saving: $('[data-summary-saving]'),
    discountRow: $('[data-summary-discount-row]'),
    discount: $('[data-summary-discount]'),
    code: $('[data-summary-code]'),
    delivery: $('[data-summary-delivery]'),
    total: $('[data-summary-total]'),
    barTotal: $('[data-checkout-bar-total]'),
    barSaving: $('[data-checkout-bar-saving]'),
    bagCount: $('[data-cart-count]'),
    bag: $('.header-link--bag'),
  };

  function update() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    const saving = cart.reduce((sum, item) => sum + (item.was ? item.qty * (item.was - item.price) : 0), 0);
    const qualifying = cart
      .filter((item) => !(FREE_DELIVERY_EXCLUDES_FOOTWEAR && item.footwear))
      .reduce((sum, item) => sum + item.qty * item.price, 0);
    const off = discount ? Math.min(discount.amount, subtotal) : 0;
    const total = subtotal - off;
    const freeDelivery = qualifying >= FREE_DELIVERY_THRESHOLD;

    page.classList.toggle('is-empty', cart.length === 0);
    $('[data-cart-empty-state]').hidden = cart.length > 0;
    if (cart.length === 0) hideCheckoutBar();

    out.headingCount.textContent = count ? `(${plural(count, 'item')})` : '';
    out.items.textContent = `(${plural(count, 'item')})`;
    out.subtotal.textContent = gbp.format(subtotal);
    out.savingRow.hidden = saving <= 0;
    out.saving.textContent = `−${gbp.format(saving)}`;
    out.discountRow.hidden = !discount;
    out.code.textContent = discount ? `(${discount.code})` : '';
    out.discount.textContent = `−${gbp.format(off)}`;
    out.delivery.textContent = freeDelivery ? 'Free' : 'Calculated at checkout';
    out.total.textContent = gbp.format(total);
    out.barTotal.textContent = gbp.format(total);
    out.barSaving.hidden = saving <= 0;
    out.barSaving.textContent = `Save ${gbp.format(saving)}`;

    out.bagCount.textContent = String(count);
    out.bagCount.hidden = count === 0;
    out.bag.setAttribute('aria-label', count ? `Cart, ${plural(count, 'item')}` : 'Cart, empty');

    meter.classList.toggle('is-complete', freeDelivery);
    meterFill.style.width = `${Math.min(100, (qualifying / FREE_DELIVERY_THRESHOLD) * 100)}%`;
    if (freeDelivery) {
      meterText.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>';
      meterText.append(el('span', {}, 'You’ve unlocked ', el('strong', { text: 'Free UK Delivery' })));
    } else {
      meterText.replaceChildren(el('span', {},
        'Spend ', el('strong', { text: gbp.format(FREE_DELIVERY_THRESHOLD - qualifying) }),
        ' more for ', el('strong', { text: 'Free UK Delivery' })));
    }
  }

  /* ---------- Next-day delivery countdown (from the product page XD) ---------- */
  const dispatch = $('[data-dispatch]');
  const timer = $('[data-dispatch-timer]');
  const dateOut = $('[data-dispatch-date]');
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
  const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const pad = (n) => String(n).padStart(2, '0');

  // Hand-off: bank holidays aren't handled; the platform should supply the cut-off and delivery date.
  function nextCutoff(now) {
    const cutoff = new Date(now);
    cutoff.setHours(DISPATCH_CUTOFF_HOUR, 0, 0, 0);
    while (cutoff <= now || isWeekend(cutoff)) {
      cutoff.setDate(cutoff.getDate() + 1);
      cutoff.setHours(DISPATCH_CUTOFF_HOUR, 0, 0, 0);
    }
    return cutoff;
  }

  function deliveryDate(cutoff) {
    const day = new Date(cutoff);
    do day.setDate(day.getDate() + 1); while (isWeekend(day));
    return day;
  }

  function tick() {
    const now = new Date();
    const cutoff = nextCutoff(now);
    const left = Math.max(0, Math.floor((cutoff - now) / 1000));
    timer.textContent = `${pad(Math.floor(left / 3600))}:${pad(Math.floor(left / 60) % 60)}:${pad(left % 60)}`;
    dateOut.textContent = dayFormat.format(deliveryDate(cutoff));
  }
  tick();
  dispatch.hidden = false;
  setInterval(tick, 1000);

  /* ---------- Mobile checkout bar ---------- */
  const bar = $('[data-checkout-bar]');
  const summaryCheckout = $('[data-summary-checkout]');
  let barTimer = 0;

  function showCheckoutBar() {
    clearTimeout(barTimer);
    bar.hidden = false;
    requestAnimationFrame(() => bar.classList.add('is-visible'));
  }
  function hideCheckoutBar() {
    bar.classList.remove('is-visible');
    clearTimeout(barTimer);
    barTimer = setTimeout(() => { bar.hidden = true; }, 250);
  }

  if ('IntersectionObserver' in window) {
    // Show the bar (phones only, via CSS) while the summary's checkout button is off screen.
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && cart.length) showCheckoutBar();
      else hideCheckoutBar();
    }).observe(summaryCheckout);
  }

  /* ---------- Express Checkout pop-up (from the checkout bar) ---------- */
  const expressDialog = $('[data-express-dialog]');
  const expressOpen = $('[data-express-open]');

  // Browsers without <dialog> keep the plain link to checkout.
  if (typeof expressDialog.showModal === 'function') {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Slide the sheet back down before closing it.
    const closeExpress = () => {
      if (!expressDialog.open || expressDialog.classList.contains('is-closing')) return;
      if (reduceMotion.matches) { expressDialog.close(); return; }
      expressDialog.classList.add('is-closing');
      setTimeout(() => {
        expressDialog.classList.remove('is-closing');
        expressDialog.close();
      }, 200);
    };

    expressOpen.addEventListener('click', (e) => {
      e.preventDefault();
      expressDialog.showModal();
    });
    $('[data-express-close]').addEventListener('click', closeExpress);
    // Esc: run the same closing slide instead of the instant close.
    expressDialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeExpress();
    });
    // A click on the backdrop lands on the <dialog> itself, outside the inner panel.
    expressDialog.addEventListener('click', (e) => {
      if (e.target === expressDialog) closeExpress();
    });
  }

  renderLines();
  update();
})();
