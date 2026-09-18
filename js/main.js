/* Blue Banana homepage interactions
   Header, mega menu, mobile nav drawer, search bar, product scrollers,
   cart drawer (demo data), newsletter form and the mobile footer accordion. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const desktopMQ = window.matchMedia('(min-width: 1180px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const header = $('#site-header');
  const nav = $('#site-nav');

  let lastPointerType = 'mouse';
  document.addEventListener('pointerdown', (e) => { lastPointerType = e.pointerType; }, true);

  /* ---------- Shared helpers ---------- */
  let lockCount = 0;
  function lockScroll() {
    if (lockCount++ > 0) return;
    const root = document.documentElement;
    root.style.setProperty('--scrollbar-w', `${window.innerWidth - root.clientWidth}px`);
    root.classList.add('is-locked');
  }
  function unlockScroll() {
    if (lockCount === 0 || --lockCount > 0) return;
    document.documentElement.classList.remove('is-locked');
  }

  // Everything outside an open drawer is made inert so focus and screen readers stay inside it.
  const pageRegions = {
    cart: ['.skip-link', '#site-header', '.promo-bar', '#main', '.site-footer'],
    nav: ['.skip-link', '.site-header__bar', '.site-search', '.promo-bar', '#main', '.site-footer'],
  };
  function setPageInert(on, who) {
    pageRegions[who].forEach((sel) => {
      const node = $(sel);
      if (node) node.inert = on;
    });
  }

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, event) {
    const items = $$(FOCUSABLE, container).filter((node) => node.getClientRects().length > 0);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Disabling a focused button drops focus to <body>; hand it to a sibling control first.
  function setDisabled(button, disabled, fallback) {
    if (disabled && document.activeElement === button && fallback) fallback.focus();
    button.disabled = disabled;
  }

  /* ---------- Sticky header shadow ---------- */
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Accordions built from plain headings (mobile nav groups + mobile footer) ---------- */
  let collapseId = 0;
  function makeCollapsible(group, headingSel, bodySel) {
    const heading = $(headingSel, group);
    const body = $(bodySel, group);
    if (!heading || !body) return;
    if (!body.id) body.id = `collapse-${++collapseId}`;

    const text = heading.textContent.trim();
    const label = document.createElement('span');
    label.className = 'collapse-label';
    label.textContent = text;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collapse-btn';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', body.id);
    button.innerHTML = '<span></span><svg class="icon collapse-btn__icon" aria-hidden="true"><use href="#i-chevron"></use></svg>';
    button.firstElementChild.textContent = text;

    heading.replaceChildren(label, button);
    button.addEventListener('click', () => {
      const open = !group.classList.contains('is-expanded');
      group.classList.toggle('is-expanded', open);
      button.setAttribute('aria-expanded', String(open));
    });
  }
  $$('.mega__group').forEach((group) => makeCollapsible(group, '.mega__heading', '.mega__links'));
  $$('.footer-col').forEach((group) => makeCollapsible(group, '.footer-col__heading', '.footer-col__links'));

  /* ---------- Desktop mega menu ---------- */
  const megaItems = $$('.site-nav__item.has-mega', nav);
  let openItem = null;
  let openTimer = 0;
  let closeTimer = 0;
  let switchTimer = 0;

  function setItemOpen(item, open) {
    item.classList.toggle('is-open', open);
    $('.site-nav__toggle', item).setAttribute('aria-expanded', String(open));
  }

  function openMega(item) {
    clearTimeout(closeTimer);
    if (openItem === item) return;
    closeSearch();
    closeLocale();
    if (openItem) {
      // Swap panels instantly instead of cross-fading two menus.
      nav.classList.add('is-switching');
      setItemOpen(openItem, false);
      clearTimeout(switchTimer);
      switchTimer = setTimeout(() => nav.classList.remove('is-switching'), 60);
    }
    setItemOpen(item, true);
    openItem = item;
  }

  function closeMega({ returnFocus = false } = {}) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (!openItem) return;
    const item = openItem;
    const hadFocus = item.contains(document.activeElement);
    setItemOpen(item, false);
    openItem = null;
    if (returnFocus && hadFocus) $('.site-nav__toggle', item).focus();
  }

  megaItems.forEach((item) => {
    const link = $('.site-nav__link', item);
    const toggle = $('.site-nav__toggle', item);

    item.addEventListener('pointerenter', (e) => {
      if (!desktopMQ.matches || e.pointerType === 'touch') return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      // Small intent delay so sweeping across the bar doesn't flash menus open.
      openTimer = setTimeout(() => openMega(item), openItem ? 0 : 90);
    });

    item.addEventListener('pointerleave', (e) => {
      if (!desktopMQ.matches || e.pointerType === 'touch') return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => closeMega(), 180);
    });

    item.addEventListener('focusout', (e) => {
      if (desktopMQ.matches && openItem === item && e.relatedTarget && !item.contains(e.relatedTarget)) closeMega();
    });

    // Touch on a desktop-width screen (e.g. iPad landscape): first tap opens the menu, second tap follows the link.
    link.addEventListener('click', (e) => {
      if (desktopMQ.matches && lastPointerType === 'touch' && openItem !== item) {
        e.preventDefault();
        openMega(item);
      }
    });

    toggle.addEventListener('click', () => {
      if (desktopMQ.matches) {
        if (openItem === item) closeMega();
        else openMega(item);
      } else {
        setItemOpen(item, !item.classList.contains('is-open'));
      }
    });
  });

  /* ---------- Mobile nav drawer ---------- */
  const navOpenBtn = $('[data-nav-open]');
  const navBackdrop = $('.nav-backdrop');
  let navIsOpen = false;

  function openNav() {
    if (navIsOpen) return;
    navIsOpen = true;
    closeSearch();
    nav.classList.add('is-open');
    navBackdrop.classList.add('is-open');
    navOpenBtn.setAttribute('aria-expanded', 'true');
    // Move focus into the drawer before the burger button becomes inert.
    $('.site-nav__head [data-nav-close]').focus({ preventScroll: true });
    setPageInert(true, 'nav');
    lockScroll();
  }

  function closeNav({ returnFocus = true } = {}) {
    if (!navIsOpen) return;
    navIsOpen = false;
    nav.classList.remove('is-open');
    navBackdrop.classList.remove('is-open');
    navOpenBtn.setAttribute('aria-expanded', 'false');
    setPageInert(false, 'nav');
    unlockScroll();
    if (returnFocus) navOpenBtn.focus();
  }

  navOpenBtn.addEventListener('click', openNav);
  $$('[data-nav-close]').forEach((node) => node.addEventListener('click', () => closeNav()));

  desktopMQ.addEventListener('change', () => {
    megaItems.forEach((item) => setItemOpen(item, false));
    openItem = null;
    closeNav({ returnFocus: false });
  });

  /* ---------- Search bar ---------- */
  const search = $('[data-search]');
  const searchToggle = $('[data-search-toggle]');
  const searchInput = $('#search-input');
  let searchIsOpen = false;

  function openSearch() {
    if (searchIsOpen) return;
    searchIsOpen = true;
    closeMega();
    closeLocale();
    search.classList.add('is-open');
    searchToggle.setAttribute('aria-expanded', 'true');
    searchInput.focus({ preventScroll: true });
  }

  function closeSearch({ returnFocus = false } = {}) {
    if (!searchIsOpen) return;
    searchIsOpen = false;
    search.classList.remove('is-open');
    searchToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) searchToggle.focus();
  }

  searchToggle.addEventListener('click', () => (searchIsOpen ? closeSearch() : openSearch()));
  $('[data-search-close]').addEventListener('click', () => closeSearch({ returnFocus: true }));
  $('form', search).addEventListener('submit', (e) => {
    if (!searchInput.value.trim()) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  /* ---------- Country / currency dropdown ---------- */
  const locale = $('[data-dropdown]');
  const localeBtn = $('[data-dropdown-toggle]', locale);
  let localeIsOpen = false;

  function closeLocale({ returnFocus = false } = {}) {
    if (!localeIsOpen) return;
    localeIsOpen = false;
    locale.classList.remove('is-open');
    localeBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) localeBtn.focus();
  }

  localeBtn.addEventListener('click', () => {
    if (localeIsOpen) return closeLocale();
    localeIsOpen = true;
    closeMega();
    closeSearch();
    locale.classList.add('is-open');
    localeBtn.setAttribute('aria-expanded', 'true');
  });
  locale.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !locale.contains(e.relatedTarget)) closeLocale();
  });

  /* ---------- Horizontal scrollers ---------- */
  function initScroller(root) {
    const track = $('[data-scroller-track]', root);
    const prev = $('[data-scroller-prev]', root);
    const next = $('[data-scroller-next]', root);
    if (!track) return;

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const x = Math.abs(track.scrollLeft);
      if (prev) setDisabled(prev, x <= 2, next);
      if (next) setDisabled(next, x >= max - 2, prev);
    };

    // Move one "page" of fully visible tiles at a time.
    const page = (direction) => {
      const first = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = first ? first.getBoundingClientRect().width + gap : track.clientWidth;
      const perPage = Math.max(1, Math.floor((track.clientWidth + gap) / step));
      track.scrollBy({ left: direction * step * perPage, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    };

    if (prev) prev.addEventListener('click', () => page(-1));
    if (next) next.addEventListener('click', () => page(1));

    track.addEventListener('scroll', update, { passive: true });

    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    root.updateScroller = update;
    update();
  }

  /* ---------- Cart drawer ----------
     DEMO DATA: these items mirror the XD cart artboard. When this page is wired
     into the store, replace DEMO_CART / DEMO_UPSELL with the platform's basket
     API and send quantity / remove / add actions to it. */
  const PRODUCT_URL = 'https://www.bluebanana.com/en_GB/products/';
  const MAX_QTY = 10;

  const DEMO_CART = [
    { id: 'killstar-chapel-iris-dress', name: 'Killstar Chapel Iris Dress (Black)', variant: 'S', price: 67.99, qty: 1 },
    { id: 'dr-martens-vegan-1460-black-boots', name: 'Dr Martens Vegan 1460 Boots (Black Felix Rub Off)', variant: 'UK 6', price: 124.99, was: 127.99, qty: 1 },
    // No longer listed on the live site, so this one links to the jewellery section.
    { id: 'plasma-gold-hinged-segment-ring', name: 'Blue Banana Plasma Gold 1.2mm Hinged Segment Ring (Gold)', variant: '1.2mm', price: 5.99, was: 8.99, qty: 1, url: 'https://www.bluebanana.com/en_GB/section/body-jewellery' },
    { id: 'pro-pierce-ultimate-advanced-aftercare-solution', name: 'Pro Pierce Ultimate Advanced Aftercare Solution', variant: '100ml', price: 7.99, qty: 1 },
  ];

  const DEMO_UPSELL = [
    { id: 'polished-titanium-silver-snake-hinged-segment-ring', name: 'Blue Banana Polished Titanium Snake Hinged Segment Ring (Silver)', price: 19.99 },
    { id: 'blue-banana-gold-plated-silver-1-0mm-cylinder-closure-ring', name: 'Blue Banana Silver 1.0mm Cylinder Closure Ring (Gold Plated)', price: 3.99 },
    { id: 'blue-banana-14k-gold-1-2-x-10mm-clear-stones-hinged-segment-ring-gold', name: 'Blue Banana 14K Gold 1.2 X 10mm Clear Stones Hinged Segment Ring (Gold)', price: 159.99 },
    { id: 'blue-banana-heart-left-hinged-segment-ring-clear', name: 'Blue Banana 14K Gold 1.2 x 8mm Left Cubic Zirconia Heart Hinged Segment Ring (Clear)', price: 109.99, was: 131.99 },
  ];

  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const imageFor = (id) => `images/products/${id}-480.jpg`;
  const urlFor = (product) => product.url || PRODUCT_URL + product.id;

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

  function priceEl(product, className) {
    if (!product.was) return el('p', { class: className }, el('span', { class: 'price', text: gbp.format(product.price) }));
    return el('p', { class: className },
      el('span', { class: 'price price--sale' }, el('span', { class: 'sr-only', text: 'Now ' }), gbp.format(product.price)),
      ' ',
      el('s', { class: 'price price--was' }, el('span', { class: 'sr-only', text: 'was ' }), gbp.format(product.was)));
  }

  const drawer = $('#cart-drawer');
  const drawerBackdrop = $('.drawer-backdrop');
  const cartOpenBtn = $('[data-cart-open]');
  const cartCount = $('[data-cart-count]');
  const cartList = $('[data-cart-items]');
  const cartEmpty = $('[data-cart-empty]');
  const cartSubtotal = $('[data-cart-subtotal]');
  const upsellList = $('[data-upsell]');
  const announcer = $('[data-cart-announce]');

  const cart = DEMO_CART.map((item) => ({ ...item }));
  const rows = new Map();

  function announce(message) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 50);
  }

  function bumpCount() {
    cartCount.classList.remove('is-bumped');
    void cartCount.offsetWidth; // restart the animation
    cartCount.classList.add('is-bumped');
  }

  function updateTotals() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    cartCount.textContent = String(count);
    cartCount.hidden = count === 0;
    cartOpenBtn.setAttribute('aria-label', count ? `View cart, ${count} item${count === 1 ? '' : 's'}` : 'View cart, empty');
    cartSubtotal.textContent = gbp.format(total);
    cartEmpty.hidden = cart.length > 0;
  }

  function createRow(item) {
    const value = el('span', { class: 'qty__value', text: String(item.qty) });
    const dec = el('button', { type: 'button', 'aria-label': `Decrease quantity of ${item.name}` }, '−');
    const inc = el('button', { type: 'button', 'aria-label': `Increase quantity of ${item.name}` }, '+');
    const remove = el('button', { type: 'button', class: 'cart-item__remove', 'aria-label': `Remove ${item.name}`, text: 'Remove' });

    const row = el('li', { class: 'cart-item' },
      el('a', { class: 'cart-item__media', href: urlFor(item), tabindex: '-1', 'aria-hidden': 'true' },
        el('img', { src: imageFor(item.id), alt: '', width: '146', height: '146', loading: 'lazy', decoding: 'async' })),
      el('div', { class: 'cart-item__info' },
        el('a', { class: 'cart-item__name', href: urlFor(item), text: item.name }),
        item.variant ? el('p', { class: 'cart-item__variant', text: item.variant }) : null,
        priceEl(item, 'cart-item__price'),
        el('div', { class: 'cart-item__row' },
          el('div', { class: 'qty', role: 'group', 'aria-label': `Quantity of ${item.name}` }, dec, value, inc),
          remove)));

    const sync = () => {
      value.textContent = String(item.qty);
      setDisabled(dec, item.qty <= 1, inc);
      setDisabled(inc, item.qty >= MAX_QTY, dec);
    };

    const change = (delta) => {
      item.qty = Math.min(MAX_QTY, Math.max(1, item.qty + delta));
      sync();
      updateTotals();
      announce(`${item.name}, quantity ${item.qty}`);
    };

    dec.addEventListener('click', () => change(-1));
    inc.addEventListener('click', () => change(1));
    remove.addEventListener('click', () => {
      const target = row.nextElementSibling || row.previousElementSibling;
      cart.splice(cart.indexOf(item), 1);
      rows.delete(item.id);
      row.remove();
      updateTotals();
      announce(`${item.name} removed from your cart`);
      (target ? $('.cart-item__remove', target) : $('.cart-drawer__close')).focus();
    });

    rows.set(item.id, { row, sync });
    sync();
    return row;
  }

  function addToCart(product) {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.qty = Math.min(MAX_QTY, existing.qty + 1);
      rows.get(existing.id).sync();
    } else {
      const item = { ...product, qty: 1 };
      cart.push(item);
      cartList.append(createRow(item));
    }
    updateTotals();
    bumpCount();
    announce(`${product.name} added to your cart`);
  }

  function renderUpsell() {
    upsellList.replaceChildren(...DEMO_UPSELL.map((product) => {
      const overlay = el('span', { class: 'upsell-card__overlay', 'aria-hidden': 'true', text: '+ Add' });
      const add = el('button', { type: 'button', class: 'upsell-card__add', 'aria-label': `Add ${product.name} to cart` },
        el('img', { src: imageFor(product.id), alt: '', width: '150', height: '150', loading: 'lazy', decoding: 'async' }),
        overlay);
      let resetTimer = 0;
      add.addEventListener('click', () => {
        addToCart(product);
        add.classList.add('is-added');
        overlay.textContent = 'Added';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          add.classList.remove('is-added');
          overlay.textContent = '+ Add';
        }, 1500);
      });
      return el('li', { class: 'upsell-card' },
        add,
        el('a', { class: 'upsell-card__name', href: urlFor(product), text: product.name }),
        priceEl(product, 'upsell-card__price'));
    }));
  }

  let cartIsOpen = false;
  let cartReturnFocus = null;

  function openCart() {
    if (cartIsOpen) return;
    closeNav({ returnFocus: false });
    closeMega();
    closeSearch();
    closeLocale();
    cartIsOpen = true;
    cartReturnFocus = document.activeElement;
    drawer.inert = false;
    drawer.classList.add('is-open');
    drawerBackdrop.classList.add('is-open');
    cartOpenBtn.setAttribute('aria-expanded', 'true');
    // Move focus into the drawer before the header (and the bag button) becomes inert.
    $('.cart-drawer__close').focus({ preventScroll: true });
    setPageInert(true, 'cart');
    lockScroll();
    const upsellScroller = $('[data-scroller]', drawer);
    if (upsellScroller && upsellScroller.updateScroller) upsellScroller.updateScroller();
  }

  function closeCart() {
    if (!cartIsOpen) return;
    cartIsOpen = false;
    drawer.classList.remove('is-open');
    drawerBackdrop.classList.remove('is-open');
    cartOpenBtn.setAttribute('aria-expanded', 'false');
    drawer.inert = true;
    setPageInert(false, 'cart');
    unlockScroll();
    const back = cartReturnFocus && document.contains(cartReturnFocus) && cartReturnFocus !== document.body ? cartReturnFocus : cartOpenBtn;
    back.focus();
  }

  cartOpenBtn.addEventListener('click', openCart);
  $$('[data-cart-close]').forEach((node) => node.addEventListener('click', closeCart));

  cartList.replaceChildren(...cart.map(createRow));
  renderUpsell();
  updateTotals();
  $$('[data-scroller]').forEach(initScroller);

  /* ---------- Newsletter ----------
     Hand-off: swap the redirect for a request to the mailing-list provider. */
  const newsletter = $('[data-newsletter]');
  if (newsletter) {
    const input = $('input[type="email"]', newsletter);
    const message = $('[data-newsletter-msg]', newsletter);
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setMessage = (text, isError) => {
      message.textContent = text;
      message.classList.toggle('is-error', isError);
    };

    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!EMAIL.test(value)) {
        input.setAttribute('aria-invalid', 'true');
        setMessage(value ? 'Please enter a valid email address.' : 'Please enter your email address.', true);
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      setMessage('Nearly there! Taking you to our sign-up page to confirm your details…', false);
      setTimeout(() => { window.location.href = newsletter.action; }, 1200);
    });

    input.addEventListener('input', () => {
      if (!input.hasAttribute('aria-invalid')) return;
      input.removeAttribute('aria-invalid');
      setMessage('', false);
    });
  }

  /* ---------- Global keyboard + outside-click handling ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (cartIsOpen) trapFocus(drawer, e);
      else if (navIsOpen) trapFocus(nav, e);
      return;
    }
    if (e.key !== 'Escape') return;
    if (cartIsOpen) closeCart();
    else if (navIsOpen) closeNav();
    else if (searchIsOpen) closeSearch({ returnFocus: true });
    else if (localeIsOpen) closeLocale({ returnFocus: true });
    else if (openItem) closeMega({ returnFocus: true });
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (openItem && desktopMQ.matches && !openItem.contains(target)) closeMega();
    if (localeIsOpen && !locale.contains(target)) closeLocale();
    if (searchIsOpen && !search.contains(target) && !searchToggle.contains(target)) closeSearch();
  });
})();
