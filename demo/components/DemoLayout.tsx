import type { ReactNode } from "react";

interface DemoLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export function DemoLayout({
  children,
  header,
  sidebar,
  className,
}: DemoLayoutProps) {
  return (
    <div className={cn("demo-dashboard", className)}>
      {header && <header className="demo-dashboard__header">{header}</header>}
      <div className="demo-dashboard__body">
        {sidebar && <aside className="demo-dashboard__sidebar">{sidebar}</aside>}
        <main className="demo-dashboard__main">{children}</main>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
