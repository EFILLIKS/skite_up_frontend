import type { UserProfile, UserRole } from "./Nav.types";

export const roleBadgeColor: Record<UserRole, "primary" | "success" | "secondary" | "error" | "warning"> = {
  ROLE_ORG_ADMIN: "primary",
  ROLE_SUPER_ADMIN: "error",
  ROLE_ADMIN: "primary",
  ROLE_TEACHER: "success",
  ROLE_STUDENT: "secondary",
  ROLE_PUBLIC: "warning",
};

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  activeId: string;
  onSelectNav: (id: string, title: string) => void;
  isMobile: boolean;
}