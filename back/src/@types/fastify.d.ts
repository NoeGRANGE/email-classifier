import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id?: number;
      isPremium?: boolean;
      premiumUntil?: Date;
    };
  }
}
