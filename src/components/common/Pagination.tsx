import { TablePagination } from "@mui/material";
import type { PaginationProps } from "../../types/Pagination.types";

const Pagination = (props: PaginationProps) => {
  const {
    count = 0,
    page = 0,
    rowsPerPage = 10,
    rowsPerPageOptions = [5, 10, 25, 50],
    ...rest
  } = props;

  const validCount = Math.max(0, Number.isFinite(count) ? count : 0);
  const validRowsPerPage = rowsPerPage > 0 ? rowsPerPage : 10;
  const maxPage = Math.max(0, Math.ceil(validCount / validRowsPerPage) - 1);
  const validPage = Math.min(Math.max(0, Number.isFinite(page) ? page : 0), maxPage);

  return (
    <TablePagination
      component="div"
      count={validCount}
      page={validPage}
      rowsPerPage={validRowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      {...rest}
    />
  );
};

export default Pagination;