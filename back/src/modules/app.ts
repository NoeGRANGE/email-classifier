import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health";
import { OutlookAuthModule } from "./outlook-auth";
import { SupabaseModule } from "./supabase";
import { RegisterModule } from "./register";
import { OrganisationModule } from "./organisation";
import { BillingModule } from "./billing";
import { EmailModule } from "./email";
import { ConfigsModule } from "./config";

@Module({
  providers: [],
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === "development"
          ? ".env.development"
          : process.env.NODE_ENV === "test"
            ? ".env.test"
            : ".env",
      isGlobal: true,
    }),
    SupabaseModule,
    HealthModule,
    RegisterModule,
    OutlookAuthModule,
    OrganisationModule,
    BillingModule,
    EmailModule,
    ConfigsModule,
  ],
})
export class AppModule {}
