(() => {
  const page = document.querySelector('.banner-case');
  if (!page) return;

  page.querySelectorAll('.banner-series').forEach((series) => {
    const tablist = series.querySelector('.banner-tabs');
    const tabs = [...series.querySelectorAll('.banner-tab')];
    const panels = tabs.map((tab) => document.getElementById(tab.dataset.panel));
    if (!tablist || !tabs.length || panels.some((panel) => !panel || !series.contains(panel))) return;

    const activate = (selected, focus = false) => {
      tabs.forEach((tab, index) => {
        tab.setAttribute('aria-selected', String(index === selected));
        tab.tabIndex = index === selected ? 0 : -1;
        panels[index].hidden = index !== selected;
      });
      if (focus) tabs[selected].focus();
    };

    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', tablist.dataset.label);
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activate(next, true);
      });
    });
    activate(0);
    tablist.hidden = false;
  });

  const dialog = page.querySelector('.banner-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.banner-dialog-image');
  const caption = dialog.querySelector('#banner-dialog-caption');
  const close = dialog.querySelector('.banner-dialog-close');
  let previousOverflow;

  page.querySelectorAll('.banner-image-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const source = link.querySelector('img');
      image.src = link.href;
      image.alt = source.alt;
      caption.textContent = source.alt;
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  close.addEventListener('click', () => dialog.close());
  // Only the backdrop dismisses the image; clicks on the content stay inside.
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
  });
})();
