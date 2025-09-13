export {};

declare global {
  type OrganisationData = {
    name: string;
    seatsPurchased: number;
    seatsUsed: number;
    members: {
      id: number;
      email: string;
      role: string;
      status: string;
      authorizedEmails: number;
      createdAt: string;
      acceptedAt: string;
    }[];
  };
  type RegisterResult = {
    ok: boolean;
    user: {
      auth_user_id: string;
      email: string;
      org_id: number;
    };
  };
}
