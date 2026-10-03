import type { ReactNode } from "react";

export type UserRole =
  | "ROLE_ORG_ADMIN"
  | "ROLE_SUPER_ADMIN"
  | "ROLE_ADMIN"
  | "ROLE_TEACHER"
  | "ROLE_STUDENT"
  | "ROLE_PUBLIC";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: ReactNode;
  roles?: UserRole[];
  badge?: string | number;
  badgeColor?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  disabled?: boolean;
  children?: NavItem[];
}

export interface NavSection {
  subheader: string;
  items: NavItem[];
}
