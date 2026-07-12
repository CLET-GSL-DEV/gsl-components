import { useState } from "react";
import { Launchpad, RoleSelect, SystemLaunchpadIcon } from "@rfdtech/components";
import { Shield, Eye, ScrollText } from "lucide-react";

const apps = [
  { id: "analytics", name: "Analytics", icon: <SystemLaunchpadIcon name="Analytics" /> },
  { id: "accreditation", name: "Accreditation", icon: <SystemLaunchpadIcon name="Accreditation" /> },
  { id: "facilities", name: "Facilities", icon: <SystemLaunchpadIcon name="Facilities" /> },
  { id: "compliance", name: "Compliance", icon: <SystemLaunchpadIcon name="Compliance" /> },
  {
    id: "fleet-management",
    name: "Fleet Management",
    icon: <SystemLaunchpadIcon name="Fleet Management" />,
  },
  { id: "outreach", name: "Outreach", icon: <SystemLaunchpadIcon name="Outreach" /> },
  { id: "scheduling", name: "Scheduling", icon: <SystemLaunchpadIcon name="Scheduling" /> },
  { id: "asset-registry", name: "Asset Registry", icon: <SystemLaunchpadIcon name="Asset Registry" /> },
  { id: "hr-suite", name: "HR Suite", icon: <SystemLaunchpadIcon name="HR Suite" /> },
  { id: "legal-research", name: "Legal Research", icon: <SystemLaunchpadIcon name="Legal Research" /> },
  { id: "case-management", name: "Case Management", icon: <SystemLaunchpadIcon name="Case Management" /> },
  { id: "training-academy", name: "Training Academy", icon: <SystemLaunchpadIcon name="Training Academy" /> },
  { id: "document-vault", name: "Document Vault", icon: <SystemLaunchpadIcon name="Document Vault" /> },
];

const roles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} strokeWidth={1.5} /> },
  { id: "reviewer", name: "Reviewer", icon: <Eye size={16} strokeWidth={1.5} /> },
  { id: "auditor", name: "Auditor", icon: <ScrollText size={16} strokeWidth={1.5} /> },
];

export function LaunchpadExample() {
  const [selectedRole, setSelectedRole] = useState("admin");

  return (
    <Launchpad apps={apps} onAppSelect={(app) => console.log("Selected:", app.name)}>
      <RoleSelect
        title="View as"
        roles={roles}
        selectedRole={selectedRole}
        onClickRole={(role) => setSelectedRole(role.id)}
      />
    </Launchpad>
  );
}
