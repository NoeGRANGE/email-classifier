export {};

declare global {
  type OrganisationRole = "owner" | "admin" | "member";
  type RegisterResult = {
    auth_user_id: string;
    email: string;
    org_id: number;
  };
}
