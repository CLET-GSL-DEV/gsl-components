import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";

function renderBreadcrumbTrail({
  classNames,
  className,
}: {
  classNames?: { root?: string };
  className?: string;
} = {}) {
  return render(
    <Breadcrumb classNames={classNames} className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Profile</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
}

describe("Breadcrumb", () => {
  it("renders navigation landmark with default aria-label", () => {
    renderBreadcrumbTrail();

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveClass("gsl-breadcrumb");
  });

  it("exposes aria-current on the current page", () => {
    renderBreadcrumbTrail();

    const currentPage = screen.getByText("Profile");
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage).toHaveClass("gsl-breadcrumb__page");
  });

  it("renders links with breadcrumb link styles", () => {
    renderBreadcrumbTrail();

    expect(screen.getByRole("link", { name: "Home" })).toHaveClass(
      "gsl-breadcrumb__link",
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveClass(
      "gsl-breadcrumb__link",
    );
  });

  it("merges classes onto child when BreadcrumbLink uses asChild", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild href="/reports">
              <a href="/reports" className="child-link">
                Reports
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveClass("gsl-breadcrumb__link");
    expect(link).toHaveClass("child-link");
  });

  it("renders separator as aria-hidden with default chevron", () => {
    const { container } = renderBreadcrumbTrail();

    const separators = container.querySelectorAll(".gsl-breadcrumb__separator");
    expect(separators).toHaveLength(2);
    separators.forEach((separator) => {
      expect(separator).toHaveAttribute("aria-hidden", "true");
      expect(separator).toHaveAttribute("role", "presentation");
    });
  });

  it("merges className and classNames without dropping base classes", () => {
    renderBreadcrumbTrail({
      classNames: { root: "custom-root" },
      className: "extra-root",
    });

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveClass("gsl-breadcrumb", "custom-root", "extra-root");
  });
});
