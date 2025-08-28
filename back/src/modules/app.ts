import { Module } from "@nestjs/common";
import {
  ConfigModule,
  // , ConfigService
} from "@nestjs/config";
import { HealthModule } from "./health";
// import { TypeOrmModule } from "@nestjs/typeorm";

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
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     type: "postgres",
    //     host: configService.get<string>("DB_HOST"),
    //     port: configService.get<number>("DB_PORT"),
    //     username: configService.get<string>("DB_USERNAME"),
    //     password: configService.get<string>("DB_PASSWORD"),
    //     database: configService.get<string>("DB_NAME"),
    //     autoLoadEntities: true,
    //     synchronize: configService.get<string>("DB_SYNCHRONIZE") === "true", // !! carefull, set to false in prod!
    //     dropSchema: configService.get<string>("NODE_ENV") === "test",
    //     entities: [
    //       process.env.NODE_ENV === "production"
    //         ? "/dist/schema/*.js"
    //         : process.cwd() + "/src/schema/*.ts",
    //     ],
    //     migrations: [
    //       process.env.NODE_ENV === "production"
    //         ? process.cwd() + "/dist/migration/*.js"
    //         : process.cwd() + "/src/migration/*.ts",
    //     ],
    //     logging: ["schema"],
    //   }),
    // }),
    HealthModule,
  ],
})
export class AppModule {}
