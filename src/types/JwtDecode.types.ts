export type JwtPayload = {
  sub: string;
  userId?: string;
  role: string;
  roleId?: string;
  organizationId?: string;
  tokenType?: string;
  token_type?: string;
  institutionId?: string;
  planId?: string;
  planStatus?: string;
  isPaid?: boolean;
  isExpired?: boolean;
  email?: string;
  iss?: string;
  iat: number;
  exp: number;
};