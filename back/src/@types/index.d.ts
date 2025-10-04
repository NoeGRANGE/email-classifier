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
    categories: string[];
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
}
