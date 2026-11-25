import { getDocument, GlobalWorkerOptions, PDFWorker, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';

const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

/** Stay under the canvas dimension limits on iOS Safari. */
const MAX_CANVAS_EDGE = 4096;
const MAX_CANVAS_PIXELS = 8_000_000;

function ensureWorker() {
  if (GlobalWorkerOptions.workerSrc !== workerSrc) GlobalWorkerOptions.workerSrc = workerSrc;
}

function paintSize(fitWidth: number, zoom: number, aspect: number) {
  let cssWidth = Math.max(160, Math.floor(fitWidth * zoom));
  let cssHeight = Math.max(1, Math.floor(cssWidth * aspect));
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const fits = () => {
    const width = cssWidth * pixelRatio;
    const height = cssHeight * pixelRatio;
    return width <= MAX_CANVAS_EDGE && height <= MAX_CANVAS_EDGE && width * height <= MAX_CANVAS_PIXELS;
  };
  while (!fits() && pixelRatio > 1) pixelRatio = Math.round((pixelRatio - 0.25) * 100) / 100;
  if (!fits()) {
    const limit = Math.min(MAX_CANVAS_EDGE / pixelRatio, MAX_CANVAS_EDGE / aspect / pixelRatio);
    cssWidth = Math.max(1, Math.floor(Math.min(cssWidth, limit)));
    cssHeight = Math.max(1, Math.floor(cssWidth * aspect));
  }
  return { cssWidth, cssHeight, pixelRatio: Math.max(1, pixelRatio) };
}

/** Parse bytes with a private worker so closing one CV cannot stop another. */
export async function openPdf(data: ArrayBuffer, signal: AbortSignal): Promise<{ pdf: PDFDocumentProxy; destroy: () => Promise<void> }> {
  ensureWorker();
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

  const worker = new PDFWorker();
  const loadingTask = getDocument({
    data: data.slice(0),
    worker,
    disableRange: true,
    disableStream: true,
    disableAutoFetch: true,
    useWasm: false,
    useSystemFonts: true,
    canvasMaxAreaInBytes: MAX_CANVAS_EDGE * MAX_CANVAS_EDGE,
  });
  let closed = false;
  const destroy = async () => {
    if (closed) return;
    closed = true;
    await loadingTask.destroy().catch(() => undefined);
  };

  const onAbort = () => void destroy();
  signal.addEventListener('abort', onAbort, { once: true });
  try {
    const pdf = await loadingTask.promise;
    signal.removeEventListener('abort', onAbort);
    if (signal.aborted) {
      await destroy();
      throw new DOMException('Aborted', 'AbortError');
    }
    return { pdf, destroy };
  } catch (error) {
    signal.removeEventListener('abort', onAbort);
    await destroy();
    throw error;
  }
}

/** Paint every page. The caller owns the document and can paint it again when zoom changes. */
export async function paintPdfPages(
  pdf: PDFDocumentProxy,
  options: { container: HTMLElement; width: number; zoom: number; signal: AbortSignal }
): Promise<void> {
  if (options.signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const renders: RenderTask[] = [];
  const cancel = () => {
    for (const task of renders) task.cancel();
  };
  options.signal.addEventListener('abort', cancel, { once: true });

  try {
    const holder = document.createElement('div');
    for (let number = 1; number <= pdf.numPages; number += 1) {
      if (options.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const { cssWidth, cssHeight, pixelRatio } = paintSize(options.width, options.zoom, base.height / base.width);
      const viewport = page.getViewport({ scale: (cssWidth / base.width) * pixelRatio });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      canvas.setAttribute('aria-hidden', 'true');

      const article = document.createElement('article');
      article.dataset.cvPage = String(number);
      article.setAttribute('aria-label', `${number} / ${pdf.numPages}`);
      article.append(canvas);

      const task = page.render({ canvas, viewport, background: '#ffffff' });
      renders.push(task);
      await task.promise;

      const content = await page.getTextContent();
      const text = document.createElement('p');
      text.className = 'sr-only';
      text.textContent = content.items
        .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      article.append(text);
      holder.append(article);
    }

    if (options.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    options.container.replaceChildren(...holder.childNodes);
  } finally {
    options.signal.removeEventListener('abort', cancel);
  }
}
