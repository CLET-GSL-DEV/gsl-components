import type { ChangeEvent, DragEvent } from "react";
import type { BulkImportField } from "../../../types/bulk-import-modal";
import { getFieldExampleValue } from "../utils/validateFieldValue";

interface UploadStepProps {
  fields: BulkImportField[];
  fileName: string | null;
  parseError: string | null;
  isParsing: boolean;
  onFileSelected: (file: File) => void;
}

export function UploadStep({
  fields,
  fileName,
  parseError,
  isParsing,
  onFileSelected,
}: UploadStepProps) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--upload">
      <h3 className="gsl-bulk-import__step-title">Upload Document</h3>

      <div className="gsl-bulk-import__expected">
        <p className="gsl-bulk-import__expected-title">Data that we expect:</p>
        <p className="gsl-bulk-import__expected-note">
          (You will have a chance to rename or remove columns in next steps)
        </p>

        <div className="gsl-bulk-import__expected-table-wrap">
          <table className="gsl-bulk-import__expected-table">
            <thead>
              <tr>
                {fields.map((field) => (
                  <th key={field.key}>{field.label.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {fields.map((field) => (
                  <td key={field.key}>{getFieldExampleValue(field)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="gsl-bulk-import__dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          id="gsl-bulk-import-file"
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="gsl-bulk-import__file-input"
          onChange={handleInputChange}
          disabled={isParsing}
        />
        <p className="gsl-bulk-import__dropzone-title">
          Upload .xlsx, .xls or .csv file
        </p>
        <label
          htmlFor="gsl-bulk-import-file"
          className="gsl-bulk-import__button gsl-bulk-import__button--primary gsl-bulk-import__select-file"
        >
          {isParsing ? "Parsing file..." : "Select file"}
        </label>
      </div>

      {fileName && !parseError && (
        <p className="gsl-bulk-import__file-name">Selected: {fileName}</p>
      )}

      {parseError && (
        <p className="gsl-bulk-import__error" role="alert">
          {parseError}
        </p>
      )}
    </div>
  );
}
