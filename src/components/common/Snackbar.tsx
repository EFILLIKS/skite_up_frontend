import { Alert, Snackbar as SnackbarMUI } from "@mui/material";
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
  ...rest
}: SnackSnackbarMUI) => {
  return (
    <SnackbarMUI
      autoHideDuration={autoHideDuration}
      anchorOrigin={anchorOrigin}
      onClose={onClose}
      {...rest}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </SnackbarMUI>
  );
};

export default Snackbar;