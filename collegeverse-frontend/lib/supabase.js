import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

function createShimBuilder() {
  const errorResponse = () => Promise.resolve({ data: null, error: new Error("Supabase not configured") });
  const builder = {
    select: () => builder,
    insert: () => builder,
    upsert: () => builder,
    update: () => builder,
    delete: () => builder,
    order: () => builder,
    eq: () => builder,
    ilike: () => builder,
    contains: () => builder,
    gte: () => builder,
    lte: () => builder,
    range: () => builder,
    limit: () => builder,
    in: () => builder,
    single: errorResponse,
    maybeSingle: errorResponse,
    then: (onFulfilled, onRejected) => errorResponse().then(onFulfilled, onRejected),
    catch: (onRejected) => errorResponse().catch(onRejected),
    finally: (onFinally) => errorResponse().finally(onFinally),
  };
  return builder;
}

function createSupabaseShim() {
  console.warn("NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY is not set in env - Supabase disabled");

  const errorResponse = () => ({ data: null, error: new Error("Supabase not configured") });

  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb) => ({ subscription: { unsubscribe: () => {} } }),
      signInWithOtp: async () => errorResponse(),
      signInWithOAuth: async () => errorResponse(),
      signOut: async () => errorResponse(),
    },
    from: () => createShimBuilder(),
    functions: {
      invoke: async () => errorResponse(),
    },
  };
}

export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : createSupabaseShim();
