import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "src/services/config";
import { FastifyReply, FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "src/lib/supabase-auth-guard";
import { OutlookAuthService } from "src/services/outlook-auth";

@Controller("config")
export class ConfigController {
  constructor(
    private readonly configService: ConfigService,
    private readonly outlookService: OutlookAuthService
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Get("list")
  async listConfigs(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const configs = await this.configService.listConfigs(req.user.id);
    return res.status(200).send({
      ok: true,
      configurations: configs.map((config) => ({
        id: config.id,
        name: config.name,
      })),
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(":id")
  async getConfig(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param("id") id: number
  ) {
    const config = await this.configService.getConfig(id, req.user.id);
    if (!config) {
      return res.status(404).send({ ok: false, error: "Config not found" });
    }
    const categories = await this.configService.getCategoriesFromConfig(id);
    return res.status(200).send({
      ok: true,
      configuration: { id: config.id, name: config.name, categories },
    });
  }

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
    console.log("ok1s", configId);
    const config = await this.configService.getConfig(configId, req.user.id);
    console.log("ok2s");
    if (!config) {
      return res
        .status(404)
        .send({ ok: false, error: "Category not found for user" });
    }
    console.log("ok3s");
    const category = await this.configService.createCategory(
      name,
      description,
      configId
    );
    console.log("ok4s");
    await Promise.all(
      actions.map(async (action) => {
        return await this.configService.createAction(
          category.id,
          action.type,
          action.props
        );
      })
    );
    console.log("ok5s");
    return res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get("category/:id")
  async getCategory(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param("id") id: number
  ) {
    const category = await this.configService.getCategory(id);
    if (
      !category ||
      category.configurations.user_auth_user_id !== req.user.id
    ) {
      return res.status(404).send({ ok: false, error: "Category not found" });
    }
    return res.status(200).send({
      ok: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        actions: category.actions || [],
      },
    });
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
    const config = await this.configService.getConfigFromCategory(id);
    if (
      !config ||
      config.user_auth_user_id !== req.user.id ||
      config.id !== configId
    ) {
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

  @UseGuards(SupabaseAuthGuard)
  @Get("tags/:id")
  async getEmailTags(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param("id") configId: number
  ) {
    const email = await this.configService.getEmailWithConfiguration(configId);
    if (!email || email.user_auth_user_id !== req.user.id) {
      return res
        .status(404)
        .send({ ok: false, error: "Configuration not found" });
    }
    const accessToken = await this.outlookService.getValidAccessToken(email);
    const tags = await this.configService.getEmailTags(accessToken);
    return res.status(200).send({ ok: true, tags });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get("folders/:id")
  async getEmailFolders(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param("id") configId: number
  ) {
    const email = await this.configService.getEmailWithConfiguration(configId);
    if (!email || email.user_auth_user_id !== req.user.id) {
      return res
        .status(404)
        .send({ ok: false, error: "Configuration not found" });
    }
    const accessToken = await this.outlookService.getValidAccessToken(email);
    const folders = await this.configService.getEmailFolders(accessToken);
    return res.status(200).send({ ok: true, folders });
  }
}
