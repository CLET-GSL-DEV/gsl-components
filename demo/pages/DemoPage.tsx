import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  TableBuilder,
} from "@rfdtech/components";
import { DemoLayout } from "../components/DemoLayout";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  joined: string;
}

const members: Member[] = [
  { id: 1, name: "Kwame Asante", email: "kwame.asante@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "Abena Mensah", email: "abena.mensah@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-02-03" },
  { id: 3, name: "Kofi Owusu", email: "kofi.owusu@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-03-08" },
  { id: 4, name: "Esi Boateng", email: "esi.boateng@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-03-22" },
  { id: 5, name: "Yaw Adom", email: "yaw.adom@gsl.edu.gh", role: "Viewer", status: "Pending", joined: "2024-04-01" },
  { id: 6, name: "Nana Yeboah", email: "nana.yeboah@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-04-15" },
  { id: 7, name: "Akua Donkor", email: "akua.donkor@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-05-02" },
  { id: 8, name: "Kwesi Appiah", email: "kwesi.appiah@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-05-18" },
  { id: 9, name: "Adwoa Sarpong", email: "adwoa.sarpong@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-06-10" },
  { id: 10, name: "Kobina Ennin", email: "kobina.ennin@gsl.edu.gh", role: "Viewer", status: "Pending", joined: "2024-06-25" },
];

const navLinks = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "members", label: "Members", icon: Users, active: false },
  { id: "settings", label: "Settings", icon: Settings, active: false },
];

export function DemoPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeNav, setActiveNav] = useState("dashboard");

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
  const paged = filtered.slice((page - 1) * 5, page * 5);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <DemoLayout mainClassName="demo-home-main">
      <SidebarProvider className="demo-home__layout">
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
        </Sidebar>

        <main className="demo-home__content">
          <TableBuilder>
            <TableBuilder.Header>
              <TableBuilder.Search
                placeholder="Search members..."
                onSearch={handleSearch}
              />
              <TableBuilder.Filter>
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
              </TableBuilder.Filter>
            </TableBuilder.Header>

            <TableBuilder.Content>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m) => (
                    <tr key={m.id}>
                      <td className="demo-home__cell-name">{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.role}</td>
                      <td>
                        <span
                          className={`demo-home__status demo-home__status--${m.status.toLowerCase()}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="demo-home__cell-date">{m.joined}</td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={5} className="demo-home__empty">
                        No members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableBuilder.Content>

            <TableBuilder.Footer>
              <TableBuilder.Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </TableBuilder.Footer>
          </TableBuilder>
        </main>
      </SidebarProvider>
    </DemoLayout>
  );
}
