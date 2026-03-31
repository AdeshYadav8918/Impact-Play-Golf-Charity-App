import { createBrowserClient } from '@supabase/ssr';
import { createClient as createBaseClient } from '@supabase/supabase-js';

// Standard Client (for general use)
export const supabase = createBaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Browser Client (for use in Clerk/Auth helpers)
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
