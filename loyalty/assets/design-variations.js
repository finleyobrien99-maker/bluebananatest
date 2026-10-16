(() => {
  const root = document.documentElement;
  const design = document.querySelector('[data-variant-select]');
  const layout = document.querySelector('[data-layout-select]');
  if (!design || !layout) return;
  const params = new URLSearchParams(location.search);
  const valid = (select, value) => [...select.options].some(option => option.value === value);
  if (valid(design, params.get('variant'))) design.value = params.get('variant');
  if (valid(layout, params.get('layout'))) layout.value = params.get('layout');
  function apply(updateUrl) {
    root.dataset.variant = design.value;
    root.dataset.layout = layout.value;
    const field = root.dataset.concept === 'coven' ? 'lilac' : design.value === 'inner-modern' || root.dataset.concept === 'collective' ? 'pink' : 'stone';
    document.querySelectorAll('.counts__row img').forEach(img => {
      img.setAttribute('src', img.getAttribute('src').replace(/-(pink|stone|lilac)\.jpg$/, `-${field}.jpg`));
    });
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('variant', design.value);
      url.searchParams.set('layout', layout.value);
      // Sharing the URL restores these choices without needing browser storage.
      try { history.replaceState(null, '', url); } catch (_) { /* Local file previews still work. */ }
    }
  }
  design.disabled = false;
  layout.disabled = false;
  apply(false);
  design.addEventListener('change', () => apply(true));
  layout.addEventListener('change', () => apply(true));
  window.addEventListener('popstate', () => {
    const query = new URLSearchParams(location.search);
    if (valid(design, query.get('variant'))) design.value = query.get('variant');
    if (valid(layout, query.get('layout'))) layout.value = query.get('layout');
    apply(false);
  });
})();
