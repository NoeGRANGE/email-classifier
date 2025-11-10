import * as dotenv from "dotenv";

dotenv.config({
  path:
    process.env.NODE_ENV === "development"
      ? ".env.development"
      : process.env.NODE_ENV === "test"
        ? ".env.test"
        : ".env",
});

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import "ts-node/register/transpile-only";
import "tsconfig-paths/register";

async function start() {
  const fastifyAdapter = new FastifyAdapter({
    trustProxy: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { rawBody: true }
  );

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://linbolt.com",
    "https://www.linbolt.com",
    process.env.APP_URL,
  ].filter(Boolean) as string[];

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "apikey",
      "X-Client-Info",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  });

  await app.register(cookie, {
    hook: "onRequest",
  });

  const PORT = Number(process.env.PORT || 3000);
  console.log(`🚀 Server is running on http://127.0.0.1:${PORT}`);
  await app.listen({ port: PORT, host: "127.0.0.1" });
}

const env = process.env.NODE_ENV;

if (!env) {
  console.warn('⚠️  NODE_ENV is not set. Defaulting to "production"...');
} else if (env === "development") {
  console.log("🛠️  Starting in development mode...");
} else if (env === "test") {
  console.warn('🧪 NODE_ENV is set to "test" — are you sure?');
} else if (env === "production") {
  console.log("🚀 Starting in production mode...");
} else {
  console.warn(`⚠️ Unknown NODE_ENV value: "${env}"`);
}

start();
