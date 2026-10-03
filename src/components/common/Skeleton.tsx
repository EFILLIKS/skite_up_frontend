import { Skeleton } from "@mui/material";
import type { AppSkeletonProps } from "../../types/Skeleton.types";

const AppSkeleton = (props: AppSkeletonProps) => {
    return <Skeleton {...props} />;
};

export default AppSkeleton;