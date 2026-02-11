import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { Star, MapPin, ArrowLeft, Scale, Trophy, Users, GraduationCap, Building2, CheckCircle, XCircle } from "lucide-react";

const allColleges = [
  { id: "1", name: "IIT Bombay", location: "Mumbai, MH", type: "IIT", rating: 4.7, placement: 4.9, academics: 4.7, hostel: 4.2, students: 12400, avgPkg: 21.5, highPkg: 280, placementRate: 96, courses: 95, clubs: 120, sports: true, wifi: true },
  { id: "2", name: "IIT Delhi", location: "New Delhi", type: "IIT", rating: 4.8, placement: 4.8, academics: 4.8, hostel: 4.0, students: 11200, avgPkg: 22.0, highPkg: 300, placementRate: 97, courses: 88, clubs: 100, sports: true, wifi: true },
  { id: "3", name: "BITS Pilani", location: "Pilani, RJ", type: "Private", rating: 4.5, placement: 4.5, academics: 4.6, hostel: 4.4, students: 9800, avgPkg: 18.5, highPkg: 150, placementRate: 93, courses: 72, clubs: 80, sports: true, wifi: true },
  { id: "4", name: "NIT Trichy", location: "Tiruchirappalli, TN", type: "NIT", rating: 4.4, placement: 4.3, academics: 4.4, hostel: 3.8, students: 7600, avgPkg: 14.5, highPkg: 85, placementRate: 89, courses: 60, clubs: 65, sports: true, wifi: true },
  { id: "5", name: "IIIT Hyderabad", location: "Hyderabad, TS", type: "IIIT", rating: 4.6, placement: 4.7, academics: 4.5, hostel: 3.9, students: 4200, avgPkg: 19.0, highPkg: 120, placementRate: 92, courses: 45, clubs: 40, sports: false, wifi: true },
  { id: "6", name: "VIT Vellore", location: "Vellore, TN", type: "Private", rating: 4.2, placement: 4.0, academics: 4.1, hostel: 4.3, students: 22000, avgPkg: 8.5, highPkg: 50, placementRate: 82, courses: 110, clubs: 150, sports: true, wifi: true },
];

const metrics = [
  { key: "rating", label: "Overall Rating", format: (v) => v + "/5", highlight: "max" },
  { key: "placement", label: "Placement Rating", format: (v) => v + "/5", highlight: "max" },
  { key: "academics", label: "Academics Rating", format: (v) => v + "/5", highlight: "max" },
  { key: "hostel", label: "Hostel Rating", format: (v) => v + "/5", highlight: "max" },
  { key: "students", label: "Total Students", format: (v) => v.toLocaleString(), highlight: "max" },
  { key: "avgPkg", label: "Avg Package (LPA)", format: (v) => v + " LPA", highlight: "max" },
  { key: "highPkg", label: "Highest Package (LPA)", format: (v) => v + " LPA", highlight: "max" },
  { key: "placementRate", label: "Placement Rate", format: (v) => v + "%", highlight: "max" },
  { key: "courses", label: "Courses Offered", format: (v) => v, highlight: "max" },
  { key: "clubs", label: "Student Clubs", format: (v) => v, highlight: "max" },
  { key: "sports", label: "Sports Facilities", format: (v) => v, highlight: "bool" },
  { key: "wifi", label: "Campus WiFi", format: (v) => v, highlight: "bool" },
];

export default function CompareColleges() {
  const router = useRouter();
  const idsParam = (router.query.ids || "1,2").split(",").slice(0, 3);
  const [selectedIds, setSelectedIds] = useState(idsParam);

  const selected = selectedIds.map((id) => allColleges.find((c) => c.id === id)).filter(Boolean);

  const getBest = (key) => {
    const vals = selected.map((c) => c[key]);
    return Math.max(...vals);
  };

  return (
    <div>
      <NavBar />
      <main style={{ minHeight: "100vh", paddingTop: "5rem" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Back to explore
          </Link>

          <div className="page-hero" style={{ marginBottom: "1.5rem" }}>
            <span className="badge-pill"><Scale size={14} /> Compare</span>
            <h1>Compare <span className="text-gradient">Colleges</span></h1>
            <p>Side-by-side comparison of top institutions.</p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {allColleges.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <button key={c.id} className={"filter-tab" + (isSelected ? " active" : "")} onClick={() => {
                  if (isSelected) setSelectedIds(selectedIds.filter((x) => x !== c.id));
                  else if (selectedIds.length < 3) setSelectedIds([...selectedIds, c.id]);
                }}>{c.name}</button>
              );
            })}
          </div>

          {selected.length < 2 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Scale size={28} /></div>
              <h3>Select at least 2 colleges</h3>
              <p>Choose colleges above to start comparing.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 160 }}>Metric</th>
                    {selected.map((c) => (
                      <th key={c.id} style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: "white" }}>{c.name.charAt(0)}</div>
                          <span style={{ fontSize: "0.82rem" }}>{c.name}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{c.location}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => {
                    const best = m.highlight === "max" ? getBest(m.key) : null;
                    return (
                      <tr key={m.key}>
                        <td style={{ fontWeight: 500, color: "var(--text-muted)" }}>{m.label}</td>
                        {selected.map((c) => {
                          const val = c[m.key];
                          const isBest = m.highlight === "max" && val === best;
                          if (m.highlight === "bool") {
                            return (
                              <td key={c.id} style={{ textAlign: "center" }}>
                                {val ? <CheckCircle size={18} style={{ color: "var(--success)" }} /> : <XCircle size={18} style={{ color: "var(--error)" }} />}
                              </td>
                            );
                          }
                          return (
                            <td key={c.id} style={{ textAlign: "center", color: isBest ? "var(--accent)" : "var(--text-muted)", fontWeight: isBest ? 700 : 400 }}>
                              {m.format(val)} {isBest && <Trophy size={12} style={{ color: "var(--warning)", verticalAlign: "middle" }} />}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}