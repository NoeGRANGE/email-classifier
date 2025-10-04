import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "src/services/config";
import { FastifyReply, FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "src/lib/supabase-auth-guard";

@Controller("config")
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post("create")
  async createConfig(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("name") name: string,
    @Body("emailId") emailId?: number
  ) {
    const config = await this.configService.createConfig(req.user.id, name);
    if (emailId) {
      await this.configService.updateEmailConfig(
        config.id,
        emailId,
        req.user.id
      );
    }
    return res.status(200).send({ ok: true, configId: config.id });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post("link")
  async linkConfigToEmail(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("configId") configId: number,
    @Body("emailId") emailId: number
  ) {
    const config = await this.configService.getConfig(configId, req.user.id);
    if (!config) {
      return res
        .status(404)
        .send({ ok: false, error: "Config not found for user" });
    }
    await this.configService.updateEmailConfig(configId, emailId, req.user.id);
    return res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete("remove")
  async removeConfig(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("id") id: number
  ) {
    await this.configService.removeConfig(req.user.id, id);
    return res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post("category/create")
  async createCategory(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("name") name: string,
    @Body("description") description: string,
    @Body("configId") configId: number,
    @Body("actions") actions: ApiCategoryAction[]
  ) {
    const config = await this.configService.getConfigFromCategory(configId);
    if (!config || config.user_auth_user_id !== req.user.id) {
      return res
        .status(404)
        .send({ ok: false, error: "Category not found for user" });
    }
    const category = await this.configService.createCategory(
      name,
      description,
      configId
    );
    await Promise.all(
      actions.map(async (action) => {
        return await this.configService.createAction(
          category.id,
          action.type,
          action.props
        );
      })
    );
    return res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post("category/update")
  async updateCategory(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("id") id: number,
    @Body("name") name: string,
    @Body("description") description: string,
    @Body("configId") configId: number,
    @Body("actions") actions: ApiCategoryAction[]
  ) {
    const config = await this.configService.getConfigFromCategory(configId);
    if (!config || config.user_auth_user_id !== req.user.id) {
      return res
        .status(404)
        .send({ ok: false, error: "Category not found for user" });
    }
    const category = await this.configService.updateCategory(
      id,
      name,
      description
    );
    await this.configService.removeActionsFromCategory(category.id);
    await Promise.all(
      actions.map(async (action) => {
        return await this.configService.createAction(
          category.id,
          action.type,
          action.props
        );
      })
    );
    return res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete("category/remove")
  async removeCategory(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("id") id: number
  ) {
    const config = await this.configService.getConfigFromCategory(id);
    if (!config || config.user_auth_user_id !== req.user.id) {
      return res
        .status(404)
        .send({ ok: false, error: "Category not found for user" });
    }
    await this.configService.removeCategory(id);
    return res.status(200).send({ ok: true });
  }
}
