import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentViewer, DocumentViewerPage } from "./DocumentViewer";

function createFile(name: string, type: string, size = 64) {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("DocumentViewer", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders a PDF iframe for an application/pdf file", () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-pdf");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    const file = createFile("report.pdf", "application/pdf");
    const { unmount } = render(
      <DocumentViewer file={file} name="report.pdf" />,
    );

    const iframe = screen.getByTitle("report.pdf");
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute("src", "blob:mock-pdf");
    expect(createObjectURL).toHaveBeenCalledWith(file);

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-pdf");
  });

  it("renders an img for an image src", () => {
    render(
      <DocumentViewer
        src="https://cdn.example/photo.png"
        name="photo.png"
        type="image"
      />,
    );

    const img = screen.getByRole("img", { name: "photo.png" });
    expect(img).toHaveAttribute("src", "https://cdn.example/photo.png");
  });

  it("shows unsupported fallback copy for other types", () => {
    render(
      <DocumentViewer
        src="https://cdn.example/notes.docx"
        name="notes.docx"
      />,
    );

    expect(screen.getByText("Preview not available")).toBeInTheDocument();
    expect(
      screen.getByText(/cannot be previewed in the browser/i),
    ).toBeInTheDocument();
  });

  it("renders DocumentViewerPage sheets in an A4 stack when there is no src or file", () => {
    render(
      <DocumentViewer name="Invoice">
        <DocumentViewerPage>
          <p>Page one</p>
        </DocumentViewerPage>
        <DocumentViewerPage>
          <p>Page two</p>
        </DocumentViewerPage>
      </DocumentViewer>,
    );

    const stack = document.querySelector(".clet-document-viewer__pages");
    const pages = document.querySelectorAll(".clet-document-viewer__page");
    expect(stack).toBeInTheDocument();
    expect(pages).toHaveLength(2);
    expect(pages[0]).toHaveTextContent("Page one");
    expect(pages[1]).toHaveTextContent("Page two");
  });

  it("shows an A4 download button by default and hides it when download is false", () => {
    const { rerender } = render(
      <DocumentViewer name="INV-2026-0142">
        <DocumentViewerPage>
          <p>Page one</p>
        </DocumentViewerPage>
      </DocumentViewer>,
    );

    expect(
      screen.getByRole("button", { name: "Download INV-2026-0142" }),
    ).toBeInTheDocument();

    rerender(
      <DocumentViewer name="INV-2026-0142" download={false}>
        <DocumentViewerPage>
          <p>Page one</p>
        </DocumentViewerPage>
      </DocumentViewer>,
    );

    expect(
      screen.queryByRole("button", { name: /download/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a download link by default when src is set", () => {
    render(
      <DocumentViewer
        src="https://cdn.example/doc.pdf"
        name="doc.pdf"
        type="pdf"
      />,
    );

    expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /download/i });
    expect(link).toHaveAttribute("href", "https://cdn.example/doc.pdf");
    expect(link).toHaveAttribute("download");
  });

  it("hides the download link when download is false", () => {
    render(
      <DocumentViewer
        src="https://cdn.example/doc.pdf"
        name="doc.pdf"
        type="pdf"
        download={false}
      />,
    );

    expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /download/i })).not.toBeInTheDocument();
  });

  it("shows a loading placeholder and hides the frame", () => {
    render(
      <DocumentViewer
        src="https://cdn.example/doc.pdf"
        name="doc.pdf"
        type="pdf"
        loading
      />,
    );

    expect(
      screen.getByText("Loading document…"),
    ).toBeInTheDocument();
    expect(document.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("prefers file preview over children when both are provided", () => {
    render(
      <DocumentViewer
        src="https://cdn.example/a.png"
        type="image"
        name="a.png"
      >
        <p>Should not show</p>
      </DocumentViewer>,
    );

    expect(screen.getByRole("img", { name: "a.png" })).toBeInTheDocument();
    expect(screen.queryByText("Should not show")).not.toBeInTheDocument();
  });

  it("shows empty fallback when there is no source and no children", () => {
    render(<DocumentViewer />);
    expect(screen.getByText("No document to preview")).toBeInTheDocument();
  });

  it("navigates a documents gallery with prev/next and status", () => {
    render(
      <DocumentViewer
        documents={[
          {
            src: "https://cdn.example/a.pdf",
            name: "a.pdf",
            type: "pdf",
          },
          {
            src: "https://cdn.example/b.png",
            name: "b.png",
            type: "image",
          },
          {
            src: "https://cdn.example/c.docx",
            name: "c.docx",
          },
        ]}
      />,
    );

    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByTitle("a.pdf")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous document" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next document" }));
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
    expect(screen.getByText("b.png")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "b.png" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next document" }));
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    expect(screen.getByText("c.docx")).toBeInTheDocument();
    expect(screen.getByText("Preview not available")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next document" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous document" }));
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "b.png" })).toBeInTheDocument();
  });

  it("supports controlled index and keyboard arrows", () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(
      <DocumentViewer
        documents={[
          { src: "https://cdn.example/a.pdf", name: "a.pdf", type: "pdf" },
          { src: "https://cdn.example/b.png", name: "b.png", type: "image" },
        ]}
        index={0}
        onIndexChange={onIndexChange}
      />,
    );

    const region = screen.getByRole("region", {
      name: /Document preview: a\.pdf/i,
    });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenCalledWith(1);

    rerender(
      <DocumentViewer
        documents={[
          { src: "https://cdn.example/a.pdf", name: "a.pdf", type: "pdf" },
          { src: "https://cdn.example/b.png", name: "b.png", type: "image" },
        ]}
        index={1}
        onIndexChange={onIndexChange}
      />,
    );

    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "b.png" })).toBeInTheDocument();

    fireEvent.keyDown(
      screen.getByRole("region", { name: /Document preview: b\.png/i }),
      { key: "ArrowLeft" },
    );
    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it("hides nav when documents has a single item", () => {
    render(
      <DocumentViewer
        documents={[
          { src: "https://cdn.example/solo.pdf", name: "solo.pdf", type: "pdf" },
        ]}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Previous document" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/of/)).not.toBeInTheDocument();
    expect(screen.getByTitle("solo.pdf")).toBeInTheDocument();
  });
});
