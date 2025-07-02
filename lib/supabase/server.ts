import {
  createServerComponentClient,
  createServerActionClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
export const createActionClient = () =>
  createServerActionClient<Database>({ cookies });
