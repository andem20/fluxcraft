import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Pagination } from "../hooks/useDataFrameRenderer";

interface DataFrameViewerProps {
  rows: any[];
  columns: GridColDef[];
  paginationModel: { pageSize: number; page: number };
  onPaginationModelChange: (model: Pagination) => void;
  rowCount: number;
}

export function DataframeViewer({
  rows,
  columns,
  paginationModel,
  onPaginationModelChange,
  rowCount,
}: DataFrameViewerProps) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pagination
      paginationMode="server"
      pageSizeOptions={[50, 100]}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sx={{ border: 0 }}
      rowCount={rowCount}
    />
  );
}
