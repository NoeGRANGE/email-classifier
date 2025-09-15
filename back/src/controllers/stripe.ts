import { Controller, Headers, Post, Req, Res } from "@nestjs/common";
import Stripe from "stripe";
import { StripeWebhookService } from "../services/stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

@Controller("webhooks/stripe")
export class StripeWebhookController {
  constructor(private readonly svc: StripeWebhookService) {}

  @Post()
  async handle(
    @Req() req: any,
    @Res() res: any,
    @Headers("stripe-signature") sig: string
  ) {
    try {
      const payload =
        typeof req.rawBody === "string"
          ? Buffer.from(req.rawBody)
          : req.rawBody;
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      await this.svc.handleEvent(event);
      return res.status(200).send("ok");
    } catch (e) {
      return res.status(400).send(`Webhook Error: ${(e as Error).message}`);
    }
  }
}
