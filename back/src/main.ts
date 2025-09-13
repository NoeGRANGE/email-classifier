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
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { rawBody: true }
  );

  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(cookie);
  await app.listen(process.env.PORT || 8800, "0.0.0.0");
}

const env = process.env.NODE_ENV;

if (!env) {
  console.warn('⚠️  NODE_ENV is not set. Defaulting to "production"...');
} else if (env === "development") {
  console.log("🛠️  Starting in development mode...");
} else if (env === "test") {
  console.warn(
    '🧪 NODE_ENV is set to "test" — are you sure you want to run the app like this?'
  );
} else if (env === "production") {
  console.log("🚀 Starting in production mode...");
} else {
  console.warn(`⚠️ Unknown NODE_ENV value: "${env}"`);
}

start();
