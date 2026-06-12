import { useState } from "react";
import { BulkImportModal } from "@rfdtech/components";
import { importFields } from "./shared";

export function BulkImportPreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="demo-button" onClick={() => setOpen(true)}>
        Open bulk import
      </button>
      <BulkImportModal
        open={open}
        onOpenChange={setOpen}
        title="Import documents"
        fields={importFields}
        onComplete={(result) => {
          console.log("Import complete:", result);
          setOpen(false);
        }}
      />
    </>
  );
}
