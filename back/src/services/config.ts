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
    if (error) null;
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

  async updateEmailConfig(configId: number, emailId: number, userId: string) {
    const { error } = await this.supabase
      .from("outlook_credentials")
      .update({ configuration_id: configId })
      .eq("id", emailId)
      .eq("user_auth_user_id", userId);
    if (error) throw error;
  }

  async getConfigFromCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from("category")
      .select("id, configuration:configuration_id(*)")
      .eq("id", categoryId)
      .single();
    if (error) throw error;

    return data.configuration;
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

  async removeActionsFromCategory(categoryId: number) {
    const { error } = await this.supabase
      .from("category_actions")
      .delete()
      .eq("category_id", categoryId);
    if (error) throw error;
  }
}
