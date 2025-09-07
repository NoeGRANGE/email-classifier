import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { OutlookAuthController } from "../controllers/outlook-auth";
import { OutlookAuthService } from "../services/outlook-auth";
import { SupabaseModule } from "./supabase";
import { JwtService } from "@nestjs/jwt";
import { RegisterService } from "src/services/register";

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [OutlookAuthController],
  providers: [OutlookAuthService, JwtService, RegisterService],
})
export class OutlookAuthModule {}
