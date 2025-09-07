import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { RegisterController } from "../controllers/register";
import { RegisterService } from "../services/register";

@Module({
  imports: [SupabaseModule],
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}

