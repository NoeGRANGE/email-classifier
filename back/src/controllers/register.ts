/// <reference path="../@types/fastify-cookie.d.ts" />
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "../lib/supabase-auth-guard";
import { RegisterService } from "../services/register";
import { Inject } from "@nestjs/common";
import { Supa } from "../lib/supabase";

@Controller("auth")
export class RegisterController {
  constructor(
    private readonly register: RegisterService,
    @Inject("SUPABASE") private readonly supabase: Supa
  ) {}

  @Post("register")
  async registerMe(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body()
    body: {
      accessToken?: string;
      refreshToken?: string;
    }
  ) {
    const accessToken =
      body?.accessToken ||
      (req.headers["authorization"] as string | undefined)?.split(" ")[1];
    const refreshToken = body?.refreshToken;
    if (!accessToken) {
      return reply
        .status(400)
        .send({ ok: false, error: "Missing accessToken" });
    }
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      return reply
        .status(401)
        .send({ ok: false, error: "Invalid accessToken" });
    }

    const user = data.user;
    const res = await this.register.registerUser(user.id, user.email || "");
    const isProd = (process.env.NODE_ENV || "production") === "production";
    const cookieOpts = {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "lax" : "lax",
    } as const;

    reply.setCookie("sb-access-token", accessToken, {
      ...cookieOpts,
      maxAge: 60 * 60,
    });
    if (refreshToken) {
      reply.setCookie("sb-refresh-token", refreshToken, {
        ...cookieOpts,
        maxAge: 60 * 24 * 60 * 60,
      });
    }
    return reply.send({ ok: true, user: res });
  }

  @Post("login")
  async loginMe(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body()
    body: {
      accessToken?: string;
      refreshToken?: string;
    }
  ) {
    const accessToken =
      body?.accessToken ||
      (req.headers["authorization"] as string | undefined)?.split(" ")[1];
    const refreshToken = body?.refreshToken;

    if (!accessToken) {
      return reply
        .status(400)
        .send({ ok: false, error: "Missing accessToken" });
    }

    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      return reply
        .status(401)
        .send({ ok: false, error: "Invalid accessToken" });
    }

    const isProd = (process.env.NODE_ENV || "production") === "production";
    const cookieOpts = {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "lax" : "lax",
    } as const;

    reply.setCookie("sb-access-token", accessToken, {
      ...cookieOpts,
      maxAge: 60 * 60,
    });
    if (refreshToken) {
      reply.setCookie("sb-refresh-token", refreshToken, {
        ...cookieOpts,
        maxAge: 60 * 24 * 60 * 60,
      });
    }

    return reply.send({ ok: true });
  }

  @Post("refresh")
  async refresh(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const cookies = req.cookies || {};
    const body = (req as any).body || {};
    const refreshToken = cookies["sb-refresh-token"] || body?.refreshToken;
    if (!refreshToken) {
      return reply
        .status(400)
        .send({ ok: false, error: "Missing refreshToken" });
    }

    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error || !data?.session) {
      const isProd = (process.env.NODE_ENV || "production") === "production";
      const cookieOpts = {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "lax" : "lax",
      } as const;
      reply.clearCookie("sb-access-token", cookieOpts);
      reply.clearCookie("sb-refresh-token", cookieOpts);
      return reply
        .status(401)
        .send({ ok: false, error: "Invalid refreshToken" });
    }

    const { session, user } = data;
    const isProd = (process.env.NODE_ENV || "production") === "production";
    const cookieOpts = {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "lax" : "lax",
    } as const;

    reply.setCookie("sb-access-token", session.access_token, {
      ...cookieOpts,
      maxAge: 60 * 60, // 1 hour
    });
    if (session.refresh_token) {
      reply.setCookie("sb-refresh-token", session.refresh_token, {
        ...cookieOpts,
        maxAge: 60 * 24 * 60 * 60, // 60 days
      });
    }

    return reply.send({ ok: true, user: { id: user.id, email: user.email } });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get("me")
  async me(@Req() req: FastifyRequest) {
    const u = req.user;
    const me = await this.register.getMe(u.id);
    return { ok: true, user: me };
  }
}
