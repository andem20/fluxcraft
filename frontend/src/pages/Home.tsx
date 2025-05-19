import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  styled,
  Box,
  Paper,
  TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ChangeEvent, FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { fileSlice } from "../stores/slices/FileSlice";
import * as wasm from "polars-wasm";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Editor from "@monaco-editor/react";

const Input = styled("input")({
  display: "none",
});

export function Home() {
  const fileSelector = useSelector((state: RootState) => state.file.file);
  const dfSelector = useSelector((state: RootState) => state.file.df);
  const dispatch = useDispatch<AppDispatch>();

  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [query, setQuery] = useState<string>("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files != null) {
      dispatch(fileSlice.actions.setFile(files[0]));
      const df = wasm.create_df(
        new Uint8Array(await files[0].arrayBuffer()),
        true
      );
      dispatch(fileSlice.actions.setDataFrame(df));
    }
  };

  const handleDataframe = (df: wasm.DataFrameJS) => {
    console.time("wasm_load");
    const columnObjects = df.get_columns();
    console.timeEnd("wasm_load");
    const numRows = columnObjects[0].get_values().length;
    const headers = df.get_headers();

    const cols: string[][] = [];

    columnObjects.map((col, colIndex) => {
      cols.push(col.get_values());
    });

    console.time("creating_rows");
    const rowData = Array.from({ length: numRows }, (_, rowIndex) => {
      const row: any = { id: rowIndex };
      columnObjects.forEach((col, colIndex) => {
        row[colIndex.toString()] = cols[colIndex][rowIndex];
      });
      return row;
    });
    console.timeEnd("creating_rows");

    console.time("creating_cols");
    const colDefs: GridColDef[] = columnObjects.map((_, index) => {
      const dtype = headers[index].get_dtype() as "string" | "number" | "date";

      return {
        field: index.toString(),
        headerName: headers[index].get_name(),
        type: dtype,
        valueGetter: (param: any) =>
          dtype === "date" ? new Date(param) : param,
      };
    });
    console.timeEnd("creating_cols");

    setRows(rowData);
    setColumns(colDefs);
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (dfSelector) {
      handleDataframe(dfSelector.query(query));
    }
  }

  function handleNext(): void {
    if (dfSelector) {
      handleDataframe(dfSelector);
    }
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Card elevation={3} sx={{ p: 2, m: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Upload a file
          </Typography>
          <Stack spacing={3}>
            <label htmlFor="file-upload">
              <Input
                accept=".csv"
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ padding: "2rem" }}
              >
                Upload File
              </Button>
            </label>
            {fileSelector && (
              <Box textAlign="center" color="text.secondary">
                Selected file: {fileSelector.name}
              </Box>
            )}
            <Button
              variant="contained"
              size="large"
              disabled={fileSelector == null}
              onClick={handleNext}
            >
              Next
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card elevation={3} sx={{ p: 2, m: 2 }}>
          <CardContent>
            <Stack spacing={3}>
              <Box
                onSubmit={handleSubmit}
                component="form"
                sx={{ display: "flex", width: "100%" }}
              >
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <Editor
                    height="15rem"
                    defaultLanguage="sql"
                    value={query}
                    onChange={(value) => setQuery(value ?? "")}
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: "on",
                      fontSize: 16,
                      wordWrap: "off",
                    }}
                  />
                </Box>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </Box>
              <Paper sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pagination
                  pageSizeOptions={[50, 100]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  sx={{ border: 0 }}
                />
              </Paper>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
