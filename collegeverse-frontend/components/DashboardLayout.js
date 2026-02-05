import { useState } from "react";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import { Menu, X, Bell, Search } from "lucide-react";

export default function DashboardLayout({ children, title, showSearch = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarOpen ? "open" : ""}`}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      
      {/* Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {title && <h1 className="page-title">{title}</h1>}
            
            {showSearch && (
              <div className="header-search">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="search-input"
                />
              </div>
            )}
          </div>
          
          <div className="header-right">
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
      
      <style jsx>{`
        .dashboard-layout {
          min-height: 100vh;
          background: #0f0f1a;
        }
        
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
          display: none;
        }
        
        .sidebar-wrapper {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 100;
        }
        
        .main-content {
          margin-left: 260px;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }
        
        .main-content.expanded {
          margin-left: 72px;
        }
        
        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: rgba(15, 15, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
        }
        
        .page-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }
        
        .header-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .search-input {
          background: none;
          border: none;
          color: white;
          outline: none;
          font-size: 0.875rem;
          width: 200px;
        }
        
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .header-icon-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .header-icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .notification-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
        }
        
        .dashboard-content {
          padding: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .sidebar-overlay {
            display: block;
          }
          
          .sidebar-wrapper {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .sidebar-wrapper.open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .main-content.expanded {
            margin-left: 0;
          }
          
          .mobile-menu-btn {
            display: block;
          }
          
          .header-search {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
