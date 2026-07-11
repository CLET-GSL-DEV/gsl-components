import { AppSwitcher, SystemAppIcon } from "@rfdtech/components";

const apps = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: "https://ui-avatars.com/api/?name=Governance+Portal&background=1d4ed8&color=fff&size=96",
    href: "https://portal.example.com",
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: "https://ui-avatars.com/api/?name=Finance+Hub&background=047857&color=fff&size=96",
    href: "https://finance.example.com",
  },
  {
    id: "hr-suite",
    name: "HR Suite",
    icon: "https://ui-avatars.com/api/?name=HR+Suite&background=7c3aed&color=fff&size=96",
  },
  {
    id: "accreditation",
    name: "Accreditation",
    icon: <SystemAppIcon name="Accreditation" />,
  },
  {
    id: "facilities",
    name: "Facilities",
    icon: <SystemAppIcon name="Facilities" />,
  },
  {
    id: "fleet-management",
    name: "Fleet Management",
    icon: <SystemAppIcon name="Fleet Management" />,
  },
];

export function AppSwitcherExample() {
  return (
    <AppSwitcher
      apps={apps}
      title="System directory"
      onAppSelect={(app) => console.log("Selected:", app.name)}
    />
  );
}
