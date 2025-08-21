import {
  Container,
  Card,
  CardContent,
  Stack,
  Button,
  Box,
  Typography,
  Grid,
  Tooltip,
  Paper,
} from "@mui/material";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";
import { UploadCard } from "../components/UploadCard";
import { TransformPipeline } from "../components/TransformPipeline";
import { QueryEditor } from "../components/QueryEditor";
import { DataFrameViewer } from "../components/DataFrameViewer";
import { useDataFrameRenderer } from "../hooks/useDataFrameRenderer";
import { useSqlCompletions } from "../hooks/useSqlCompletions";

export function Home() {
  const dfSelector = useSelector((state: RootState) => state.file.df);
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const { rows, columns, renderDataframe } = useDataFrameRenderer();
  const query = useRef<string>("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
  });

  const [dataframes, setDataframes] = useState<String[]>([]);

  const beforeMount = useSqlCompletions(dfSelector!, fluxcraftSelector);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fluxcraftSelector) {
      renderDataframe(fluxcraftSelector.query(query.current));
      setDataframes(fluxcraftSelector.get_dataframe_names());
    }
  }

  function handleNext() {
    if (dfSelector) {
      renderDataframe(dfSelector);
      setDataframes(fluxcraftSelector.get_dataframe_names());
    }
  }

  useEffect(() => {
    handleNext();
  }, []);

  function renderTooltip(file: String) {
    return fluxcraftSelector.get_schema(file as string).map((header) => (
      <div>
        <b>{header.get_name()}</b>: {header.get_dtype()}
      </div>
    ));
  }

  return (
    <Container maxWidth={false} disableGutters>
      <UploadCard handleNext={handleNext} />

      <Card elevation={3} sx={{ p: 2, m: 2 }}>
        <CardContent>
          {dataframes.length > 0 && (
            <Grid container spacing={2}>
              {dataframes.map((name, idx) => (
                <Tooltip title={renderTooltip(name)}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, textAlign: "center" }}
                    key={idx}
                    style={{ cursor: "pointer" }}
                  >
                    <Typography variant="body2">{name}</Typography>
                  </Paper>
                </Tooltip>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card elevation={3} sx={{ p: 2, m: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Query
            </Typography>
            <Stack spacing={3}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", width: "100%" }}
              >
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <QueryEditor
                    onChange={(val) => (query.current = val)}
                    onSubmitShortcut={() =>
                      fluxcraftSelector &&
                      renderDataframe(fluxcraftSelector.query(query.current))
                    }
                    beforeMount={beforeMount}
                  />
                </Box>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </Box>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataFrameViewer
                  rows={rows}
                  columns={columns}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
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
