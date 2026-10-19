import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types/JwtDecode.types";

export const getStoredAccessToken = (): string | null => {
  return sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
};

export const getStoredRefreshToken = (): string | null => {
  return sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
};

export const getStoredUserRole = (): string | null => {
  return sessionStorage.getItem("role") || localStorage.getItem("role");
};

export const checkIsExpired = (): boolean => {
  const isExpiredVal = sessionStorage.getItem("isExpired") || localStorage.getItem("isExpired");
  if (isExpiredVal === "false") {
    return false;
  }

  const token = getStoredAccessToken();
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isTokenExpired =
        decoded.isExpired === true ||
        Boolean(decoded.planStatus && decoded.planStatus.toLowerCase().includes("expired"));

      if (isTokenExpired) {
        sessionStorage.setItem("isExpired", "true");
        localStorage.setItem("isExpired", "true");
        return true;
      } else if (decoded.isExpired === false && (!decoded.planStatus || !decoded.planStatus.toLowerCase().includes("expired"))) {
        sessionStorage.setItem("isExpired", "false");
        localStorage.setItem("isExpired", "false");
        return false;
      }
    } catch {
    }
  }

  return isExpiredVal === "true";
};
