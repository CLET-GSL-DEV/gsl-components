interface SelectHeaderRowStepProps {
  rows: string[][];
  headerRowIndex: number | null;
  onSelectHeaderRow: (index: number) => void;
}

const PREVIEW_ROW_LIMIT = 20;

export function SelectHeaderRowStep({
  rows,
  headerRowIndex,
  onSelectHeaderRow,
}: SelectHeaderRowStepProps) {
  const previewRows = rows.slice(0, PREVIEW_ROW_LIMIT);
  const columnCount = Math.max(...previewRows.map((row) => row.length), 1);

  return (
    <div className="gsl-bulk-import__step">
      <h3 className="gsl-bulk-import__step-title">Select header row</h3>

      <div className="gsl-bulk-import__table-wrap gsl-bulk-import__table-wrap--header">
        <table className="gsl-bulk-import__table">
          <tbody>
            {previewRows.map((row, rowIndex) => {
              const isSelected = headerRowIndex === rowIndex;
              const inputId = `gsl-bulk-import-header-row-${rowIndex}`;

              return (
                <tr
                  key={rowIndex}
                  className={[
                    "gsl-bulk-import__table-row",
                    isSelected ? "gsl-bulk-import__table-row--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <td className="gsl-bulk-import__radio-cell">
                    <input
                      id={inputId}
                      type="radio"
                      name="gsl-bulk-import-header-row"
                      className="gsl-bulk-import__radio"
                      checked={isSelected}
                      onChange={() => onSelectHeaderRow(rowIndex)}
                    />
                  </td>
                  {Array.from({ length: columnCount }).map((_, columnIndex) => (
                    <td key={columnIndex}>{row[columnIndex] ?? ""}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
