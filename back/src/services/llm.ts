import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosRequestConfig } from "axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LLMService {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly defaultModel: string;
  private readonly reqTimeout: number;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService
  ) {
    this.baseUrl = this.cfg.get<string>(
      "LLM_BASE_URL",
      "http://127.0.0.1:11434"
    );
    const user = this.cfg.get<string>("LLM_BASIC_USER", "");
    const pass = this.cfg.get<string>("LLM_BASIC_PASS", "");
    this.authHeader =
      "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
    this.defaultModel = "mistral:instruct";
    // this.defaultModel = "gemma3:270m";
    this.reqTimeout = Number(
      this.cfg.get<string>("LLM_REQUEST_TIMEOUT", "60000")
    );
  }

  private axiosCfg(extra?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        ...extra?.headers,
      },
      timeout: this.reqTimeout,
      responseType: extra?.responseType ?? "json",
      // important pour le streaming NDJSON
      decompress: true,
      ...extra,
    };
  }

  async callLLM(
    prompt: string
  ): Promise<{ categoryId: number; confidence: number }> {
    const payload = {
      model: this.defaultModel,
      format: "json",
      stream: false,
      options: { temperature: 0.1, top_p: 0.9, seed: 42, num_ctx: 4096 },
      prompt,
    };

    const { data } = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/llm/api/generate`,
        payload,
        this.axiosCfg()
      )
    );

    try {
      const obj =
        typeof data.response === "string"
          ? JSON.parse(data.response.replace("```json", "").replace("```", ""))
          : data.response;
      if (!obj || typeof obj !== "object") {
        // TODO: add more validation
        throw new Error("Invalid JSON shape");
      }
      return obj;
    } catch (err) {
      throw new HttpException(
        { error: "Invalid JSON from model", raw: data },
        502
      );
    }
  }

  buildPrompt(
    subject: string,
    body: string,
    hasAttachments: boolean,
    _categories: { name: string; description: string }[]
  ): string {
    const categoriesList = _categories
      .map((c, i) => `ID ${i}: ${c.description}`)
      .join("\n");

    let prompt = `Classifie cet email dans une catégorie.

CATÉGORIES:
${categoriesList}
ID -1: Aucune des catégories ci-dessus ne correspond

EMAIL:
Sujet: ${subject}
Corps: ${body}
Pièces jointes: ${hasAttachments ? "oui" : "non"}

EXEMPLES DE RÉPONSE:
{"categoryId": 0, "confidence": 85}
{"categoryId": 2, "confidence": 70}
{"categoryId": -1, "confidence": 95}

IMPORTANT:
- categoryId doit être un NOMBRE (0, 1, 2, ... ou -1)
- confidence est un nombre entre 0 et 100
- Réponds UNIQUEMENT avec le JSON, aucun autre texte

Ta réponse JSON:`;

    return prompt;
  }

  async classifyEmail(
    subject: string,
    body: string,
    hasAttachments: boolean,
    categories: {
      id: number;
      name: string;
      description: string;
      actions: {
        id: number;
        type: string;
        props: Json;
      }[];
    }[]
  ) {
    if (categories.length === 0) {
      return null;
    }
    try {
      const prompt = this.buildPrompt(
        subject,
        body,
        hasAttachments,
        categories
      );
      const response = await this.callLLM(prompt);
      if (
        response?.categoryId &&
        response.categoryId >= 0 &&
        response.categoryId < categories.length &&
        (!response.confidence || response.confidence > 60)
      ) {
        const category = categories[response.categoryId];
        return category;
      }
      return null;
    } catch (err) {
      console.error("LLM classification error:", err);
      // TODO: notify in DB that LLM failed
      return null;
    }
  }
}
