import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { QueryEditor } from "./QueryEditor";
import { DataframeViewer } from "./DataFrameViewer";
import { useSqlCompletions } from "../hooks/useSqlCompletions";
import { FormEvent, useRef, useState } from "react";
import { useDataFrameRenderer } from "../hooks/useDataFrameRenderer";
import { RootState } from "../stores/Store";
import { useSelector } from "react-redux";

export function QueryCard() {
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

  const beforeMount = useSqlCompletions(dfSelector!, fluxcraftSelector);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fluxcraftSelector) {
      renderDataframe(fluxcraftSelector.query(query.current));
    }
  }

  return (
    <Card elevation={3} sx={{ p: 2, m: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
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
            <DataframeViewer
              rows={rows}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
