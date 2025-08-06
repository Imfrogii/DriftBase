"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { supabase } from "@/lib/supabase/client"
import type { User as DbUser } from "@/lib/supabase/types"
import { useAuth as useAuthProvider } from '@/components/providers/AuthProvider'

export const useAuth = useAuthProvider
