import type { ReactNode } from "react";
import type { CardProps, SxProps, Theme } from "@mui/material";

export interface AppCardProps extends CardProps {
    title?: string;
    subtitle?: string;
    children?: ReactNode;
    headerAction?: ReactNode;
    footer?: ReactNode;
    contentSx?: SxProps<Theme>;
}