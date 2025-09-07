import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "src/lib/supabase-auth-guard";
import { OrganisationService } from "src/services/organisation";
import { RegisterService } from "src/services/register";

@Controller("organisation")
export class OrganisationController {
  constructor(
    private readonly organisationService: OrganisationService,
    private readonly registerService: RegisterService
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Post("/join")
  async join(
    @Query("token") token: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    if (!token) {
      res.status(400).send({ error: "Missing token" });
      return;
    }

    const user = await this.registerService.getMe(req.user.id);
    if (!user) {
      res.status(404).send({ error: "User not found" });
      return;
    }
    if (user.org_id !== null) {
      res
        .status(404)
        .send({ error: "User already registered in an organisation" });
      return;
    }

    const orgId = await this.organisationService.setInviteToAccepted(
      user.auth_user_id,
      token
    );
    await this.organisationService.setOrganisationToUser(
      user.auth_user_id,
      orgId
    );

    res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post("/create")
  async create(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body() name: string
  ) {
    const user = await this.registerService.getMe(req.user.id);
    if (!user.org_id === null) {
      res
        .status(404)
        .send({ error: "User already registered in an organisation" });
      return;
    }

    const orgId = await this.organisationService.createOrganisation(
      name,
      user.auth_user_id
    );
    await Promise.all([
      this.organisationService.setOrganisationToUser(user.auth_user_id, orgId),
      this.organisationService.createOwnerMember(
        user.auth_user_id,
        orgId,
        user.email
      ),
    ]);

    res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post("/invite")
  async invite(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body() email: string,
    @Body() role: OrganisationRole,
    @Body() reservedSeats: number
  ) {
    const member = await this.organisationService.getMember(req.user.id);
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      res
        .status(404)
        .send({ error: "Member doesn't have the right permission" });
      return;
    }

    const token = await this.organisationService.generateToken();

    await this.organisationService.createInvite(
      member.org_id,
      email,
      token,
      role,
      reservedSeats
    );
    // TODO: send email to the user with a link to join the org

    res.status(200).send({ ok: true });
  }
}
