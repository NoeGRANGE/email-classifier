import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { LLMService } from "src/services/llm";
import { OutlookAuthService } from "src/services/outlook-auth";
import { EmailSubscriptionService } from "src/services/subscription";
import { WebhookEmailService } from "src/services/webhook-email";

@Controller("webhook/email")
export class WebhookEmailController {
  constructor(
    private readonly outlookService: OutlookAuthService,
    private readonly webhookEmailService: WebhookEmailService,
    private readonly emailSubscriptionService: EmailSubscriptionService,
    private readonly llmService: LLMService
  ) {}

  @Post("test")
  async test(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const { prompt } = req.body as { prompt: string };
    const result = await this.llmService.callLLM(prompt);
    return res.status(HttpStatus.OK).send(result);
  }

  @Post()
  async handleWebhook(
    @Query("validationToken") validationToken: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    if (validationToken) {
      return res.status(HttpStatus.OK).send(validationToken);
    }
    console.log("Webhook reçu:", req.body);

    const { value: notifications } = req.body as {
      value: OutlookNotification[];
    };

    for (const notification of notifications) {
      console.log("Notification reçu:", notification);
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
        console.log("pas subscription trouvée ou pas activée, skip");
        continue;
      }
      console.log("subscription trouvée, processing...");

      this.processNotification(notification).catch((err) =>
        console.error("Erreur traitement notification:", err)
      );
    }

    return res.status(HttpStatus.ACCEPTED).send();
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
