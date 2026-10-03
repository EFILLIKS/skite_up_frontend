import {
    Card as CardMUI,
    CardHeader,
    CardContent,
    CardActions,
} from "@mui/material";
import type { AppCardProps } from "../../types/Card.types";

const Card = (props: AppCardProps) => {
    return (
        <CardMUI {...props}>
            {(props.title || props.subtitle || props.headerAction) && (
                <CardHeader
                    title={props.title}
                    subheader={props.subtitle}
                    action={props.headerAction}
                />
            )}

            {props.children && (
                <CardContent sx={props.contentSx}>
                    {props.children}
                </CardContent>
            )}

            {props.footer && (
                <CardActions>
                    {props.footer}
                </CardActions>
            )}
        </CardMUI>
    );
};

export default Card;