import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/*
 * Required Supabase table — run this SQL in your Supabase dashboard:
 *
 * CREATE TABLE transactions (
 *   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   session_id  TEXT NOT NULL,
 *   amount      NUMERIC(12, 2) NOT NULL,
 *   currency    TEXT NOT NULL DEFAULT 'NGN',
 *   description TEXT,
 *   status      TEXT NOT NULL CHECK (status IN ('pending','processing','success','failed','cancelled')),
 *   reference   TEXT,
 *   created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 *
 * ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can manage own transactions"
 *   ON transactions FOR ALL
 *   USING (auth.uid() = user_id)
 *   WITH CHECK (auth.uid() = user_id);
 */
