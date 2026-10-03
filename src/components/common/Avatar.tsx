import { Avatar } from "@mui/material";
import type { MuiAvatarProps as AppAvatarProps } from "../../types/Avatar.types";

const AppAvatar = (props: AppAvatarProps) => {
    return <Avatar {...props} />;
};

export default AppAvatar;