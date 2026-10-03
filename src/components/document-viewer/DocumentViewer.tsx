import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type {
  DocumentViewerItem,
  DocumentViewerPageProps,
  DocumentViewerProps,
} from "../../types/document-viewer";
import { cn } from "../../utils/cn";
import { downloadA4Pages } from "./utils/downloadA4Pages";
import { inferDocumentKind } from "./utils/inferDocumentKind";
import "./styles/document-viewer.css";

function fileDisplayName(
  file: File | Blob | undefined,
  name?: string,
): string | undefined {
  if (name) return name;
  if (file && "name" in file && typeof file.name === "string") return file.name;
  return undefined;
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(0, index), length - 1);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * One A4 sheet inside `DocumentViewer` A4 mode. Stack multiple pages as siblings.
 */
export const DocumentViewerPage = /* @__PURE__ */ forwardRef<HTMLDivElement, DocumentViewerPageProps>(
  function DocumentViewerPage(
    { classNames, className, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "clet-document-viewer__page",
          classNames?.root,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

/**
 * Read-only document preview: PDF and images via native browser embeds,
 * multi-document galleries with prev/next, or React children in an A4 page
 * stack (`DocumentViewerPage`). Compose inside Modal/Sheet as needed.
 */
export const DocumentViewer = /* @__PURE__ */ forwardRef<HTMLDivElement, DocumentViewerProps>(
  function DocumentViewer(
    {
      src,
      file,
      documents,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      type = "auto",
      name,
      children,
      showToolbar,
      download = true,
      loading = false,
      classNames,
      className,
      "aria-label": ariaLabel,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    const isGallery = Boolean(documents && documents.length > 0);
    const docCount = documents?.length ?? 0;

    const isIndexControlled = indexProp !== undefined;
    const [uncontrolledIndex, setUncontrolledIndex] = useState(() =>
      clampIndex(defaultIndex, docCount || 1),
    );

    const activeIndex = isGallery
      ? clampIndex(
          isIndexControlled ? (indexProp as number) : uncontrolledIndex,
          docCount,
        )
      : 0;

    useEffect(() => {
      if (!isGallery || isIndexControlled) return;
      setUncontrolledIndex((prev) => clampIndex(prev, docCount));
    }, [docCount, isGallery, isIndexControlled]);

    function setActiveIndex(next: number) {
      if (!isGallery) return;
      const clamped = clampIndex(next, docCount);
      if (clamped === activeIndex) return;
      if (!isIndexControlled) setUncontrolledIndex(clamped);
      onIndexChange?.(clamped);
    }

    const activeItem: DocumentViewerItem | undefined = isGallery
      ? documents![activeIndex]
      : undefined;

    const activeSrc = isGallery ? activeItem?.src : src;
    const activeFile = isGallery ? activeItem?.file : file;
    const activeType = isGallery ? (activeItem?.type ?? "auto") : type;
    const activeName = isGallery ? activeItem?.name : name;

    const hasFileSource = Boolean(activeSrc || activeFile);
    const isA4Mode = !isGallery && !hasFileSource && children != null;
    const displayName = fileDisplayName(activeFile, activeName);
    const pagesRef = useRef<HTMLDivElement>(null);

    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
      if (!activeFile) {
        setObjectUrl(null);
        return;
      }
      const url = URL.createObjectURL(activeFile);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }, [activeFile]);

    const activeUrl = activeFile ? objectUrl : activeSrc ?? null;

    const kind = useMemo(() => {
      if (!hasFileSource) return null;
      const mimeType = activeFile?.type;
      const fileName =
        displayName ??
        (typeof activeSrc === "string" ? activeSrc : undefined);
      return inferDocumentKind({
        mimeType,
        fileName,
        src: activeSrc,
        override: activeType,
      });
    }, [hasFileSource, activeFile, displayName, activeSrc, activeType]);

    const showNav = isGallery && docCount > 1;
    const toolbarVisible =
      showToolbar ??
      Boolean(displayName || hasFileSource || isA4Mode || isGallery);
    const canDownload = download && Boolean(activeUrl || isA4Mode);

    const rootLabel =
      ariaLabel ??
      (displayName
        ? `Document preview: ${displayName}`
        : isGallery
          ? `Document preview, ${activeIndex + 1} of ${docCount}`
          : "Document preview");

    const downloadLabel = displayName
      ? `Download ${displayName}`
      : "Download";

    function handleDownloadA4() {
      if (!pagesRef.current) return;
      void downloadA4Pages(pagesRef.current, displayName ?? "document").catch(
        (error: unknown) => {
          console.error("DocumentViewer download failed", error);
        },
      );
    }

    function goPrev() {
      setActiveIndex(activeIndex - 1);
    }

    function goNext() {
      setActiveIndex(activeIndex + 1);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented || !showNav) return;
      if (isEditableTarget(event.target)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    return (
      <div
        ref={ref}
        role="region"
        aria-label={rootLabel}
        onKeyDown={handleKeyDown}
        className={cn(
          "clet-document-viewer",
          isA4Mode && "clet-document-viewer--a4",
          classNames?.root,
          className,
        )}
        {...props}
      >
        {toolbarVisible ? (
          <div
            className={cn(
              "clet-document-viewer__toolbar",
              classNames?.toolbar,
            )}
          >
            <span
              className={cn(
                "clet-document-viewer__title",
                classNames?.title,
              )}
            >
              {displayName ?? "Document"}
            </span>
            {showNav ? (
              <div
                className={cn(
                  "clet-document-viewer__nav",
                  classNames?.nav,
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "clet-document-viewer__nav-button",
                    classNames?.navButton,
                  )}
                  aria-label="Previous document"
                  disabled={activeIndex <= 0}
                  onClick={goPrev}
                >
                  <ChevronLeft size={18} strokeWidth={1.5} aria-hidden />
                </button>
                <span
                  className={cn(
                    "clet-document-viewer__nav-status",
                    classNames?.navStatus,
                  )}
                  aria-live="polite"
                >
                  {activeIndex + 1} of {docCount}
                </span>
                <button
                  type="button"
                  className={cn(
                    "clet-document-viewer__nav-button",
                    classNames?.navButton,
                  )}
                  aria-label="Next document"
                  disabled={activeIndex >= docCount - 1}
                  onClick={goNext}
                >
                  <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
                </button>
              </div>
            ) : null}
            {canDownload && activeUrl ? (
              <a
                className="clet-document-viewer__download"
                href={activeUrl}
                download={displayName || true}
                aria-label={downloadLabel}
              >
                <Download size={16} strokeWidth={1.5} aria-hidden />
                Download
              </a>
            ) : null}
            {canDownload && !activeUrl && isA4Mode ? (
              <button
                type="button"
                className="clet-document-viewer__download"
                aria-label={downloadLabel}
                onClick={handleDownloadA4}
              >
                <Download size={16} strokeWidth={1.5} aria-hidden />
                Download
              </button>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            "clet-document-viewer__canvas",
            classNames?.canvas,
          )}
        >
          {loading || (activeFile && !objectUrl) ? (
            <div
              className={cn(
                "clet-document-viewer__fallback",
                classNames?.fallback,
              )}
              aria-busy="true"
            >
              Loading document…
            </div>
          ) : isA4Mode ? (
            <div
              ref={pagesRef}
              className={cn(
                "clet-document-viewer__pages",
                classNames?.pages,
              )}
            >
              {children}
            </div>
          ) : hasFileSource && kind === "pdf" && activeUrl ? (
            <div
              className={cn(
                "clet-document-viewer__frame",
                classNames?.frame,
              )}
            >
              <iframe
                className="clet-document-viewer__iframe"
                title={displayName ?? "PDF document"}
                src={activeUrl}
              />
            </div>
          ) : hasFileSource && kind === "image" && activeUrl ? (
            <div
              className={cn(
                "clet-document-viewer__frame",
                "clet-document-viewer__frame--image",
                classNames?.frame,
              )}
            >
              <img
                className="clet-document-viewer__image"
                src={activeUrl}
                alt={displayName ?? "Document image"}
              />
            </div>
          ) : hasFileSource ? (
            <div
              className={cn(
                "clet-document-viewer__fallback",
                classNames?.fallback,
              )}
            >
              <FileText
                size={32}
                strokeWidth={1.5}
                aria-hidden
                className="clet-document-viewer__fallback-icon"
              />
              <div className="clet-document-viewer__fallback-title">
                Preview not available
              </div>
              <div className="clet-document-viewer__fallback-body">
                This file type cannot be previewed in the browser.
                {download && activeUrl
                  ? " Use Download to open it locally."
                  : ""}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "clet-document-viewer__fallback",
                classNames?.fallback,
              )}
            >
              <div className="clet-document-viewer__fallback-title">
                No document to preview
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
