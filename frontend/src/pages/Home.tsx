import {
  Container,
  Card,
  CardContent,
  Stack,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";
import * as wasm from "polars-wasm";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Editor from "@monaco-editor/react";
import { UploadCard } from "../components/UploadCard";
import { TransformPipeline } from "../components/TransformPipeline";
import { VpnKey } from "@mui/icons-material";

export function Home() {
  const dfSelector = useSelector((state: RootState) => state.file.df);
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const query = useRef<string>("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
  });

  const renderDataframe = (df: wasm.DataFrameJS) => {
    console.time("wasm_load");
    const columnObjects = df.get_columns();
    console.timeEnd("wasm_load");
    const numRows = columnObjects[0].get_values().length;
    const headers = df.get_headers();

    const cols: string[][] = [];

    columnObjects.map((col, _colIndex) => {
      cols.push(col.get_values());
    });

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
        valueGetter: (param: any) => {
          return dtype === "datetime"
            ? new Date(param).toLocaleString()
            : param;
        },
        flex: 1,
        renderHeader: () => (
          <Box display="flex" alignItems="center" gap={1}>
            {header.is_primary_key() && <VpnKey fontSize="small" />}
            <Typography variant="body2">{headers[index].get_name()}</Typography>
          </Box>
        ),
      };
    });
    console.timeEnd("creating_cols");

    setRows(rowData);
    setColumns(colDefs);
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (fluxcraftSelector) {
      renderDataframe(fluxcraftSelector.query(query.current));
    }
  }

  function handleNext(): void {
    if (dfSelector) {
      renderDataframe(dfSelector);
    }
  }

  useEffect(() => {
    handleNext();
  }, []);

  function handleEditorWillMount(monaco: typeof import("monaco-editor")) {
    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: () => {
        // @ts-ignore
        const suggestions: monaco.languages.CompletionItem[] = fluxcraftSelector
          .get_dataframe_names()
          .map((table) => ({
            label: table,
            kind: monaco.languages.CompletionItemKind.Struct,
            insertText: table,
            detail: "Table",
            documentation: `Table: ${table}`,
          }));

        if (dfSelector) {
          const headers = dfSelector.get_headers?.();
          if (headers) {
            headers.forEach((header: wasm.ColumnHeaderJS) => {
              const headerName = header.get_name();
              suggestions.push({
                label: headerName,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: headerName.includes(" ")
                  ? `"${headerName}"`
                  : headerName,
                detail: `Column (${header.get_dtype()})`,
                documentation: `Column in dataframe: ${headerName}`,
              });
            });
          }
        }

        const keywords = [
          "SELECT",
          "FROM",
          "WHERE",
          "GROUP BY",
          "ORDER BY",
          "LIMIT",
          "INSERT",
          "UPDATE",
          "DELETE",
          "JOIN",
          "LEFT JOIN",
          "RIGHT JOIN",
          "CREATE TABLE",
          "DROP TABLE",
          "ALTER TABLE",
        ];
        keywords.forEach((word) => {
          suggestions.push({
            label: word,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: word,
            detail: "Keyword",
          });
        });

        const functions = [
          "COUNT",
          "AVG",
          "SUM",
          "MIN",
          "MAX",
          "NOW",
          "LOWER",
          "UPPER",
          "COALESCE",
        ];
        functions.forEach((func) => {
          suggestions.push({
            label: func,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: `${func}()`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "Function",
            documentation: `SQL function: ${func}`,
          });
        });

        return { suggestions };
      },
    });
  }

  function handleEditorDidMount(
    editor: import("monaco-editor").editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor")
  ) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (fluxcraftSelector) {
        renderDataframe(fluxcraftSelector.query(query.current));
      }
    });
  }

  return (
    <Container maxWidth={false} disableGutters>
      <UploadCard handleNext={handleNext} />

      {rows.length > 0 && (
        <Card elevation={3} sx={{ p: 2, m: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Query
            </Typography>
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
                    onChange={(value) => (query.current = value ?? "")}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
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
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pagination
                  pageSizeOptions={[50, 100]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  sx={{ border: 0 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
      <TransformPipeline />
    </Container>
  );
}
