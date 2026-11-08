/* Animated flipbook for PDFs: pages turn like a magazine.
   Uses PDF.js (to read the PDF) and StPageFlip (for the page-turn animation), loaded only when needed. */

const FLIP_LIBS = {
  pdf: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  flip: "https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js"
};
const loadScript = src => new Promise((ok, fail) => {
  if (document.querySelector(`script[src="${src}"]`)) return ok();
  const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => fail(new Error("Could not load " + src));
  document.head.appendChild(s);
});
async function loadPdfJs() {
  await loadScript(FLIP_LIBS.pdf);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = FLIP_LIBS.worker;
  return window.pdfjsLib;
}

/* Renders every page of the PDF to a picture */
async function pdfToImages(url, targetWidth, onProgress) {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument(url).promise;
  const images = []; let ratio = 1.414;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    if (i === 1) ratio = base.height / base.width;
    const vp = page.getViewport({ scale: targetWidth / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.86));
    onProgress && onProgress(i, doc.numPages);
  }
  return { images, ratio };
}

/* First page as a picture (used by the admin to make the article cover) */
async function pdfFirstPageBlob(fileOrUrl, width = 1200) {
  const pdfjs = await loadPdfJs();
  const src = fileOrUrl instanceof Blob ? { data: new Uint8Array(await fileOrUrl.arrayBuffer()) } : fileOrUrl;
  const doc = await pdfjs.getDocument(src).promise;
  const page = await doc.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const vp = page.getViewport({ scale: width / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
  const ctx = canvas.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  return new Promise(ok => canvas.toBlob(ok, "image/jpeg", 0.88));
}

async function renderFlipbook(box, url, t = k => k) {
  box.innerHTML = `<div class="fb-status">${t("flip_loading")}</div>`;
  try {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { images, ratio } = await pdfToImages(url, 760 * dpr, (i, n) => {
      const st = box.querySelector(".fb-status"); if (st) st.textContent = `${t("flip_loading")} ${i} / ${n}`;
    });
    await loadScript(FLIP_LIBS.flip);
    box.innerHTML = `
      <div class="fb-stage"><div class="fb-book"></div></div>
      <div class="fb-bar">
        <button class="fb-prev" aria-label="Previous page">‹</button>
        <span class="fb-count"></span>
        <button class="fb-next" aria-label="Next page">›</button>
        <span class="fb-sep"></span>
        <button class="fb-full">${t("flip_fullscreen")}</button>
        <a class="fb-dl" href="${url}" target="_blank" rel="noopener" download>${t("flip_download")}</a>
      </div>`;
    const bookEl = box.querySelector(".fb-book");
    const W = 500, H = Math.round(W * ratio);
    const flip = new St.PageFlip(bookEl, {
      width: W, height: H, size: "stretch",
      minWidth: 260, maxWidth: 900, minHeight: Math.round(260 * ratio), maxHeight: Math.round(900 * ratio),
      showCover: true, usePortrait: true, mobileScrollSupport: true, maxShadowOpacity: 0.45, flippingTime: 800
    });
    flip.loadFromImages(images);
    const count = box.querySelector(".fb-count");
    const update = () => { count.textContent = `${t("flip_page")} ${flip.getCurrentPageIndex() + 1} / ${flip.getPageCount()}`; };
    flip.on("flip", update); flip.on("changeOrientation", update); update();
    box.querySelector(".fb-prev").onclick = () => flip.flipPrev();
    box.querySelector(".fb-next").onclick = () => flip.flipNext();
    box.querySelector(".fb-full").onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else (box.requestFullscreen || box.webkitRequestFullscreen || (() => {})).call(box);
    };
    box.tabIndex = 0;
    box.addEventListener("keydown", e => { if (e.key === "ArrowRight") flip.flipNext(); if (e.key === "ArrowLeft") flip.flipPrev(); });
    document.addEventListener("fullscreenchange", () => setTimeout(() => flip.update && flip.update(), 120));
  } catch (e) {
    console.warn(e);
    box.innerHTML = `<div class="fb-status">${t("flip_error")} <a href="${url}" target="_blank" rel="noopener">${t("flip_download")}</a></div>`;
  }
}
