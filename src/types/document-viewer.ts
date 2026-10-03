import type { HTMLAttributes, ReactNode } from "react";

export type DocumentViewerKind = "pdf" | "image" | "unsupported";

export interface DocumentViewerItem {
  src?: string;
  file?: File | Blob;
  name?: string;
  type?: DocumentViewerKind | "auto";
}

export interface DocumentViewerClassNames {
  root?: string;
  toolbar?: string;
  title?: string;
  canvas?: string;
  frame?: string;
  /** Stack that holds one or more `DocumentViewerPage` sheets in A4 mode. */
  pages?: string;
  /** Applied when a consumer still targets the page part via the root `classNames`. Prefer `DocumentViewerPage`. */
  page?: string;
  fallback?: string;
  nav?: string;
  navButton?: string;
  navStatus?: string;
}

export interface DocumentViewerPageClassNames {
  root?: string;
}

export interface DocumentViewerPageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  classNames?: DocumentViewerPageClassNames;
  className?: string;
}

export interface DocumentViewerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Remote or blob URL. Mutually exclusive with `file`, `documents`, and A4 `children` mode. */
  src?: string;
  /** Local file/blob. Creates/revokes an object URL internally. */
  file?: File | Blob;
  /**
   * Multiple documents with prev/next navigation. When non-empty, wins over
   * `src` / `file` / A4 `children`.
   */
  documents?: DocumentViewerItem[];
  /** Controlled index into `documents`. */
  index?: number;
  /** Uncontrolled initial index into `documents`. Default 0. */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Override MIME inference (`file.type` / URL extension). */
  type?: DocumentViewerKind | "auto";
  /** Shown in the toolbar; also used as iframe title / img alt. */
  name?: string;
  /**
   * When set without `src`/`file`/`documents`, renders children in an A4 page stack.
   * Wrap each sheet in `DocumentViewerPage`.
   */
  children?: ReactNode;
  /**
   * Show chrome with name (and optional download). Defaults to true when
   * `name`, `src`, `file`, or `documents` is present.
   */
  showToolbar?: boolean;
  /**
   * Show a download control when a resolvable URL/`file` exists, or when
   * rendering an A4 React document (rasterizes sheets into a multi-page `.pdf`).
   * Defaults to `true`; pass `false` to hide download.
   */
  download?: boolean;
  loading?: boolean;
  classNames?: DocumentViewerClassNames;
}
