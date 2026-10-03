export type JwtPayload = {
  sub: string;
  userId: string;
  role: string;
  roleId: string;
  orgId: string;
  tokenType: string;
  iat: number;
  exp: number;
};