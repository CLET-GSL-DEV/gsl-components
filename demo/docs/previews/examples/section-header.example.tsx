import {
  Button,
  SectionActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@rfdtech/components";
import { Plus } from "lucide-react";

export function SectionHeaderExample() {
  return (
    <SectionHeader>
      <SectionTitle>Users</SectionTitle>
      <SectionDescription>
        Manage who has access to this workspace and what they can do.
      </SectionDescription>
      <SectionActions>
        <Button variant="outline" size="md">
          Export
        </Button>
        <Button variant="primary" size="md">
          <Plus size={14} strokeWidth={1.5} />
          Add user
        </Button>
      </SectionActions>
    </SectionHeader>
  );
}
