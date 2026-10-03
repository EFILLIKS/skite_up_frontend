import type { UserProfile, UserRole } from "./Nav.types";

export interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  activeTitle?: string;
}