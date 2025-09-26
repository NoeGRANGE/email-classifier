import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { EmailService } from "src/services/email";
import { EmailController } from "src/controllers/emails";

@Module({
  imports: [SupabaseModule],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
