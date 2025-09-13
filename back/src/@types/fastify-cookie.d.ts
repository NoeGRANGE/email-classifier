// Ensure Fastify types are augmented with @fastify/cookie
// so reply.setCookie / clearCookie and request.cookies are available.
import "fastify";
import type { CookieSerializeOptions } from "@fastify/cookie";

declare module "fastify" {
  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: CookieSerializeOptions
    ): this;
    clearCookie(name: string, options?: CookieSerializeOptions): this;
  }

  interface FastifyRequest {
    cookies: Record<string, string>;
  }
}

export {};
