import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  SectionActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders title, description, and actions", () => {
    render(
      <SectionHeader>
        <SectionTitle>Users</SectionTitle>
        <SectionDescription>Manage who has access</SectionDescription>
        <SectionActions>
          <button type="button">Add user</button>
        </SectionActions>
      </SectionHeader>,
    );

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Manage who has access")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add user" })).toBeInTheDocument();
  });

  it("renders title as an h2", () => {
    render(<SectionTitle>Users</SectionTitle>);
    expect(screen.getByRole("heading", { level: 2, name: "Users" })).toBeInTheDocument();
  });

  it("renders without description or actions", () => {
    render(
      <SectionHeader>
        <SectionTitle>Users</SectionTitle>
      </SectionHeader>,
    );

    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("merges className and classNames on each part", () => {
    render(
      <SectionHeader className="root-custom" classNames={{ root: "root-parts" }}>
        <SectionTitle className="title-custom" classNames={{ title: "title-parts" }}>
          Users
        </SectionTitle>
        <SectionDescription
          className="desc-custom"
          classNames={{ description: "desc-parts" }}
        >
          Manage who has access
        </SectionDescription>
        <SectionActions className="actions-custom" classNames={{ actions: "actions-parts" }}>
          <button type="button">Add user</button>
        </SectionActions>
      </SectionHeader>,
    );

    expect(screen.getByText("Users").parentElement).toHaveClass(
      "root-custom",
      "root-parts",
    );
    expect(screen.getByText("Users")).toHaveClass("title-custom", "title-parts");
    expect(screen.getByText("Manage who has access")).toHaveClass(
      "desc-custom",
      "desc-parts",
    );
    expect(screen.getByRole("button", { name: "Add user" }).parentElement).toHaveClass(
      "actions-custom",
      "actions-parts",
    );
  });

  it("forwards refs", () => {
    const ref = { current: null };
    render(<SectionHeader ref={ref}>Content</SectionHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
