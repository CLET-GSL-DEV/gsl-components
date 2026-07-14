import { useState } from "react";
import { Launchpad, RoleSelect, LaunchpadIconTile } from "@rfdtech/components";
import {
  Shield,
  Eye,
  ScrollText,
  BarChart3,
  BadgeCheck,
  Building2,
  ShieldCheck,
  Truck,
  Megaphone,
  CalendarDays,
  Boxes,
  Users,
  Scale,
  Briefcase,
  GraduationCap,
  FolderLock,
} from "lucide-react";

const apps = [
  {
    id: "analytics",
    name: "Analytics",
    icon: (
      <LaunchpadIconTile name="Analytics">
        <BarChart3 size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "accreditation",
    name: "Accreditation",
    icon: (
      <LaunchpadIconTile name="Accreditation">
        <BadgeCheck size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "facilities",
    name: "Facilities",
    icon: (
      <LaunchpadIconTile name="Facilities">
        <Building2 size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "compliance",
    name: "Compliance",
    icon: (
      <LaunchpadIconTile name="Compliance">
        <ShieldCheck size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "fleet-management",
    name: "Fleet Management",
    icon: (
      <LaunchpadIconTile name="Fleet Management">
        <Truck size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "outreach",
    name: "Outreach",
    icon: (
      <LaunchpadIconTile name="Outreach">
        <Megaphone size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "scheduling",
    name: "Scheduling",
    icon: (
      <LaunchpadIconTile name="Scheduling">
        <CalendarDays size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "asset-registry",
    name: "Asset Registry",
    icon: (
      <LaunchpadIconTile name="Asset Registry">
        <Boxes size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "hr-suite",
    name: "HR Suite",
    icon: (
      <LaunchpadIconTile name="HR Suite">
        <Users size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "legal-research",
    name: "Legal Research",
    icon: (
      <LaunchpadIconTile name="Legal Research">
        <Scale size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "case-management",
    name: "Case Management",
    icon: (
      <LaunchpadIconTile name="Case Management">
        <Briefcase size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "training-academy",
    name: "Training Academy",
    icon: (
      <LaunchpadIconTile name="Training Academy">
        <GraduationCap size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "document-vault",
    name: "Document Vault",
    icon: (
      <LaunchpadIconTile name="Document Vault">
        <FolderLock size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
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
