import { Alert, Portal, Snackbar as SnackbarMUI } from "@mui/material";
import type { SnackSnackbarMUI } from "../../types/Snackbar.types";

const Snackbar = ({
  autoHideDuration = 4000,
  anchorOrigin = {
    vertical: "top",
    horizontal: "right",
  },
  onClose,
  severity = "success",
  message,
  sx,
  ...rest
}: SnackSnackbarMUI) => {
  const isTop = (anchorOrigin?.vertical ?? "top") === "top";

  return (
    <Portal>
      <SnackbarMUI
        autoHideDuration={autoHideDuration}
        anchorOrigin={anchorOrigin}
        onClose={onClose}
        sx={[
          ...(isTop
            ? [{ top: { xs: "68px !important", sm: "72px !important" } }]
            : []),
          { zIndex: (theme) => theme.zIndex.snackbar + 100 },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...rest}
      >
        <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          {message}
        </Alert>
      </SnackbarMUI>
    </Portal>
  );
};

export default Snackbar;