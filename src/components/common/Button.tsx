import { Button as ButtonMUI, CircularProgress, type ButtonProps } from "@mui/material";

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