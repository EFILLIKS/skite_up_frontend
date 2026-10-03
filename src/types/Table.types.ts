import type { ReactNode } from "react";
import type { TableProps, TableCellProps } from "@mui/material";

export interface AppTableColumn<T> {
    id: keyof T | string;
    label: string;
    align?: TableCellProps["align"];
    minWidth?: number;
    render?: (row: T) => ReactNode;
}

export interface AppTableProps<T> extends TableProps {
    columns: AppTableColumn<T>[];
    rows: T[];
    getRowId: (row: T) => string | number;
    loading?: boolean;
    emptyMessage?: string;
}