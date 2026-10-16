import {
    Card as CardMUI,
    CardHeader,
    CardContent,
    CardActions,
} from "@mui/material";
import type { AppCardProps } from "../../types/Card.types";

const Card = ({
    title,
    subtitle,
    headerAction,
    children,
    contentSx,
    footer,
    ...restProps
}: AppCardProps) => {
    return (
        <CardMUI {...restProps}>
            {(title || subtitle || headerAction) && (
                <CardHeader
                    title={title}
                    subheader={subtitle}
                    action={headerAction}
                />
            )}

            {children && (
                <CardContent sx={contentSx}>
                    {children}
                </CardContent>
            )}

            {footer && (
                <CardActions>
                    {footer}
                </CardActions>
            )}
        </CardMUI>
    );
};

export default Card;