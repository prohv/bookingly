import { supabase } from "./supabase";

export const signIn = async (email: string) => {
    return supabase.auth.signInWithOtp({ email })
};

export const signOut = async () => {
    return supabase.auth.signOut()
}