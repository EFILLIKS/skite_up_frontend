import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types/JwtDecode.types";

export const checkIsExpired = (): boolean => {
  if (localStorage.getItem("isExpired") === "false") {
    return false;
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isTokenExpired =
        decoded.isExpired === true ||
        Boolean(decoded.planStatus && decoded.planStatus.toLowerCase().includes("expired"));

      if (isTokenExpired) {
        localStorage.setItem("isExpired", "true");
        return true;
      } else if (decoded.isExpired === false && (!decoded.planStatus || !decoded.planStatus.toLowerCase().includes("expired"))) {
        localStorage.setItem("isExpired", "false");
        return false;
      }
    } catch {
    }
  }

  return localStorage.getItem("isExpired") === "true";
};
