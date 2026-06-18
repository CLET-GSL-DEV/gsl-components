import { Link, NavLink } from "react-router-dom";
import { docNavSections } from "../docs/nav";
import { githubUrl, npmUrl, packageName, packageVersion } from "../docs/site-meta";

function GitHubIcon() {
  return (
    <svg
      className="demo-docs__external-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg
      className="demo-docs__external-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-9.129 9.129 9.155 9.155-.017-13.837-9.129-9.129-9.155-9.155z" />
    </svg>
  );
}

export function DocsSidebar() {
  return (
    <>
      <div className="demo-docs__sidebar-brand">
        <span className="demo-docs__sidebar-name">{packageName}</span>
        <span className="demo-docs__sidebar-version">v{packageVersion}</span>
      </div>

      <nav className="demo-docs__nav" aria-label="Component documentation">
        {docNavSections.map((section) => (
          <div key={section.title} className="demo-docs__nav-section">
            <p className="demo-docs__nav-section-title">{section.title}</p>
            <div className="demo-docs__nav-links">
              {section.items.map((item) => (
                <NavLink
                  key={item.slug}
                  to={`/docs/${item.slug}`}
                  className={({ isActive }) =>
                    ["demo-docs__nav-link", isActive ? "demo-docs__nav-link--active" : ""]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  {item.title}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="demo-docs__sidebar-footer">
        <Link to="/" className="demo-docs__back-link">
          Back to demo
        </Link>

        <Link to="/docs/changelog" className="demo-docs__back-link">
          Changelog
        </Link>

        <div className="demo-docs__external-links">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="demo-docs__external-link"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="demo-docs__external-link"
          >
            <NpmIcon />
            npm
          </a>
        </div>
      </div>
    </>
  );
}
