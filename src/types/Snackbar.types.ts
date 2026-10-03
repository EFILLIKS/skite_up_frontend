import type { AlertColor, SnackbarProps as SnackbarMUIProps } from "@mui/material";

export interface SnackSnackbarMUI
  extends Omit<SnackbarMUIProps, "children" | "onClose"> {
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}
export type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "error";
};