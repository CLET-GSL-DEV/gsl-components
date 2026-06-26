import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as RadioGroup from "@radix-ui/react-radio-group";

interface SelectHeaderRowStepProps {
  rows: string[][];
  headerRowIndex: number | null;
  onSelectHeaderRow: (index: number) => void;
}

const ROW_HEIGHT = 44;

export function SelectHeaderRowStep({
  rows,
  headerRowIndex,
  onSelectHeaderRow,
}: SelectHeaderRowStepProps) {
  const columnCount = Math.max(...rows.map((row) => row.length), 1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const hasVirtualRows = virtualRows.length > 0;

  const items = hasVirtualRows
    ? virtualRows
    : rows.map((_, i) => ({
        key: i,
        index: i,
        start: i * ROW_HEIGHT,
        size: ROW_HEIGHT,
      }));

  const totalHeight = hasVirtualRows
    ? virtualizer.getTotalSize()
    : rows.length * ROW_HEIGHT;

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--header">
      <h3 className="gsl-bulk-import__step-title">Select header row</h3>
      <p className="gsl-bulk-import__step-note">
        Click the row that contains your column headers.
      </p>

      <div className="gsl-bulk-import__table-wrap gsl-bulk-import__table-wrap--header">
        <div
          ref={scrollRef}
          className="gsl-bulk-import__virtual-scroll"
        >
          <div
            style={{
              height: totalHeight,
              width: "100%",
              position: "relative",
            }}
          >
            <RadioGroup.Root
              value={headerRowIndex !== null ? String(headerRowIndex) : undefined}
              onValueChange={(value) => onSelectHeaderRow(Number(value))}
            >
              {items.map((item) => {
                const rowIndex = item.index;
                const isSelected = headerRowIndex === rowIndex;
                const inputId = `gsl-bulk-import-header-row-${rowIndex}`;

                return (
                  <div
                    key={item.key}
                    className={[
                      "gsl-bulk-import__virtual-row",
                      isSelected
                        ? "gsl-bulk-import__table-row--selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${item.start}px)`,
                      height: `${item.size}px`,
                    }}
                    aria-selected={isSelected}
                    onClick={() => onSelectHeaderRow(rowIndex)}
                  >
                    <div className="gsl-bulk-import__radio-cell">
                      <RadioGroup.Item
                        id={inputId}
                        value={String(rowIndex)}
                        className="gsl-bulk-import__radio"
                        aria-label={`Select row ${rowIndex + 1} as header`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <RadioGroup.Indicator className="gsl-bulk-import__radio-indicator" />
                      </RadioGroup.Item>
                    </div>
                    {Array.from({ length: columnCount }).map((_, columnIndex) => (
                      <div key={columnIndex} className="gsl-bulk-import__virtual-cell">
                        {rows[rowIndex]?.[columnIndex] ?? ""}
                      </div>
                    ))}
                  </div>
                );
              })}
            </RadioGroup.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
