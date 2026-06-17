import type { ReactNode } from "react";

interface DocsLayoutProps {
  children: ReactNode;
  mainClassName?: string;
  pageClassName?: string;
}

export function DocsLayout({
  children,
  mainClassName = "demo-main",
  pageClassName,
}: DocsLayoutProps) {
  const pageClass = ["demo-page", pageClassName].filter(Boolean).join(" ");

  return (
    <div className={pageClass}>
      <main className={mainClassName}>{children}</main>
    </div>
  );
}
