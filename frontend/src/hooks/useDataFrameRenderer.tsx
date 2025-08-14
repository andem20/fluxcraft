import { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import * as wasm from "polars-wasm";
import { Box, Typography } from "@mui/material";
import { VpnKey } from "@mui/icons-material";

export function useDataFrameRenderer() {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);

  const renderDataframe = (df: wasm.DataFrameJS) => {
    console.time("wasm_load");
    const columnObjects = df.get_columns();
    console.timeEnd("wasm_load");

    const numRows = columnObjects[0].get_values().length;
    const headers = df.get_headers();
    const cols: string[][] = columnObjects.map((col) => col.get_values());

    console.time("creating_rows");
    const rowData = Array.from({ length: numRows }, (_, rowIndex) => {
      const row: any = { id: rowIndex };
      columnObjects.forEach((_col, colIndex) => {
        row[colIndex.toString()] = cols[colIndex][rowIndex];
      });
      return row;
    });
    console.timeEnd("creating_rows");

    console.time("creating_cols");
    const colDefs: GridColDef[] = columnObjects.map((_, index) => {
      const header = headers[index];
      const dtype = header.get_dtype() as "string" | "number" | "datetime";

      return {
        field: index.toString(),
        headerName: header.get_name(),
        type: "singleSelect",
        flex: 1,
        renderHeader: () => (
          <Box display="flex" alignItems="center" gap={1}>
            {header.is_primary_key() && <VpnKey fontSize="small" />}
            <Typography variant="body2">{header.get_name()}</Typography>
          </Box>
        ),
      };
    });
    console.timeEnd("creating_cols");

    setRows(rowData);
    setColumns(colDefs);
  };

  return { rows, columns, renderDataframe };
}
