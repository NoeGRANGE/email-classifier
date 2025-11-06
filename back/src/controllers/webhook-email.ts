import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { FastifyReply, FastifyRequest } from "fastify";
import { OutlookAuthService } from "src/services/outlook-auth";
import { EmailSubscriptionService } from "src/services/subscription";
import { WebhookEmailService } from "src/services/webhook-email";
import { asyncMap } from "src/utils/array";

@Controller("webhook/email")
export class WebhookEmailController {
  constructor(
    private readonly outlookService: OutlookAuthService,
    private readonly webhookEmailService: WebhookEmailService,
    private readonly emailSubscriptionService: EmailSubscriptionService
  ) {}

  @Post()
  async handleWebhook(
    @Query("validationToken") validationToken: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    if (validationToken) {
      return res.status(HttpStatus.OK).send(validationToken);
    }
    const { value: notifications } = req.body as {
      value: OutlookNotification[];
    };

    for (const notification of notifications) {
      const emailId = notification.clientState;
      const subscription = await this.webhookEmailService.findSubscriptionById(
        notification.subscriptionId,
        Number(emailId)
      );

      if (
        !subscription ||
        subscription === null ||
        !subscription?.outlook_credentials?.activated
      ) {
        continue;
      }

      this.processNotification(notification).catch((err) =>
        console.error("Erreur traitement notification:", err)
      );
    }

    return res.status(HttpStatus.ACCEPTED).send();
  }

  @Cron("0 */12 * * *")
  async checkExpiringSubscriptions() {
    const expiringSubscriptions =
      await this.webhookEmailService.findExpiringSoon(24);
    await asyncMap(expiringSubscriptions, 10, async (sub) => {
      const email = await this.webhookEmailService.getEmailCredentials(
        sub.outlook_credentials_id
      );
      if (!email.activated) return;
      const accessToken = await this.outlookService.getValidAccessToken({
        id: email.id,
        user_auth_user_id: email.user_auth_user_id,
        accessToken: email.access_token,
        email: email.email,
        accountId: email.account_id,
        refreshToken: email.refresh_token,
        expiresAt: email.expires_at,
        tokenType: email.token_type,
      });
      await this.emailSubscriptionService.updateSubscription(
        sub.id,
        accessToken,
        sub.outlook_credentials_id
      );
    });
  }

  private async processNotification(notification: OutlookNotification) {
    const emailId = notification.clientState as string;
    const messageId = notification.resourceData.id;
    const email = await this.webhookEmailService.getEmailCredentials(
      Number(emailId)
    );
    const accessToken = await this.outlookService.getValidAccessToken({
      id: email.id,
      user_auth_user_id: email.user_auth_user_id,
      accessToken: email.access_token,
      email: email.email,
      accountId: email.account_id,
      refreshToken: email.refresh_token,
      expiresAt: email.expires_at,
      tokenType: email.token_type,
    });

    const client =
      this.emailSubscriptionService.getAuthenticatedClient(accessToken);
    const message = (await client
      .api(`/me/messages/${messageId}`)
      .get()) as OutlookMessage;
    await this.webhookEmailService.processMail(
      message,
      email.configuration_id,
      accessToken
    );
  }
}
