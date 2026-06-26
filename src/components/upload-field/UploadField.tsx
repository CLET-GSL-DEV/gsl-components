import { CloudUpload, FileImage, FilePlay, FileText, Trash2 } from "lucide-react";
import { forwardRef, useCallback, useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../dialog/Dialog";
import { Button } from "../button/Button";
import type { UploadFieldProps } from "../../types/upload-field";
import { cn } from "../../utils/cn";
import "./styles/upload-field.css";

function FilePdfIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15h6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12v6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const fileIcons: Record<string, () => ReactNode> = {
  pdf: () => <FilePdfIcon size={20} />,
  image: () => <FileImage size={20} strokeWidth={1.5} aria-hidden />,
  video: () => <FilePlay size={20} strokeWidth={1.5} aria-hidden />,
  text: () => <FileText size={20} strokeWidth={1.5} aria-hidden />,
};

function getFileTypeIcon(file: File) {
  const type = file.type;
  const name = file.name.toLowerCase();
  if (type.startsWith("image/") || name.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/)) return fileIcons.image();
  if (type.startsWith("video/") || name.match(/\.(mp4|webm|avi|mov|mkv)$/)) return fileIcons.video();
  if (name.endsWith(".pdf")) return fileIcons.pdf();
  return fileIcons.text();
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function acceptToLabel(accept?: string): string {
  if (!accept) return "any files";
  const normalized = accept.toLowerCase();
  if (normalized.includes(".csv") && normalized.includes(".xls")) return "Spreadsheet files";
  if (normalized.includes(".xls")) return "Excel files";
  if (normalized.includes(".csv")) return "CSV files";
  if (normalized.includes(".pdf")) return "PDF files";
  if (normalized.includes(".json")) return "JSON files";
  if (normalized.includes(".xml")) return "XML files";
  if (normalized.includes(".zip") || normalized.includes(".tar")) return "archive files";
  if (normalized.includes("image/")) return "image files";
  if (normalized.includes("video/")) return "video files";
  if (normalized.includes("audio/")) return "audio files";
  if (normalized.includes("text/")) return "text files";
  return accept;
}

function maxSizeLabel(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

export const UploadField = forwardRef<HTMLDivElement, UploadFieldProps>(
  function UploadField(
    {
      invalid = false,
      disabled = false,
      classNames,
      className,
      accept,
      multiple = false,
      maxSize,
      value: controlledValue,
      onChange,
      name,
      id,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState<File | File[] | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileErrorDialog, setFileErrorDialog] = useState<{ name: string; message: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const isControlled = controlledValue !== undefined;

    const setValue = useCallback(
      (next: File | File[] | null) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const handleFiles = useCallback(
      (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const filtered = Array.from(files).filter((f) => {
          if (maxSize && f.size > maxSize) return false;
          return true;
        });
        if (filtered.length === 0) {
          const rejected = Array.from(files)[0];
          setFileErrorDialog({
            name: rejected.name,
            message: `File exceeds maximum size of ${maxSizeLabel(maxSize!)}`,
          });
          return;
        }
        if (multiple) {
          setValue(filtered);
        } else {
          setValue(filtered[0]);
        }
      },
      [maxSize, multiple, setValue],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = "";
      },
      [handleFiles],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      },
      [disabled, handleFiles],
    );

    const handleClick = useCallback(() => {
      if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const handleDialogRetry = useCallback(() => {
      setFileErrorDialog(null);
      if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const invalidBool = ariaInvalid !== undefined ? !!ariaInvalid : invalid;
    const hasFiles = value ? (Array.isArray(value) ? value.length > 0 : true) : false;
    const files = value ? (Array.isArray(value) ? value : [value]) : [];

    const supportedLabel = acceptToLabel(accept);
    const sizeLabel = maxSizeLabel(maxSize);
    const subtitle = sizeLabel
      ? `Only ${supportedLabel} are supported. Maximum filesize ${sizeLabel}.`
      : `Only ${supportedLabel} are supported.`;

    return (
      <>
        <div
          ref={ref}
          id={id}
          className={cn(
            "gsl-upload-field",
            dragOver && "gsl-upload-field--drag-over",
            hasFiles && "gsl-upload-field--has-files",
            invalidBool && "gsl-upload-field--invalid",
            disabled && "gsl-upload-field--disabled",
            classNames?.root,
            className,
          )}
          aria-invalid={invalidBool || undefined}
          aria-describedby={ariaDescribedby}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClick();
          }}
          aria-label="Drop files here"
          {...props}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            name={name}
            onChange={handleChange}
            className="gsl-upload-field__input"
          />

          <div
            className={cn(
              "gsl-upload-field__icon",
              classNames?.icon,
            )}
          >
            <CloudUpload size={20} strokeWidth={1.75} aria-hidden />
          </div>
          <p className={cn("gsl-upload-field__title", classNames?.title)}>
            Click to upload or drag and drop
          </p>
          <p className={cn("gsl-upload-field__subtitle", classNames?.subtitle)}>
            {subtitle}
          </p>

          {hasFiles && (
            <div className={cn("gsl-upload-field__files", classNames?.files)}>
              {files.map((file, i) => (
                <div
                  key={i}
                  className={cn("gsl-upload-field__file-card", classNames?.fileCard)}
                >
                  <span className="gsl-upload-field__file-card-icon">
                    {getFileTypeIcon(file)}
                  </span>
                  <div className="gsl-upload-field__file-card-info">
                    <span className={cn("gsl-upload-field__file-card-name", classNames?.fileName)}>
                      {file.name}
                    </span>
                    <span className={cn("gsl-upload-field__file-card-size", classNames?.fileSize)}>
                      {formatSize(file.size)}
                    </span>
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      className={cn("gsl-upload-field__file-card-remove", classNames?.removeButton)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue(null);
                      }}
                      aria-label="Remove file"
                    >
                      <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!multiple && (
            <Button
              variant="primary"
              size="md"
              className={cn(
                "gsl-upload-field__action",
                classNames?.actionButton,
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              disabled={disabled}
            >
              {hasFiles ? "Replace file" : "Upload file"}
            </Button>
          )}
        </div>

        <Dialog open={fileErrorDialog !== null} onOpenChange={(open) => { if (!open) setFileErrorDialog(null); }}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent showCloseButton aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Upload failed</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                {fileErrorDialog?.name && (
                  <span className="gsl-upload-field__dialog-filename">{fileErrorDialog.name}</span>
                )}
                {fileErrorDialog?.message}
              </DialogDescription>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setFileErrorDialog(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleDialogRetry}>
                  Try again
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
);
