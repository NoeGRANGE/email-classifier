import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "src/lib/supabase-auth-guard";
import { EmailService } from "src/services/email";

@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get("list")
  async listEmails(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const emails = await this.emailService.listUserEmails(req.user.id);

    res.status(200).send({ ok: true, emails });
  }
}
