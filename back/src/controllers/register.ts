import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "../lib/supabase-auth-guard";
import { RegisterService } from "../services/register";

@UseGuards(SupabaseAuthGuard)
@Controller("auth")
export class RegisterController {
  constructor(private readonly register: RegisterService) {}

  @Post("register")
  async registerMe(@Req() req: FastifyRequest) {
    const u = req.user;
    const email = u.email || "";
    const res = await this.register.registerUser(u.id, email);
    return { ok: true, user: res };
  }

  @Get("me")
  async me(@Req() req: FastifyRequest) {
    const u = req.user;
    const me = await this.register.getMe(u.id);
    return { ok: true, user: me };
  }
}
