import * as RadioGroup from "@radix-ui/react-radio-group";

interface SelectHeaderRowStepProps {
  rows: string[][];
  headerRowIndex: number | null;
  onSelectHeaderRow: (index: number) => void;
}

export function SelectHeaderRowStep({
  rows,
  headerRowIndex,
  onSelectHeaderRow,
}: SelectHeaderRowStepProps) {
  const columnCount = Math.max(...rows.map((row) => row.length), 1);

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--header">
      <h3 className="gsl-bulk-import__step-title">Select header row</h3>
      <p className="gsl-bulk-import__step-note">
        Click the row that contains your column headers.
      </p>

      <div className="gsl-bulk-import__table-wrap gsl-bulk-import__table-wrap--header">
        <table className="gsl-bulk-import__table">
          <RadioGroup.Root
            asChild
            value={headerRowIndex !== null ? String(headerRowIndex) : undefined}
            onValueChange={(value) => onSelectHeaderRow(Number(value))}
          >
            <tbody>
              {rows.map((row, rowIndex) => {
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
                    aria-selected={isSelected}
                    onClick={() => onSelectHeaderRow(rowIndex)}
                  >
                    <td className="gsl-bulk-import__radio-cell">
                      <RadioGroup.Item
                        id={inputId}
                        value={String(rowIndex)}
                        className="gsl-bulk-import__radio"
                        aria-label={`Select row ${rowIndex + 1} as header`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <RadioGroup.Indicator className="gsl-bulk-import__radio-indicator" />
                      </RadioGroup.Item>
                    </td>
                    {Array.from({ length: columnCount }).map((_, columnIndex) => (
                      <td key={columnIndex}>{row[columnIndex] ?? ""}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </RadioGroup.Root>
        </table>
      </div>
    </div>
  );
}
