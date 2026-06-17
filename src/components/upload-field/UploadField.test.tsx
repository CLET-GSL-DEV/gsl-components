import { createRef, useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UploadField } from "./UploadField";

function createFile(name: string, type: string, size = 1024) {
  return new File([new ArrayBuffer(size)], name, { type });
}

function setFileInput(files: File[]) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, "files", {
    value: files as unknown as FileList,
    configurable: true,
  });
  fireEvent.change(input);
}

describe("UploadField", () => {
  it("renders dropzone with placeholder", () => {
    render(<UploadField />);
    expect(screen.getByRole("button", { name: "Drop files here or click to browse" })).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    render(<UploadField placeholder="Upload your files" />);
    expect(screen.getByRole("button", { name: "Upload your files" })).toBeInTheDocument();
  });

  it("renders Upload icon when no files", () => {
    render(<UploadField />);
    expect(document.querySelector(".gsl-upload-field__placeholder .lucide-upload")).toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<UploadField ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies invalid styling and aria-invalid", () => {
    render(<UploadField invalid />);
    expect(document.querySelector(".gsl-upload-field--invalid")).toBeInTheDocument();
    expect(document.querySelector(".gsl-upload-field")).toHaveAttribute("aria-invalid", "true");
  });

  it("respects aria-invalid over invalid prop", () => {
    render(<UploadField invalid={false} aria-invalid="true" />);
    expect(document.querySelector(".gsl-upload-field--invalid")).toBeInTheDocument();
  });

  it("applies disabled styling and class", () => {
    render(<UploadField disabled />);
    expect(document.querySelector(".gsl-upload-field--disabled")).toBeInTheDocument();
  });

  it("forwards aria-describedby", () => {
    render(<UploadField aria-describedby="desc-id" />);
    expect(document.querySelector(".gsl-upload-field")).toHaveAttribute("aria-describedby", "desc-id");
  });

  it("merges classNames onto parts", () => {
    render(
      <UploadField
        className="custom-classname"
        classNames={{
          root: "custom-root",
          dropzone: "custom-dropzone",
          removeButton: "custom-remove",
        }}
      />,
    );

    expect(document.querySelector(".gsl-upload-field")).toHaveClass("custom-root");
    expect(document.querySelector(".gsl-upload-field")).toHaveClass("custom-classname");
    expect(document.querySelector(".gsl-upload-field__dropzone")).toHaveClass("custom-dropzone");
  });

  it("triggers onChange with single file on selection", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("photo.jpg", "image/jpeg")]);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("shows file info after selection", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("report.pdf", "application/pdf", 204800)]);

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("200 KB")).toBeInTheDocument();
  });

  it("shows remove button and clears file on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("doc.txt", "text/plain")]);

    const removeButton = await screen.findByRole("button", { name: "Remove file" });
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByText("Drop files here or click to browse")).toBeInTheDocument();
  });

  it("does not show remove button when disabled", () => {
    render(<UploadField disabled />);
    setFileInput([createFile("doc.txt", "text/plain")]);

    expect(screen.queryByRole("button", { name: "Remove file" })).not.toBeInTheDocument();
  });

  it("applies drag-over class when dragging over dropzone", () => {
    render(<UploadField />);
    const dropzone = document.querySelector(".gsl-upload-field__dropzone")!;
    fireEvent.dragOver(dropzone, { bubbles: true });
    expect(document.querySelector(".gsl-upload-field__dropzone--active")).toBeInTheDocument();
  });

  it("removes drag-over class on drag leave", () => {
    render(<UploadField />);
    const dropzone = document.querySelector(".gsl-upload-field__dropzone")!;
    fireEvent.dragOver(dropzone, { bubbles: true });
    expect(document.querySelector(".gsl-upload-field__dropzone--active")).toBeInTheDocument();

    fireEvent.dragLeave(dropzone, { bubbles: true });
    expect(document.querySelector(".gsl-upload-field__dropzone--active")).not.toBeInTheDocument();
  });

  it("handles multiple files when multiple is true", () => {
    const onChange = vi.fn();
    render(<UploadField multiple onChange={onChange} />);
    setFileInput([createFile("a.png", "image/png"), createFile("b.png", "image/png")]);

    const files = onChange.mock.calls[0][0];
    expect(files).toHaveLength(2);
  });

  it("supports controlled single value", () => {
    const file = createFile("avatar.jpg", "image/jpeg");
    render(<UploadField value={file} onChange={() => {}} />);

    expect(screen.getByText("avatar.jpg")).toBeInTheDocument();
  });

  it("supports controlled multiple value", () => {
    const file1 = createFile("a.jpg", "image/jpeg");
    const file2 = createFile("b.jpg", "image/jpeg");
    render(<UploadField value={[file1, file2]} onChange={() => {}} />);

    expect(screen.getByText("a.jpg")).toBeInTheDocument();
    expect(screen.getByText("b.jpg")).toBeInTheDocument();
  });

  it("displays correct icon for image files", () => {
    const file = createFile("photo.jpg", "image/jpeg");
    render(<UploadField value={file} onChange={() => {}} />);

    expect(document.querySelector(".lucide-file-image")).toBeInTheDocument();
  });

  it("displays correct icon for video files", () => {
    const file = createFile("movie.mp4", "video/mp4");
    render(<UploadField value={file} onChange={() => {}} />);

    expect(document.querySelector(".lucide-file-play")).toBeInTheDocument();
  });

  it("displays correct icon for pdf files", () => {
    const file = createFile("doc.pdf", "application/pdf");
    render(<UploadField value={file} onChange={() => {}} />);

    const fileIcon = document.querySelector(".gsl-upload-field__file-icon");
    expect(fileIcon?.querySelector("svg")).toBeInTheDocument();
  });

  it("displays correct icon for text files", () => {
    const file = createFile("notes.txt", "text/plain");
    render(<UploadField value={file} onChange={() => {}} />);

    expect(document.querySelector(".lucide-file-text")).toBeInTheDocument();
  });

  it("filters files exceeding maxSize", () => {
    const onChange = vi.fn();
    render(<UploadField maxSize={500} onChange={onChange} />);
    setFileInput([createFile("large.jpg", "image/jpeg", 1024)]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders with hidden file input having accept attribute", () => {
    render(<UploadField accept="image/*" />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("accept", "image/*");
  });

  it("renders with hidden file input having name attribute", () => {
    render(<UploadField name="avatar" />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("name", "avatar");
  });

  it("renders with default placeholder text", () => {
    render(<UploadField />);
    expect(screen.getByText("Drop files here or click to browse")).toBeInTheDocument();
  });

  it("calls onChange with null when value is removed from controlled state", async () => {
    const user = userEvent.setup();
    function TestWrapper() {
      const [file, setFile] = useState<File | null>(createFile("test.png", "image/png"));
      return <UploadField value={file} onChange={(v) => setFile(v as File | null)} />;
    }
    render(<TestWrapper />);

    expect(screen.getByText("test.png")).toBeInTheDocument();
    const removeButton = screen.getByRole("button", { name: "Remove file" });
    await user.click(removeButton);

    expect(screen.queryByText("test.png")).not.toBeInTheDocument();
  });
});
