import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@rfdtech/components";
import { demoApps } from "demo/data/demoApps";
import { useMockQuery } from "demo/hooks/useMockQuery";
import { SidebarPreview } from "demo/docs/previews/code/SidebarPreview";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  Download,
} from "lucide-react";
import type { TableColumn } from "@rfdtech/components";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableFooter,
  TablePagination,
  AppHeader,
  AppHeaderSearch,
  AppHeaderNotifications,
  AppHeaderProfile,
  AppSwitcher,
  AppLayout,
  AppSidebar,
  AppBody,
  SidebarProvider,
  Button,
} from "@rfdtech/components";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  joined: string;
}

const members: Member[] = [
  {
    id: 1,
    name: "Kwame Asante",
    email: "kwame.asante@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-01-15",
  },
  {
    id: 2,
    name: "Abena Mensah",
    email: "abena.mensah@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-02-03",
  },
  {
    id: 3,
    name: "Kofi Owusu",
    email: "kofi.owusu@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2024-03-08",
  },
  {
    id: 4,
    name: "Esi Boateng",
    email: "esi.boateng@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-03-22",
  },
  {
    id: 5,
    name: "Yaw Adom",
    email: "yaw.adom@gsl.edu.gh",
    role: "Viewer",
    status: "Pending",
    joined: "2024-04-01",
  },
  {
    id: 6,
    name: "Nana Yeboah",
    email: "nana.yeboah@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-04-15",
  },
  {
    id: 7,
    name: "Akua Donkor",
    email: "akua.donkor@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-05-02",
  },
  {
    id: 8,
    name: "Kwesi Appiah",
    email: "kwesi.appiah@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2024-05-18",
  },
  {
    id: 9,
    name: "Adwoa Sarpong",
    email: "adwoa.sarpong@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-06-10",
  },
  {
    id: 10,
    name: "Kobina Ennin",
    email: "kobina.ennin@gsl.edu.gh",
    role: "Viewer",
    status: "Pending",
    joined: "2024-06-25",
  },
  {
    id: 11,
    name: "Efua Sutherland",
    email: "efua.sutherland@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-07-01",
  },
  {
    id: 12,
    name: "Paapa Essiedu",
    email: "paapa.essiedu@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2024-07-03",
  },
  {
    id: 13,
    name: "Afia Agyeman",
    email: "afia.agyeman@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-07-08",
  },
  {
    id: 14,
    name: "Kofi Baako",
    email: "kofi.baako@gsl.edu.gh",
    role: "Editor",
    status: "Pending",
    joined: "2024-07-12",
  },
  {
    id: 15,
    name: "Adoley Nmai",
    email: "adoley.nmai@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-07-15",
  },
  {
    id: 16,
    name: "Kwabena Darko",
    email: "kwabena.darko@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-07-20",
  },
  {
    id: 17,
    name: "Abena Serwaa",
    email: "abena.serwaa@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-07-22",
  },
  {
    id: 18,
    name: "Yaw Poku",
    email: "yaw.poku@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2024-07-28",
  },
  {
    id: 19,
    name: "Dede Aidoo",
    email: "dede.aidoo@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-08-01",
  },
  {
    id: 20,
    name: "Kwamena Quayson",
    email: "kwamena.quayson@gsl.edu.gh",
    role: "Viewer",
    status: "Pending",
    joined: "2024-08-05",
  },
  {
    id: 21,
    name: "Mansa Ankrah",
    email: "mansa.ankrah@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-08-10",
  },
  {
    id: 22,
    name: "Nii Armah",
    email: "nii.armah@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-08-14",
  },
  {
    id: 23,
    name: "Araba Forson",
    email: "araba.forson@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2024-08-18",
  },
  {
    id: 24,
    name: "Fiifi Coleman",
    email: "fiifi.coleman@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-08-22",
  },
  {
    id: 25,
    name: "Akosua Danso",
    email: "akosua.danso@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-08-26",
  },
  {
    id: 26,
    name: "Nana Kwasi",
    email: "nana.kwasi@gsl.edu.gh",
    role: "Admin",
    status: "Pending",
    joined: "2024-09-01",
  },
  {
    id: 27,
    name: "Maame Esi",
    email: "maame.esi@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-09-03",
  },
  {
    id: 28,
    name: "Kojo Bentsi",
    email: "kojo.bentsi@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2024-09-07",
  },
  {
    id: 29,
    name: "Naa Shika",
    email: "naa.shika@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-09-10",
  },
  {
    id: 30,
    name: "Kwaku Attah",
    email: "kwaku.attah@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-09-14",
  },
  {
    id: 31,
    name: "Afua Nyarko",
    email: "afua.nyarko@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-09-18",
  },
  {
    id: 32,
    name: "Ebo Taylor",
    email: "ebo.taylor@gsl.edu.gh",
    role: "Editor",
    status: "Inactive",
    joined: "2024-09-22",
  },
  {
    id: 33,
    name: "Adjoa Yeboah",
    email: "adjoa.yeboah@gsl.edu.gh",
    role: "Viewer",
    status: "Pending",
    joined: "2024-09-26",
  },
  {
    id: 34,
    name: "Kweku Bediako",
    email: "kweku.bediako@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-10-01",
  },
  {
    id: 35,
    name: "Akua Amoako",
    email: "akua.amoako@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-10-05",
  },
  {
    id: 36,
    name: "Joe Lartey",
    email: "joe.lartey@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-10-08",
  },
  {
    id: 37,
    name: "Adaa Ofori",
    email: "adaa.ofori@gsl.edu.gh",
    role: "Editor",
    status: "Inactive",
    joined: "2024-10-12",
  },
  {
    id: 38,
    name: "Kwaku Gyasi",
    email: "kwaku.gyasi@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-10-16",
  },
  {
    id: 39,
    name: "Nana Ama",
    email: "nana.ama@gsl.edu.gh",
    role: "Editor",
    status: "Pending",
    joined: "2024-10-20",
  },
  {
    id: 40,
    name: "Kwesi Nkrumah",
    email: "kwesi.nkrumah@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-10-24",
  },
  {
    id: 41,
    name: "Akosua Brenya",
    email: "akosua.brenya@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-10-28",
  },
  {
    id: 42,
    name: "Yaw Frempong",
    email: "yaw.frempong@gsl.edu.gh",
    role: "Editor",
    status: "Inactive",
    joined: "2024-11-01",
  },
  {
    id: 43,
    name: "Abiba Moshie",
    email: "abiba.moshie@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-11-04",
  },
  {
    id: 44,
    name: "Kofi Sekyere",
    email: "kofi.sekyere@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-11-08",
  },
  {
    id: 45,
    name: "Ewurama Badu",
    email: "ewurama.badu@gsl.edu.gh",
    role: "Viewer",
    status: "Pending",
    joined: "2024-11-12",
  },
  {
    id: 46,
    name: "Osei Tutu",
    email: "osei.tutu@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-11-16",
  },
  {
    id: 47,
    name: "Afua Kwarteng",
    email: "afua.kwarteng@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-11-20",
  },
  {
    id: 48,
    name: "Kojo Ashon",
    email: "kojo.ashon@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2024-11-24",
  },
  {
    id: 49,
    name: "Adjoa Boateng",
    email: "adjoa.boateng@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-11-28",
  },
  {
    id: 50,
    name: "Nii Noi",
    email: "nii.noi@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-12-02",
  },
  {
    id: 51,
    name: "Akua Dansoa",
    email: "akua.dansoa@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-12-06",
  },
  {
    id: 52,
    name: "Kwame Ninsin",
    email: "kwame.ninsin@gsl.edu.gh",
    role: "Editor",
    status: "Pending",
    joined: "2024-12-10",
  },
  {
    id: 53,
    name: "Esi Atta-Mills",
    email: "esi.attamills@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-12-14",
  },
  {
    id: 54,
    name: "Kofi Ansah",
    email: "kofi.ansah@gsl.edu.gh",
    role: "Editor",
    status: "Inactive",
    joined: "2024-12-18",
  },
  {
    id: 55,
    name: "Abena Konadu",
    email: "abena.konadu@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2024-12-22",
  },
  {
    id: 56,
    name: "Yaw Marfo",
    email: "yaw.marfo@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-12-26",
  },
  {
    id: 57,
    name: "Adoley Lamptey",
    email: "adoley.lamptey@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2025-01-02",
  },
  {
    id: 58,
    name: "Fiifi Appiah",
    email: "fiifi.appiah@gsl.edu.gh",
    role: "Viewer",
    status: "Inactive",
    joined: "2025-01-06",
  },
  {
    id: 59,
    name: "Araba Cudjoe",
    email: "araba.cudjoe@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2025-01-10",
  },
  {
    id: 60,
    name: "Kwesi Bentum",
    email: "kwesi.bentum@gsl.edu.gh",
    role: "Viewer",
    status: "Active",
    joined: "2025-01-14",
  },
];

const columns: TableColumn<Member>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
    cell: ({ value }) => (
      <span className="demo-home__cell-name">{String(value)}</span>
    ),
  },
  { id: "email", header: "Email", accessorKey: "email", sortable: true },
  { id: "role", header: "Role", accessorKey: "role", sortable: true },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: ({ value }) => {
      const status = String(value).toLowerCase();
      return (
        <span className={`demo-home__status demo-home__status--${status}`}>
          {String(value)}
        </span>
      );
    },
  },
  {
    id: "joined",
    header: "Joined",
    accessorKey: "joined",
    sortable: true,
    cell: ({ value }) => (
      <span className="demo-home__cell-date">{String(value)}</span>
    ),
  },
];

const navLinks = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "members", label: "Members", icon: Users, active: false },
  { id: "settings", label: "Settings", icon: Settings, active: false },
];

export function DemoPage() {
  const navigate = useNavigate();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeNav, setActiveNav] = useState("dashboard");

  const { data: appsData, loading: appsLoading } = useMockQuery(demoApps, 2000);

  const fakeNotifications = [
    { id: "1", text: "Kwame Asante submitted a new policy draft for review.", time: "2 min ago", unread: true },
    { id: "2", text: "Your monthly report is ready for review.", time: "1 hour ago", unread: true },
    { id: "3", text: "System maintenance scheduled for Saturday 2:00 AM.", time: "3 hours ago", unread: false },
    { id: "4", text: "Password policy has been updated. Review the changes in Settings.", time: "Yesterday", unread: false },
    { id: "5", text: "Abena Mensah invited you to collaborate on 'Q3 Budget'.", time: "2 hours ago", unread: true },
    { id: "6", text: "New compliance training assigned to all editors.", time: "5 hours ago", unread: true },
    { id: "7", text: "Data export for Ghana chapter completed successfully.", time: "Yesterday, 4:30 PM", unread: false },
    { id: "8", text: "Kofi Owusu's account has been deactivated due to inactivity.", time: "Yesterday, 2:15 PM", unread: false },
    { id: "9", text: "Weekly analytics digest is available for download.", time: "Yesterday, 10:00 AM", unread: true },
    { id: "10", text: "Esi Boateng commented on your proposal.", time: "2 days ago", unread: false },
    { id: "11", text: "Server upgrade completed for all production environments.", time: "2 days ago", unread: false },
    { id: "12", text: "Yaw Adom requested access to Finance Hub.", time: "2 days ago", unread: true },
    { id: "13", text: "Audit log export for Q2 is now available.", time: "3 days ago", unread: false },
    { id: "14", text: "Nana Yeboah uploaded 12 new documents to Governance Portal.", time: "3 days ago", unread: true },
    { id: "15", text: "Reminder: Team standup in 30 minutes.", time: "3 days ago", unread: true },
    { id: "16", text: "Akua Donkor's admin privileges have been updated.", time: "4 days ago", unread: false },
    { id: "17", text: "New version of HR Suite released (v4.2.1).", time: "4 days ago", unread: true },
    { id: "18", text: "Kwesi Appiah shared a dashboard with you.", time: "5 days ago", unread: false },
    { id: "19", text: "Two-factor authentication will be mandatory starting next month.", time: "5 days ago", unread: true },
    { id: "20", text: "Adwoa Sarpong has been promoted to Senior Editor.", time: "6 days ago", unread: false },
    { id: "21", text: "Billing: Your subscription renews in 7 days.", time: "6 days ago", unread: true },
    { id: "22", text: "Kobina Ennin opened a support ticket (#GH-2841).", time: "1 week ago", unread: false },
    { id: "23", text: "Performance review cycle starts Monday.", time: "1 week ago", unread: true },
    { id: "24", text: "Efua Sutherland published 3 new articles.", time: "1 week ago", unread: false },
    { id: "25", text: "Database backup completed: 342 GB transferred.", time: "1 week ago", unread: false },
    { id: "26", text: "Paapa Essiedu flagged a duplicate record in the member directory.", time: "1 week ago", unread: true },
    { id: "27", text: "Afia Agyeman reset the API keys for Finance Hub.", time: "1 week ago", unread: false },
    { id: "28", text: "Security alert: Unusual login attempt detected from Accra.", time: "1 week ago", unread: true },
    { id: "29", text: "Kofi Baako completed the onboarding checklist.", time: "2 weeks ago", unread: false },
    { id: "30", text: "Adoley Nmai created a new workspace for the Kumasi team.", time: "2 weeks ago", unread: false },
    { id: "31", text: "SSL certificate for gsl.edu.gh renewed automatically.", time: "2 weeks ago", unread: false },
    { id: "32", text: "Kwabena Darko's document 'Procurement Policy' was approved.", time: "2 weeks ago", unread: true },
    { id: "33", text: "System update: Dark mode contrast improved across all apps.", time: "2 weeks ago", unread: true },
    { id: "34", text: "Abena Serwaa archived 150 resolved support tickets.", time: "2 weeks ago", unread: false },
    { id: "35", text: "Yaw Poku mentioned you in a comment on 'Audit Trail'.", time: "2 weeks ago", unread: true },
    { id: "36", text: "Dede Aidoo invited 12 new members to the Ghana chapter.", time: "3 weeks ago", unread: true },
    { id: "37", text: "Kwamena Quayson's access request to Billing was denied.", time: "3 weeks ago", unread: false },
    { id: "38", text: "GDPR compliance scan passed with no issues.", time: "3 weeks ago", unread: false },
    { id: "39", text: "Mansa Ankrah updated the organizational chart.", time: "3 weeks ago", unread: true },
    { id: "40", text: "Nii Armah uploaded meeting minutes for board session.", time: "3 weeks ago", unread: false },
    { id: "41", text: "Araba Forson's contract ends next Friday.", time: "3 weeks ago", unread: true },
    { id: "42", text: "Fiifi Coleman submitted travel reimbursement for review.", time: "4 weeks ago", unread: false },
    { id: "43", text: "Akosua Danso created a poll: 'Best snack for team meetings?'", time: "4 weeks ago", unread: true },
    { id: "44", text: "Nana Kwasi generated the annual diversity report.", time: "4 weeks ago", unread: false },
    { id: "45", text: "Maame Esi's proposal 'Digital Transformation 2026' was published.", time: "1 month ago", unread: false },
    { id: "46", text: "Kojo Bentsi locked the Q1 financial records for auditing.", time: "1 month ago", unread: false },
    { id: "47", text: "Naa Shika requested deletion of 3 outdated knowledge base articles.", time: "1 month ago", unread: false },
    { id: "48", text: "Kwaku Attah's timesheet for March is overdue.", time: "1 month ago", unread: true },
    { id: "49", text: "Afua Nyarko scheduled a town hall for April 15th.", time: "1 month ago", unread: true },
    { id: "50", text: "Ebo Taylor detected 4 inactive accounts — cleanup recommended.", time: "1 month ago", unread: false },
  ];

  const { data: notifData, loading: notifLoading } = useMockQuery(fakeNotifications, 1500);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <SidebarProvider>
      <AppLayout>
        <AppHeader
          search={<AppHeaderSearch />}
          appSwitcher={
            <AppSwitcher
              apps={appsData ?? []}
              loading={appsLoading}
              title="System directory"
              onAppSelect={(app) => console.log("Selected:", app.name)}
            />
          }
          notifications={
            <AppHeaderNotifications loading={notifLoading}>
              {notifData?.map((n) => (
                <div key={n.id} className={`gsl-notif-popover__item${!n.unread ? " gsl-notif-popover__item--read" : ""}`}>
                  {n.unread && <div className="gsl-notif-popover__dot" />}
                  <div className="gsl-notif-popover__body">
                    <div className="gsl-notif-popover__body-text">{n.text}</div>
                    <div className="gsl-notif-popover__body-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </AppHeaderNotifications>
          }
          profile={
            <AppHeaderProfile
              user={{
                name: "Kwame Asante",
                role: "Admin",
                initials: "KA",
                email: "kwame@gsl.edu.gh",
              }}
            >
              <button
                type="button"
                className="gsl-profile-popover__action"
                onClick={() => navigate("/docs")}
              >
                <span className="gsl-profile-popover__action-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span className="gsl-profile-popover__action-label">Docs</span>
              </button>
              <button
                type="button"
                className="gsl-profile-popover__action"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                <span className="gsl-profile-popover__action-icon">
                  {resolvedTheme === "dark" ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </span>
                <span className="gsl-profile-popover__action-label">
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                </span>
              </button>
              <button
                type="button"
                className="gsl-profile-popover__action gsl-profile-popover__action--danger"
              >
                <span className="gsl-profile-popover__action-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <span className="gsl-profile-popover__action-label">
                  Sign out
                </span>
              </button>
            </AppHeaderProfile>
          }
        />
        <AppSidebar>
          <Sidebar>
            <SidebarHeader>
              <div className="demo-home__sidebar-brand">
                <img
                  src="/gsl-logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="demo-home__sidebar-logo"
                />
                <span className="demo-home__sidebar-title">GSL</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav>
                <SidebarGroup>
                  <SidebarGroupLabel>Main</SidebarGroupLabel>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <SidebarLink
                        key={link.id}
                        active={activeNav === link.id}
                        icon={<Icon size={18} strokeWidth={1.5} />}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveNav(link.id);
                        }}
                      >
                        {link.label}
                      </SidebarLink>
                    );
                  })}
                </SidebarGroup>
              </SidebarNav>
            </SidebarContent>
            <SidebarFooter>
              <button type="button" className="demo-home__sidebar-footer-btn">
                <Settings size={18} strokeWidth={1.5} />
                <span>Settings</span>
                <ChevronRight
                  size={16}
                  strokeWidth={1.5}
                  className="demo-home__sidebar-footer-chevron"
                />
              </button>
            </SidebarFooter>
          </Sidebar>
        </AppSidebar>
        <AppBody>
          <div className="demo-card">
            <Table>
              <TableHeader>
                <TableSearch
                  placeholder="Search members..."
                  onSearch={handleSearch}
                />
                <div className="demo-filter-right">
                  <TableFilter>
                    <div className="demo-home__filter-field">
                      <label className="demo-home__filter-label">Status</label>
                      <select className="demo-home__filter-select">
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div className="demo-home__filter-field">
                      <label className="demo-home__filter-label">Role</label>
                      <select className="demo-home__filter-select">
                        <option value="">All</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </TableFilter>
                  <Button>
                    <Download size={14} strokeWidth={1.5} />
                    Download CSV
                  </Button>
                </div>
              </TableHeader>

              <TableContent
                columns={columns}
                data={paged}
                rowKey={(m: Member) => m.id}
              />

              <TableFooter>
                <TablePagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={filtered.length}
                  pageSize={pageSize}
                  onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                  }}
                />
              </TableFooter>
            </Table>
          </div>
        </AppBody>
      </AppLayout>
    </SidebarProvider>
  );
}
