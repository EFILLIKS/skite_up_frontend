import type { ReactNode } from "react";
import type { DialogProps, SxProps, Theme } from "@mui/material";

export interface AppDialogProps
  extends Omit<DialogProps, "title" | "onClose"> {
  title?: string;
  description?: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  actions?: ReactNode;
  contentSx?: SxProps<Theme>;
  showCloseButton?: boolean;
}