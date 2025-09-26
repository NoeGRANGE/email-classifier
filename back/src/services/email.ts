import { Inject, Injectable } from "@nestjs/common";
import { Supa } from "../lib/supabase";

@Injectable()
export class EmailService {
  constructor(@Inject("SUPABASE") private supabase: Supa) {}

  async listUserEmails(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("outlook_credentials")
      .select("email")
      .eq("user_auth_user_id", userId);
    if (error) throw error;
    return data.map((row) => row.email);
  }
}
