import {
  Dialog as DialogMUI,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Button from "./Button";
import type { AppDialogProps } from "../../types/Dialog.types";

const Dialog = (props: AppDialogProps) => {
  return (
    <DialogMUI
      {...props}
      open={props.open}
      onClose={props.onClose}
      fullWidth
      maxWidth={props.maxWidth ?? "sm"}
    >
      {(props.title || props.showCloseButton) && (
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 600,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {props.title}
          </Typography>

          {props.showCloseButton && (
            <Button
              onClick={props.onClose}
              size="small"
              aria-label="Close dialog"
            >
              <CloseIcon />
            </Button>
          )}
        </DialogTitle>
      )}

      <DialogContent sx={props.contentSx}>
        {props.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {props.description}
          </Typography>
        )}

        {props.children}
      </DialogContent>

      {props.actions && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {props.actions}
        </DialogActions>
      )}
    </DialogMUI>
  );
};

export default Dialog;