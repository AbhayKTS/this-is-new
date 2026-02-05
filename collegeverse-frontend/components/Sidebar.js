import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  Home,
  User,
  School,
  MessageCircle,
  Trophy,
  Shield,
  Settings,
  HelpCircle,
  Users,
  Briefcase,
  Star,
  BookOpen,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/colleges", label: "Explore Colleges", icon: School },
  { href: "/colleges/compare", label: "Compare", icon: Star },
  { href: "/qa", label: "Q&A Forum", icon: MessageCircle },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/microgigs", label: "MicroGigs", icon: Briefcase },
];

const seniorLinks = [
  { href: "/verification", label: "Verification", icon: Shield },
];

const bottomLinks = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

export default function Sidebar({ collapsed = false, onToggle }) {
  const router = useRouter();
  const { user, profile, logout } = useContext(AuthContext);
  
  const isActive = (href) => {
    if (href === "/dashboard") {
      return router.pathname === "/dashboard" || router.pathname === "/student/dashboard";
    }
    return router.pathname.startsWith(href);
  };
  
  const isVerifiedSenior = profile?.isVerifiedSenior || profile?.is_verified_senior;
  const userName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  
  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* User Profile Section */}
      <div className="sidebar-profile">
        <div className="profile-avatar">
          {profile?.avatar ? (
            <img src={profile.avatar} alt={userName} />
          ) : (
            <span>{userInitials}</span>
          )}
        </div>
        {!collapsed && (
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">
              {isVerifiedSenior ? "Verified Senior" : profile?.role || "Student"}
            </span>
          </div>
        )}
      </div>
      
      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <span className="nav-section-title">Main Menu</span>}
          {studentLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${active ? "active" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{link.label}</span>}
                {active && !collapsed && <ChevronRight size={16} className="link-indicator" />}
              </Link>
            );
          })}
        </div>
        
        {/* Senior Section - Only for verified or pending verification */}
        {(isVerifiedSenior || profile?.role === "student") && (
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">Senior Zone</span>}
            {seniorLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  title={collapsed ? link.label : undefined}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{link.label}</span>}
                  {isVerifiedSenior && !collapsed && (
                    <span className="badge badge-success">Verified</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
        
        {/* Bottom Links */}
        <div className="nav-section nav-section-bottom">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${active ? "active" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
          
          {user && (
            <button
              onClick={logout}
              className="sidebar-link sidebar-logout"
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut size={20} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </nav>
      
      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          transition: width 0.3s ease;
        }
        
        .sidebar-collapsed {
          width: 72px;
        }
        
        .sidebar-profile {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .profile-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 0.875rem;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .profile-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .profile-name {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .profile-role {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .nav-section {
          margin-bottom: 1.5rem;
        }
        
        .nav-section-bottom {
          margin-top: auto;
          margin-bottom: 0;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav-section-title {
          display: block;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem 0.75rem;
        }
        
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s ease;
          margin-bottom: 0.25rem;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }
        
        .sidebar-link.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          color: white;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }
        
        .sidebar-logout {
          color: rgba(255, 100, 100, 0.8);
        }
        
        .sidebar-logout:hover {
          background: rgba(255, 100, 100, 0.1);
          color: #ff6b6b;
        }
        
        .link-indicator {
          margin-left: auto;
          opacity: 0.5;
        }
        
        .badge {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          border-radius: 100px;
          margin-left: auto;
        }
        
        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
