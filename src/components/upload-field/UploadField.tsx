import { Upload, X, FileImage, FilePlay, FileText } from "lucide-react";
import { forwardRef, useCallback, useRef, useState, type ReactNode } from "react";
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
  pdf: () => <FilePdfIcon size={24} />,
  image: () => <FileImage size={24} strokeWidth={1.5} aria-hidden />,
  video: () => <FilePlay size={24} strokeWidth={1.5} aria-hidden />,
  text: () => <FileText size={24} strokeWidth={1.5} aria-hidden />,
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
      placeholder = "Drop files here or click to browse",
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
    const inputRef = useRef<HTMLInputElement>(null);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const isControlled = controlledValue !== undefined;

    const setValue = useCallback(
      (next: File | File[] | null) => {
        if (!isControlled) {
          setInternalValue(next);
        }
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

        if (filtered.length === 0) return;

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

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setValue(null);
      },
      [setValue],
    );

    const handleClick = useCallback(() => {
      if (!disabled) {
        inputRef.current?.click();
      }
    }, [disabled]);

    const invalidBool = ariaInvalid !== undefined ? !!ariaInvalid : invalid;
    const hasFiles = value ? (Array.isArray(value) ? value.length > 0 : true) : false;

    const renderFilePreview = () => {
      const files = value ? (Array.isArray(value) ? value : [value]) : [];
      return files.map((file, i) => (
        <div key={i} className="gsl-upload-field__file">
          <span className="gsl-upload-field__file-icon">{getFileTypeIcon(file)}</span>
          <div className="gsl-upload-field__file-info">
            <span className="gsl-upload-field__file-name">{file.name}</span>
            <span className="gsl-upload-field__file-size">{formatSize(file.size)}</span>
          </div>
          {!disabled && (
            <button
              type="button"
              className={cn("gsl-upload-field__remove", classNames?.removeButton)}
              onClick={handleRemove}
              aria-label="Remove file"
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          )}
        </div>
      ));
    };

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          "gsl-upload-field",
          invalidBool && "gsl-upload-field--invalid",
          disabled && "gsl-upload-field--disabled",
          classNames?.root,
          className,
        )}
        aria-invalid={invalidBool || undefined}
        aria-describedby={ariaDescribedby}
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
          style={{ display: "none" }}
        />
        <div
          className={cn(
            "gsl-upload-field__dropzone",
            dragOver && "gsl-upload-field__dropzone--active",
            hasFiles && "gsl-upload-field__dropzone--has-files",
            classNames?.dropzone,
          )}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClick();
          }}
          aria-label={placeholder}
        >
          {hasFiles ? (
            <div className={cn("gsl-upload-field__file-info", classNames?.fileInfo)}>
              {renderFilePreview()}
            </div>
          ) : (
            <div className="gsl-upload-field__placeholder">
              <Upload size={24} strokeWidth={1.5} aria-hidden />
              <span>{placeholder}</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);
