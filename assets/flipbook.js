document.addEventListener('DOMContentLoaded', () => {
  const viewers = document.querySelectorAll('.flipbook-viewer');

  viewers.forEach((viewer) => {
    const data = viewer.dataset.images;
    const pdfUrl = viewer.dataset.pdf;
    const images = data ? JSON.parse(data) : [];
    const leftPage = viewer.querySelector('.flipbook-viewer__page--left');
    const rightPage = viewer.querySelector('.flipbook-viewer__page--right');
    const counterCurrent = viewer.querySelector('[data-counter="current"]');
    const counterTotal = viewer.querySelector('[data-counter="total"]');
    let currentSpread = 0;
    let zoomLevel = 1;
    let pageCount = 0;
    let pdfDoc = null;
    let renderTask = null;
    let renderToken = 0;

    const spreads = [];
    for (let i = 0; i < images.length; i += 2) {
      spreads.push([images[i], images[i + 1] || null]);
    }

    const updateCounter = () => {
      if (counterCurrent) {
        counterCurrent.textContent = String(currentSpread + 1);
      }
      if (counterTotal) {
        counterTotal.textContent = String(pageCount || spreads.length || 1);
      }
    };

    const renderImageSpread = () => {
      const [left, right] = spreads[currentSpread] || [];
      leftPage.innerHTML = left ? `<img src="${left}" alt="Page ${currentSpread * 2 + 1}">` : '';
      rightPage.innerHTML = right ? `<img src="${right}" alt="Page ${currentSpread * 2 + 2}">` : '';
      pageCount = spreads.length;
      updateCounter();
    };

    const renderPdfPage = async (pageNumber, container) => {
      if (!pdfDoc) {
        return;
      }
      const token = ++renderToken;
      if (renderTask) {
        renderTask.cancel();
      }
      const page = await pdfDoc.getPage(pageNumber);
      if (token !== renderToken) {
        return;
      }
      const viewport = page.getViewport({ scale: zoomLevel });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      container.innerHTML = '';
      container.appendChild(canvas);
      renderTask = page.render({ canvasContext: context, viewport });
      await renderTask.promise;
    };

    const renderPdfSpread = async () => {
      if (!pdfDoc) {
        return;
      }
      const leftNumber = currentSpread * 2 + 1;
      const rightNumber = currentSpread * 2 + 2;
      await renderPdfPage(leftNumber, leftPage);
      if (rightNumber <= pageCount) {
        await renderPdfPage(rightNumber, rightPage);
      } else {
        rightPage.innerHTML = '';
      }
      updateCounter();
    };

    const renderSpread = () => {
      if (pdfUrl && window.pdfjsLib) {
        renderPdfSpread();
      } else {
        renderImageSpread();
      }
    };

    const updateZoom = () => {
      viewer.querySelector('.flipbook-viewer__spread').style.transform = `scale(${zoomLevel})`;
    };

    const setupPdf = async () => {
      if (!pdfUrl || !window.pdfjsLib) {
        renderImageSpread();
        updateZoom();
        return;
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';
      const loadingTask = window.pdfjsLib.getDocument({ url: pdfUrl, disableAutoFetch: false });
      pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;
      renderPdfSpread();
      updateZoom();
    };

    setupPdf();

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
        const maxSpread = Math.max(0, Math.ceil(pageCount / 2) - 1);
        currentSpread = Math.min(maxSpread, currentSpread + 1);
        renderSpread();
      }
      if (action === 'zoom-in') {
        zoomLevel = Math.min(1.6, zoomLevel + 0.1);
        updateZoom();
        renderSpread();
      }
      if (action === 'zoom-out') {
        zoomLevel = Math.max(0.7, zoomLevel - 0.1);
        updateZoom();
        renderSpread();
      }
      if (action === 'fit') {
        zoomLevel = 1;
        updateZoom();
        renderSpread();
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
