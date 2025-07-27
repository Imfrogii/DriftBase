"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import type { User } from "@supabase/auth-helpers-nextjs";
import { supabase } from "@/lib/supabase/client";
import type { User as DbUser } from "@/lib/supabase/types";

export interface AuthContextType {
  setUser: Dispatch<SetStateAction<User | null>>;
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      console.log("Auth state changed:", event, session);
      if (session?.user) {
        setLoading(true);
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setDbUser(dbUser);
        setLoading(false);
      } else {
        setDbUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        signOut,
        dbUser,
        isAdmin: dbUser?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
