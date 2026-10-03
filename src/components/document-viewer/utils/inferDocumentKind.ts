import type { DocumentViewerKind } from "../../../types/document-viewer";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif"]);

export interface InferDocumentKindInput {
  mimeType?: string;
  fileName?: string;
  src?: string;
  override?: DocumentViewerKind | "auto";
}

function extensionFrom(pathOrName: string | undefined): string | undefined {
  if (!pathOrName) return undefined;
  const cleaned = pathOrName.split(/[?#]/)[0] ?? pathOrName;
  const base = cleaned.split(/[/\\]/).pop() ?? cleaned;
  const dot = base.lastIndexOf(".");
  if (dot < 0 || dot === base.length - 1) return undefined;
  return base.slice(dot + 1).toLowerCase();
}

/**
 * Resolve whether a document can be previewed as PDF, image, or neither.
 * Explicit `override` (other than `"auto"`) wins over MIME / extension.
 */
export function inferDocumentKind(
  input: InferDocumentKindInput,
): DocumentViewerKind {
  const { override } = input;
  if (override && override !== "auto") return override;

  const mime = input.mimeType?.toLowerCase().trim() ?? "";
  if (mime === "application/pdf") return "pdf";
  if (
    mime === "image/png" ||
    mime === "image/jpeg" ||
    mime === "image/jpg" ||
    mime === "image/webp" ||
    mime === "image/gif"
  ) {
    return "image";
  }

  const ext =
    extensionFrom(input.fileName) ?? extensionFrom(input.src) ?? undefined;

  if (ext === "pdf") return "pdf";
  if (ext && IMAGE_EXTENSIONS.has(ext)) return "image";

  return "unsupported";
}
