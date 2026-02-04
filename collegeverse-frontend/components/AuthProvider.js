import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  loadingProfile: false,
  authLoading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithLinkedIn: async () => {},
  signInWithMagic: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.warn("Auth init error", error);
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      try {
        listener.subscription.unsubscribe();
      } catch (error) {
        // no-op
      }
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !session?.user) {
      setProfile(null);
      return null;
    }

    setLoadingProfile(true);
    let resolvedProfile = null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, college, company, tags")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error && error.message && !error.message.toLowerCase().includes("no rows")) {
        console.warn("Profile fetch error", error);
      }

      resolvedProfile = data ?? null;

      if (!resolvedProfile) {
        const localRole =
          typeof window !== "undefined" ? window.localStorage.getItem("cv-role") : null;
        const defaultRole = localRole || session.user.user_metadata?.role || "student";
        const payload = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || "",
          role: defaultRole,
          college: session.user.user_metadata?.college || "",
          company: session.user.user_metadata?.company || "",
        };

        const { data: upserted, error: upsertError } = await supabase
          .from("profiles")
          .upsert(payload, { onConflict: "id" })
          .select()
          .single();

        if (upsertError) {
          console.warn("Profile upsert error", upsertError);
        } else {
          resolvedProfile = upserted;
        }
      }
    } catch (error) {
      console.warn("Profile sync failed", error);
    }

    setProfile(resolvedProfile);
    setLoadingProfile(false);
    return resolvedProfile;
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    fetchProfile();
  }, [fetchProfile, session?.user]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cv-role");
      }
    } catch (error) {
      console.warn("signOut error", error);
    }
  };

  const signInWithOAuth = async (provider, metadata = {}) => {
    const options = Object.keys(metadata || {}).length ? { data: metadata } : undefined;
    return supabase.auth.signInWithOAuth({ provider, options });
  };

  const signInWithGoogle = async (metadata) => signInWithOAuth("google", metadata);

  const signInWithLinkedIn = async (metadata) => signInWithOAuth("linkedin", metadata);

  const signInWithMagic = async (email) => supabase.auth.signInWithOtp({ email });

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loadingProfile,
        authLoading,
        signOut,
        signInWithGoogle,
        signInWithLinkedIn,
        signInWithMagic,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
