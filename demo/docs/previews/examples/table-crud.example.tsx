import { useCallback, useState } from "react";
import type { TableColumn } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableContent,
  TableBulkActions,
  TableFooter,
  TablePagination,
  Badge,
  Button,
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  useTableState,
} from "@rfdtech/components";
import { Trash2, Eye, Edit, MoreHorizontal } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const initialUsers: User[] = [
  { id: 1, name: "Kwame Asante", email: "kwame@clet.edu.gh", role: "Admin", status: "Active" },
  { id: 2, name: "Abena Mensah", email: "abena@clet.edu.gh", role: "Editor", status: "Active" },
  { id: 3, name: "Kofi Owusu", email: "kofi@clet.edu.gh", role: "Viewer", status: "Inactive" },
  { id: 4, name: "Esi Boateng", email: "esi@clet.edu.gh", role: "Editor", status: "Active" },
  { id: 5, name: "Yaw Adom", email: "yaw@clet.edu.gh", role: "Viewer", status: "Pending" },
  { id: 6, name: "Nana Yeboah", email: "nana@clet.edu.gh", role: "Admin", status: "Active" },
  { id: 7, name: "Akua Donkor", email: "akua@clet.edu.gh", role: "Editor", status: "Active" },
  { id: 8, name: "Kwesi Appiah", email: "kwesi@clet.edu.gh", role: "Viewer", status: "Inactive" },
];

function statusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    case "Inactive":
      return "outline" as const;
    default:
      return "default" as const;
  }
}

/** Per-row action menu — an alternative to the built-in `rowActions` prop,
 * composed by hand from `Popover` so the menu content can be fully custom. */
function RowActionsMenu({
  user,
  onView,
  onEdit,
  onDelete,
}: {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${user.name}`}
          className="clet-dropdown__trigger"
          style={{
            width: 32,
            height: 32,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--clet-border)",
            borderRadius: "var(--clet-radius-base)",
            background: "transparent",
          }}
        >
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={4} className="clet-popover--menu">
        <div className="clet-popover__menu" role="menu">
          <PopoverClose asChild>
            <button
              type="button"
              className="clet-popover__menu-item"
              role="menuitem"
              onClick={() => onView(user)}
            >
              <Eye size={16} strokeWidth={1.5} aria-hidden />
              View
            </button>
          </PopoverClose>
          <PopoverClose asChild>
            <button
              type="button"
              className="clet-popover__menu-item"
              role="menuitem"
              onClick={() => onEdit(user)}
            >
              <Edit size={16} strokeWidth={1.5} aria-hidden />
              Edit
            </button>
          </PopoverClose>
          <PopoverClose asChild>
            <button
              type="button"
              className="clet-popover__menu-item clet-popover__menu-item--destructive"
              role="menuitem"
              onClick={() => onDelete(user)}
            >
              <Trash2 size={16} strokeWidth={1.5} aria-hidden />
              Delete
            </button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TableCrudExample() {
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Set<string | number> | null>(null);

  const { page, pageSize, pageSizeOptions, search } = useTableState({
    defaultPageSize: 5,
  });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleView = useCallback((user: User) => {
    window.alert(`Viewing ${user.name}`);
  }, []);

  const handleEdit = useCallback((user: User) => {
    window.alert(`Editing ${user.name}`);
  }, []);

  const handleRowDelete = useCallback((user: User) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  }, []);

  // Bulk delete never deletes directly — it stages the selection and opens a
  // confirm Dialog. The actual mutation only happens once the user confirms.
  const requestBulkDelete = useCallback((ids: Set<string | number>) => {
    setPendingDelete(ids);
  }, []);

  const confirmBulkDelete = useCallback(() => {
    if (!pendingDelete) return;
    setUsers((prev) => prev.filter((u) => !pendingDelete.has(u.id)));
    setSelected(new Set());
    setPendingDelete(null);
  }, [pendingDelete]);

  const columns: TableColumn<User>[] = [
    { id: "name", header: "Name", accessorKey: "name", sortable: true },
    { id: "email", header: "Email", accessorKey: "email", sortable: true },
    { id: "role", header: "Role", accessorKey: "role", sortable: true },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: ({ value }) => (
        <Badge variant={statusVariant(String(value))}>{String(value)}</Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      width: 56,
      align: "right",
      cell: ({ row }) => (
        <RowActionsMenu
          user={row}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleRowDelete}
        />
      ),
    },
  ];

  return (
    <>
      <Table paramPrefix="crud-users">
        <TableHeader>
          <TableSearch placeholder="Search users..." />
        </TableHeader>
        <TableContent
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          columns={columns}
          data={paged}
          rowKey={(u) => u.id}
        />
        <TableBulkActions
          selectedIds={selected}
          onClear={() => setSelected(new Set())}
          actions={[
            {
              id: "delete",
              label: "Delete",
              icon: <Trash2 size={14} strokeWidth={1.5} />,
              onClick: requestBulkDelete,
              destructive: true,
            },
          ]}
        />
        <TableFooter>
          <TablePagination
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSizeOptions={pageSizeOptions}
          />
        </TableFooter>
      </Table>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent showCloseButton>
            <DialogTitle>Delete selected users?</DialogTitle>
            <DialogDescription>
              {pendingDelete?.size ?? 0} user{(pendingDelete?.size ?? 0) === 1 ? "" : "s"}{" "}
              will be permanently removed. This action cannot be undone.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmBulkDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
