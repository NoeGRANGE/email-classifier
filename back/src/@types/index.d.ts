export {};

declare global {
  type OrganisationRole = "owner" | "admin" | "member";
  type RegisterResult = {
    auth_user_id: string;
    email: string;
    org_id: number;
  };
  type PlanInfo = {
    canSwitchTo: boolean;
    isCurrent: boolean;
    id: string;
    stripe_price_id: string;
    plan: "solo" | "team" | "business" | "enterprise";
    mailbox_limit: number;
  };
  type Plan = "solo" | "team" | "business";
  type BillingInfo = {
    userId: string;
    stripeCustomerId: string | null;
    currentPlan: "solo" | "team" | "business" | "enterprise" | null;
    subscriptionStatus: "trialing" | "active" | "past_due" | "canceled" | null;
    currentPriceId: string | null;
    currentPeriodEnd: string | null;
    mailboxLimit: number;
    mailboxUsed: number;
  };
  type ActionPropsTag = {
    categories: string;
  };
  type ActionPropsFolder = {
    destinationFolderId: string;
  };
  type ActionPropsForward = {
    to: string[];
    comment?: string;
  };
  type ActionPropsReply = {
    replyAll?: boolean;
    messageText: string;
    includeOriginal?: boolean;
  };
  type ApiCategoryAction = {
    type: string;
    props:
      | ActionPropsTag
      | ActionPropsFolder
      | ActionPropsForward
      | ActionPropsReply;
  };
  type OutlookNotification = {
    subscriptionId: string;
    subscriptionExpirationDateTime: string;
    changeType: string;
    resource: string;
    resourceData: {
      "@odata.type": string;
      "@odata.id": string;
      "@odata.etag": string;
      id: string;
    };
    clientState: string;
    tenantId: string;
  };

  type OutlookMessage = {
    id: string;
    createdDateTime?: string;
    lastModifiedDateTime?: string;
    changeKey?: string;
    categories?: string[];
    receivedDateTime?: string;
    sentDateTime?: string;
    hasAttachments?: boolean;
    internetMessageId?: string;
    subject?: string;
    bodyPreview?: string;
    importance?: "Low" | "Normal" | "High";
    parentFolderId?: string;
    conversationId?: string;
    conversationIndex?: string;
    isDeliveryReceiptRequested?: boolean;
    isReadReceiptRequested?: boolean;
    isRead?: boolean;
    isDraft?: boolean;
    webLink?: string;
    inferenceClassification?: "Focused" | "Other";

    body?: {
      contentType: "Text" | "HTML";
      content: string;
    };

    sender?: {
      emailAddress: {
        name: string;
        address: string;
      };
    };

    from?: {
      emailAddress: {
        name: string;
        address: string;
      };
    };

    toRecipients?: Array<{
      emailAddress: {
        name: string;
        address: string;
      };
    }>;

    ccRecipients?: Array<{
      emailAddress: {
        name: string;
        address: string;
      };
    }>;

    bccRecipients?: Array<{
      emailAddress: {
        name: string;
        address: string;
      };
    }>;

    replyTo?: Array<{
      emailAddress: {
        name: string;
        address: string;
      };
    }>;

    attachments?: Array<{
      id: string;
      name: string;
      contentType?: string;
      size?: number;
      isInline?: boolean;
    }>;
  };
}
