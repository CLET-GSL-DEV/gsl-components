/** A4 width/height in PDF points (1/72"). */
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

export interface JpegPage {
  data: Uint8Array;
  width: number;
  height: number;
}

let embeddedFontCssPromise: Promise<string> | null = null;

/**
 * Rasterize a DOM node to JPEG bytes via SVG foreignObject + canvas.
 * Embeds used webfonts so metrics match on-screen layout (avoids reflow/wrap).
 */
export async function rasterizeElementToJpeg(
  element: HTMLElement,
  embeddedFontCss?: string,
): Promise<JpegPage> {
  await document.fonts.ready;

  const width = Math.max(1, Math.ceil(element.scrollWidth || element.offsetWidth));
  const height = Math.max(
    1,
    Math.ceil(element.scrollHeight || element.offsetHeight),
  );

  const clone = element.cloneNode(true) as HTMLElement;
  copyComputedStyles(element, clone);
  const live = getComputedStyle(element);
  // Lock the page box so SVG layout matches the live element width.
  // Re-apply root padding explicitly: class stylesheets are unavailable inside
  // SVG foreignObject, and we skip padding on descendants to avoid wrap bugs.
  clone.style.width = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.boxSizing = "border-box";
  clone.style.paddingTop = live.paddingTop;
  clone.style.paddingRight = live.paddingRight;
  clone.style.paddingBottom = live.paddingBottom;
  clone.style.paddingLeft = live.paddingLeft;
  clone.style.overflow = "hidden";
  clone.style.whiteSpace = "normal";
  clone.style.wordBreak = "normal";
  clone.style.overflowWrap = "normal";
  clone.style.backgroundColor = live.backgroundColor || "#ffffff";

  const fontCss =
    embeddedFontCss ?? (await getEmbeddedFontCss(["Matimo"]));
  const serialized = ensureXhtmlNamespace(
    new XMLSerializer().serializeToString(clone),
  );
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <style type="text/css"><![CDATA[
${fontCss}
    ]]></style>
  </defs>
  <foreignObject x="0" y="0" width="${width}" height="${height}">
    ${serialized}
  </foreignObject>
</svg>`;

  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable");
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    return {
      data: dataUrlToBytes(dataUrl),
      width,
      height,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to rasterize document page");
  }
}

/**
 * Build a multi-page PDF (one JPEG image per A4 page, letterboxed to fit).
 */
export function buildPdfFromJpegPages(pages: JpegPage[]): Uint8Array {
  if (pages.length === 0) {
    throw new Error("At least one page is required");
  }

  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [0];
  let size = 0;

  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
    parts.push(bytes);
    size += bytes.length;
  };

  const addObject = (objectNumber: number, body: string | Uint8Array[]) => {
    offsets[objectNumber] = size;
    push(`${objectNumber} 0 obj\n`);
    if (typeof body === "string") {
      push(body);
    } else {
      for (const part of body) push(part);
    }
    push("\nendobj\n");
  };

  push("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  const pageCount = pages.length;
  const pageRefs = pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ");

  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObject(
    2,
    `<< /Type /Pages /Kids [${pageRefs}] /Count ${pageCount} >>`,
  );

  pages.forEach((page, i) => {
    const pageObj = 3 + i * 3;
    const contentObj = 4 + i * 3;
    const imageObj = 5 + i * 3;

    const scale = Math.min(
      A4_WIDTH_PT / page.width,
      A4_HEIGHT_PT / page.height,
    );
    const drawW = page.width * scale;
    const drawH = page.height * scale;
    const offsetX = (A4_WIDTH_PT - drawW) / 2;
    const offsetY = (A4_HEIGHT_PT - drawH) / 2;

    const contentStream = encoder.encode(
      `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${offsetX.toFixed(2)} ${offsetY.toFixed(2)} cm\n/Im${i} Do\nQ\n`,
    );

    addObject(
      pageObj,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH_PT} ${A4_HEIGHT_PT}] /Contents ${contentObj} 0 R /Resources << /XObject << /Im${i} ${imageObj} 0 R >> >> >>`,
    );
    addObject(contentObj, [
      encoder.encode(`<< /Length ${contentStream.length} >>\nstream\n`),
      contentStream,
      encoder.encode("\nendstream"),
    ]);
    addObject(imageObj, [
      encoder.encode(
        `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.data.length} >>\nstream\n`,
      ),
      page.data,
      encoder.encode("\nendstream"),
    ]);
  });

  const xrefOffset = size;
  const maxObj = 2 + pageCount * 3;
  push(`xref\n0 ${maxObj + 1}\n`);
  push("0000000000 65535 f \n");
  for (let i = 1; i <= maxObj; i++) {
    push(`${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`);
  }
  push(
    `trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  );

  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * Rasterize each `.clet-document-viewer__page` and download a multi-page PDF.
 */
export async function downloadA4Pages(
  pagesRoot: HTMLElement,
  fileName: string,
): Promise<void> {
  const pageEls = Array.from(
    pagesRoot.querySelectorAll<HTMLElement>(".clet-document-viewer__page"),
  );
  if (pageEls.length === 0) return;

  const fontCss = await getEmbeddedFontCss(["Matimo"]);
  const jpegPages: JpegPage[] = [];
  for (const page of pageEls) {
    jpegPages.push(await rasterizeElementToJpeg(page, fontCss));
  }

  const pdf = buildPdfFromJpegPages(jpegPages);
  const safeName = fileName.replace(/\.(html|pdf)$/i, "");
  // Copy into a fresh ArrayBuffer-backed view for BlobPart typing.
  const pdfBytes = new Uint8Array(pdf.byteLength);
  pdfBytes.set(pdf);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeName}.pdf`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Visual / typography props only. Never bake computed width+padding (causes wrap). */
const STYLE_PROPS = [
  "color",
  "background",
  "background-color",
  "font",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "text-decoration",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-collapse",
  "border-spacing",
  "display",
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "justify-content",
  "align-items",
  "align-self",
  "gap",
  "row-gap",
  "column-gap",
  "grid-template-columns",
  "grid-template-rows",
  "vertical-align",
  "box-sizing",
  "white-space",
  "word-break",
  "overflow-wrap",
  "opacity",
  "list-style-type",
  "list-style-position",
] as const;

function copyComputedStyles(source: Element, target: Element): void {
  if (!(source instanceof HTMLElement) || !(target instanceof HTMLElement)) {
    return;
  }
  const computed = getComputedStyle(source);
  for (const prop of STYLE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value) target.style.setProperty(prop, value);
  }
  const sourceChildren = source.children;
  const targetChildren = target.children;
  const count = Math.min(sourceChildren.length, targetChildren.length);
  for (let i = 0; i < count; i++) {
    copyComputedStyles(sourceChildren[i]!, targetChildren[i]!);
  }
}

/** Ensure a single XHTML xmlns on the root. XMLSerializer may already add one. */
export function ensureXhtmlNamespace(serialized: string): string {
  if (/xmlns\s*=\s*["']http:\/\/www\.w3\.org\/1999\/xhtml["']/.test(serialized)) {
    return serialized;
  }
  return serialized.replace(
    /^<([a-zA-Z0-9:-]+)/,
    '<$1 xmlns="http://www.w3.org/1999/xhtml"',
  );
}

/**
 * Pull matching @font-face rules and rewrite src urls to base64 data URIs
 * so SVG foreignObject can use the same metrics as the live page.
 */
export async function getEmbeddedFontCss(
  families: string[],
): Promise<string> {
  if (!embeddedFontCssPromise) {
    embeddedFontCssPromise = embedFontFaces(families).catch((error) => {
      embeddedFontCssPromise = null;
      throw error;
    });
  }
  return embeddedFontCssPromise;
}

/** Test helper. Clears the font CSS cache between cases. */
export function resetEmbeddedFontCssCache(): void {
  embeddedFontCssPromise = null;
}

async function embedFontFaces(families: string[]): Promise<string> {
  const familyPattern = new RegExp(
    families.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "i",
  );
  const out: string[] = [];
  const seen = new Set<string>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const cssText = rule.cssText;
      if (!familyPattern.test(cssText) || seen.has(cssText)) continue;
      seen.add(cssText);

      const urlMatch = cssText.match(
        /url\(\s*(['"]?)([^'")]+)\1\s*\)/,
      );
      if (!urlMatch?.[2]) {
        out.push(cssText);
        continue;
      }

      const rawUrl = urlMatch[2];
      if (rawUrl.startsWith("data:")) {
        out.push(cssText);
        continue;
      }

      try {
        const absolute = new URL(rawUrl, sheet.href || window.location.href)
          .href;
        const response = await fetch(absolute);
        if (!response.ok) continue;
        const bytes = new Uint8Array(await response.arrayBuffer());
        const base64 = bytesToBase64(bytes);
        const mime = absolute.endsWith(".woff")
          ? "font/woff"
          : absolute.endsWith(".ttf")
            ? "font/ttf"
            : absolute.endsWith(".otf")
              ? "font/otf"
              : "font/woff2";
        out.push(
          cssText.replace(
            /url\(\s*(['"]?)([^'")]+)\1\s*\)/,
            `url("data:${mime};base64,${base64}")`,
          ),
        );
      } catch {
        // Skip fonts that cannot be fetched; fallback metrics may wrap.
      }
    }
  }

  return out.join("\n");
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to rasterize document page"));
    image.src = url;
  });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("Invalid canvas data URL");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
