import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface DemoLayoutProps {
  children: ReactNode;
  mainClassName?: string;
  pageClassName?: string;
}

export function DemoLayout({
  children,
  mainClassName = "demo-main",
  pageClassName,
}: DemoLayoutProps) {
  const pageClass = ["demo-page", pageClassName].filter(Boolean).join(" ");

  return (
    <div className={pageClass}>
      <header className="demo-header">
        <Link to="/" className="demo-logo">
          GSL Components
        </Link>
        <nav className="demo-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              ["demo-nav-link", isActive ? "demo-nav-link--active" : ""]
                .filter(Boolean)
                .join(" ")
            }
          >
            Demo
          </NavLink>
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              ["demo-nav-link", isActive ? "demo-nav-link--active" : ""]
                .filter(Boolean)
                .join(" ")
            }
          >
            Docs
          </NavLink>
          <ThemeToggle />
        </nav>
      </header>

      <main className={mainClassName}>{children}</main>
    </div>
  );
}
