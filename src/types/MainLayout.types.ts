import type {  UserRole } from "./Nav.types";

export interface MainLayoutProps {
    children?: React.ReactNode;
    initialRole?: UserRole;
}
