import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Loader2,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";

const REQUIRED_FIELDS = [
  { key: "name", label: "Full name" },
  { key: "college", label: "College" },
  { key: "score", label: "Score" },
  { key: "rank", label: "Rank" },
];

const INITIAL_FORM = {
  name: "",
  college: "",
  score: "",
  rank: "",
};

export default function ProfilePage() {
  const { user, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState(INITIAL_FORM);

  const missingFields = useMemo(() => {
    if (!profile) {
      return REQUIRED_FIELDS;
    }

    return REQUIRED_FIELDS.filter((field) => {
      const value = profile[field.key];
      return value === null || value === undefined || value === "";
    });
  }, [profile]);

  const fetchProfile = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        throw new Error("Unable to load profile");
      }

      const { data } = await response.json();
      setProfile(data);
      setFormState({
        name: data?.name ?? user.user_metadata?.full_name ?? "",
        college: data?.college ?? "",
        score: data?.score ?? "",
        rank: data?.rank ?? "",
      });
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: error.message || "We couldn't load your profile.",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user?.email) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [authLoading, user?.email, fetchProfile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user?.email) return;

    setIsSaving(true);
    setStatus(null);

    const payload = {
      ...formState,
      email: user.email,
    };

    try {
      const endpoint = profile?.id ? `/api/users/${profile.id}` : "/api/users";
      const method = profile?.id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error ?? "Profile update failed");
      }

      setProfile(body.data);
      setFormState({
        name: body.data?.name ?? "",
        college: body.data?.college ?? "",
        score: body.data?.score ?? "",
        rank: body.data?.rank ?? "",
      });
      setStatus({ type: "success", message: "Profile saved to Supabase successfully!" });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading) {
    return (
      <section className="profile-shell center">
        <Loader2 className="spin" size={28} />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profile-shell center">
        <div className="glass-panel">
          <h2>Please sign in</h2>
          <p className="muted">
            You need to sign in with your college or recruiter account to view your profile.
          </p>
          <Link className="cta-pill" href="/login">
            Go to login
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="profile-shell center">
        <Loader2 className="spin" size={28} />
      </section>
    );
  }

  return (
    <section className="profile-shell nebula-wrap">
      <header className="profile-hero glass-panel">
        <div className="profile-title-block">
          <div className="profile-avatar">
            {profile?.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h1>{profile?.name ?? user.user_metadata?.full_name ?? "Add your name"}</h1>
            <p className="muted">
              {profile?.college ?? "Add your college to unlock leaderboards"}
            </p>
          </div>
        </div>

        <div className="profile-score-card">
          <span className="badge-pill">
            <Sparkles size={16} />
            Profile completeness {missingFields.length === 0 ? "100%" : "Pending"}
          </span>
          <p>
            {missingFields.length === 0
              ? "You're all set! Keep linking achievements to boost your rank."
              : "Complete the steps below to get verified and featured on the leaderboard."}
          </p>
          <ul className="checklist">
            {REQUIRED_FIELDS.map((field) => {
              const isDone = !missingFields.some((item) => item.key === field.key);
              return (
                <li key={field.key} className={isDone ? "done" : "todo"}>
                  {isDone ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <span>{field.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </header>

      <div className="profile-grid">
        <main className="profile-main glass-panel">
          <form className="profile-form" onSubmit={handleSubmit}>
            <h2>
              <Edit3 size={20} />
              Basic details
            </h2>

            <label>
              Full name
              <input
                name="name"
                type="text"
                value={formState.name}
                placeholder="Your full name"
                onChange={handleChange}
                required
              />
            </label>

            <label>
              College
              <input
                name="college"
                type="text"
                value={formState.college}
                placeholder="e.g. IIT Bombay"
                onChange={handleChange}
                required
              />
            </label>

            <div className="two-col">
              <label>
                Score
                <input
                  name="score"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.score}
                  placeholder="e.g. 8420"
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Rank
                <input
                  name="rank"
                  type="number"
                  min="1"
                  step="1"
                  value={formState.rank}
                  placeholder="e.g. 128"
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button className="cta-pill" type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="spin" size={18} />
                  Saving…
                </>
              ) : (
                "Save profile"
              )}
            </button>

            {status && (
              <div className={`form-status ${status.type}`}>
                {status.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>{status.message}</span>
              </div>
            )}
          </form>

          <section className="profile-section">
            <header>
              <BookOpen size={20} />
              <h3>Coding & micro achievements</h3>
              <span className="label">Coming soon</span>
            </header>
            <p className="muted">
              Connect your GitHub, LeetCode, and Codeforces handles to sync real scores automatically.
              Feature is rolling out shortly.
            </p>
            <div className="pending-pill">
              <UploadCloud size={18} />
              Attach certificates or proof of work once verification opens.
            </div>
          </section>
        </main>

        <aside className="profile-sidebar">
          <div className="glass-panel">
            <h3>Missing information</h3>
            {missingFields.length === 0 ? (
              <p className="muted">
                Great! Your essential data is complete. Explore the dashboard to view leaderboards and MicroGigs.
              </p>
            ) : (
              <ul className="todo-list">
                {missingFields.map((field) => (
                  <li key={field.key}>
                    <span>{field.label}</span>
                    <small>Tap “Save profile” after filling this field.</small>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass-panel">
            <h3>Need help?</h3>
            <p className="muted">
              Reach out to your college admin or recruiter contact if any data looks incorrect. Verified details unlock your badges and tokens.
            </p>
            <Link className="cta-outline" href="/dashboard">
              Go to Dashboard
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
