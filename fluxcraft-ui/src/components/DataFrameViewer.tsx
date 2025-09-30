import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface DataFrameViewerProps {
  rows: any[];
  columns: GridColDef[];
  paginationModel: { pageSize: number; page: number };
  onPaginationModelChange: (model: { pageSize: number; page: number }) => void;
}

export function DataframeViewer({
  rows,
  columns,
  paginationModel,
  onPaginationModelChange,
}: DataFrameViewerProps) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pagination
      pageSizeOptions={[50, 100]}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sx={{ border: 0 }}
    />
  );
}
