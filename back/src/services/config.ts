import { Inject, Injectable } from "@nestjs/common";
import { Supa } from "../lib/supabase";

@Injectable()
export class ConfigService {
  constructor(@Inject("SUPABASE") private supabase: Supa) {}

  async getConfig(configIg: number, userId: string) {
    const { data, error } = await this.supabase
      .from("configurations")
      .select()
      .eq("id", configIg)
      .eq("user_auth_user_id", userId)
      .single();
    if (error) return null;
    return data;
  }

  async getCategoriesFromConfig(configId: number) {
    const { data, error } = await this.supabase
      .from("category")
      .select(
        `id, name, description, actions:category_actions(id, type, props)`
      )
      .eq("configuration_id", configId);
    if (error) throw error;
    return data;
  }

  async listConfigs(userId: string) {
    const { data, error } = await this.supabase
      .from("configurations")
      .select()
      .eq("user_auth_user_id", userId);
    if (error) throw error;
    return data;
  }

  async createConfig(userId: string, name: string) {
    const { data, error } = await this.supabase
      .from("configurations")
      .insert({ user_auth_user_id: userId, name })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async removeConfig(userId: string, configId: number) {
    const { error } = await this.supabase
      .from("configurations")
      .delete()
      .eq("user_auth_user_id", userId)
      .eq("id", configId);
    if (error) throw error;
  }

  async updateEmailConfig(
    configId: number | null,
    emailId: number,
    userId: string
  ) {
    const { data, error } = await this.supabase
      .from("outlook_credentials")
      .update({ configuration_id: configId })
      .eq("id", emailId)
      .eq("user_auth_user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  async getConfigFromCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from("category")
      .select("id, configurations:configuration_id(*)")
      .eq("id", categoryId)
      .single();
    if (error) throw error;

    return data.configurations;
  }

  async createCategory(name: string, description: string, configId: number) {
    const { data, error } = await this.supabase
      .from("category")
      .insert({ name, description, configuration_id: configId })
      .select()
      .single();
    if (error) throw error;

    return data;
  }

  async updateCategory(categoryId: number, name: string, description: string) {
    const { data, error } = await this.supabase
      .from("category")
      .update({ name, description })
      .eq("id", categoryId)
      .select()
      .single();
    if (error) throw error;

    return data;
  }

  async removeCategory(categoryId: number) {
    const { error } = await this.supabase
      .from("category")
      .delete()
      .eq("id", categoryId);
    if (error) throw error;
  }

  async createAction(
    categoryId: number,
    type: string,
    props:
      | ActionPropsTag
      | ActionPropsFolder
      | ActionPropsForward
      | ActionPropsReply
  ) {
    const { data, error } = await this.supabase
      .from("category_actions")
      .insert({
        type,
        props,
        category_id: categoryId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from("category")
      .select(
        `id, name, description, configurations:configuration_id(*), actions:category_actions(id, type, props)`
      )
      .eq("id", categoryId)
      .single();
    if (error) throw error;
    return data;
  }

  async getEmailWithConfiguration(configurationId: number) {
    const { data, error } = await this.supabase
      .from("outlook_credentials")
      .select(
        "id, user_auth_user_id, email, accountId:account_id, tokenType:token_type, expiresAt:expires_at, accessToken:access_token, refreshToken:refresh_token, configurationId:configuration_id"
      )
      .eq("configuration_id", configurationId)
      .single();
    if (error) throw error;
    return data;
  }

  async removeActionsFromCategory(categoryId: number) {
    const { error } = await this.supabase
      .from("category_actions")
      .delete()
      .eq("category_id", categoryId);
    if (error) throw error;
  }

  async getEmailTags(
    accessToken: string
  ): Promise<Array<{ id: string; displayName: string; color?: string }>> {
    if (!accessToken) {
      throw new Error("Missing access token for Outlook Graph");
    }

    const url = "https://graph.microsoft.com/v1.0/me/outlook/masterCategories";

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      // Common case: 401 -> token expired/invalid. Let caller decide to refresh.
      throw new Error(
        `Failed to fetch Outlook categories (${resp.status}): ${text}`
      );
    }

    const data: any = await resp.json();
    const items = Array.isArray(data?.value) ? data.value : [];

    return items.map((c: any) => ({
      id: String(c.id ?? ""),
      displayName: String(c.displayName ?? ""),
      color: c.color,
    }));
  }

  async getEmailFolders(
    accessToken: string
  ): Promise<{ id: string; displayName: string }[]> {
    if (!accessToken) {
      throw new Error("Missing access token for Outlook Graph");
    }

    // Microsoft Graph endpoint for mail folders (supports pagination via @odata.nextLink)
    const baseUrl = "https://graph.microsoft.com/v1.0/me/mailFolders";
    const params = new URLSearchParams({
      includeHiddenFolders: "true",
      $top: "50",
      $select:
        "id,displayName,parentFolderId,childFolderCount,totalItemCount,unreadItemCount,isHidden",
    });

    let url = `${baseUrl}?${params.toString()}`;
    const flat: any[] = [];

    while (url) {
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(
          `Failed to fetch Outlook folders (${resp.status}): ${text}`
        );
      }

      const data: any = await resp.json();
      const page = Array.isArray(data?.value) ? data.value : [];

      for (const f of page) {
        flat.push({
          id: String(f.id ?? ""),
          displayName: String(f.displayName ?? ""),
          name: String(f.displayName ?? ""), // alias
          parentFolderId: f.parentFolderId ?? null,
          childFolderCount: Number(f.childFolderCount ?? 0),
          totalItemCount: Number(f.totalItemCount ?? 0),
          unreadItemCount: Number(f.unreadItemCount ?? 0),
          isHidden: Boolean(f.isHidden ?? false),
        });
      }

      url = data && data["@odata.nextLink"] ? data["@odata.nextLink"] : "";
    }

    // Build a tree so the UI can present a folder picker
    const byId = new Map<string, any>();
    for (const f of flat) byId.set(f.id, { ...f, children: [] as any[] });

    const roots: any[] = [];
    for (const f of byId.values()) {
      if (f.parentFolderId && byId.has(f.parentFolderId)) {
        byId.get(f.parentFolderId)!.children.push(f);
      } else {
        roots.push(f);
      }
    }

    // Optional: sort alphabetically for nicer display
    const sortRec = (nodes: any[]) => {
      nodes.sort((a, b) => a.displayName.localeCompare(b.displayName));
      for (const n of nodes) sortRec(n.children);
    };
    sortRec(roots);

    return roots; // tree with {id, displayName, ... , children: []}
  }
}
