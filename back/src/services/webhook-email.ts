import { Inject, Injectable } from "@nestjs/common";
import { Supa } from "../lib/supabase";
import { Client } from "@microsoft/microsoft-graph-client";

@Injectable()
export class WebhookEmailService {
  constructor(@Inject("SUPABASE") private supabase: Supa) {}

  async createSubscription(accessToken: string, emailId: number) {
    const client = this.getAuthenticatedClient(accessToken);

    const subscription = {
      changeType: "created",
      // notificationUrl: `${process.env.APP_URL}/webhook/email`,
      notificationUrl: `https://1feac2a175b9.ngrok-free.app/webhook/email`,
      resource: "/me/mailFolders/inbox/messages",
      expirationDateTime: this.getExpirationDate(),
      clientState: emailId.toString(),
    };

    try {
      const result = await client.api("/subscriptions").post(subscription);

      await this.saveSubscription(
        result.id,
        emailId,
        new Date(result.expirationDateTime)
      );

      return result;
    } catch (error) {
      console.error("Erreur création subscription:", error);
      throw error;
    }
  }

  private getExpirationDate(): string {
    // Maximum 3 jours (4230 minutes) pour les messages
    const date = new Date();
    date.setMinutes(date.getMinutes() + 4230);
    return date.toISOString();
  }

  private getAuthenticatedClient(accessToken: string) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  async findExpiringSoon(hoursBeforeExpiry: number = 24) {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() + hoursBeforeExpiry);

    const { data, error } = await this.supabase
      .from("mail_subscriptions")
      .select("*")
      .lt("expires_at", thresholdDate);

    if (error) {
      console.error("Erreur récupération subscriptions:", error);
      throw error;
    }

    return data;
  }

  async saveSubscription(
    subscriptionId: string,
    emailId: number,
    expiresAt: Date
  ) {
    const { error } = await this.supabase.from("mail_subscriptions").upsert({
      id: subscriptionId,
      outlook_credentials_id: emailId,
      expires_at: expiresAt.toISOString(),
    });
    if (error) {
      console.error("Erreur sauvegarde subscription:", error);
      throw error;
    }
  }

  async getEmailCredentials(emailId: number) {
    const { data, error } = await this.supabase
      .from("outlook_credentials")
      .select("*")
      .eq("id", emailId)
      .single();

    if (error) {
      console.error("Erreur récupération credentials email:", error);
      throw error;
    }

    return data;
  }

  async findSubscriptionById(subscriptionId: string, emailId: number) {
    const { data, error } = await this.supabase
      .from("mail_subscriptions")
      .select("*, outlook_credentials(*)")
      .eq("id", subscriptionId)
      .eq("outlook_credentials_id", emailId)
      .single();

    if (error) return null;
    return data;
  }
}
