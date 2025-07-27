"use client";

import {
  AuthContextType,
  AuthContext,
} from "@/components/providers/AuthProvider";
import { useContext } from "react";

// import { useEffect, useState } from "react";
// import type { User } from "@supabase/auth-helpers-nextjs";
// import { supabase } from "@/lib/supabase/client";
// import type { User as DbUser } from "@/lib/supabase/types";

// export function useAuth() {
// const [user, setUser] = useState<User | null>(null);
// const [dbUser, setDbUser] = useState<DbUser | null>(null);
// const [loading, setLoading] = useState(true);

// useEffect(() => {
//   const getUser = async () => {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     setUser(user);

//     if (user) {
//       const { data: dbUser } = await supabase
//         .from("users")
//         .select("*")
//         .eq("id", user.id)
//         .single();
//       setDbUser(dbUser);
//     }

//     setLoading(false);
//   };

//   if (user || loading) return;

//   getUser();

//   const {
//     data: { subscription },
//   } = supabase.auth.onAuthStateChange(async (event, session) => {
//     setUser(session?.user ?? null);

//     if (session?.user) {
//       const { data: dbUser } = await supabase
//         .from("users")
//         .select("*")
//         .eq("id", session.user.id)
//         .single();
//       setDbUser(dbUser);
//     } else {
//       setDbUser(null);
//     }

//     setLoading(false);
//   });

//   return () => subscription.unsubscribe();
// }, []);

// const signOut = async () => {
//   await supabase.auth.signOut();
// };

//   return {
//     user,
//     dbUser,
//     loading,
//     signOut,
//     isAdmin: dbUser?.role === "admin",
//   };
// }

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
