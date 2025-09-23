import {
  Body,
  Controller,
  Get,
  Post,
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
  @Get()
  async get(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const user = await this.registerService.getMe(req.user.id);
    if (!user) {
      res.status(403).send({ error: "User not found" });
      return;
    }
    if (user.org_id === null) {
      res.status(403).send({ error: "User not registered in an organisation" });
      return;
    }

    const organisation = await this.organisationService.getOrganisationForUser(
      user.auth_user_id
    );
    if (!organisation) {
      res.status(403).send({ error: "Organisation not found" });
      return;
    }
    const members = await this.organisationService.getMembersForOrg(
      organisation.id
    );

    res.status(200).send({
      ok: true,
      organisation: {
        name: organisation.name,
        seatsPurchased: organisation.seats_purchased,
        seatsUsed: organisation.seats_used,
        members: members.map((m) => ({
          id: m.id,
          email: m.email,
          role: m.role,
          status: m.status,
          authorizedEmails: m.authorized_emails,
          createdAt: m.created_at,
          acceptedAt: m.accepted_at,
        })),
      },
    });
  }
  @UseGuards(SupabaseAuthGuard)
  @Post("/join")
  async join(
    @Body("token") token: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    if (!token) {
      res.status(400).send({ error: "Missing token" });
      return;
    }

    const user = await this.registerService.getMe(req.user.id);
    if (!user) {
      res.status(403).send({ error: "User not found" });
      return;
    }
    if (user.org_id !== null) {
      res
        .status(403)
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
    @Body("name") name: string
  ) {
    const user = await this.registerService.getMe(req.user.id);
    if (!user.org_id === null) {
      res
        .status(403)
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
    @Body("email") email: string,
    @Body("role") role: OrganisationRole,
    @Body("reservedSeats") reservedSeats: number
  ) {
    const member = await this.organisationService.getMember(req.user.id);
    if (
      role === "owner" ||
      !member ||
      (member.role !== "owner" && member.role !== "admin")
    ) {
      res
        .status(403)
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
