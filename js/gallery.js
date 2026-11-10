/* Blue Banana Style Gallery
   Shop The Look panel and Load More for style-inspo.html.
   main.js runs first and handles the header, menus, scrollers and cart drawer. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const root = document.documentElement;

  /* ---------- Latest Additions: Load More ----------
     Without JavaScript every look shows. Hand-off: when the gallery is fed
     from the CMS, load the next page from the server instead. */
  const grid = $('[data-look-grid]');
  const pager = $('[data-look-pager]');
  if (grid && pager) {
    const PAGE = 12;
    const cards = $$(':scope > li', grid);
    const shownEl = $('[data-look-shown]', pager);
    const fill = $('.pager__fill', pager);
    const more = $('[data-look-more]', pager);
    let shown = Math.min(PAGE, cards.length);

    const render = () => {
      cards.forEach((card, i) => { card.hidden = i >= shown; });
      shownEl.textContent = String(shown);
      fill.style.width = `${(shown / cards.length) * 100}%`;
      more.hidden = shown >= cards.length;
    };

    more.addEventListener('click', () => {
      const from = shown;
      shown = Math.min(shown + PAGE, cards.length);
      render();
      cards.slice(from, shown).forEach((card) => card.classList.add('is-new'));
      // The button may now be hidden, so move focus to the first new look.
      const first = cards[from] && $('a', cards[from]);
      if (first) first.focus();
    });

    pager.hidden = false;
    render();
  }

  /* ---------- Shop The Look panel ----------
     Every look link carries data-look="<id>". Without JavaScript the links
     open the full-size photo, as on the live page. Look data (title, brand,
     products used) is the JSON in #looks-data. */
  const dataEl = $('#looks-data');
  const panel = $('#look-panel');
  if (!dataEl || !panel) return;

  const LOOKS = JSON.parse(dataEl.textContent);
  const backdrop = $('.look-backdrop');
  const img = $('[data-look-img]', panel);
  const countEl = $('[data-look-count]', panel);
  const brandEl = $('[data-look-brand]', panel);
  const titleEl = $('[data-look-title]', panel);
  const labelEl = $('[data-look-label]', panel);
  const listEl = $('[data-look-products]', panel);
  const noteEl = $('[data-look-note]', panel);
  const brandBtn = $('[data-look-brand-btn]', panel);
  const fullEl = $('[data-look-full]', panel);
  const prevBtn = $('[data-look-prev]', panel);
  const nextBtn = $('[data-look-next]', panel);
  const closeBtn = $('.look-panel__close', panel);

  const PAGE_REGIONS = ['.skip-link', '#site-header', '.promo-bar', '#main', '.site-footer'];
  const FOCUSABLE = 'a[href], button:not([disabled])';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  let set = [];
  let index = 0;
  let trigger = null;
  let isOpen = false;

  function chevron() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-chevron');
    svg.append(use);
    return svg;
  }

  function productRow(product) {
    const name = document.createElement('span');
    name.className = 'look-product__name';
    name.textContent = product.name;
    const shop = document.createElement('span');
    shop.className = 'look-product__shop';
    shop.setAttribute('aria-hidden', 'true');
    shop.append('Shop', chevron());
    const link = document.createElement('a');
    link.className = 'look-product';
    link.href = product.url;
    link.append(name, shop);
    const li = document.createElement('li');
    li.append(link);
    return li;
  }

  function show(i) {
    index = (i + set.length) % set.length;
    const id = set[index];
    const look = LOOKS[id];
    const hasProducts = look.products.length > 0;

    img.srcset = `images/gallery/${id}-480.jpg 480w, images/gallery/${id}-840.jpg 840w`;
    img.src = `images/gallery/${id}-840.jpg`;
    img.alt = look.title;

    countEl.textContent = set.length > 1 ? `Look ${index + 1} of ${set.length}` : 'Look';
    titleEl.textContent = look.title;

    // Some brands (H&R London, Twilight) have no profile page: show the name without a link.
    brandEl.hidden = !look.brand;
    brandBtn.hidden = !(look.brand && look.brand.url);
    if (look.brand) {
      brandEl.textContent = look.brand.name;
      if (look.brand.url) brandEl.href = look.brand.url;
      else brandEl.removeAttribute('href');
    }
    if (look.brand && look.brand.url) {
      brandBtn.textContent = `More From ${look.brand.name}`;
      brandBtn.href = look.brand.url;
      // With no tagged products, the brand is the main way on, so it gets the dark button.
      brandBtn.classList.toggle('btn--dark', !hasProducts);
      brandBtn.classList.toggle('btn--light', hasProducts);
    }

    labelEl.hidden = !hasProducts;
    listEl.hidden = !hasProducts;
    noteEl.hidden = hasProducts;
    listEl.replaceChildren(...look.products.map(productRow));

    fullEl.href = look.full;
    history.replaceState(null, '', `#look-${id}`);
  }

  function setPageInert(on) {
    PAGE_REGIONS.forEach((sel) => {
      const node = $(sel);
      if (node) node.inert = on;
    });
  }

  function open(link) {
    const id = link.dataset.look;
    const setRoot = link.closest('[data-look-set]');
    set = setRoot ? [...new Set($$('[data-look]', setRoot).map((node) => node.dataset.look))] : [id];
    trigger = link;
    isOpen = true;

    show(set.indexOf(id));
    prevBtn.hidden = set.length < 2;
    nextBtn.hidden = set.length < 2;

    root.style.setProperty('--scrollbar-w', `${window.innerWidth - root.clientWidth}px`);
    root.classList.add('is-locked');
    setPageInert(true);
    panel.inert = false;
    panel.scrollTop = 0;
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    closeBtn.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    panel.inert = true;
    setPageInert(false);
    root.classList.remove('is-locked');
    history.replaceState(null, '', window.location.pathname + window.location.search);
    if (trigger && document.contains(trigger)) trigger.focus();
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-look]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!LOOKS[link.dataset.look]) return;
    e.preventDefault();
    open(link);
  });

  $$('[data-look-close]').forEach((node) => node.addEventListener('click', close));
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && set.length > 1) {
      show(index + (e.key === 'ArrowLeft' ? -1 : 1));
    } else if (e.key === 'Tab') {
      const items = $$(FOCUSABLE, panel).filter((node) => node.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // A shared link (…/style-inspo.html#look-<id>) opens that look.
  const linked = window.location.hash.match(/^#look-([\w-]+)$/);
  if (linked && LOOKS[linked[1]]) {
    const link = $(`[data-look="${linked[1]}"]`);
    if (link) open(link);
  }
})();
