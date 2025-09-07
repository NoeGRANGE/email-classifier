import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";

export type Supa = SupabaseClient<Database>;

export const SupabaseProvider = {
  provide: "SUPABASE",
  inject: [ConfigService],
  useFactory: (cfg: ConfigService): Supa =>
    createClient<Database>(
      cfg.get<string>("SUPABASE_URL")!,
      cfg.get<string>("SUPABASE_SERVICE_KEY")!
    ),
};
