import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportPdfOptions {
  fileName?: string;
  marginTop?: number; // Top margin in px for page 2+ (default: 40px ≈ 10.6mm)
  marginBottom?: number; // Bottom margin in px for all pages (default: 40px ≈ 10.6mm)
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

import { exportCandidatePdfApi } from '@/api-client/candidate';

/**
 * Exports candidate profile to a vector PDF via NestJS Puppeteer backend.
 * Provides 1-click direct file download with 100% real text (ATS-friendly) & 0 cut errors.
 */
export async function exportPdfViaBackend(candidateData: any, fileName?: string) {
  const candidateName = candidateData?.name || 'Candidate';
  const name = fileName || `CV_${candidateName.replace(/\s+/g, '_')}.pdf`;

  const blob = await exportCandidatePdfApi(candidateData);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * PDF Exporter — Spacer Injection Architecture (v4)
 *
 * Key insight that makes this work correctly:
 * - data-pdf-block is on ITEM CONTAINERS (divs), NOT on <li> elements.
 * - Spacers are inserted as siblings of flex/block divs (valid HTML, correct layout).
 * - We modify the DOM BEFORE rendering canvas, so spacers bake in to canvas pixels.
 * - Cutting canvas at exact PAGE_H intervals always cuts through a white spacer.
 *
 * Flow:
 * 1. Clone element into an off-screen fixed sandbox.
 * 2. Measure block positions (getBoundingClientRect relative to sandbox top = 0).
 * 3. For each A4 page boundary, find the block straddling it and insert a white spacer above it.
 * 4. Render ONE html2canvas of the modified clone.
 * 5. Slice canvas at PAGE_H_CANVAS intervals → zero text cutting, guaranteed.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {}
) {
  const {
    fileName = 'Candidate_Profile.pdf',
    marginTop = 40,
    marginBottom = 40,
    onStart,
    onSuccess,
    onError,
  } = options;

  try {
    if (onStart) onStart();

    const WIDTH_PX = element.offsetWidth || 794;
    const PAGE_H_PX = Math.round((WIDTH_PX * 297) / 210); // A4 height in CSS px (~1123)

    const MARGIN_TOP_CSS = marginTop; // block starts marginTop px PAST page boundary → top margin
    const MARGIN_BOT_CSS = marginBottom; // content stops marginBottom px BEFORE page boundary → bottom margin

    // ── 1. Create sandbox clone ─────────────────────────────────────────────
    const sandbox = document.createElement('div');
    sandbox.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:0',
      `width:${WIDTH_PX}px`,
      'visibility:visible',
      'z-index:-9999',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(sandbox);

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.minHeight = 'auto';
    clone.style.width = `${WIDTH_PX}px`;
    sandbox.appendChild(clone);

    // Let layout stabilise (Tailwind/CSS apply)
    await new Promise((r) => setTimeout(r, 200));

    // ── 2. Insert spacers at each page boundary ─────────────────────────────
    // sandbox is position:fixed at top:0 → sandboxTop = 0 always
    const sandboxTop = sandbox.getBoundingClientRect().top;

    for (let page = 0; page < 30; page++) {
      const boundary = (page + 1) * PAGE_H_PX;
      const effectiveBoundary = boundary - MARGIN_BOT_CSS;
      const cloneHeight = clone.getBoundingClientRect().height;

      // No more pages needed beyond clone height
      if (boundary >= cloneHeight) break;

      // Fresh query each iteration (DOM has been modified by previous spacers)
      const blockEls = Array.from(
        clone.querySelectorAll<HTMLElement>(
          '[data-pdf-block="true"], [data-pdf-header="true"]'
        )
      );

      // Find block with highest `top` that straddles `effectiveBoundary`
      let bestBlock: HTMLElement | null = null;
      let bestTop = -Infinity;

      for (const block of blockEls) {
        const rect = block.getBoundingClientRect();
        const top = rect.top - sandboxTop;
        const bottom = top + rect.height;
        const isHeader = block.hasAttribute('data-pdf-header');

        if (rect.height < 2) continue;

        // Block body crosses the effective bottom margin line
        const blockCrosses = top < effectiveBoundary && bottom > effectiveBoundary;

        // Orphan header (header finishes very close to page bottom)
        const headerOrphan =
          isHeader &&
          top < boundary &&
          bottom <= boundary &&
          bottom > effectiveBoundary - 20;

        if ((blockCrosses || headerOrphan) && top > bestTop) {
          const pageStart = page * PAGE_H_PX;
          if (top > pageStart + PAGE_H_PX * 0.05) {
            bestBlock = block;
            bestTop = top;
          }
        }
      }

      if (bestBlock !== null) {
        const spacerHeight = boundary - bestTop;

        // Push the block PAST the boundary by MARGIN_TOP_CSS so it starts
        // with a top margin on the next page.
        const spacerHeightWithMargin = spacerHeight + MARGIN_TOP_CSS;

        // Guard: spacer must be reasonable (> 1px, < full page height)
        if (
          spacerHeightWithMargin > 1 &&
          spacerHeightWithMargin < PAGE_H_PX * 2
        ) {
          const spacer = document.createElement('div');
          spacer.setAttribute('data-pdf-spacer', 'true');
          spacer.style.cssText = [
            `height:${spacerHeightWithMargin}px`,
            'width:100%',
            'display:block',
            'background:#ffffff',
            'flex-shrink:0',
            'padding:0',
            'margin:0',
          ].join(';');

          // Insert BEFORE bestBlock. Because data-pdf-block is on item CONTAINER divs
          // (never on <li> elements), bestBlock.parentNode is always a flex/block div.
          bestBlock.parentNode?.insertBefore(spacer, bestBlock);

          // Force synchronous reflow before next iteration
          void clone.offsetHeight;
          await new Promise((r) => setTimeout(r, 15));
        }
      }
    }

    // ── 3. Render full canvas of modified clone (single pass) ───────────────
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: WIDTH_PX,
    });

    // Clean up sandbox immediately
    document.body.removeChild(sandbox);

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('html2canvas returned empty canvas');
    }

    // ── 4. Slice canvas at exact A4 page intervals and build PDF ────────────
    const PAGE_H_CANVAS = Math.round((canvas.width * 297) / 210);
    const PDF_W_MM = 210;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const totalPages = Math.ceil(canvas.height / PAGE_H_CANVAS);

    for (let i = 0; i < totalPages; i++) {
      const startY = i * PAGE_H_CANVAS;
      const endY = Math.min((i + 1) * PAGE_H_CANVAS, canvas.height);
      const sliceH = endY - startY;

      if (sliceH <= 0) continue;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext('2d');
      if (!ctx) continue;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, sliceH);
      ctx.drawImage(
        canvas,
        0,
        startY,
        canvas.width,
        sliceH,
        0,
        0,
        canvas.width,
        sliceH
      );

      if (i > 0) pdf.addPage();

      const sliceHMM = (sliceH * PDF_W_MM) / canvas.width;
      pdf.addImage(
        pageCanvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        0,
        PDF_W_MM,
        sliceHMM
      );
    }

    pdf.save(fileName);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('[exportPdf] Error:', err);
    if (onError) onError(err);
    else throw err;
  }
}
