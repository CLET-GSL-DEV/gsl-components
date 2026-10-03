import { createContext, useContext } from "react";

export interface TableContextValue {
  paramPrefix: string | undefined;
}

export const TableContext = /* @__PURE__ */ createContext<TableContextValue>({
  paramPrefix: undefined,
});

export function useTableContext() {
  return useContext(TableContext);
}
