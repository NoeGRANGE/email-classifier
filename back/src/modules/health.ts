import { Module } from "@nestjs/common";
import { HealthController } from "../controllers/health";

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
