import type { BulkImportField } from "../../../types/bulk-import-modal";
import { UploadField } from "../../upload-field/UploadField";
import { getFieldExampleValue } from "../utils/validateFieldValue";

interface UploadStepProps {
  fields: BulkImportField[];
  parseError: string | null;
  isParsing: boolean;
  maxFileSizeBytes: number;
  onFileSelected: (file: File) => void;
  uploadedFile?: File | null;
  onRemoveFile?: () => void;
}

export function UploadStep({
  fields,
  parseError,
  isParsing,
  maxFileSizeBytes,
  onFileSelected,
  uploadedFile,
  onRemoveFile,
}: UploadStepProps) {
  return (
    <div className="clet-bulk-import__step clet-bulk-import__step--upload">
      <h3 className="clet-bulk-import__step-title">Upload Document</h3>

      <div className="clet-bulk-import__expected">
        <p className="clet-bulk-import__expected-title">Data that we expect:</p>
        <p className="clet-bulk-import__expected-note">
          (You will have a chance to rename or remove columns in next steps)
        </p>

        <div className="clet-bulk-import__expected-table-wrap">
          <table className="clet-bulk-import__expected-table">
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

      <div className="clet-bulk-import__upload-area">
        <UploadField
          value={uploadedFile ?? undefined}
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          maxSize={maxFileSizeBytes}
          disabled={isParsing}
          invalid={!!parseError}
          onChange={(file) => {
            if (file && !Array.isArray(file)) {
              onFileSelected(file);
            } else if (!file) {
              onRemoveFile?.();
            }
          }}
        />
      </div>

      {parseError && (
        <p className="clet-bulk-import__error" role="alert">
          {parseError}
        </p>
      )}
    </div>
  );
}
