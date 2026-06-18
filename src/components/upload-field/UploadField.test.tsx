import { createRef } from "react";
import { useForm } from "react-hook-form";
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
  it("renders dropzone with title and subtitle", () => {
    render(<UploadField accept=".csv" maxSize={10 * 1024 * 1024} />);
    expect(screen.getByText("Click to upload or drag and drop")).toBeInTheDocument();
    expect(screen.getByText("Only CSV files are supported. Maximum filesize 10MB.")).toBeInTheDocument();
  });

  it("renders upload button", () => {
    render(<UploadField />);
    expect(document.querySelector(".gsl-upload-field__action")).toHaveTextContent("Upload file");
  });

  it("renders cloud upload icon", () => {
    render(<UploadField />);
    expect(document.querySelector(".gsl-upload-field__icon .lucide-cloud-upload")).toBeInTheDocument();
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
          removeButton: "custom-remove",
        }}
      />,
    );
    expect(document.querySelector(".gsl-upload-field")).toHaveClass("custom-root");
    expect(document.querySelector(".gsl-upload-field")).toHaveClass("custom-classname");
  });

  it("triggers onChange with single file on selection", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("photo.jpg", "image/jpeg")]);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("shows file card after selection", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("report.pdf", "application/pdf", 204800)]);

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("200 KB")).toBeInTheDocument();
  });

  it("shows replace button when file is selected", () => {
    render(<UploadField />);
    setFileInput([createFile("doc.txt", "text/plain")]);
    expect(screen.getByRole("button", { name: "Replace file" })).toBeInTheDocument();
  });

  it("removes file and shows upload button on delete", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("doc.txt", "text/plain")]);

    const removeButton = screen.getByRole("button", { name: "Remove file" });
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(document.querySelector(".gsl-upload-field__action")).toHaveTextContent("Upload file");
  });

  it("does not show remove button when disabled", () => {
    render(<UploadField disabled />);
    setFileInput([createFile("doc.txt", "text/plain")]);
    expect(screen.queryByRole("button", { name: "Remove file" })).not.toBeInTheDocument();
  });

  it("applies drag-over class when dragging over dropzone", () => {
    render(<UploadField />);
    const dropzone = document.querySelector(".gsl-upload-field")!;
    fireEvent.dragOver(dropzone, { bubbles: true });
    expect(document.querySelector(".gsl-upload-field--drag-over")).toBeInTheDocument();
  });

  it("removes drag-over class on drag leave", () => {
    render(<UploadField />);
    const dropzone = document.querySelector(".gsl-upload-field")!;
    fireEvent.dragOver(dropzone, { bubbles: true });
    expect(document.querySelector(".gsl-upload-field--drag-over")).toBeInTheDocument();
    fireEvent.dragLeave(dropzone, { bubbles: true });
    expect(document.querySelector(".gsl-upload-field--drag-over")).not.toBeInTheDocument();
  });

  it("handles multiple files when multiple is true", () => {
    const onChange = vi.fn();
    render(<UploadField multiple onChange={onChange} />);
    setFileInput([createFile("a.png", "image/png"), createFile("b.png", "image/png")]);
    const files = onChange.mock.calls[0][0];
    expect(files).toHaveLength(2);
  });

  it("does not show action button in multiple mode", () => {
    render(<UploadField multiple />);
    expect(screen.queryByRole("button", { name: "Upload file" })).not.toBeInTheDocument();
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
    const fileIcon = document.querySelector(".gsl-upload-field__file-card-icon");
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

  it("shows upload button when value is cleared", () => {
    const file = createFile("test.png", "image/png");
    const { rerender } = render(<UploadField value={file} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Replace file" })).toBeInTheDocument();

    rerender(<UploadField value={null} onChange={() => {}} />);
    expect(document.querySelector(".gsl-upload-field__action")).toHaveTextContent("Upload file");
  });

  // Uncontrolled mode
  it("manages internal state in uncontrolled mode", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("doc.pdf", "application/pdf")]);
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByText("doc.pdf")).toBeInTheDocument();
  });

  it("removes file in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("notes.txt", "text/plain")]);
    expect(screen.getByText("notes.txt")).toBeInTheDocument();

    const removeButton = screen.getByRole("button", { name: "Remove file" });
    await user.click(removeButton);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  // RHF integration
  it("works with react-hook-form controlled", () => {
    function Form() {
      const form = useForm<{ file: File | null }>({
        defaultValues: { file: null },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <UploadField
            value={form.watch("file") ?? undefined}
            onChange={(v) => form.setValue("file", v as File | null)}
          />
          <span data-testid="value">
            {form.watch("file")?.name ?? "none"}
          </span>
        </form>
      );
    }

    render(<Form />);
    expect(screen.getByTestId("value")).toHaveTextContent("none");

    setFileInput([createFile("avatar.jpg", "image/jpeg")]);
    expect(screen.getByTestId("value")).toHaveTextContent("avatar.jpg");
  });
});
