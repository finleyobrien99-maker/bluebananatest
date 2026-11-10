/* ==========================================================================
   Blue Banana taxon (product list) page
   Filters drawer, applied-filter chips, Sort By / View menus, Load More,
   SEO Read More. Runs after js/main.js (header, footer, scrollers, cart drawer).

   DEMO MODE: filtering, sorting and paging run in the browser over the
   products on the page plus DEMO_MORE below. On the live site they come
   from the server: the drawer is a GET form with the live field names, and
   the page URL is kept in step with those same parameters.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

  const grid = $('[data-grid]');
  if (!grid) return;

  /* ---------- Demo data ----------
     The next "pages" of products for Load More. The first item is the Hell Bunny
     Love-A-Lot product that sits under the promo tile in the XD; the rest are live
     clothing products already used on the homepage. Hand-off: replace with the
     taxon's paginated product endpoint (the live page uses ?page=2 etc.). */
  const DEMO_MORE = [
    {"url": "https://www.bluebanana.com/en_GB/section/hell-bunny", "img": "images/taxon/products/hell-bunny-love-a-lot", "name": "Hell Bunny X Care Bear Love-A-Lot (Black)", "price": 54.99, "todo": true, "attrs": {"brand": "hell-bunny", "type": "skirt", "colour": "black", "style": "kawaii", "bottoms": "xs s m l xl"}},
    {"url": "https://www.bluebanana.com/en_GB/products/the-offspring-arrow-heart-crop-t-shirt", "img": "images/products/the-offspring-arrow-heart-crop-t-shirt", "name": "Official The Offspring Arrow Heart Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "the-offspring", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/falling-in-reverse-metal-logo-crop-t-shirt", "img": "images/products/falling-in-reverse-metal-logo-crop-t-shirt", "name": "Official Falling In Reverse Metal Logo Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "falling-in-reverse", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/hell-bunny-ma-boheme-mini-dress", "img": "images/products/hell-bunny-ma-boheme-mini-dress", "name": "Hell Bunny Ma Boheme Mini Dress (Pink)", "price": 40.0, "was": 64.99, "attrs": {"brand": "hell-bunny", "type": "dress", "colour": "pink", "style": "vintage", "dress": "xs s m l xl 2xl"}},
    {"url": "https://www.bluebanana.com/en_GB/products/black-sabbath-dancing-ladies-crop-t-shirt", "img": "images/products/black-sabbath-dancing-ladies-crop-t-shirt", "name": "Official Black Sabbath Dancing Ladies Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "black-sabbath", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/banned-morena-tropical-dress", "img": "images/products/banned-morena-tropical-dress", "name": "Banned Morena Tropical Dress (Multicolour)", "price": 50.0, "was": 79.99, "attrs": {"brand": "banned", "type": "dress", "colour": "multi-coloured", "style": "flower", "range": "banned-alternative-clothing", "dress": "xs s m l xl 2xl"}},
    {"url": "https://www.bluebanana.com/en_GB/products/black-sabbath-daemon-ring-crop-t-shirt", "img": "images/products/black-sabbath-daemon-ring-crop-t-shirt", "name": "Official Black Sabbath Daemon Ring Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "black-sabbath", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/vixxsin-junia-maxi-dress", "img": "images/products/vixxsin-junia-maxi-dress", "name": "Vixxsin Junia Maxi Dress (Black)", "price": 30.0, "was": 59.99, "attrs": {"brand": "vixxsin", "type": "dress", "colour": "black", "style": "gothic", "dress": "xs s m l xl 2xl"}},
    {"url": "https://www.bluebanana.com/en_GB/products/fall-out-boy-repeat-crop-t-shirt", "img": "images/products/fall-out-boy-repeat-crop-t-shirt", "name": "Official Fall Out Boy Repeat Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "fall-out-boy", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/jort-doe-animal", "img": "images/products/jort-doe-animal", "name": "The Ragged Priest Doe Jorts (Beige)", "price": 40.0, "was": 64.99, "attrs": {"brand": "the-ragged-priest", "type": "shorts", "colour": "beige", "style": "grunge", "bottoms": "26 28 30 32"}},
    {"url": "https://www.bluebanana.com/en_GB/products/bad-omens-dagger-skull-crop-t-shirt", "img": "images/products/bad-omens-dagger-skull-crop-t-shirt", "name": "Official Bad Omens Dagger & Skull Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "bad-omens", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/jeans-gingham-blue", "img": "images/products/jeans-gingham-blue", "name": "The Ragged Priest Gingham Jeans (Blue)", "price": 50.0, "was": 74.99, "attrs": {"brand": "the-ragged-priest", "type": "trousers", "colour": "blue", "style": "grunge", "bottoms": "26 28 30 32 34"}},
    {"url": "https://www.bluebanana.com/en_GB/products/the-offspring-skull-check-crop-t-shirt", "img": "images/products/the-offspring-skull-check-crop-t-shirt", "name": "Official The Offspring Skull Check Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "the-offspring", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/skirt-heartbreaker-blk", "img": "images/products/skirt-heartbreaker-blk", "name": "Banned Heartbreaker Skirt (Black)", "price": 20.0, "was": 34.99, "attrs": {"brand": "banned", "type": "skirt", "colour": "black", "style": "heart", "range": "banned-alternative-clothing", "bottoms": "xs s m l xl"}},
    {"url": "https://www.bluebanana.com/en_GB/products/system-of-a-down-bird-flight-crop-t-shirt", "img": "images/products/system-of-a-down-bird-flight-crop-t-shirt", "name": "Official System Of A Down Bird Flight Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "system-of-a-down", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/top-heartbreaker-blk", "img": "images/products/top-heartbreaker-blk", "name": "Banned Heartbreaker Top (Black)", "price": 10.0, "was": 29.99, "attrs": {"brand": "banned", "type": "top", "size": "xs s m l xl", "colour": "black", "style": "heart", "range": "banned-alternative-clothing"}},
    {"url": "https://www.bluebanana.com/en_GB/products/system-of-a-down-byob-crop-t-shirt", "img": "images/products/system-of-a-down-byob-crop-t-shirt", "name": "Official System Of A Down BYOB Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "system-of-a-down", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/dress-lunar-veil-blk", "img": "images/products/dress-lunar-veil-blk", "name": "Banned Lunar Veil Dress (Black)", "price": 40.0, "was": 64.99, "attrs": {"brand": "banned", "type": "dress", "colour": "black", "style": "gothic", "range": "banned-alternative-clothing", "dress": "xs s m l xl 2xl"}},
    {"url": "https://www.bluebanana.com/en_GB/products/pierce-the-veil-wavy-skeleton-crop-t-shirt", "img": "images/products/pierce-the-veil-wavy-skeleton-crop-t-shirt", "name": "Official Pierce The Veil Wavy Skeleton Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "pierce-the-veil", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/jumper-panic-purrfect-blk", "img": "images/products/jumper-panic-purrfect-blk", "name": "Banned Panic Purrfect Jumper (Black)", "price": 20.0, "was": 39.99, "attrs": {"brand": "banned", "type": "jumper", "size": "xs s m l xl 2xl", "colour": "black", "style": "cat", "range": "banned-alternative-clothing"}},
    {"url": "https://www.bluebanana.com/en_GB/products/bad-omens-take-me-crop-t-shirt", "img": "images/products/bad-omens-take-me-crop-t-shirt", "name": "Official Bad Omens Take Me Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "bad-omens", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/top-wild-instincts-leo", "img": "images/products/top-wild-instincts-leo", "name": "Banned Wild Instincts Top (Leopard Print)", "price": 10.0, "was": 29.99, "attrs": {"brand": "banned", "type": "top", "size": "xs s m l xl", "colour": "multi-coloured", "style": "animals", "range": "banned-alternative-clothing"}},
    {"url": "https://www.bluebanana.com/en_GB/products/slipknot-the-end-mesh-crop-t-shirt", "img": "images/products/slipknot-the-end-mesh-crop-t-shirt", "name": "Official Slipknot The End Mesh Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "slipknot", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/vixxsin-dahlia-gothic-corset-black", "img": "images/products/vixxsin-dahlia-gothic-corset-black", "name": "Vixxsin Dahlia Gothic Corset (Black)", "price": 29.99, "attrs": {"brand": "vixxsin", "type": "corset", "size": "xs s m l xl 2xl", "colour": "black", "style": "gothic"}},
    {"url": "https://www.bluebanana.com/en_GB/products/ghost-opus-mesh-crop-t-shirt", "img": "images/products/ghost-opus-mesh-crop-t-shirt", "name": "Official Ghost Opus Mesh Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "ghost", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/hr-stripe-dot-dress-black-white", "img": "images/products/hr-stripe-dot-dress-black-white", "name": "H&R London Striped Dot Dress (Black/White)", "price": 20.0, "attrs": {"brand": "h-r-london", "type": "dress", "colour": "black white", "style": "stripe", "dress": "uk-8 uk-10 uk-12 uk-14 uk-16"}},
    {"url": "https://www.bluebanana.com/en_GB/products/ozzy-osbourne-logo-mesh-crop-t-shirt", "img": "images/products/ozzy-osbourne-logo-mesh-crop-t-shirt", "name": "Official Ozzy Osbourne Logo Mesh Crop T-Shirt (Multicolour)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "multi-coloured", "style": "band", "band": "ozzy-osbourne", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/hell-bunny-black-harley-mini-dress", "img": "images/products/hell-bunny-black-harley-mini-dress", "name": "Hell Bunny Harley Mini Dress (Black)", "price": 47.99, "attrs": {"brand": "hell-bunny", "type": "dress", "colour": "black", "style": "50s", "dress": "xs s m l xl 2xl"}},
    {"url": "https://www.bluebanana.com/en_GB/products/ofiicial-nirvana-happy-face-mesh-crop-top-black", "img": "images/products/ofiicial-nirvana-happy-face-mesh-crop-top-black", "name": "Official Nirvana Happy Face Mesh Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "nirvana", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/official-my-chemical-romance-march-crop-top-black", "img": "images/products/official-my-chemical-romance-march-crop-top-black", "name": "Official My Chemical Romance March Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "my-chemical-romance", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/nothing-more-arrows-t-shirt", "img": "images/products/nothing-more-arrows-t-shirt", "name": "Official Nothing More Arrows T-Shirt (Carbon)", "price": 10.0, "was": 20.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "grey", "style": "band", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/official-green-day-american-dream-crop-top-black", "img": "images/products/official-green-day-american-dream-crop-top-black", "name": "Official Green Day American Dream Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "green-day", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/official-bring-me-the-horizon-genxsis-logo-crop-top-black", "img": "images/products/official-bring-me-the-horizon-genxsis-logo-crop-top-black", "name": "Official Bring Me The Horizon Metal Logo Genxsis Crop T-Shirt (Black)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black", "style": "band", "band": "bring-me-the-horizon", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/black-sabbath-wavy-logo-t-shirt", "img": "images/products/black-sabbath-wavy-logo-t-shirt", "name": "Official Black Sabbath Wavy Logo T-Shirt (Black/Purple)", "price": 18.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "black purple", "style": "band", "band": "black-sabbath", "range": "official-band-t-shirts"}},
    {"url": "https://www.bluebanana.com/en_GB/products/metallica-justice-neon-grey-unisex-t-shirt", "img": "images/products/metallica-justice-neon-grey-unisex-t-shirt", "name": "Official Metallica Justice Neon T-Shirt (Grey)", "price": 10.0, "was": 24.99, "attrs": {"brand": "official-band-merchandise", "type": "t-shirt", "size": "s m l xl 2xl", "colour": "grey", "style": "band", "band": "metallica", "range": "official-band-t-shirts"}}
  ];
  // END DEMO_MORE

  const TOTAL = Number(grid.dataset.total) || 0;
  const GROUPS = ['brand', 'type', 'size', 'colour', 'style', 'band', 'range', 'bottoms', 'dress'];
  const promo = $('[data-promo]', grid);
  const announcer = $('[data-taxon-announce]');

  let pageSize = 24;
  let sortValue = '';
  let poolIndex = 0;
  let nextIndex = $$('.tile[data-index]', grid).length;

  const productTiles = () => $$('.tile[data-index]', grid);
  // How many products the shopper has paged to (unfiltered): page 1, plus each Load More.
  let pageCount = productTiles().length;
  const announce = (text) => {
    if (!announcer) return;
    announcer.textContent = '';
    window.setTimeout(() => { announcer.textContent = text; }, 60);
  };

  /* ---------- Building a tile (same markup as the tiles in taxon.html) ---------- */
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value == null) return;
      if (key === 'className') node.className = value;
      else if (key === 'text') node.textContent = value;
      else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach((child) => child && node.append(child));
    return node;
  }

  function priceEl(item) {
    const wrap = el('span', { className: 'tile__price' });
    if (item.was) {
      wrap.append(
        el('span', { className: 'price price--sale' }, el('span', { className: 'sr-only', text: 'Now ' }), gbp.format(item.price)),
        ' ',
        el('s', { className: 'price price--was' }, el('span', { className: 'sr-only', text: 'was ' }), gbp.format(item.was)),
      );
    } else {
      wrap.append(el('span', { className: 'price', text: gbp.format(item.price) }));
    }
    return wrap;
  }

  function tileFrom(item) {
    const data = {};
    Object.entries(item.attrs || {}).forEach(([key, value]) => { data[`data-${key}`] = value; });
    const img = el('img', {
      src: `${item.img}-480.jpg`,
      srcset: `${item.img}-480.jpg 480w, ${item.img}-840.jpg 840w`,
      sizes: '(min-width: 1280px) 400px, (min-width: 600px) 31vw, 46vw',
      width: 480, height: 480, alt: '', loading: 'lazy', decoding: 'async',
    });
    const tile = el('li', { className: 'tile', 'data-index': nextIndex++, 'data-price': item.price.toFixed(2), ...data },
      el('a', { className: 'tile__link', href: item.url, 'data-todo-url': item.todo || false },
        el('span', { className: 'tile__media' }, img),
        el('span', { className: 'tile__name', text: item.name }),
        priceEl(item)));
    return tile;
  }

  // Demo: once the DEMO_MORE products have all been shown, they repeat (marked data-demo-repeat),
  // so Load More can run all the way to the taxon's total and the progress line can fill.
  function loadFromPool(count) {
    const room = TOTAL - productTiles().length;
    const tiles = [];
    for (let i = 0; i < Math.min(count, room); i++) {
      const tile = tileFrom(DEMO_MORE[poolIndex % DEMO_MORE.length]);
      if (poolIndex >= DEMO_MORE.length) tile.dataset.demoRepeat = '';
      tiles.push(tile);
      poolIndex++;
    }
    grid.append(...tiles);
    return tiles;
  }
  const isRepeat = (tile) => 'demoRepeat' in tile.dataset;

  /* ---------- Filter state ---------- */
  const form = $('[data-filters-form]');
  const inputs = form ? $$('.check__input', form) : [];
  const groupOf = (input) => input.closest('[data-facet]').dataset.facet;
  const labelOf = (input) => $('.check__label', input.closest('.check')).firstChild.textContent.trim();
  const facetTitle = (input) => $('[data-facet-toggle]', input.closest('[data-facet]')).firstChild.textContent.trim();

  function activeFilters() {
    const active = {};
    inputs.filter((input) => input.checked).forEach((input) => {
      (active[groupOf(input)] ||= []).push(input.dataset.match);
    });
    return active;
  }

  function tileMatches(tile, active) {
    return Object.entries(active).every(([group, values]) => {
      const own = (tile.dataset[group] || '').split(' ');
      return values.some((value) => own.includes(value));
    });
  }

  /* ---------- Sorting (demo) ---------- */
  const wasPrice = (tile) => {
    const was = $('.price--was', tile);
    return was ? Number(was.textContent.replace(/[^\d.]/g, '')) : 0;
  };
  const discount = (tile) => {
    const was = wasPrice(tile);
    return was ? (was - Number(tile.dataset.price)) / was : 0;
  };
  const nameOf = (tile) => $('.tile__name', tile).textContent;
  const COMPARE = {
    'price-asc': (a, b) => a.dataset.price - b.dataset.price,
    'price-desc': (a, b) => b.dataset.price - a.dataset.price,
    'discount-desc': (a, b) => discount(b) - discount(a),
    'discount-asc': (a, b) => discount(a) - discount(b),
    'alphabetical-asc': (a, b) => nameOf(a).localeCompare(nameOf(b)),
    'alphabetical-desc': (a, b) => nameOf(b).localeCompare(nameOf(a)),
    'product_created_at-desc': (a, b) => b.dataset.index - a.dataset.index,
  };
  const byIndex = (a, b) => a.dataset.index - b.dataset.index;

  function sortTiles() {
    const compare = COMPARE[sortValue] || byIndex;
    productTiles().sort((a, b) => compare(a, b) || byIndex(a, b)).forEach((tile) => grid.append(tile));
  }

  // The promo tile keeps the 5th place in the grid (row 2 on desktop, row 3 on phones).
  function placePromo(visibleTiles) {
    if (!promo) return;
    promo.hidden = visibleTiles.length === 0;
    const anchor = visibleTiles[4];
    if (anchor) grid.insertBefore(promo, anchor);
    else grid.append(promo);
  }

  /* ---------- Render ---------- */
  const countEl = $('[data-product-count]');
  const pagerStatus = $('[data-pager-status]');
  // Progress line: the share of the taxon's products currently shown on the page.
  const pagerFill = $('[data-pager-fill]');
  const loadMore = $('[data-load-more]');
  const emptyState = $('[data-grid-empty]');
  const appliedWrap = $('[data-applied]');
  const appliedList = $('[data-applied-list]');
  const drawerChips = $('[data-drawer-chips]');
  const drawerChipList = $('[data-drawer-chip-list]');
  const filtersBadge = $('[data-filters-badge]');

  function render() {
    const active = activeFilters();
    const filtering = Object.keys(active).length > 0;

    // Demo: filters and sorting cover every demo product, as the server's would cover the
    // whole taxon. Unfiltered, the first pageCount products of the sorted set are shown.
    if (filtering || sortValue) loadFromPool(Math.max(0, DEMO_MORE.length - poolIndex));
    else if (productTiles().length < pageCount) loadFromPool(pageCount - productTiles().length);

    sortTiles();
    const visible = [];
    productTiles().forEach((tile) => {
      // Filtered results leave out the demo repeats, so each product appears once
      const show = filtering ? !isRepeat(tile) && tileMatches(tile, active) : visible.length < pageCount;
      tile.hidden = !show;
      if (show) visible.push(tile);
    });
    placePromo(visible);

    const shown = visible.length;
    const total = filtering ? shown : TOTAL;
    countEl.textContent = total.toLocaleString('en-GB');
    pagerStatus.textContent = `Viewing ${shown.toLocaleString('en-GB')} of ${total.toLocaleString('en-GB')} Products`;
    pagerFill.style.width = `${total ? Math.min(100, (shown / total) * 100) : 0}%`;
    loadMore.hidden = filtering || shown >= TOTAL;
    $('[data-pager]').hidden = shown === 0;
    emptyState.hidden = shown !== 0;

    renderChips();
    syncUrl();
    return shown;
  }

  /* ---------- Chips: on the page (small) and in the drawer (42px) ---------- */
  function chip(input, onRemove) {
    const label = labelOf(input);
    const button = el('button', { className: 'chip', type: 'button', 'aria-label': `Remove filter: ${facetTitle(input)} ${label}` },
      label, svgIcon('i-xmark'));
    button.addEventListener('click', () => { input.checked = false; onRemove(input); });
    return el('li', {}, button);
  }

  function resetChip(onReset) {
    const button = el('button', { className: 'chip chip--reset', type: 'button', text: 'Reset' });
    button.addEventListener('click', onReset);
    return el('li', {}, button);
  }

  function svgIcon(id) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  }

  function renderChips() {
    const checked = inputs.filter((input) => input.checked);

    appliedList.replaceChildren(
      ...checked.map((input) => chip(input, () => {
        const shown = render();
        announce(`Filter removed. Showing ${shown} products.`);
        (($('.chip', appliedList)) || $('[data-filters-open]')).focus();
      })),
      ...(checked.length ? [resetChip(() => { resetFilters(); announce('Filters reset.'); $('[data-filters-open]').focus(); })] : []),
    );
    appliedWrap.hidden = checked.length === 0;
    renderDrawerChips();

    filtersBadge.hidden = checked.length === 0;
    filtersBadge.textContent = checked.length;
    $('[data-filters-open]').setAttribute('aria-label', checked.length ? `Filters, ${checked.length} applied` : 'Filters');
  }

  function renderDrawerChips() {
    const checked = inputs.filter((input) => input.checked);
    drawerChipList.replaceChildren(
      ...checked.map((input) => chip(input, () => {
        updateFacetCounts();
        renderDrawerChips();
        (($('.chip', drawerChipList)) || $('[data-facet-toggle]', form)).focus();
      })),
      ...(checked.length ? [resetChip(() => {
        inputs.forEach((input) => { input.checked = false; });
        updateFacetCounts();
        renderDrawerChips();
        $('[data-facet-toggle]', form).focus();
      })] : []),
    );
    drawerChips.hidden = checked.length === 0;
  }

  function updateFacetCounts() {
    $$('[data-facet]', form).forEach((facet) => {
      const n = $$('.check__input:checked', facet).length;
      $('[data-facet-count]', facet).textContent = n ? ` (${n})` : '';
    });
  }

  function resetFilters() {
    inputs.forEach((input) => { input.checked = false; });
    updateFacetCounts();
    render();
  }

  /* ---------- URL: same parameters as the live taxon page ---------- */
  function syncUrl() {
    if (!form || !window.history.replaceState) return;
    const params = new URLSearchParams(new FormData(form));
    if (sortValue) params.set('order_by_sort', sortValue);
    if (pageSize !== 24) params.set('limit', pageSize);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, name) => {
      inputs.filter((input) => input.name === name && input.value === value).forEach((input) => { input.checked = true; });
    });
    return { sort: params.get('order_by_sort') || '', limit: params.get('limit') || '' };
  }

  /* ---------- Filters drawer ---------- */
  const drawer = $('#filters');
  const backdrop = $('.filters-backdrop');
  const openBtn = $('[data-filters-open]');
  const PAGE_REGIONS = ['.skip-link', '#site-header', '.promo-bar', '#main', '.site-footer'];
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let drawerOpen = false;
  let lastFocus = null;

  function setPageInert(on) {
    PAGE_REGIONS.forEach((sel) => { const node = $(sel); if (node) node.inert = on; });
  }
  function lockScroll(on) {
    const root = document.documentElement;
    if (on) root.style.setProperty('--scrollbar-w', `${window.innerWidth - root.clientWidth}px`);
    root.classList.toggle('is-locked', on);
  }

  function openFilters() {
    if (drawerOpen) return;
    drawerOpen = true;
    lastFocus = document.activeElement;
    // Open the groups that already have something chosen
    $$('[data-facet]', form).forEach((facet) => setFacetOpen(facet, !!$('.check__input:checked', facet)));
    renderDrawerChips();
    updateFacetCounts();
    document.documentElement.classList.add('filters-open');
    openBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    setPageInert(true);
    window.setTimeout(() => $('.filters__close', drawer).focus(), reduceMotion.matches ? 0 : 60);
  }

  function closeFilters({ apply = true } = {}) {
    if (!drawerOpen) return;
    drawerOpen = false;
    document.documentElement.classList.remove('filters-open');
    openBtn.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    setPageInert(false);
    if (apply) {
      const shown = render();
      announce(`Showing ${shown} products.`);
    }
    const returnTo = lastFocus && lastFocus !== document.body && document.contains(lastFocus) && !drawer.contains(lastFocus);
    (returnTo ? lastFocus : openBtn).focus();
  }

  function setFacetOpen(facet, open) {
    facet.classList.toggle('is-open', open);
    $('[data-facet-toggle]', facet).setAttribute('aria-expanded', String(open));
  }

  if (drawer && form) {
    openBtn.addEventListener('click', (e) => { e.preventDefault(); openFilters(); });
    $$('[data-filters-close]').forEach((node) => node.addEventListener('click', (e) => { e.preventDefault(); closeFilters(); }));
    backdrop.addEventListener('click', () => closeFilters());
    form.addEventListener('submit', (e) => { e.preventDefault(); closeFilters(); });

    $$('[data-facet-toggle]', form).forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const facet = toggle.closest('[data-facet]');
        setFacetOpen(facet, !facet.classList.contains('is-open'));
      });
    });

    form.addEventListener('change', (e) => {
      if (!e.target.matches('.check__input')) return;
      updateFacetCounts();
      renderDrawerChips();
    });

    document.addEventListener('keydown', (e) => {
      if (!drawerOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); closeFilters(); return; }
      if (e.key !== 'Tab') return;
      const items = $$(FOCUSABLE, drawer).filter((node) => node.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  $$('[data-filters-reset]').forEach((button) => button.addEventListener('click', () => {
    resetFilters();
    announce('Filters reset.');
    openBtn.focus();
  }));

  /* ---------- Sort By / View menus ---------- */
  const menus = $$('[data-menu]');

  function closeMenu(menu, { focus = false } = {}) {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    const toggle = $('[data-menu-toggle]', menu);
    toggle.setAttribute('aria-expanded', 'false');
    if (focus) toggle.focus();
  }

  function openMenu(menu, { focusItem = true } = {}) {
    menus.forEach((other) => other !== menu && closeMenu(other));
    menu.classList.add('is-open');
    $('[data-menu-toggle]', menu).setAttribute('aria-expanded', 'true');
    if (focusItem) ($('[aria-checked="true"]', menu) || $('[role="menuitemradio"]', menu)).focus();
  }

  function selectItem(menu, item, { silent = false } = {}) {
    $$('[role="menuitemradio"]', menu).forEach((node) => node.setAttribute('aria-checked', String(node === item)));
    $('[data-menu-label]', menu).textContent = item.dataset.label || item.textContent;
    if (silent) return;
    const value = item.dataset.value;
    if (menu.dataset.menu === 'order_by_sort') {
      sortValue = value;
      render();
      announce(`Sorted by ${item.textContent}.`);
    } else {
      pageSize = Number(value) || 24;
      pageCount = pageSize;
      const shown = render();
      announce(`Showing ${shown} products.`);
    }
  }

  menus.forEach((menu) => {
    const toggle = $('[data-menu-toggle]', menu);
    const items = $$('[role="menuitemradio"]', menu);

    toggle.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) closeMenu(menu);
      else openMenu(menu, { focusItem: false });
    });
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(menu); }
    });

    items.forEach((item, i) => {
      item.addEventListener('click', () => { selectItem(menu, item); closeMenu(menu, { focus: true }); });
      item.addEventListener('keydown', (e) => {
        const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
        if (move) { e.preventDefault(); items[(i + move + items.length) % items.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(menu, { focus: true }); }
        else if (e.key === 'Tab') closeMenu(menu);
      });
    });
  });

  document.addEventListener('click', (e) => {
    menus.forEach((menu) => { if (!menu.contains(e.target)) closeMenu(menu); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    menus.forEach((menu) => { if (menu.contains(document.activeElement)) closeMenu(menu, { focus: true }); });
  });

  /* ---------- Load More ---------- */
  if (loadMore) {
    loadMore.addEventListener('click', (e) => {
      e.preventDefault();
      if (loadMore.classList.contains('is-loading')) return;
      loadMore.classList.add('is-loading');
      loadMore.setAttribute('aria-busy', 'true');
      // A short pause stands in for the network request.
      window.setTimeout(() => {
        const before = productTiles().filter((tile) => !tile.hidden);
        pageCount += pageSize;
        render();
        const added = productTiles().filter((tile) => !tile.hidden && !before.includes(tile));
        added.forEach((tile) => {
          tile.classList.add('is-new');
          tile.addEventListener('animationend', () => tile.classList.remove('is-new'), { once: true });
        });
        loadMore.classList.remove('is-loading');
        loadMore.removeAttribute('aria-busy');
        announce(`${added.length} more products loaded.`);
        // Keyboard users carry on from the first new product
        if (added[0] && (e.detail === 0 || document.activeElement === loadMore || loadMore.hidden)) {
          $('.tile__link', added[0]).focus({ preventScroll: false });
        }
      }, reduceMotion.matches ? 0 : 350);
    });
  }

  /* ---------- Sub-taxon buttons: drag to scroll, and a slow back-and-forth drift ----------
     The drift starts on page load, turns round at each end, pauses while the pointer is over
     the row or a button in it has focus, and stops for good once someone scrolls it themselves.
     It doesn't run for people who ask for reduced motion, or while the row is off screen. */
  const pills = $('[data-autoscroll]');
  if (pills) {
    const SPEED = 22; // px per second
    let pos = 0;
    let dir = 1;
    let last = 0;
    let hovering = false;
    let stopped = reduceMotion.matches;
    let onScreen = true;
    let ownScroll = false;

    const max = () => pills.scrollWidth - pills.clientWidth;
    const paused = () => hovering || pills.contains(document.activeElement) || !onScreen || document.hidden;

    const step = (now) => {
      if (stopped) return;
      const dt = last ? Math.min(now - last, 64) / 1000 : 0;
      last = now;
      const end = max();
      if (end > 1 && !paused()) {
        pos += dir * SPEED * dt;
        if (pos >= end) { pos = end; dir = -1; }
        else if (pos <= 0) { pos = 0; dir = 1; }
        ownScroll = true;
        pills.scrollLeft = pos;
      } else {
        pos = Math.min(Math.max(pills.scrollLeft, 0), Math.max(end, 0));
      }
      window.requestAnimationFrame(step);
    };

    const stop = () => { stopped = true; };
    pills.addEventListener('scroll', () => {
      if (ownScroll) { ownScroll = false; return; }
      // A scroll we didn't make: someone is using the row, so leave it where they put it.
      if (Math.abs(pills.scrollLeft - pos) > 2) stop();
    }, { passive: true });
    pills.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
    pills.addEventListener('pointerleave', () => { hovering = false; });
    pills.addEventListener('touchstart', stop, { passive: true });
    pills.addEventListener('wheel', stop, { passive: true });
    reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) stop(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(pills);
    }

    // Mouse drag, so desktop users can scroll it like a phone
    let drag = null;
    pills.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: pills.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 5) return;
      if (!drag.moved) { drag.moved = true; stop(); pills.classList.add('is-dragging'); }
      pills.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!drag) return;
      const { moved } = drag;
      drag = null;
      if (!moved) return;
      // Buttons ignore the pointer while .is-dragging is on, so the release after a drag
      // doesn't count as a click. It comes off once that click has been dispatched.
      window.setTimeout(() => pills.classList.remove('is-dragging'), 0);
    });

    window.requestAnimationFrame(step);
  }

  /* ---------- Start: restore filters, sort and page size from the URL ---------- */
  const fromUrl = readUrl();
  menus.forEach((menu) => {
    const value = menu.dataset.menu === 'order_by_sort' ? fromUrl.sort : fromUrl.limit;
    const item = $$('[role="menuitemradio"]', menu).find((node) => node.dataset.value === value);
    if (!value || !item) return;
    selectItem(menu, item, { silent: true });
    if (menu.dataset.menu === 'order_by_sort') sortValue = value;
    else {
      pageSize = Number(value);
      pageCount = pageSize;
    }
  });
  updateFacetCounts();
  render();
})();
