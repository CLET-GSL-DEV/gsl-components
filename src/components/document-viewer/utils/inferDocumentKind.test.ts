import { describe, expect, it } from "vitest";
import { inferDocumentKind } from "./inferDocumentKind";

describe("inferDocumentKind", () => {
  it("returns pdf for application/pdf MIME", () => {
    expect(inferDocumentKind({ mimeType: "application/pdf" })).toBe("pdf");
  });

  it("returns pdf for .pdf extension in a name or URL", () => {
    expect(inferDocumentKind({ fileName: "report.PDF" })).toBe("pdf");
    expect(inferDocumentKind({ src: "https://cdn.example/docs/a.pdf?x=1" })).toBe(
      "pdf",
    );
  });

  it("returns image for image/* MIME and listed extensions", () => {
    expect(inferDocumentKind({ mimeType: "image/png" })).toBe("image");
    expect(inferDocumentKind({ mimeType: "image/jpeg" })).toBe("image");
    expect(inferDocumentKind({ fileName: "photo.webp" })).toBe("image");
    expect(inferDocumentKind({ fileName: "scan.gif" })).toBe("image");
    expect(inferDocumentKind({ src: "/assets/hero.jpg" })).toBe("image");
  });

  it("returns unsupported for other types", () => {
    expect(inferDocumentKind({ mimeType: "application/msword" })).toBe(
      "unsupported",
    );
    expect(inferDocumentKind({ fileName: "notes.docx" })).toBe("unsupported");
    expect(inferDocumentKind({ src: "https://example.com/data.csv" })).toBe(
      "unsupported",
    );
    expect(inferDocumentKind({})).toBe("unsupported");
  });

  it("prefers an explicit override over inference", () => {
    expect(
      inferDocumentKind({
        mimeType: "image/png",
        override: "pdf",
      }),
    ).toBe("pdf");
    expect(
      inferDocumentKind({
        fileName: "a.pdf",
        override: "auto",
      }),
    ).toBe("pdf");
  });
});
