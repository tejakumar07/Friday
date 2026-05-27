import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    "https://ftvqvkbbzowenbexften.supabase.co",
    "sb_publishable_otEha1IZuEkJi8Eh4g8VLg_T3CoLut8",
  );
}
