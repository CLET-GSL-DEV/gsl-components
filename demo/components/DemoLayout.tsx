import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { AppSwitcher } from "@rfdtech/components";

const baseUrl = "";
const accessToken = "demo-token";

interface DemoLayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

export function DemoLayout({ children, mainClassName = "demo-main" }: DemoLayoutProps) {
  return (
    <div className="demo-page">
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
          <AppSwitcher
            baseUrl={baseUrl}
            accessToken={accessToken}
            title="System directory"
            onAppSelect={(app) => console.log("Selected:", app.name, app.metadata)}
          />
        </nav>
      </header>

      <main className={mainClassName}>{children}</main>
    </div>
  );
}
