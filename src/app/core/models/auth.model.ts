export enum UserRole {
  Admin = 1,
  User = 2,
}

export interface CurrentUser {
  userId: string;
  userName: string;
  email: string;
  role: UserRole;
  employeeId: number | null;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

// نفس الشكل بيرجع من /auth/login ومن /auth/refresh
export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  user: CurrentUser;
}