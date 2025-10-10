import { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import * as wasm from "polars-wasm";
import { Box, Tooltip, Typography } from "@mui/material";
import { VpnKey } from "@mui/icons-material";

export interface Pagination {
  pageSize: number;
  page: number;
}

export function useDataFrameRenderer() {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
  });

  const renderDataframe = (df: wasm.JsDataFrame, pagination?: Pagination) => {
    console.time("wasm_load");
    const columnObjects = df.get_columns_paged(
      pagination?.pageSize ?? 100,
      pagination?.page ?? 0
    );
    console.timeEnd("wasm_load");

    console.time("get_values");
    let numRows = pagination?.pageSize ?? 100;
    numRows = df.size() < numRows ? df.size() : numRows;
    const headers = df.get_headers();

    const cols: string[][] = columnObjects.map((col) => {
      const stringLengths = col.get_string_lengths();

      let offset = 0;
      let result = [];

      let textContent = col.get_values_as_string();

      for (let l of stringLengths) {
        result.push(textContent.substring(offset, offset + l));
        offset += l;
      }

      return result;
    });
    console.timeEnd("get_values");

    console.time("creating_rows");
    const rowData = Array.from({ length: numRows }, (_, rowIndex) => {
      const row: any = { id: rowIndex };
      columnObjects.forEach((_col, colIndex) => {
        row[colIndex.toString()] = cols[colIndex][rowIndex];
      });
      return row;
    });
    console.timeEnd("creating_rows");

    const colDefs: GridColDef[] = columnObjects.map((_, index) => {
      const header = headers[index];

      return {
        field: index.toString(),
        headerName: header.get_name(),
        type: "singleSelect",
        minWidth:
          header.get_dtype() == "str" || header.get_dtype().includes("datetime")
            ? 200
            : 50,
        renderHeader: () => (
          <Box display="flex" alignItems="center" gap={1}>
            {header.is_primary_key() && <VpnKey fontSize="small" />}
            <Tooltip title={header.get_dtype()}>
              <Typography variant="body2">{header.get_name()}</Typography>
            </Tooltip>
          </Box>
        ),
      };
    });

    setRows(rowData);
    setColumns(colDefs);
  };

  return {
    rows,
    columns,
    paginationModel,
    setPaginationModel,
    renderDataframe,
  };
}
