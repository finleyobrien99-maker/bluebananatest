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
    cart: ['.skip-link', '#site-header', '.promo-bar', '#main', '.foot'],
    nav: ['.skip-link', '.site-header__bar', '.site-search', '.loyalty-toolbar', '.loyalty-switcher', '.promo-bar', '#main', '.foot'],
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

  /* ---------- Global keyboard + outside-click handling ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (navIsOpen) trapFocus(nav, e);
      return;
    }
    if (e.key !== 'Escape') return;
    if (navIsOpen) closeNav();
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
