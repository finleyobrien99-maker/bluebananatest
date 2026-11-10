/* Blue Banana New In page
   - Drops: new arrivals grouped by the day they landed, newest first. Each drop shows a 2 x 2 lead
     tile plus a few more products, then Show All.
   - The category pills, brand menu and "New Since Your Visit" filter every drop at once. The choice
     is kept in the URL (?cat=footwear&brand=dr-martens&fresh=1) so it can be linked to.
   - Remembers the visitor's last visit in localStorage and flags the drops that have landed since.
     Preview it with ?since=2026-11-05 (treats 5 Nov as the last visit).
   - The drop list beside the timeline follows the scroll position.
   Loads after main.js, which runs the header, scrollers, newsletter and cart drawer. */
(() => {
  const root = document.querySelector('[data-newin]');
  if (!root) return;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

  /* ---------- Sticky offsets: the category bar sits under the sticky header ---------- */
  const header = $('#site-header');
  const bar = $('[data-newin-bar]');
  const setOffsets = () => {
    const style = document.documentElement.style;
    if (header) style.setProperty('--header-h', `${header.offsetHeight}px`);
    if (bar) style.setProperty('--newin-bar-h', `${bar.offsetHeight}px`);
  };
  setOffsets();
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(setOffsets);
    if (header) ro.observe(header);
    if (bar) ro.observe(bar);
  }

  /* ---------- Dates: "Today" and "Yesterday" labels ---------- */
  const DAY = 864e5;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parseDay = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysAgo = (date) => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return Math.round((today - day) / DAY);
  };
  const formatDay = (date) => `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;

  $$('[data-rel]').forEach((el) => {
    const ago = daysAgo(parseDay(el.dataset.rel));
    const text = ago === 0 ? 'Today' : ago === 1 ? 'Yesterday' : '';
    if (!text) return;
    el.textContent = text;
    el.hidden = false;
    el.parentElement.classList.add('has-rel');
  });

  /* ---------- Last visit ----------
     localStorage keeps the time of the latest visit. A new browser session moves it to "since",
     so refreshing the page doesn't clear the flags.
     Hand-off: with real arrival times, compare product_created_at with the same value. */
  const KEY = 'bb-new-in-visit';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }
  let newSession = true;
  try {
    newSession = !sessionStorage.getItem(KEY);
    sessionStorage.setItem(KEY, '1');
  } catch (e) { /* storage blocked: treat every view as a new session */ }
  if (newSession) saved.since = saved.last || null;
  saved.last = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* storage blocked */ }

  const params = new URLSearchParams(window.location.search);
  let since = saved.since ? new Date(saved.since) : null;
  const preview = params.get('since');
  if (preview && /^\d{4}-\d{2}-\d{2}$/.test(preview)) since = new Date(parseDay(preview).getTime() + DAY - 1);

  /* ---------- Drops ---------- */
  const drops = $$('[data-drop]').map((el) => {
    const nav = $(`[data-nav-drop="${el.id}"]`);
    const drop = {
      el,
      date: parseDay(el.dataset.date),
      tiles: $$('.tile', el),
      count: $('[data-drop-count]', el),
      brands: $('[data-drop-brands]', el),
      flag: $('[data-drop-flag]', el),
      more: $('[data-drop-more]', el),
      nav,
      navCount: nav && $('[data-nav-count]', nav),
      expanded: false,
    };
    drop.fresh = !!since && drop.date > since;
    if (drop.fresh) {
      el.classList.add('is-fresh');
      drop.flag.hidden = false;
      if (nav) nav.classList.add('is-fresh');
    }
    return drop;
  });
  const freshTotal = drops.reduce((n, d) => n + (d.fresh ? d.tiles.length : 0), 0);

  /* ---------- Filters ---------- */
  const state = { cat: 'all', brand: 'all', fresh: false };
  const catButtons = $$('[data-cat]', bar);
  const freshItem = $('[data-fresh-item]', bar);
  const freshBtn = $('[data-fresh]', bar);
  const freshCount = $('[data-fresh-count]', bar);
  const status = $('[data-newin-status]', root);
  const empty = $('[data-newin-empty]', root);
  const interlude = $('[data-interlude]', root);
  const brandMenu = $('[data-brand-menu]', root);
  const brandItems = brandMenu ? $$('[data-brand-value]', brandMenu) : [];
  const brandLabel = brandMenu && $('[data-menu-label]', brandMenu);
  const SIZES_TILE = root.dataset.sizesTile;
  const SIZES_LEAD = root.dataset.sizesLead;

  if (freshTotal && freshItem) freshItem.hidden = false;

  const matches = (tile, drop, s = state) =>
    (s.cat === 'all' || tile.dataset.cat === s.cat) &&
    (s.brand === 'all' || tile.dataset.brand === s.brand) &&
    (!s.fresh || drop.fresh);
  const countWith = (over) => {
    const s = { ...state, ...over };
    return drops.reduce((n, d) => n + d.tiles.filter((t) => matches(t, d, s)).length, 0);
  };
  const limit = () => parseInt(getComputedStyle(root).getPropertyValue('--drop-limit'), 10) || 5;
  const LEAD_MIN = 5;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const joinNames = (names) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`);
  const filtered = () => state.cat !== 'all' || state.brand !== 'all' || state.fresh;

  function setLead(tile, on) {
    tile.classList.toggle('tile--lead', on);
    const img = $('img', tile);
    const sizes = on ? SIZES_LEAD : SIZES_TILE;
    if (img && sizes && img.getAttribute('sizes') !== sizes) img.setAttribute('sizes', sizes);
  }

  function render() {
    const base = limit();
    let total = 0;
    let shownDrops = 0;

    drops.forEach((d) => {
      const hits = d.tiles.filter((t) => matches(t, d));
      // The latest drop shows more before Show All (data-limit="9": the lead plus two full rows)
      const lim = Math.max(base, Number(d.el.dataset.limit) || 0);
      const max = d.expanded ? hits.length : lim;
      // A 2 x 2 lead tile only when there are enough products to fill the block beside it
      const lead = hits.length >= LEAD_MIN ? hits[0] : null;
      d.tiles.forEach((t) => {
        const i = hits.indexOf(t);
        t.hidden = i === -1 || i >= max;
        setLead(t, t === lead);
      });
      d.el.hidden = !hits.length;
      d.count.textContent = plural(hits.length, 'New Piece', 'New Pieces');
      d.brands.textContent = joinNames([...new Set(hits.map((t) => t.dataset.brandName))]);
      d.more.hidden = hits.length <= lim;
      d.more.textContent = d.expanded ? 'Show Less' : `Show All ${hits.length}`;
      d.more.setAttribute('aria-expanded', String(d.expanded));
      if (d.nav) {
        d.nav.parentElement.hidden = !hits.length;
        d.navCount.textContent = hits.length;
      }
      total += hits.length;
      if (hits.length) shownDrops += 1;
    });

    status.innerHTML = total
      ? `<strong>${plural(total, 'New Piece', 'New Pieces')}</strong> Across ${plural(shownDrops, 'Drop', 'Drops')}`
      : '<strong>0 New Pieces</strong>';
    empty.hidden = total > 0;

    if (interlude) {
      const wasHidden = interlude.hidden;
      interlude.hidden = filtered();
      const scroller = $('[data-scroller]', interlude);
      if (wasHidden && !interlude.hidden && scroller && scroller.updateScroller) scroller.updateScroller();
    }

    catButtons.forEach((b) => {
      const value = b.dataset.cat;
      const n = countWith({ cat: value });
      const on = value === state.cat;
      $('[data-cat-count]', b).textContent = n;
      b.setAttribute('aria-pressed', String(on));
      b.disabled = !n && !on;
    });
    if (freshBtn) {
      const n = countWith({ fresh: true });
      freshBtn.setAttribute('aria-pressed', String(state.fresh));
      freshCount.textContent = n;
      freshBtn.disabled = !n && !state.fresh;
    }
    brandItems.forEach((b) => {
      b.setAttribute('aria-checked', String(b.dataset.brandValue === state.brand));
      const n = countWith({ brand: b.dataset.brandValue });
      const c = $('[data-brand-count]', b);
      if (c) c.textContent = n;
      b.classList.toggle('is-empty', !n);
    });
    if (brandLabel) {
      const chosen = brandItems.find((b) => b.dataset.brandValue === state.brand);
      brandLabel.textContent = chosen ? chosen.dataset.brandName : 'All Brands';
    }
    queueMark();
  }

  function syncUrl() {
    const q = new URLSearchParams(window.location.search);
    ['cat', 'brand', 'fresh'].forEach((k) => q.delete(k));
    if (state.cat !== 'all') q.set('cat', state.cat);
    if (state.brand !== 'all') q.set('brand', state.brand);
    if (state.fresh) q.set('fresh', '1');
    const query = q.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }

  // Bring the top of the listing back into view (under the header) if the visitor has scrolled past it.
  function toListing(force) {
    const top = root.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
    if (force || window.scrollY > top + 1) window.scrollTo({ top, behavior: scrollBehavior() });
  }

  function setFilter(over, force) {
    Object.assign(state, over);
    drops.forEach((d) => { d.expanded = false; });
    render();
    syncUrl();
    toListing(force);
  }

  catButtons.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.cat !== state.cat) setFilter({ cat: b.dataset.cat });
  }));
  if (freshBtn) freshBtn.addEventListener('click', () => setFilter({ fresh: !state.fresh }));
  const reset = $('[data-newin-reset]', root);
  if (reset) reset.addEventListener('click', () => setFilter({ cat: 'all', brand: 'all', fresh: false }, true));

  /* ---------- Show All / Show Less ---------- */
  drops.forEach((d) => d.more.addEventListener('click', () => {
    const before = d.tiles.filter((t) => !t.hidden);
    d.expanded = !d.expanded;
    render();
    if (d.expanded) {
      const added = d.tiles.filter((t) => !t.hidden && !before.includes(t));
      added.forEach((t) => {
        t.classList.remove('is-new');
        void t.offsetWidth; // restart the fade-in
        t.classList.add('is-new');
      });
      const link = added[0] && $('a', added[0]);
      if (link) link.focus({ preventScroll: true });
    } else if (d.el.getBoundingClientRect().top < 0) {
      d.el.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
    }
  }));

  /* ---------- Brand menu (same look as the taxon Sort By menu) ---------- */
  if (brandMenu) {
    const toggle = $('[data-menu-toggle]', brandMenu);
    const isOpen = () => brandMenu.classList.contains('is-open');
    const open = () => {
      brandMenu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      const current = brandItems.find((b) => b.getAttribute('aria-checked') === 'true') || brandItems[0];
      current.focus();
    };
    const close = (focusToggle) => {
      if (!isOpen()) return;
      brandMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (focusToggle) toggle.focus();
    };
    toggle.addEventListener('click', () => (isOpen() ? close() : open()));
    brandItems.forEach((b) => b.addEventListener('click', () => {
      close(true);
      if (b.dataset.brandValue !== state.brand) setFilter({ brand: b.dataset.brandValue });
    }));
    brandMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        close(true);
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      if (!isOpen()) { open(); return; }
      const i = brandItems.indexOf(document.activeElement);
      const n = brandItems.length;
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n;
      brandItems[next].focus();
    });
    document.addEventListener('click', (e) => { if (!brandMenu.contains(e.target)) close(); });
    brandMenu.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !brandMenu.contains(e.relatedTarget)) close();
    });
  }

  /* ---------- "Since your last visit" notice in the hero ---------- */
  const visit = $('[data-visit]');
  if (visit) {
    const text = $('[data-visit-text]', visit);
    const btn = $('[data-visit-show]', visit);
    if (!since) {
      text.textContent = 'Next time you visit, we’ll flag everything that’s landed since.';
      btn.hidden = true;
    } else {
      const ago = daysAgo(since);
      const when = ago <= 0 ? 'earlier today' : ago === 1 ? 'yesterday' : `on ${formatDay(since)}`;
      if (freshTotal) {
        text.innerHTML = `Welcome back! <strong>${plural(freshTotal, 'new piece has', 'new pieces have')}</strong> landed since your last visit ${when}.`;
      } else {
        text.textContent = `Welcome back! You’re all caught up since your last visit ${when}.`;
        btn.hidden = true;
      }
    }
    btn.addEventListener('click', () => setFilter({ fresh: true }, true));
    visit.hidden = false;
  }

  /* ---------- Drop list follows the scroll position ----------
     The current drop is the last one whose top has passed 40% of the way down the screen. */
  let current = null;
  let ticking = false;
  function markCurrent() {
    ticking = false;
    const line = window.innerHeight * 0.4;
    const shown = drops.filter((d) => !d.el.hidden);
    let d = shown[0] || null;
    shown.forEach((x) => { if (x.el.getBoundingClientRect().top <= line) d = x; });
    if (d === current) return;
    if (current && current.nav) current.nav.removeAttribute('aria-current');
    current = d;
    if (d && d.nav) d.nav.setAttribute('aria-current', 'true');
  }
  const queueMark = () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(markCurrent); }
  };
  window.addEventListener('scroll', queueMark, { passive: true });
  window.addEventListener('resize', queueMark);

  /* ---------- Start: filters from the URL, then draw ---------- */
  const catParam = params.get('cat');
  const brandParam = params.get('brand');
  if (catParam && catButtons.some((b) => b.dataset.cat === catParam)) state.cat = catParam;
  if (brandParam && brandItems.some((b) => b.dataset.brandValue === brandParam)) state.brand = brandParam;
  if (params.get('fresh') === '1' && freshTotal) state.fresh = true;
  render();

  // Re-draw when the number of products per drop changes with the layout
  ['(max-width: 599.98px)', '(max-width: 1023.98px)'].forEach((q) => {
    const mq = window.matchMedia(q);
    if (mq.addEventListener) mq.addEventListener('change', render);
  });
})();
