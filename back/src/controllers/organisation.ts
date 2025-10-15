import {
  Body,
  Controller,
  Delete,
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
  @Get("/me-role")
  async getMeRole(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const [member, activatedEmails] = await Promise.all([
      this.organisationService.getMemberFromUserId(req.user.id),
      this.organisationService.getActivatedEmailsForUser(req.user.id),
    ]);
    const activatedCount = activatedEmails.length;

    if (!member) {
      return res.status(200).send({
        ok: true,
        role: null,
        activatedEmails: 0,
        authorizedEmails: 0,
      });
    }
    return res.status(200).send({
      ok: true,
      role: member.role,
      activatedEmails: activatedCount,
      authorizedEmails: member.authorized_emails,
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
    const member = await this.organisationService.getMemberFromUserId(
      req.user.id
    );
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

    const organisation = await this.organisationService.getOrganisationById(
      member.org_id
    );
    if (!organisation) {
      res.status(403).send({ error: "Organisation not found" });
      return;
    }
    if (
      organisation.seats_used + reservedSeats >
      organisation.seats_purchased
    ) {
      res.status(403).send({ error: "Not enough seats available" });
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
    await this.organisationService.setSeatsUsed(
      member.org_id,
      organisation.seats_used + reservedSeats
    );
    // TODO: send email to the user with a link to join the org
    const APP_URL = process.env.APP_URL || "http://localhost:3000";
    res.status(200).send({
      ok: true,
      inviteLink: `${APP_URL}/organisation?inviteToken=${token}`,
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete("/remove-member")
  async removeMember(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("memberId") memberId: number
  ) {
    const member = await this.organisationService.getMemberFromUserId(
      req.user.id
    );
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      res
        .status(403)
        .send({ error: "Member doesn't have the right permission" });
      return;
    }

    const [memberToRemove, organisation] = await Promise.all([
      this.organisationService.getMemberFromId(memberId),
      this.organisationService.getOrganisationById(member.org_id),
    ]);
    if (!memberToRemove || !organisation || memberToRemove.role === "owner") {
      res.status(404).send({ error: "Member not found or is owner" });
      return;
    }
    await Promise.all([
      this.organisationService.setSeatsUsed(
        member.org_id,
        organisation.seats_used - memberToRemove.authorized_emails
      ),
      this.organisationService.removeMember(memberId),
      this.organisationService.removeOrganisationFromUser(
        memberToRemove.user_auth_user_id
      ),
      this.organisationService.deactivateUserEmails(
        memberToRemove.user_auth_user_id
      ),
    ]);
    res.status(200).send({ ok: true });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post("/update-member")
  async updateMember(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body("memberId") memberId: number,
    @Body("role") role: OrganisationRole,
    @Body("reservedSeats") reservedSeats: number
  ) {
    const member = await this.organisationService.getMemberFromUserId(
      req.user.id
    );
    if (
      reservedSeats < 1 ||
      !member ||
      (member.role !== "owner" && member.role !== "admin")
    ) {
      res
        .status(403)
        .send({ error: "Member doesn't have the right permission" });
      return;
    }

    const [memberToUpdate, organisation] = await Promise.all([
      this.organisationService.getMemberFromId(memberId),
      this.organisationService.getOrganisationById(member.org_id),
    ]);
    if (
      !memberToUpdate ||
      !organisation ||
      (memberToUpdate.role === "owner" && member.role !== "owner") ||
      (role === "owner" &&
        memberToUpdate.user_auth_user_id !== organisation.owner_user_id) ||
      (role !== "owner" &&
        memberToUpdate.user_auth_user_id === organisation.owner_user_id)
    ) {
      res
        .status(404)
        .send({ error: "Member doesn't have the right permission" });
      return;
    }
    const diffSeats = reservedSeats - memberToUpdate.authorized_emails;
    if (organisation.seats_used + diffSeats > organisation.seats_purchased) {
      res.status(403).send({ error: "Not enough seats available" });
      return;
    }
    await Promise.all([
      this.organisationService.updateMember(
        memberToUpdate.id,
        role,
        reservedSeats
      ),
      this.organisationService.setSeatsUsed(
        member.org_id,
        organisation.seats_used + diffSeats
      ),
    ]);
    // TODO: handle the emails for the user if he had obtain the limit and has less emails now (deactivate)
    res.status(200).send({ ok: true });
  }
}
