/* Blue Banana Online Piercing Booking (prototype)
   One script for all six pages. Each page sets <body data-step="1..6">.
   The booking is kept in sessionStorage (key bb-booking) so it survives moving between steps
   and is gone when the browser tab closes.

   Prototype data, marked "Hand-off" where the real booking app plugs in:
   - studio list: the 18 studios from the Inner Circle store finder
   - time slots: generated per studio and day (opening hours, walk-in-only blocks)
   - address lookup, payment and the confirmation email are not connected. */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const STEP = Number(document.body.dataset.step || 1);
  const KEY = 'bb-booking';
  const HOLD_MS = 10 * 60 * 1000;
  const DOWS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* ---------- Data ---------- */
  const STORES = [
    ['birmingham', 'Birmingham', '117 New Street', 'Birmingham', 'B2 4JH', 52.47887, -1.8991],
    ['bristol', 'Bristol', '67 The Horsefair', 'Bristol', 'BS1 3JP', 51.45882, -2.58873],
    ['cardiff', 'Cardiff', '8 Queen Street', 'Cardiff', 'CF10 2BU', 51.48169, -3.17917, true],
    ['coventry', 'Coventry', 'Unit 68 Lower Precinct Shopping Centre', 'Coventry', 'CV1 1NQ', 52.40784, -1.5132],
    ['exeter', 'Exeter', '204 High Street', 'Exeter', 'EX4 3EB', 50.72338, -3.53161],
    ['leeds', 'Leeds', '55 Albion Street', 'Leeds', 'LS1 5AA', 53.79839, -1.54521],
    ['leicester', 'Leicester', 'Unit SU08, Lower Mall Highcross', 'Leicester', 'LE1 4FS', 52.6366, -1.13175],
    ['liverpool', 'Liverpool', '58 Bold Street', 'Liverpool', 'L1 4EA', 53.40336, -2.9791],
    ['manchester', 'Manchester', 'Unit 48 Barbirolli Mall East, Arndale Shopping Centre', 'Manchester', 'M4 3AQ', 53.48361, -2.24128],
    ['newport', 'Newport', '42a Commercial Street', 'Newport', 'NP20 1LP', 51.58526, -2.99414, true],
    ['nottingham', 'Nottingham', '15 Long Row, The Exchange Arcade', 'Nottingham', 'NG1 2NX', 52.9536, -1.14814],
    ['plymouth', 'Plymouth', '26-28 Cornwall Street', 'Plymouth', 'PL1 1LP', 50.37252, -4.14141],
    ['reading', 'Reading', '95 Broad Street', 'Reading', 'RG1 2AP', 51.45545, -0.97341],
    ['sheffield', 'Sheffield', '15 Fargate', 'Sheffield', 'S1 2HD', 53.38203, -1.46863],
    ['stoke', 'Stoke-on-Trent', '4 Market Square, Hanley', 'Stoke-on-Trent', 'ST1 1NU', 53.02642, -2.17502],
    ['swansea', 'Swansea', '38 Union Street', 'Swansea', 'SA1 3DZ', 51.6191, -3.94576, true],
    ['swindon', 'Swindon', '42 The Parade', 'Swindon', 'SN1 1BA', 51.56175, -1.78528],
    ['wolverhampton', 'Wolverhampton', '61 Wulfrun Shopping Centre', 'Wolverhampton', 'WV1 3HH', 52.58362, -2.12773]
  ].map((s) => ({ code: s[0], name: s[1], street: s[2], city: s[3], postcode: s[4], lat: s[5], lng: s[6], wales: !!s[7] }));
  const storeBy = (code) => STORES.find((s) => s.code === code) || null;

  // Minimum ages from the age restrictions table. consent: with a parent or guardian (null = not allowed); id: with valid ID.
  const AGE = {
    lobe: { consent: 8, id: 14 }, rim: { consent: 13, id: 16 }, inner: { consent: 13, id: 16 },
    septum: { consent: 14, id: 16 }, nostril: { consent: 13, id: 16 }, lip: { consent: null, id: 16 },
    navel: { consent: 13, id: 16 }, eyebrow: { consent: 14, id: 16 }, tongue: { consent: null, id: 16, wales: 18 }
  };
  const AREAS = {
    Ear: [['Lobe', 'lobe'], ['Upper Lobe', 'lobe'], ['Helix', 'rim'], ['Forward Helix', 'rim'], ['Industrial', 'rim'], ['Tragus', 'inner'], ['Anti Tragus', 'inner'], ['Conch', 'inner'], ['Daith', 'inner'], ['Medi-Daith', 'inner'], ['Rook', 'inner']],
    Nose: [['Nostril', 'nostril'], ['High Nostril', 'nostril'], ['Septum', 'septum'], ['Bridge', null]],
    Face: [['Eyebrow', 'eyebrow'], ['Lip', 'lip'], ['Labret', 'lip'], ['Monroe', 'lip'], ['Medusa', 'lip'], ['Tongue', 'tongue']],
    Body: [['Navel', 'navel']]
  };
  const ageKey = (area, part) => { const p = (AREAS[area] || []).find((x) => x[0] === part); return p ? p[1] : null; };
  const QCOUNT = 17;

  // MEETING DEMO (preview only): details that fill Your Details so the steps can be shown quickly.
  // Remove before go-live, with the "Fill In A Demo Booking" button (fillDemo) and the prefill in step3().
  const DEMO_DETAILS = {
    firstName: 'Luke', lastName: 'Miller', gender: 'Male', dob: '1995-03-12',
    email: 'luke@bluebanana.com', phone: '01234567890',
    street: '16 Forge Land', building: '', city: 'Saltash', postcode: 'PL12 6LX', country: 'United Kingdom'
  };
  const MODE_LABEL = { new: 'New Piercing', change: 'Jewellery Change', consult: 'Consultation' };

  /* ---------- State ---------- */
  let memory = null;
  function load() {
    try { const raw = sessionStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* storage blocked */ }
    return memory || {};
  }
  const state = Object.assign({ visit: 'new', items: [], nextId: 1, ageAgreed: false, store: 'plymouth', date: '', time: '', heldUntil: 0, details: {}, health: {}, notes: '', terms: false }, load());
  function save() {
    memory = state;
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: kept in memory for this page */ }
  }

  // Links from the shop can preselect a studio (?store=plymouth) or a consultation (?visit=consult).
  const params = new URLSearchParams(location.search);
  if (params.get('store') && storeBy(params.get('store'))) { if (state.store !== params.get('store')) { state.store = params.get('store'); state.time = ''; } }
  if (params.get('visit') === 'consult') setVisit('consult');
  save();

  /* ---------- Dates and slots ---------- */
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const isoOf = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMins = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  const endOf = (t) => fromMins(toMins(t) + 15);
  const longDate = (iso) => { const d = parseIso(iso); return DOWS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; };
  const shortDate = (iso) => { const d = parseIso(iso); return DOWS[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3); };
  const DAYS_AHEAD = 28;

  function seeded(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }
  // Hand-off: the booking app returns real slots for the studio and day.
  function daySlots(storeCode, iso) {
    const d = parseIso(iso);
    const sunday = d.getDay() === 0;
    const open = sunday ? 11 * 60 : 10 * 60;
    const close = sunday ? 16 * 60 : 17 * 60 + 30;
    const rnd = seeded(storeCode + iso);
    const busy = rnd() < 0.08; // now and then a day is nearly full
    const slots = [];
    for (let m = open; m < close; m += 15) {
      const walkin = m < open + 30 || (m >= 12 * 60 && m < 12 * 60 + 30) || m >= close - 60 || rnd() < (busy ? 0.75 : 0.16);
      slots.push({ t: fromMins(m), walkin: walkin });
    }
    return slots;
  }
  const slotFree = (storeCode, iso, t) => !!iso && !!t && daySlots(storeCode, iso).some((s) => s.t === t && !s.walkin);
  const dateInRange = (iso) => { if (!iso) return false; const d = parseIso(iso); return d > today && d <= addDays(today, DAYS_AHEAD - 1); };

  /* ---------- Ages ---------- */
  function ageOn(dobIso, onIso) {
    const b = parseIso(dobIso), on = onIso ? parseIso(onIso) : today;
    let a = on.getFullYear() - b.getFullYear();
    if (on.getMonth() < b.getMonth() || (on.getMonth() === b.getMonth() && on.getDate() < b.getDate())) a--;
    return a;
  }
  function limitsFor(item) {
    const a = AGE[ageKey(item.area, item.part)];
    if (!a) return null;
    const store = storeBy(state.store);
    return { consent: a.consent, id: store && store.wales && a.wales ? a.wales : a.id };
  }
  function ageChips(item) {
    const l = limitsFor(item);
    if (item.mode !== 'new') return '';
    if (!l) return '<span class="bk-ages"><span class="bk-age">Age: ask in studio</span></span>';
    const c = l.consent == null ? 'No parental consent' : 'Parental consent ' + l.consent + '+';
    return '<span class="bk-ages"><span class="bk-age">' + c + '</span><span class="bk-age">With ID ' + l.id + '+</span></span>';
  }

  /* ---------- Step completeness ---------- */
  const itemName = (it) => it.area + ' – ' + it.part;
  const done1 = () => (state.visit === 'consult' || state.items.length > 0) && state.ageAgreed;
  const done2 = () => !!storeBy(state.store) && dateInRange(state.date) && slotFree(state.store, state.date, state.time);
  const done3 = () => !!state.detailsOk;
  const done4 = () => Object.keys(state.health).length >= QCOUNT;
  const firstGap = () => (!done1() ? 1 : !done2() ? 2 : !done3() ? 3 : !done4() ? 4 : 0);
  const STEP_FILES = ['index.html', 'studio.html', 'details.html', 'health.html', 'summary.html'];
  const STEP_NAMES = ['your piercing', 'a studio and time', 'your details', 'the health declaration'];

  function setVisit(v) {
    state.visit = v;
    state.items.forEach((it) => {
      if (v === 'consult') it.mode = 'consult';
      else if (it.mode === 'consult') it.mode = 'new';
    });
  }

  /* Footer accordion, header, menus and search come from ../js/main.js, as on the shop pages. */

  /* ---------- Shared: on phones, scroll the piercing menu so Book Online is in view ---------- */
  const subnav = $('.bk-subnav ul');
  const current = subnav && $('[aria-current="page"]', subnav);
  if (current && subnav.scrollWidth > subnav.clientWidth) {
    subnav.scrollLeft = current.offsetLeft - (subnav.clientWidth - current.offsetWidth) / 2;
  }

  /* ---------- Shared: "Your Booking" summary (desktop sidebar) ---------- */
  function renderSummary() {
    const box = $('[data-summary]');
    if (!box) return;
    const store = storeBy(state.store);
    const empty = (t) => '<span class="bk-summary__empty">' + t + '</span>';
    const items = state.items.length
      ? '<ol>' + state.items.map((it) => '<li><strong>' + esc(itemName(it)) + '</strong><br>' + MODE_LABEL[it.mode] + '</li>').join('') + '</ol>'
      : empty(state.visit === 'consult' ? 'General consultation' : 'None added yet');
    const when = state.date && state.time && done2() ? '<strong>' + shortDate(state.date) + '</strong><span>' + state.time + '–' + endOf(state.time) + '</span>' : empty('Not chosen yet');
    box.innerHTML =
      '<h2 class="bk-summary__title">Your Booking</h2>' +
      '<div class="bk-summary__group"><span>Visit</span><strong>' + (state.visit === 'consult' ? 'Consultation' : 'New Piercing Or Changeover') + '</strong></div>' +
      '<div class="bk-summary__group"><span>Piercings</span>' + items + '</div>' +
      '<div class="bk-summary__group"><span>Studio</span>' + (store ? '<strong>' + esc(store.name) + '</strong><span>' + esc(store.street) + ', ' + esc(store.postcode) + '</span>' : empty('Not chosen yet')) + '</div>' +
      '<div class="bk-summary__group"><span>Date &amp; Time</span>' + when + '</div>' +
      '<div class="bk-price__total"><strong>Deposit To Pay</strong><span class="bk-price__amount">&pound;5.00</span></div>' +
      '<p class="bk-small">Includes VAT. Your deposit secures your slot.</p>';
  }

  /* ---------- Shared: gate when someone lands on a later step without the earlier ones ---------- */
  function renderGate() {
    const gate = $('[data-gate]');
    if (!gate || STEP < 2 || STEP > 5) return false;
    const gap = firstGap();
    if (!gap || gap >= STEP) { gate.hidden = true; return false; }
    gate.hidden = false;
    gate.innerHTML =
      '<div class="bk-notice bk-notice--info">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>' +
      '<div class="bk-notice__body"><p class="bk-notice__title">You&rsquo;ve Skipped A Step</p>' +
      '<p>We still need ' + STEP_NAMES[gap - 1] + ' before this step.</p>' +
      '<div class="bk-notice__actions"><a class="bk-btn bk-btn--dark" href="' + STEP_FILES[gap - 1] + '">Go To Step ' + gap + '</a>' +
      '<button class="bk-btn bk-btn--light" type="button" data-demo>Fill In A Demo Booking</button></div></div></div>';
    $('[data-demo]', gate).addEventListener('click', () => { fillDemo(STEP); location.reload(); });
    return true;
  }
  // Prototype helper for showing a single step in a meeting: fills every step before this one.
  function fillDemo(upTo) {
    if (!done1()) { state.visit = 'new'; if (!state.items.length) { state.items = [{ id: state.nextId++, area: 'Ear', part: 'Daith', mode: 'new' }]; } state.ageAgreed = true; }
    if (upTo > 2 && !done2()) {
      for (let i = 1; i < DAYS_AHEAD; i++) {
        const iso = isoOf(addDays(today, i));
        const s = daySlots(state.store, iso).find((x) => !x.walkin);
        if (s) { state.date = iso; state.time = s.t; break; }
      }
      state.heldUntil = Date.now() + HOLD_MS;
    }
    if (upTo > 3 && !done3()) {
      state.details = Object.assign({}, DEMO_DETAILS, { marketing: 'no' }, state.details);
      state.demoPrefilled = true;
      state.detailsOk = true;
    }
    if (upTo > 4 && !done4()) { for (let i = 1; i <= QCOUNT; i++) state.health['q' + i] = state.health['q' + i] || 'no'; }
    save();
  }

  /* ---------- Shared: slot hold timer (steps 3 to 5) ---------- */
  function startHoldTimer() {
    const chip = $('[data-hold]');
    if (!chip || !done2()) return;
    if (!state.heldUntil) { state.heldUntil = Date.now() + HOLD_MS; save(); }
    chip.hidden = false;
    const clock = $('[data-hold-clock]', chip);
    const text = $('[data-hold-text]', chip);
    let warned = false;
    const tick = () => {
      const left = Math.max(0, state.heldUntil - Date.now());
      const s = Math.ceil(left / 1000);
      clock.textContent = Math.floor(s / 60) + ':' + pad(s % 60);
      if (left <= 0) {
        clearInterval(timer);
        chip.classList.add('is-ended');
        text.textContent = 'Slot hold ended';
        clock.textContent = '';
        showHoldEnded();
      } else if (s <= 120 && !warned) {
        warned = true;
        announce('Two minutes left to finish your booking before your slot is released.');
      }
    };
    const timer = setInterval(tick, 1000);
    tick();
  }
  function showHoldEnded() {
    const gate = $('[data-gate]');
    if (!gate) return;
    gate.hidden = false;
    gate.innerHTML =
      '<div class="bk-notice bk-notice--error" role="alert"><div class="bk-notice__body">' +
      '<p class="bk-notice__title">Your Slot Hold Has Ended</p>' +
      '<p>We hold your time for 10 minutes while you book. ' + esc(shortDate(state.date)) + ' at ' + esc(state.time) + ' may now go to someone else.</p>' +
      '<div class="bk-notice__actions"><button class="bk-btn bk-btn--dark" type="button" data-rehold>Hold It Again</button><a class="bk-btn bk-btn--light" href="studio.html">Choose Another Time</a></div>' +
      '</div></div>';
    // Hand-off: the booking app re-checks the slot is still free before holding it again.
    $('[data-rehold]', gate).addEventListener('click', () => { state.heldUntil = Date.now() + HOLD_MS; save(); location.reload(); });
    gate.scrollIntoView({ block: 'center' });
  }

  let liveNode = null;
  function announce(msg) {
    if (!liveNode) {
      liveNode = $('[data-live]') || Object.assign(document.createElement('p'), { className: 'sr-only' });
      liveNode.setAttribute('role', 'status');
      if (!liveNode.isConnected) document.body.appendChild(liveNode);
    }
    liveNode.textContent = '';
    setTimeout(() => { liveNode.textContent = msg; }, 50);
  }

  /* ---------- Shared: Continue button ---------- */
  function wireNext(check, onGo) {
    const next = $('[data-next]');
    const hint = $('[data-hint]');
    if (!next) return () => {};
    const refresh = () => {
      const r = check(false);
      next.setAttribute('aria-disabled', String(!!r));
      if (hint) hint.textContent = r || '';
    };
    next.addEventListener('click', (e) => {
      const r = check(true);
      if (r) { e.preventDefault(); refresh(); return; }
      if (onGo) onGo();
      save();
    });
    refresh();
    return refresh;
  }
  function setError(el, msg) {
    if (!el) return;
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  /* ======================================================================
     Step 1: piercing
     ====================================================================== */
  function step1() {
    const area = $('[data-area]'), part = $('[data-part]'), addBtn = $('[data-add]');
    const list = $('[data-items]'), emptyMsg = $('[data-empty]'), count = $('[data-count]');
    const addErr = $('[data-add-error]'), itemsErr = $('[data-items-error]');
    const agree = $('[data-agree]'), agreeErr = $('[data-agree-error]'), agreeWrap = $('[data-agree-wrap]');
    const modeGroup = $('[data-mode-group]');

    Object.keys(AREAS).forEach((a) => area.add(new Option(a, a)));
    $$('input[name="visit"]').forEach((r) => {
      r.checked = r.value === state.visit;
      r.addEventListener('change', () => { setVisit(r.value); save(); renderVisit(); renderItems(); refresh(); });
    });
    agree.checked = !!state.ageAgreed;
    agree.addEventListener('change', () => {
      state.ageAgreed = agree.checked; save();
      if (agree.checked) { setError(agreeErr, ''); agreeWrap.classList.remove('is-invalid'); }
      refresh();
    });

    function fillParts() {
      part.length = 1;
      const opts = AREAS[area.value] || [];
      opts.forEach((p) => part.add(new Option(p[0], p[0])));
      part.disabled = !opts.length;
      part.options[0].text = opts.length ? 'Choose a body part' : 'Choose an area first';
    }
    area.addEventListener('change', () => { fillParts(); setError(addErr, ''); part.removeAttribute('aria-invalid'); });
    part.addEventListener('change', () => { setError(addErr, ''); part.removeAttribute('aria-invalid'); });

    function renderVisit() {
      const consult = state.visit === 'consult';
      modeGroup.hidden = consult;
      $('[data-pierce-title]').textContent = consult ? 'What Would You Like Advice On?' : 'Add Your Piercings';
      $('[data-pierce-lede]').textContent = consult
        ? 'Optional: add the piercings you’d like to talk about, so your piercer can be ready for you.'
        : 'Pick New Piercing for something brand new, or Jewellery Change to downsize or swap jewellery in a piercing you already have.';
    }

    function renderItems() {
      list.innerHTML = state.items.map((it, i) =>
        '<li class="bk-item" data-id="' + it.id + '">' +
        '<span class="bk-num" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="bk-item__text"><span class="bk-item__name">' + esc(itemName(it)) + '</span>' +
        '<span class="bk-item__meta">' + MODE_LABEL[it.mode] + '</span>' + ageChips(it) + '</span>' +
        '<button class="bk-item__remove" type="button" data-remove="' + it.id + '"><span class="sr-only">Remove ' + esc(itemName(it)) + '</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg></button></li>'
      ).join('');
      emptyMsg.hidden = state.items.length > 0;
      count.textContent = state.items.length;
      // Highlight the picked rows in the age table
      const keys = state.items.map((it) => ageKey(it.area, it.part));
      $$('[data-age-row]').forEach((tr) => tr.classList.toggle('is-picked', keys.includes(tr.dataset.ageRow)));
      renderSummary();
    }

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      const id = Number(btn.dataset.remove);
      const idx = state.items.findIndex((x) => x.id === id);
      const gone = state.items[idx];
      state.items.splice(idx, 1);
      save(); renderItems(); refresh();
      announce(itemName(gone) + ' removed.');
      const nextBtn = $$('[data-remove]', list)[Math.min(idx, state.items.length - 1)];
      (nextBtn || addBtn).focus();
    });

    addBtn.addEventListener('click', () => {
      if (!area.value) { setError(addErr, 'Choose a body area first.'); area.setAttribute('aria-invalid', 'true'); area.focus(); return; }
      area.removeAttribute('aria-invalid');
      if (!part.value) { setError(addErr, 'Choose a body part to add.'); part.setAttribute('aria-invalid', 'true'); part.focus(); return; }
      const mode = state.visit === 'consult' ? 'consult' : ($('input[name="mode"]:checked') || {}).value || 'new';
      if (state.items.some((x) => x.area === area.value && x.part === part.value && x.mode === mode)) {
        setError(addErr, area.value + ' – ' + part.value + ' (' + MODE_LABEL[mode] + ') is already in your selection.');
        return;
      }
      const it = { id: state.nextId++, area: area.value, part: part.value, mode: mode };
      state.items.push(it);
      save();
      setError(addErr, ''); setError(itemsErr, '');
      area.value = ''; fillParts();
      renderItems(); refresh();
      announce(itemName(it) + ' added. ' + state.items.length + ' in your selection.');
    });

    const refresh = wireNext((show) => {
      const needItems = state.visit !== 'consult' && state.items.length === 0;
      if (show) {
        setError(itemsErr, needItems ? 'Add at least one piercing to continue.' : '');
        setError(agreeErr, state.ageAgreed ? '' : 'Please tick to confirm you’ve read the age restrictions.');
        agreeWrap.classList.toggle('is-invalid', !state.ageAgreed);
        if (needItems) area.focus(); else if (!state.ageAgreed) agree.focus();
      }
      if (needItems) return 'Add at least one piercing to continue';
      if (!state.ageAgreed) return 'Tick the age restrictions box to continue';
      return '';
    });

    renderVisit(); renderItems();
  }

  /* ======================================================================
     Step 2: studio and time
     ====================================================================== */
  function step2() {
    const toggle = $('[data-store-toggle]'), picker = $('[data-picker]'), q = $('[data-store-q]');
    const listEl = $('[data-store-list]'), nearMsg = $('[data-near-msg]');
    const daysEl = $('[data-days]'), groups = $('[data-slot-groups]'), slotErr = $('[data-slot-error]');
    let distances = null;
    if (!dateInRange(state.date)) state.date = '';
    let week = state.date ? Math.floor((parseIso(state.date) - today) / 864e5 / 7) : 0;

    function renderStore() {
      const s = storeBy(state.store);
      $('[data-store-name]').textContent = s ? s.name : 'Choose a studio';
      $('[data-store-addr]').textContent = s ? s.street + ', ' + s.city + ', ' + s.postcode : '';
    }
    function renderList() {
      const term = q.value.trim().toLowerCase();
      let rows = STORES.filter((s) => !term || (s.name + ' ' + s.city + ' ' + s.postcode + ' ' + s.street).toLowerCase().includes(term));
      if (distances) rows = rows.slice().sort((a, b) => distances[a.code] - distances[b.code]);
      listEl.innerHTML = rows.length ? rows.map((s) =>
        '<li><label class="bk-picker__opt"><input type="radio" name="store" value="' + s.code + '"' + (s.code === state.store ? ' checked' : '') + '>' +
        '<span><strong>' + esc(s.name) + '</strong><small>' + esc(s.street + ', ' + s.postcode) + '</small></span>' +
        (distances ? '<em>' + distances[s.code].toFixed(1) + ' mi</em>' : '') + '</label></li>'
      ).join('') : '<li class="bk-picker__none">No studios match. Try a town or city name.</li>';
    }
    function openPicker(open) {
      picker.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) { renderList(); q.focus(); }
    }
    toggle.addEventListener('click', () => openPicker(picker.hidden));
    q.addEventListener('input', renderList);
    picker.addEventListener('keydown', (e) => { if (e.key === 'Escape') { openPicker(false); toggle.focus(); } });
    listEl.addEventListener('change', (e) => {
      if (e.target.name !== 'store') return;
      const changed = state.store !== e.target.value;
      state.store = e.target.value;
      if (changed && state.time && !slotFree(state.store, state.date, state.time)) state.time = '';
      state.heldUntil = 0;
      save(); renderStore(); renderDays(); renderSlots(); refresh();
      openPicker(false); toggle.focus();
      announce(storeBy(state.store).name + ' studio chosen.');
    });
    $('[data-near]').addEventListener('click', () => {
      if (!navigator.geolocation) { nearMsg.textContent = 'Your browser can’t share your location. Search by town instead.'; return; }
      nearMsg.textContent = 'Finding your location…';
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: la, longitude: lo } = pos.coords;
        const rad = (x) => x * Math.PI / 180;
        distances = {};
        STORES.forEach((s) => {
          const dLa = rad(s.lat - la), dLo = rad(s.lng - lo);
          const a = Math.sin(dLa / 2) ** 2 + Math.cos(rad(la)) * Math.cos(rad(s.lat)) * Math.sin(dLo / 2) ** 2;
          distances[s.code] = 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        });
        q.value = '';
        renderList();
        const near = STORES.slice().sort((a, b) => distances[a.code] - distances[b.code])[0];
        nearMsg.textContent = 'Sorted by distance. Your nearest studio is ' + near.name + '.';
      }, () => { nearMsg.textContent = 'We couldn’t get your location. Search by town instead.'; }, { timeout: 10000 });
    });

    function renderDays() {
      const start = addDays(today, week * 7);
      const days = [];
      for (let i = 0; i < 7; i++) days.push(addDays(start, i));
      const m1 = MONTHS[days[0].getMonth()], m2 = MONTHS[days[6].getMonth()];
      $('[data-month]').textContent = (m1 === m2 ? m1 : m1 + ' – ' + m2) + ' ' + days[6].getFullYear();
      daysEl.innerHTML = days.map((d) => {
        const iso = isoOf(d);
        const isToday = iso === isoOf(today);
        const free = isToday ? 0 : daySlots(state.store, iso).filter((s) => !s.walkin).length;
        const sel = iso === state.date;
        const sub = isToday ? 'Walk-in' : free ? free + ' free' : 'Full';
        const label = DOWS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + (isToday ? ', today, walk-ins only' : ', ' + (free ? free + ' times free' : 'fully booked'));
        return '<button class="bk-day" type="button" data-day="' + iso + '" aria-pressed="' + sel + '" aria-label="' + label + '"' + (isToday || !free ? ' disabled' : '') + '>' +
          '<span class="bk-day__dow" aria-hidden="true">' + DOWS[d.getDay()].slice(0, 3).toUpperCase() + '</span>' +
          '<span class="bk-day__num" aria-hidden="true">' + d.getDate() + '</span>' +
          '<span class="bk-day__sub" aria-hidden="true">' + sub + '</span></button>';
      }).join('');
      $('[data-week="-1"]').disabled = week <= 0;
      $('[data-week="1"]').disabled = (week + 1) * 7 >= DAYS_AHEAD;
    }
    $$('[data-week]').forEach((b) => b.addEventListener('click', () => {
      week = Math.max(0, week + Number(b.dataset.week));
      renderDays();
    }));
    daysEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-day]');
      if (!b || b.disabled) return;
      if (state.date !== b.dataset.day) { state.date = b.dataset.day; state.time = ''; state.heldUntil = 0; }
      save(); renderDays(); renderSlots(); refresh();
      const btn = $('[data-day="' + state.date + '"]', daysEl);
      if (btn) btn.focus();
    });

    function renderSlots() {
      if (!state.date) {
        $('[data-day-title]').textContent = 'Choose A Time';
        $('[data-free]').textContent = '';
        groups.innerHTML = '<p class="bk-slots-empty">Choose a day to see the times.</p>';
        return;
      }
      const slots = daySlots(state.store, state.date);
      $('[data-day-title]').textContent = longDate(state.date);
      $('[data-free]').textContent = slots.filter((s) => !s.walkin).length + ' times free';
      const block = (title, list) => !list.length ? '' :
        '<p class="bk-label" style="margin:14px 0 8px">' + title + '</p><div class="bk-slots" role="group" aria-label="' + title + ' times">' +
        list.map((s) => {
          const sel = !s.walkin && s.t === state.time;
          return '<button class="bk-slot" type="button" data-slot="' + s.t + '" aria-pressed="' + sel + '"' + (s.walkin ? ' disabled' : '') +
            ' aria-label="' + (s.walkin ? s.t + ', walk-in only' : s.t + ' to ' + endOf(s.t)) + '">' + s.t +
            (s.walkin ? '<small aria-hidden="true">Walk-in only</small>' : '') + '</button>';
        }).join('') + '</div>';
      groups.innerHTML = block('Morning', slots.filter((s) => toMins(s.t) < 12 * 60)) + block('Afternoon', slots.filter((s) => toMins(s.t) >= 12 * 60));
    }
    groups.addEventListener('click', (e) => {
      const b = e.target.closest('[data-slot]');
      if (!b || b.disabled) return;
      if (state.time !== b.dataset.slot) state.heldUntil = 0;
      state.time = b.dataset.slot;
      save(); renderSlots(); refresh(); setError(slotErr, '');
      const again = $('[data-slot="' + state.time + '"]', groups);
      if (again) again.focus();
      announce(longDate(state.date) + ', ' + state.time + ' to ' + endOf(state.time) + ' chosen.');
    });

    const barSummary = $('[data-bar-summary]');
    const refreshBase = wireNext((show) => {
      if (!done2()) {
        if (show) { setError(slotErr, state.date ? 'Please choose a time.' : 'Please choose a day and a time.'); (($('.bk-slot:not(:disabled)', groups)) || $('.bk-day:not(:disabled)', daysEl) || daysEl).focus(); }
        return state.date ? 'Choose a time to continue' : 'Choose a day and a time to continue';
      }
      return '';
    }, () => { if (!state.heldUntil) state.heldUntil = Date.now() + HOLD_MS; });
    function refresh() {
      refreshBase();
      const s = storeBy(state.store);
      barSummary.innerHTML = '<span>' + esc(s ? s.name : '') + '</span><strong>' + (done2() ? shortDate(state.date) + ', ' + state.time + '–' + endOf(state.time) : 'Choose a time') + '</strong>';
      renderSummary();
    }

    // Default to the first day with free times
    if (!state.date) {
      for (let i = 1; i < 7; i++) {
        const iso = isoOf(addDays(today, i));
        if (daySlots(state.store, iso).some((s) => !s.walkin)) { state.date = iso; break; }
      }
      save();
    }
    renderStore(); renderDays(); renderSlots(); refresh();
  }

  /* ======================================================================
     Step 3: details
     ====================================================================== */
  function step3() {
    const form = $('[data-details-form]');
    const d = state.details;
    // MEETING DEMO: fill any empty fields once per visit, so later edits stay as typed
    if (!state.demoPrefilled) {
      Object.keys(DEMO_DETAILS).forEach((k) => { if (!d[k]) d[k] = DEMO_DETAILS[k]; });
      state.demoPrefilled = true;
      save();
    }
    if (d.postcode) $('#pcFind').value = d.postcode;
    const fields = $$('[data-field]', form);
    fields.forEach((f) => {
      if (f.type === 'radio') f.checked = d[f.name] === f.value;
      else if (d[f.name] != null) f.value = d[f.name];
      const evt = f.tagName === 'SELECT' || f.type === 'radio' || f.type === 'date' ? 'change' : 'input';
      f.addEventListener(evt, () => {
        d[f.name] = f.value;
        state.detailsOk = false;
        save();
        if (f.getAttribute('aria-invalid') === 'true') validate(f);
        if (f.name === 'dob') renderAgeCheck();
        refresh();
      });
      f.addEventListener('blur', () => { if (f.value) validate(f); });
    });

    const RULES = {
      firstName: (v) => !v.trim() && 'Enter your first name.',
      lastName: (v) => !v.trim() && 'Enter your last name.',
      gender: (v) => !v && 'Choose an option. You can pick “Prefer not to say”.',
      dob: (v) => {
        if (!v) return 'Enter your date of birth.';
        const a = ageOn(v);
        if (isNaN(a) || parseIso(v) > today) return 'Enter a date of birth in the past.';
        if (a > 110) return 'Check the year of your date of birth.';
        return '';
      },
      email: (v) => !v.trim() ? 'Enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && 'Enter an email address like name@example.com.',
      phone: (v) => { const n = v.replace(/[\s()-]/g, ''); return !n ? 'Enter your mobile number.' : !/^\+?\d{10,14}$/.test(n) && 'Enter a mobile number like 07700 900000.'; },
      street: (v) => !v.trim() && 'Enter your street address.',
      city: (v) => !v.trim() && 'Enter your town or city.',
      postcode: (v) => {
        if (!v.trim()) return 'Enter your postcode.';
        if ((d.country || 'United Kingdom') === 'United Kingdom' && !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(v.trim())) return 'Enter a real UK postcode, like PL1 1LP.';
        return '';
      }
    };
    function validate(f) {
      const rule = RULES[f.name];
      if (!rule) return true;
      const msg = rule(f.value || '') || '';
      const err = document.getElementById(f.id + '-error');
      setError(err, msg);
      if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid');
      return !msg;
    }

    // Age check against the piercings and the appointment date
    const ageBox = $('[data-age-check]');
    function ageProblems() {
      if (!d.dob || RULES.dob(d.dob) || state.visit === 'consult') return { block: [], consent: [] };
      const age = ageOn(d.dob, state.date || null);
      const out = { block: [], consent: [], age: age };
      state.items.filter((it) => it.mode === 'new').forEach((it) => {
        const l = limitsFor(it);
        if (!l || age >= l.id) return;
        if (l.consent != null && age >= l.consent) out.consent.push(itemName(it));
        else out.block.push({ name: itemName(it), min: l.consent != null ? l.consent : l.id, withConsent: l.consent != null });
      });
      return out;
    }
    function renderAgeCheck() {
      const p = ageProblems();
      let html = '';
      if (p.block.length) {
        html += '<div class="bk-notice bk-notice--error" role="alert"><div class="bk-notice__body"><p class="bk-notice__title">We Can&rsquo;t Do ' + (p.block.length > 1 ? 'These Piercings' : 'This Piercing') + ' At ' + p.age + '</p><ul>' +
          p.block.map((b) => '<li>' + esc(b.name) + ': ' + b.min + '+ ' + (b.withConsent ? 'with parental consent' : 'with valid ID') + '</li>').join('') +
          '</ul><p><a href="index.html">Change your piercings</a> or book a consultation instead.</p></div></div>';
      }
      if (p.consent.length) {
        html += '<div class="bk-notice"><div class="bk-notice__body"><p class="bk-notice__title">A Parent Or Guardian Must Come With You</p><p>At ' + p.age + ', ' +
          esc(p.consent.join(', ')) + ' needs parental consent. They&rsquo;ll need to bring their own photo ID, and you&rsquo;ll need yours.</p></div></div>';
      }
      ageBox.innerHTML = html;
    }

    // Postcode finder. Hand-off: connect the address lookup provider.
    $('[data-find]').addEventListener('click', () => {
      const v = $('#pcFind').value.trim().toUpperCase();
      const msg = $('[data-find-msg]');
      if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(v)) { msg.textContent = 'Enter a full UK postcode, like PL1 1LP.'; return; }
      const pc = $('#postcode');
      pc.value = v.replace(/^(.+?)\s*(\d[A-Z]{2})$/, '$1 $2');
      d.postcode = pc.value; save(); validate(pc);
      msg.textContent = 'Address lookup isn’t connected in this prototype. We’ve added your postcode; please type the rest of your address.';
      $('#street').focus();
    });

    const refresh = wireNext((show) => {
      let firstBad = null;
      const filled = fields.filter((f) => RULES[f.name]).every((f) => !(RULES[f.name](f.value || '')));
      if (show) {
        fields.forEach((f) => { if (!validate(f) && !firstBad) firstBad = f; });
      }
      const p = ageProblems();
      if (!filled) { if (firstBad) firstBad.focus(); return 'Fill in all the details to continue'; }
      if (p.block.length) { if (show) ageBox.scrollIntoView({ block: 'center' }); return 'Change your piercings to continue'; }
      return '';
    }, () => { state.detailsOk = true; });

    renderAgeCheck();
  }

  /* ======================================================================
     Step 4: health declaration
     ====================================================================== */
  function step4() {
    const qs = $$('[data-q]');
    const meter = $('[data-meter]');
    const notes = $('[data-notes]');
    notes.value = state.notes || '';
    notes.addEventListener('input', () => { state.notes = notes.value; save(); });
    qs.forEach((fs) => {
      const id = fs.dataset.q;
      $$('input', fs).forEach((r) => {
        r.checked = state.health[id] === r.value;
        r.addEventListener('change', () => {
          state.health[id] = r.value; save();
          fs.classList.remove('is-missing');
          paint(); refresh();
        });
      });
    });
    function paint() {
      const n = Object.keys(state.health).length;
      $('[data-answered]').textContent = n;
      $('[data-togo]').textContent = n >= QCOUNT ? 'All done' : (QCOUNT - n) + ' to go';
      $('[data-fill]').style.width = Math.round(n / QCOUNT * 100) + '%';
      meter.classList.toggle('is-done', n >= QCOUNT);
      qs.forEach((fs) => { $('.bk-q__note', fs).hidden = state.health[fs.dataset.q] !== 'yes'; });
    }
    const refresh = wireNext((show) => {
      const missing = qs.filter((fs) => !state.health[fs.dataset.q]);
      if (show && missing.length) {
        missing.forEach((fs) => fs.classList.add('is-missing'));
        $('input', missing[0]).focus();
        missing[0].scrollIntoView({ block: 'center' });
      }
      return missing.length ? 'Answer all ' + QCOUNT + ' questions to continue (' + missing.length + ' left)' : '';
    });
    paint();
  }

  /* ======================================================================
     Step 5: review and pay
     ====================================================================== */
  function fillTicket(root, b) {
    const s = storeBy(b.store);
    const set = (sel, v) => { const el = $(sel, root); if (el) el.textContent = v; };
    set('[data-t-date]', b.date ? longDate(b.date) : 'No time chosen');
    set('[data-t-time]', b.time ? b.time + ' – ' + endOf(b.time) : '');
    set('[data-t-store]', s ? s.name : '');
    set('[data-t-addr]', s ? s.street + ', ' + s.postcode : '');
    set('[data-t-name]', ((b.details.firstName || '') + ' ' + (b.details.lastName || '')).trim() || 'Not given yet');
  }
  function step5() {
    fillTicket(document, state);
    $('[data-rp-title]').textContent = state.visit === 'consult' ? 'Consultation' : 'Piercings';
    $('[data-r-items]').innerHTML = state.items.length ? state.items.map((it, i) =>
      '<li class="bk-row-item"><span class="bk-num" aria-hidden="true">' + (i + 1) + '</span><span class="bk-item__text"><span class="bk-item__name">' + esc(itemName(it)) + '</span>' +
      '<span class="bk-item__meta">' + MODE_LABEL[it.mode] + '</span>' + ageChips(it) + '</span></li>').join('')
      : '<li class="bk-small">General consultation, no piercings picked.</li>';
    const d = state.details;
    const rows = [
      ['Name', (d.firstName || '') + ' ' + (d.lastName || '')],
      ['Date of birth', d.dob ? parseIso(d.dob).toLocaleDateString('en-GB') : ''],
      ['Email', d.email], ['Mobile', d.phone],
      ['Address', [d.street, d.building, d.city, d.postcode].filter(Boolean).join(', ')],
      ['Marketing', d.marketing === 'yes' ? 'Yes please' : 'No thanks']
    ];
    $('[data-r-details]').innerHTML = rows.map((r) => '<dt>' + r[0] + '</dt><dd>' + (esc((r[1] || '').trim()) || '&ndash;') + '</dd>').join('');
    const yes = Object.keys(state.health).filter((k) => state.health[k] === 'yes').length;
    $('[data-r-health]').textContent = done4()
      ? 'All ' + QCOUNT + ' questions answered' + (yes ? ', ' + yes + ' answered “Yes”. Your piercer will talk these through with you.' : ', all “No”.') + (state.notes ? ' Notes added.' : '')
      : 'Not finished yet.';

    const terms = $('[data-terms]'), termsErr = $('[data-terms-error]'), wrap = $('[data-agree-wrap]');
    terms.checked = !!state.terms;
    terms.addEventListener('change', () => {
      state.terms = terms.checked; save();
      if (terms.checked) { setError(termsErr, ''); wrap.classList.remove('is-invalid'); }
    });
    const pay = $('[data-pay]');
    pay.addEventListener('click', (e) => {
      e.preventDefault();
      const gap = firstGap();
      if (gap) { renderGate(); $('[data-gate]').scrollIntoView({ block: 'center' }); return; }
      if (state.heldUntil && Date.now() > state.heldUntil) { showHoldEnded(); return; }
      if (!state.terms) {
        setError(termsErr, 'Please tick to agree to the terms and conditions.');
        wrap.classList.add('is-invalid'); terms.focus(); return;
      }
      pay.classList.add('is-busy');
      pay.lastChild.textContent = 'Processing…';
      // Hand-off: payment provider. The prototype takes no payment and confirms straight away.
      setTimeout(() => {
        const s = storeBy(state.store);
        const confirmed = JSON.parse(JSON.stringify(state));
        confirmed.visitId = 'BB-' + s.code.slice(0, 3).toUpperCase() + '-' + String(Date.now()).slice(-6);
        const fresh = { confirmed: confirmed, store: state.store, details: state.details };
        try { sessionStorage.setItem(KEY, JSON.stringify(fresh)); } catch (err) { memory = fresh; }
        location.href = pay.getAttribute('href');
      }, 900);
    });
  }

  /* ======================================================================
     Confirmation
     ====================================================================== */
  function step6() {
    const b = state.confirmed;
    if (!b) { $('[data-none]').hidden = false; return; }
    const box = $('[data-done]');
    box.hidden = false;
    fillTicket(box, b);
    const s = storeBy(b.store);
    $('[data-done-title]').textContent = 'You’re Booked In' + (b.details.firstName ? ', ' + b.details.firstName : '') + '!';
    $('[data-done-lede]').textContent = 'See you at ' + s.name + ' on ' + longDate(b.date) + '. Your confirmation is on its way to ' + (b.details.email || 'your email') + '.';
    $('[data-t-visit]').textContent = b.visitId;
    $('[data-t-items]').textContent = b.items.length ? b.items.map(itemName).join(', ') : 'Consultation';
    $('[data-directions]').href = 'https://www.google.com/maps/dir//' + encodeURIComponent('Blue Banana ' + s.street + ' ' + s.city + ' ' + s.postcode);
    document.title = 'Booking Confirmed | ' + b.visitId + ' | Blue Banana';

    $('[data-ics]').addEventListener('click', () => {
      const stamp = (iso, t) => iso.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
      const what = b.items.length ? b.items.map(itemName).join(', ') : 'Consultation';
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Blue Banana//Piercing Booking//EN', 'BEGIN:VEVENT',
        'UID:' + b.visitId + '@bluebanana.com',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
        'DTSTART;TZID=Europe/London:' + stamp(b.date, b.time),
        'DTEND;TZID=Europe/London:' + stamp(b.date, endOf(b.time)),
        'SUMMARY:Blue Banana piercing appointment',
        'DESCRIPTION:' + what + '. Visit ID ' + b.visitId + '. Bring valid photo ID.',
        'LOCATION:Blue Banana ' + s.name + '\\, ' + s.street.replace(/,/g, '\\,') + '\\, ' + s.postcode,
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'blue-banana-piercing-' + b.date + '.ics';
      document.body.appendChild(a); a.click(); a.remove();
    });
    $('[data-again]').addEventListener('click', () => {
      try { sessionStorage.setItem(KEY, JSON.stringify({ store: b.store, details: b.details })); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Start ---------- */
  renderSummary();
  const gated = renderGate();
  ({ 1: step1, 2: step2, 3: step3, 4: step4, 5: step5, 6: step6 })[STEP]();
  if (!gated && STEP >= 3 && STEP <= 5) startHoldTimer();
})();
