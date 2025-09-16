import { Inject, Injectable } from "@nestjs/common";
import { Supa } from "../lib/supabase";
import { randomBytes } from "crypto";

@Injectable()
export class OrganisationService {
  constructor(@Inject("SUPABASE") private supabase: Supa) {}

  async createOrganisation(name: string, ownerOrgId: string): Promise<number> {
    const { error: orgErr, data } = await this.supabase
      .from("organisations")
      .insert({
        name,
        seats_purchased: 1, // TODO: change to real values
        seats_used: 1,
        owner_user_id: ownerOrgId,
      })
      .select("id")
      .single();
    if (orgErr) throw orgErr;
    return data.id;
  }

  async createOwnerMember(
    userId: string,
    orgId: number,
    email: string
  ): Promise<void> {
    const { error: userErr } = await this.supabase.from("members").insert({
      user_auth_user_id: userId,
      org_id: orgId,
      role: "owner",
      email,
      authorized_emails: 1,
      token: "",
      status: "accepted",
    });
    if (userErr) throw userErr;
  }

  async setInviteToAccepted(userId: string, token: string): Promise<number> {
    const { error: userErr, data } = await this.supabase
      .from("members")
      .update({ status: "accepted", user_auth_user_id: userId, token: null })
      .eq("token", token)
      .select("org_id")
      .single();
    if (userErr) throw userErr;
    return data.org_id;
  }

  async setOrganisationToUser(userId: string, orgId: number): Promise<void> {
    const { error: userErr } = await this.supabase
      .from("users")
      .update({ org_id: orgId })
      .eq("auth_user_id", userId);
    if (userErr) throw userErr;
  }

  async getMember(userId: string): Promise<{
    accepted_at: string;
    authorized_emails: number;
    created_at: string;
    email: string;
    id: number;
    org_id: number;
    role: string;
    status: string;
    token: string;
    user_auth_user_id: string;
  } | null> {
    const { error: userErr, data } = await this.supabase
      .from("members")
      .select("*")
      .eq("user_auth_user_id", userId)
      .single();
    if (userErr) throw userErr;
    return data;
  }

  async createInvite(
    org_id: number,
    email: string,
    token: string,
    role: OrganisationRole,
    reservedSeats: number
  ): Promise<void> {
    const { error: userErr } = await this.supabase.from("members").insert({
      org_id,
      email,
      token,
      role,
      authorized_emails: reservedSeats,
      status: "pending",
    });
    if (userErr) throw userErr;
  }

  async generateToken(): Promise<string> {
    let token: string = randomBytes(32).toString("hex");
    let exists = true;

    while (exists) {
      token = randomBytes(32).toString("hex");
      const { data } = await this.supabase
        .from("members")
        .select("id")
        .eq("token", token)
        .maybeSingle();
      exists = !!data;
    }
    return token;
  }

  async getOrganisationForUser(
    userId: string
  ): Promise<Pick<
    Tables<"organisations">,
    "id" | "name" | "subscription_type" | "seats_purchased" | "seats_used"
  > | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select(
        "org_id, org:organisations!users_org_id_fkey(id, name, subscription_type, seats_purchased, seats_used)"
      )
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (error) throw error;

    return data?.org ?? null;
  }

  async getMembersForOrg(
    orgId: number
  ): Promise<
    Pick<
      Tables<"members">,
      | "id"
      | "email"
      | "role"
      | "status"
      | "authorized_emails"
      | "created_at"
      | "accepted_at"
    >[]
  > {
    const { data, error } = await this.supabase
      .from("members")
      .select(
        "id, email, role, status, authorized_emails, created_at, accepted_at"
      )
      .eq("org_id", orgId);

    if (error) throw error;

    return data;
  }
}
