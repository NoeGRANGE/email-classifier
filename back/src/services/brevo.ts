import { Injectable } from "@nestjs/common";

@Injectable()
export class BrevoService {
  private readonly apiKey = process.env.BREVO_API_KEY || "";
  private readonly url = "https://api.brevo.com/v3/smtp/email";
  constructor() {}

  async sendMail(
    subject: string,
    toEmail: string,
    textContent: string,
    htmlContent?: string
  ) {
    const payload = {
      sender: {
        name: "SecMe",
        email: "no-reply@secme.site",
      },
      to: [
        {
          email: toEmail,
          name: "user",
        },
      ],
      subject: subject,
      htmlContent,
      textContent,
    };
    await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  async notifyMeOfProblem(organisationName: string, organisationId: number) {
    await this.sendMail(
      "[LinBolt] Non-respect of limit",
      "ngrange.dev@gmail.com",
      `Organisation ${organisationName} (${organisationId}) has exceeded its email processing limit. Please check the dashboard for more details.`
    );
  }
}
