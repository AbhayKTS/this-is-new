import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "./AuthContext";
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

export default function Sidebar({ collapsed = false, open = false }) {
  const router = useRouter();
  const { user, userData, logout, isVerifiedSenior } = useAuth();

  const isActive = (href) => {
    if (href === "/dashboard") {
      return router.pathname === "/dashboard" || router.pathname === "/student/dashboard";
    }
    return router.pathname.startsWith(href);
  };

  const userName = userData?.full_name || userData?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}${open ? " open" : ""}`}>
      <div className="sidebar-header">
        <Link href="/" className="brand-link">
          <span className="logo-badge">CV</span>
          {!collapsed && <span className="brand-name">CollegeVerse</span>}
        </Link>
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">
          {userData?.avatar ? (
            <img src={userData.avatar} alt={userName} />
          ) : (
            <span>{userInitials}</span>
          )}
        </div>
        {!collapsed && (
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">
              {isVerifiedSenior ? "Verified Senior" : userData?.role || "Student"}
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <span className="nav-section-title">Main Menu</span>}
          {studentLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} className={`sidebar-link${active ? " active" : ""}`} title={collapsed ? link.label : undefined}>
                <Icon size={20} />
                {!collapsed && <span>{link.label}</span>}
                {active && !collapsed && <ChevronRight size={16} className="link-indicator" />}
              </Link>
            );
          })}
        </div>

        {(isVerifiedSenior || userData?.role === "student") && (
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">Senior Zone</span>}
            {seniorLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href} className={`sidebar-link${active ? " active" : ""}`} title={collapsed ? link.label : undefined}>
                  <Icon size={20} />
                  {!collapsed && <span>{link.label}</span>}
                  {isVerifiedSenior && !collapsed && <span className="badge badge-success">Verified</span>}
                </Link>
              );
            })}
          </div>
        )}

        <div className="nav-section nav-section-bottom">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} className={`sidebar-link${active ? " active" : ""}`} title={collapsed ? link.label : undefined}>
                <Icon size={20} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
          {user && (
            <button onClick={logout} className="sidebar-link sidebar-logout" title={collapsed ? "Sign Out" : undefined}>
              <LogOut size={20} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </nav>
    </aside>
  );
}
