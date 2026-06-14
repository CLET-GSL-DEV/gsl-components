import { Link, useParams } from "react-router-dom";
import { DemoLayout } from "../components/DemoLayout";
import { DocsSidebar } from "../components/DocsSidebar";
import { mdxComponents } from "../docs/mdx-components";
import { getDocPage } from "../docs/registry";

export function DocsPage() {
  const { componentId = "getting-started" } = useParams<{ componentId?: string }>();
  const page = getDocPage(componentId);
  const Content = page?.default;

  return (
    <DemoLayout mainClassName="demo-docs" pageClassName="demo-docs-page">
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
    </DemoLayout>
  );
}
