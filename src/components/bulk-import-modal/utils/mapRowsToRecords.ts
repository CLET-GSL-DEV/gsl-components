import type {
  BulkImportField,
  SourceColumn,
  SourceColumnMapping,
} from "../../../types/bulk-import-modal";

export function buildSourceColumns(
  rows: string[][],
  headerRowIndex: number,
): SourceColumn[] {
  return buildAllSourceColumns(rows, headerRowIndex).filter(
    (column) => (rows[headerRowIndex]?.[column.index] ?? "").trim().length > 0,
  );
}

export function buildAllSourceColumns(
  rows: string[][],
  headerRowIndex: number,
): SourceColumn[] {
  const headerRow = rows[headerRowIndex] ?? [];

  return headerRow.map((label, index) => ({
    index,
    label: label.trim() || `Column ${index + 1}`,
  }));
}

export function createEmptySourceMapping(
  sourceColumns: SourceColumn[],
): SourceColumnMapping {
  return Object.fromEntries(
    sourceColumns.map((column) => [column.index, null]),
  );
}

export function autoMatchSourceColumns(
  fields: BulkImportField[],
  sourceColumns: SourceColumn[],
): SourceColumnMapping {
  const mapping = createEmptySourceMapping(sourceColumns);
  const usedFields = new Set<string>();

  for (const column of sourceColumns) {
    const normalizedLabel = column.label.trim().toLowerCase();
    const match = fields.find((field) => {
      if (usedFields.has(field.key)) {
        return false;
      }

      const candidates = [
        field.label.trim().toLowerCase(),
        field.key.trim().toLowerCase(),
        ...(field.matchKeys ?? []).map((k) => k.trim().toLowerCase()),
      ];
      return candidates.includes(normalizedLabel);
    });

    if (match) {
      mapping[column.index] = match.key;
      usedFields.add(match.key);
    }
  }

  return mapping;
}

export function isRequiredMappingComplete(
  fields: BulkImportField[],
  sourceColumnMapping: SourceColumnMapping,
  excludedColumns: number[],
) {
  const excluded = new Set(excludedColumns);
  const mappedFields = new Set(
    Object.entries(sourceColumnMapping)
      .filter(([index, fieldKey]) => fieldKey && !excluded.has(Number(index)))
      .map(([, fieldKey]) => fieldKey as string),
  );

  return fields
    .filter((field) => field.required)
    .every((field) => mappedFields.has(field.key));
}

export function mapRowsToRecords(
  rows: string[][],
  headerRowIndex: number,
  sourceColumnMapping: SourceColumnMapping,
  excludedColumns: number[],
): Record<string, string>[] {
  const dataRows = rows.slice(headerRowIndex + 1);
  const excluded = new Set(excludedColumns);

  return dataRows
    .map((row) => {
      const record: Record<string, string> = {};

      for (const [sourceIndexValue, fieldKey] of Object.entries(
        sourceColumnMapping,
      )) {
        const sourceIndex = Number(sourceIndexValue);
        if (!fieldKey || excluded.has(sourceIndex)) {
          continue;
        }

        record[fieldKey] = (row[sourceIndex] ?? "").trim();
      }

      return record;
    })
    .filter((record) =>
      Object.values(record).some((value) => value.length > 0),
    );
}

export function getMappedFieldKeys(
  sourceColumnMapping: SourceColumnMapping,
  excludedColumns: number[],
) {
  const excluded = new Set(excludedColumns);
  return Object.entries(sourceColumnMapping)
    .filter(([index, fieldKey]) => fieldKey && !excluded.has(Number(index)))
    .map(([, fieldKey]) => fieldKey as string);
}
