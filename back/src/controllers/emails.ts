import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "src/lib/supabase-auth-guard";
import { EmailService } from "src/services/email";
import { OutlookAuthService } from "src/services/outlook-auth";

@Controller("email")
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly outlookService: OutlookAuthService
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Get("list")
  async listEmails(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const [emails, limit] = await Promise.all([
      this.emailService.listUserEmails(req.user.id),
      this.outlookService.getMailboxesLimit(req.user.id),
    ]);

    const usedEmails = emails.filter((e) => e.activated).length;

    res.status(200).send({
      ok: true,
      emails,
      hasMaxMailboxes: usedEmails >= limit.maximum,
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete("remove/:id")
  async removeEmail(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param("id") emailId: number
  ) {
    await this.emailService.removeUserEmail(req.user.id, emailId);
    res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post("activate/:id")
  async activateOrDeactivateEmail(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param("id") emailId: number
  ) {
    const email = await this.emailService.getUserEmail(req.user.id, emailId);
    if (!email) {
      return res.status(404).send({ ok: false, error: "Email not found" });
    }
    if (!email.activated) {
      const limit = await this.outlookService.getMailboxesLimit(req.user.id);
      if (limit.used >= limit.maximum) {
        return res
          .status(403)
          .send({ ok: false, error: "Activated mailbox limit reached" });
      }
    }
    await this.emailService.activateOrDeactivateUserEmail(
      req.user.id,
      emailId,
      !email.activated
    );
    res.status(200).send({ ok: true });
  }
}
