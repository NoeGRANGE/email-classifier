import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { JwtService } from "@nestjs/jwt";
import { RegisterService } from "src/services/register";
import { OrganisationController } from "src/controllers/organisation";
import { OrganisationService } from "src/services/organisation";

@Module({
  imports: [SupabaseModule],
  controllers: [OrganisationController],
  providers: [OrganisationService, JwtService, RegisterService],
})
export class OrganisationModule {}
