import { Tooltip as TooltipMUI } from "@mui/material";
import type { AppTooltipProps } from "../../types/Tooltip.types";

const Tooltip = (props: AppTooltipProps) => {
    return (
        <TooltipMUI
            arrow
            placement="top"
            {...props}
        />
    );
};

export default Tooltip;