import { Button as ButtonMUI, CircularProgress } from "@mui/material";
import type { ButtonProps } from "../../types/Button.types";

const Button = (props: ButtonProps) => {
    return (
        <ButtonMUI
            variant={props.variant}
            color={props.color}
            disabled={props.disabled || props.loading as boolean}
            {...props}
        >
            {props.loading ? (
                <CircularProgress size={20} color="inherit" />
            ) : (
                props.children
            )}
        </ButtonMUI>
    );
};

export default Button;