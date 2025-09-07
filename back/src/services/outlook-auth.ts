import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { Supa } from "../lib/supabase";

type TokenResponse = {
  token_type: string;
  scope?: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  refresh_token?: string;
  id_token?: string;
};

@Injectable()
export class OutlookAuthService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @Inject("SUPABASE") private supabase: Supa
  ) {}

  buildAuthUrl(state: string): string {
    const tenant = this.config.get<string>("MS_AUTH_TENANT", "common");
    const clientId = this.config.get<string>("MS_CLIENT_ID");
    const redirectUri = this.config.get<string>("MS_REDIRECT_URI");
    const scopes = this.config.get<string>("MS_SCOPES");
    const base = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
      client_id: clientId || "",
      response_type: "code",
      redirect_uri: redirectUri || "",
      response_mode: "query",
      scope: scopes,
      state,
      prompt: "select_account",
    });
    return `${base}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const tenant = this.config.get<string>("MS_AUTH_TENANT", "common");
    const clientId = this.config.get<string>("MS_CLIENT_ID");
    const clientSecret = this.config.get<string>("MS_CLIENT_SECRET");
    const redirectUri = this.config.get<string>("MS_REDIRECT_URI");
    const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: clientId || "",
      client_secret: clientSecret || "",
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri || "",
    });

    const { data } = await firstValueFrom(
      this.http.post<TokenResponse>(tokenUrl, body.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
    );
    return data;
  }

  static decodeJwtWithoutVerify(jwt?: string): any | null {
    if (!jwt) return null;
    const parts = jwt.split(".");
    if (parts.length < 2) return null;
    try {
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = Buffer.from(payload, "base64").toString("utf8");
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  async addCredentialsToUser(
    userId: string,
    account_id: string,
    access_token: string,
    refresh_token: string,
    token_type: string,
    expires_in: number,
    email: string
  ): Promise<void> {
    let now = new Date();
    now.setSeconds(now.getSeconds() + expires_in);
    const { error: userErr } = await this.supabase
      .from("outlook_credentials")
      .insert({
        user_auth_user_id: userId,
        account_id,
        access_token,
        token_type,
        refresh_token,
        expires_at: now.toISOString(),
        email,
      });
    if (userErr) throw userErr;
  }
}
