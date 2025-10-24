import { Inject, Injectable } from "@nestjs/common";
import { Supa } from "../lib/supabase";

@Injectable()
export class RegisterService {
  constructor(@Inject("SUPABASE") private readonly supabase: Supa) {}

  async registerUser(
    authUserId: string,
    email: string
  ): Promise<RegisterResult> {
    const existing = await this.supabase
      .from("users")
      .select("auth_user_id,email,org_id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (existing.data) {
      if (existing.data.email !== email) {
        await this.supabase
          .from("users")
          .update({ email })
          .eq("auth_user_id", authUserId);
      }
      return existing.data as RegisterResult;
    }

    const { data: userRow, error: userErr } = await this.supabase
      .from("users")
      .insert({
        auth_user_id: authUserId,
        email,
        org_id: null,
      })
      .select("auth_user_id,email,org_id")
      .single();
    if (userErr) throw userErr;
    return userRow as RegisterResult;
  }

  async getMe(authUserId: string): Promise<RegisterResult | null> {
    const { data } = await this.supabase
      .from("users")
      .select("auth_user_id,email,org_id,subscription_status,current_plan")
      .eq("auth_user_id", authUserId)
      .single();
    return (data as RegisterResult) || null;
  }
}
