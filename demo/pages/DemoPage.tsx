import { useState } from "react";
import { LayoutDashboard, Users, Settings } from "lucide-react";
import type { TableColumn } from "@rfdtech/components";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  AppLayout,
  AppSidebar,
  AppBody,
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
  const pageSize = 5;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeNav, setActiveNav] = useState("dashboard");

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
    <AppLayout>
      <AppHeader
        logoSrc="/gsl-logo.png"
        brandText="GSL"
        user={{
          name: "Kwame Asante",
          role: "Admin",
          initials: "KA",
        }}
        notificationCount={3}
      />
      <AppSidebar>
        <Sidebar>
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
            <div className="demo-home__user">
              <div className="demo-home__user-avatar">KA</div>
              <div className="demo-home__user-info">
                <span className="demo-home__user-name">Kwame Asante</span>
                <span className="demo-home__user-email">kwame@gsl.edu.gh</span>
              </div>
            </div>
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
              />
            </TableFooter>
          </Table>
        </div>
      </AppBody>
    </AppLayout>
  );
}
