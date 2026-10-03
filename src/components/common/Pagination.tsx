import { TablePagination } from "@mui/material";
import type { PaginationProps } from "../../types/Pagination.types";

const Pagination = (props: PaginationProps) => {
  return (
    <TablePagination
      component="div"
      rowsPerPageOptions={[5, 10, 25, 50]}
      {...props}
    />
  );
};

export default Pagination;