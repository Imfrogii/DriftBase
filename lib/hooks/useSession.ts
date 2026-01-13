"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import api from "../utils/request";

export function useSession(initialSession?: Session | null) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(
    initialSession ?? null
  );
  // const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setSession(null);
    } catch (error) {
      throw error;
    }
  };

  // useEffect(() => {
  //   console.log("useeffect triggered");

  //   const check = async () => {
  //     const { data } = await supabase.auth.getSession();
  //     console.log("Initial session:", data.session);
  //     setSession(data.session);
  //     setLoading(false);
  //   };

  //   check();

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_, session) => {
  //     setSession(session);
  //     setLoading(false);
  //     router.refresh();
  //   });

  //   return () => subscription.unsubscribe();
  // }, [router, supabase]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, logout };
}
