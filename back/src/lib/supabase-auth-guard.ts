import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { Inject } from "@nestjs/common";
import { Supa } from "./supabase";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(@Inject("SUPABASE") private readonly supabase: Supa) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw new UnauthorizedException();
    }

    const { user } = data;
    request["user"] = {
      id: user.id,
      email: user.email ?? undefined,
      token,
    } as any;
    // TODO: check if ID is still valid
    return true;
  }

  private extractTokenFromRequest(request: FastifyRequest): string | undefined {
    const authorization = request.headers["authorization"] as string | undefined;
    if (authorization) {
      const [type, token] = authorization.split(" ");
      if (type === "Bearer" && token) return token;
    }
    const cookies = (request as any).cookies || request["cookies"] || {};
    if (cookies["sb-access-token"]) return cookies["sb-access-token"];
    return undefined;
  }
}
