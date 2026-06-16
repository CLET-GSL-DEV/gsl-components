import { Link, NavLink, useParams } from "react-router-dom";
import { DocsLayout } from "../components/DocsLayout";
import { DocsSidebar } from "../components/DocsSidebar";
import { mdxComponents } from "../docs/mdx-components";
import { getDocPage } from "../docs/registry";
import { ThemeToggle } from "demo/components/ThemeToggle";

export function DocsPage() {
  const { componentId = "getting-started" } = useParams<{
    componentId?: string;
  }>();
  const page = getDocPage(componentId);
  const Content = page?.default;

  return (
    <DocsLayout mainClassName="demo-docs" pageClassName="demo-docs-page">
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

      <div className="demo-docs__layout">
        <aside className="demo-docs__sidebar">
          <DocsSidebar />
        </aside>

        <article className="demo-docs__content">
          {page && Content ? (
            <>
              <p className="demo-docs__eyebrow">@rfdtech/components</p>
              <Content components={mdxComponents} />
            </>
          ) : (
            <div className="demo-docs__not-found">
              <h1 className="demo-docs__title">Page not found</h1>
              <p className="demo-docs__summary">
                No documentation page exists for <code>{componentId}</code>.
              </p>
              <p>
                <Link to="/docs/getting-started">Go to getting started</Link>
              </p>
            </div>
          )}
        </article>
      </div>
    </DocsLayout>
  );
}
