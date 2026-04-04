import Sidebar from "../../components/admin/Sidebar";

export const metadata = { title: "NOX Admin" };

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      <Sidebar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}