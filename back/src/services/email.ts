import { Inject, Injectable } from "@nestjs/common";
import { Supa } from "../lib/supabase";

@Injectable()
export class EmailService {
  constructor(@Inject("SUPABASE") private supabase: Supa) {}

  async listUserEmails(userId: string): Promise<
    {
      id: number;
      email: string;
      activated: boolean;
      configurationId: number | null;
    }[]
  > {
    const { data, error } = await this.supabase
      .from("outlook_credentials")
      .select("id, email, activated, configurationId:configuration_id")
      .eq("user_auth_user_id", userId);
    if (error) {
      throw error;
    }
    return data;
  }

  async removeUserEmail(userId: string, emailId: number) {
    const { error } = await this.supabase
      .from("outlook_credentials")
      .delete()
      .eq("user_auth_user_id", userId)
      .eq("id", emailId);
    if (error && error.code !== "PGRST116") throw error;
  }

  async activateOrDeactivateUserEmail(
    userId: string,
    emailId: number,
    activated: boolean
  ) {
    const { error } = await this.supabase
      .from("outlook_credentials")
      .update({ activated: activated })
      .eq("user_auth_user_id", userId)
      .eq("id", emailId);
    if (error && error.code !== "PGRST116") throw error;
  }

  async getUserEmail(userId: string, emailId: number) {
    const { data, error } = await this.supabase
      .from("outlook_credentials")
      .select("*")
      .eq("user_auth_user_id", userId)
      .eq("id", emailId)
      .single();
    if (error) throw error;
    return data;
  }
}
