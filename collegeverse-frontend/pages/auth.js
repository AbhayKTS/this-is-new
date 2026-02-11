import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../components/AuthContext";

export default function Auth() {
  const router = useRouter();
  const { isAuthenticated, userData } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const routeByRole = {
        student: "/dashboard",
        recruiter: "/recruiter/dashboard",
        college: "/college/dashboard",
      };
      const role = (userData?.role || "student").toLowerCase();
      router.replace(routeByRole[role] || "/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, userData, router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div className="loading-pulse" style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)" }} />
    </div>
  );
}