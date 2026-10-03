import {
    Table as TableMUI,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Skeleton,
    Typography,
} from "@mui/material";
import type { AppTableProps } from "../../types/Table.types";

const Table = <T,>(props: AppTableProps<T>) => {
    const { columns, rows, getRowId, loading = false, emptyMessage = "No records found", ...tableProps } = props;
    return (
        <TableContainer component={Paper} elevation={0}>
            <TableMUI {...tableProps}>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell
                                key={String(column.id)}
                                align={column.align}
                                sx={{ fontWeight: 600, minWidth: column.minWidth }}
                            >
                                {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                {columns.map((column) => (
                                    <TableCell key={String(column.id)}>
                                        <Skeleton variant="text" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                align="center"
                                sx={{ py: 4 }}
                            >
                                <Typography color="text.error">
                                    {emptyMessage}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => (
                            <TableRow key={getRowId(row)} hover>
                                {columns.map((column) => (
                                    <TableCell
                                        key={String(column.id)}
                                        align={column.align}
                                    >
                                        {column.render
                                            ? column.render(row)
                                            : String(
                                                (row as Record<string, unknown>)[
                                                String(column.id)
                                                ] ?? "-"
                                            )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </TableMUI>
        </TableContainer>
    );
};

export default Table;