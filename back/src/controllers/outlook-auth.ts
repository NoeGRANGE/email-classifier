import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { OutlookAuthService } from "../services/outlook-auth";
import { SupabaseAuthGuard } from "src/lib/supabase-auth-guard";
import { RegisterService } from "src/services/register";

@Controller("auth/outlook")
export class OutlookAuthController {
  constructor(
    private readonly outlookService: OutlookAuthService,
    private readonly registerService: RegisterService
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async start(@Res() res: FastifyReply, @Req() req: FastifyRequest) {
    const userId = req?.user?.id.toString() || "";
    const flow = (req.query as any)?.flow === "redirect" ? "redirect" : "popup";
    const state = `${userId}|${flow}`;
    // TODO: replace the userId with something more secure (temporary value)
    const url = this.outlookService.buildAuthUrl(state);
    res.status(302).redirect(url);
  }

  @Get("callback")
  async callback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: FastifyReply
  ) {
    if (!code) {
      res.status(400).send({ error: "Missing code" });
      return;
    }

    const token = await this.outlookService.exchangeCodeForToken(code);

    const idPayload = OutlookAuthService.decodeJwtWithoutVerify(token.id_token);
    const accountId: string | undefined = idPayload?.oid || idPayload?.sub;
    const email: string | undefined =
      idPayload?.email ||
      idPayload?.user_metadata?.email ||
      idPayload?.preferred_username;

    if (!accountId) {
      res.status(500).send({ error: "Unable to identify Microsoft account" });
      return;
    }

    const [userId, flow = "popup"] = (state || "").split("|");
    const user = await this.registerService.getMe(userId);
    if (!user) {
      res.status(404).send({ error: "User not found" });
      return;
    }

    await this.outlookService.addCredentialsToUser(
      user.auth_user_id,
      accountId,
      token.access_token,
      token.refresh_token,
      token.token_type,
      token.expires_in,
      email
    );

    // TODO: faire au moment du register ou autre
    // rajouter une route qui quand récupère le token en query param l'attache en local storage jusqu'à ce que
    // await this.outlookService.setInviteToAccepted(
    //   user.auth_user_id,
    //   user.email
    // );
    const FRONT_URL =
      process.env.FRONTEND_URL ?? "http://localhost:3000/en/emails";
    const doneUrl = `${FRONT_URL}/en/emails/inbox?connected=outlook`;
    if (flow === "redirect") {
      // 🔵 Cas redirection plein écran → on NE ferme PAS la page
      return res.status(302).redirect(doneUrl);
    }
    const origin = new URL(FRONT_URL).origin;

    const html = `
<!doctype html><meta charset="utf-8"><title>Connexion Outlook</title>
<script>
(function () {
  try {
    if (window.opener) {
      try { window.opener.postMessage("Login successful", "${origin}"); } catch (e) {}
      try { window.opener.location = "${doneUrl}"; } catch (e) {}
    }
  } catch (e) {}
  try { window.close(); } catch (e) {}
  setTimeout(function () {
    // Fallback si close bloqué
    location.replace("${doneUrl}");
  }, 500);
})();
</script>`.trim();

    return res
      .header("content-type", "text/html; charset=utf-8")
      .status(200)
      .send(html);
  }
}
