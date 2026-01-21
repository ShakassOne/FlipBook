document.addEventListener('DOMContentLoaded', () => {
  const viewers = document.querySelectorAll('.flipbook-viewer');

  viewers.forEach((viewer) => {
    const data = viewer.dataset.images;
    const images = data ? JSON.parse(data) : [];
    const leftPage = viewer.querySelector('.flipbook-viewer__page--left');
    const rightPage = viewer.querySelector('.flipbook-viewer__page--right');
    const counterCurrent = viewer.querySelector('[data-counter="current"]');
    const counterTotal = viewer.querySelector('[data-counter="total"]');
    let currentSpread = 0;
    let zoomLevel = 1;

    const spreads = [];
    for (let i = 0; i < images.length; i += 2) {
      spreads.push([images[i], images[i + 1] || null]);
    }

    const renderSpread = () => {
      const [left, right] = spreads[currentSpread] || [];
      leftPage.innerHTML = left ? `<img src="${left}" alt="Page ${currentSpread * 2 + 1}">` : '';
      rightPage.innerHTML = right ? `<img src="${right}" alt="Page ${currentSpread * 2 + 2}">` : '';
      if (counterCurrent) {
        counterCurrent.textContent = String(currentSpread + 1);
      }
      if (counterTotal) {
        counterTotal.textContent = String(spreads.length);
      }
    };

    const updateZoom = () => {
      viewer.querySelector('.flipbook-viewer__spread').style.transform = `scale(${zoomLevel})`;
    };

    renderSpread();
    updateZoom();

    viewer.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) {
        return;
      }
      const action = target.dataset.action;
      if (action === 'prev') {
        currentSpread = Math.max(0, currentSpread - 1);
        renderSpread();
      }
      if (action === 'next') {
        currentSpread = Math.min(spreads.length - 1, currentSpread + 1);
        renderSpread();
      }
      if (action === 'zoom-in') {
        zoomLevel = Math.min(1.6, zoomLevel + 0.1);
        updateZoom();
      }
      if (action === 'zoom-out') {
        zoomLevel = Math.max(0.7, zoomLevel - 0.1);
        updateZoom();
      }
      if (action === 'fit') {
        zoomLevel = 1;
        updateZoom();
      }
      if (action === 'fullscreen') {
        viewer.classList.toggle('flipbook-viewer--fullscreen');
      }
      if (action === 'close') {
        viewer.classList.add('flipbook-viewer--closed');
        viewer.style.display = 'none';
      }
    });
  });
});
