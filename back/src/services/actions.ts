import { Injectable } from "@nestjs/common";
import { asyncMap } from "src/utils/array";

@Injectable()
export class ActionsService {
  private readonly graphBaseUrl = "https://graph.microsoft.com/v1.0";

  constructor() {}

  private buildGraphUrl(path: string) {
    return `${this.graphBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  private async graphFetch(
    path: string,
    accessToken: string,
    init: RequestInit = {}
  ) {
    if (!accessToken) {
      throw new Error("Missing access token for Outlook Graph");
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    if (init.headers) {
      const entries =
        init.headers instanceof Headers
          ? Array.from(init.headers.entries())
          : Array.isArray(init.headers)
            ? init.headers
            : Object.entries(init.headers as Record<string, string>);
      for (const [key, value] of entries) {
        headers[key] = value;
      }
    }

    const response = await fetch(this.buildGraphUrl(path), {
      ...init,
      headers,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Graph request failed (${response.status}): ${text || response.statusText}`
      );
    }

    return response;
  }

  async assignCategories(
    props: ActionPropsTag,
    messageId: string,
    accessToken: string
  ) {
    const encodedMessageId = encodeURIComponent(messageId);

    // Validate that categories exist
    if (!props.categories) {
      console.error(`No categories provided for message ${messageId}`);
      return;
    }

    try {
      const categories = [props.categories];

      await this.graphFetch(`/me/messages/${encodedMessageId}`, accessToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: categories,
        }),
      });
    } catch (error) {
      console.error(
        `Failed to assign category ${props.categories} to message ${messageId}`,
        error
      );
    }
  }

  async moveToFolder(
    props: ActionPropsFolder,
    messageId: string,
    accessToken: string
  ) {
    const destinationId = props.folder;

    if (!destinationId) {
      console.error(
        `Missing destinationFolderId for moving message ${messageId}`
      );
      return;
    }

    try {
      await this.graphFetch(
        `/me/messages/${encodeURIComponent(messageId)}/move`,
        accessToken,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinationId,
          }),
        }
      );
    } catch (error) {
      console.error(
        `Failed to move message ${messageId} to folder ${destinationId}`,
        error
      );
    }
  }

  async forwardTo(
    props: ActionPropsForward,
    messageId: string,
    accessToken: string
  ) {
    if (!props.recipients || props.recipients.length === 0) {
      console.error(
        `No recipients provided for forwarding message ${messageId}`
      );
      return;
    }

    try {
      await this.graphFetch(
        `/me/messages/${encodeURIComponent(messageId)}/forward`,
        accessToken,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: props.comment || "",
            toRecipients: props.recipients.map((address) => ({
              emailAddress: { address },
            })),
          }),
        }
      );
    } catch (error) {
      console.error(
        `Failed to forward message ${messageId} to ${props.recipients.join(", ")}`,
        error
      );
    }
  }

  async replyWithMessage(
    props: ActionPropsReply,
    messageId: string,
    accessToken: string
  ) {
    const endpoint = props?.replyAll ? "replyAll" : "reply";
    const comment = props.messageText?.trim();

    if (!comment) {
      console.error(`No message text provided for reply to ${messageId}`);
      return;
    }

    try {
      await this.graphFetch(
        `/me/messages/${encodeURIComponent(messageId)}/${endpoint}`,
        accessToken,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment,
          }),
        }
      );
    } catch (error) {
      console.error(
        `Failed to send ${endpoint} for message ${messageId}`,
        error
      );
    }
  }

  async executeActions(
    actions: { type: string; props: Json }[],
    messageId: string,
    accessToken: string
  ) {
    await asyncMap(actions, 5, async (action) => {
      switch (action.type) {
        case "assign_categories":
          await this.assignCategories(
            action.props as ActionPropsTag,
            messageId,
            accessToken
          );
          break;
        case "move_to_folder":
          await this.moveToFolder(
            action.props as ActionPropsFolder,
            messageId,
            accessToken
          );
          break;
        case "forward_to":
          await this.forwardTo(
            action.props as ActionPropsForward,
            messageId,
            accessToken
          );
          break;
        case "reply_with_message":
          await this.replyWithMessage(
            action.props as ActionPropsReply,
            messageId,
            accessToken
          );
          break;
        default:
          console.log(`Unknown action type: ${action.type}`);
      }
    });
  }
}
