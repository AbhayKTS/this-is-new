import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X, Bell, Search } from "lucide-react";

export default function DashboardLayout({ children, title, showSearch = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar collapsed={sidebarCollapsed} open={sidebarOpen} />

      <div className={`dashboard-main${sidebarCollapsed ? " expanded" : ""}`}>
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {title && <span className="topbar-title">{title}</span>}
            {showSearch && (
              <div className="topbar-search">
                <Search size={16} />
                <input type="text" placeholder="Search..." />
              </div>
            )}
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        <main className="dashboard-page">
          {children}
        </main>
      </div>
    </div>
  );
}