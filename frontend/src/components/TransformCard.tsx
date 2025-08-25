import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { QueryEditor } from "./QueryEditor";
import { DataframeViewer } from "./DataFrameViewer";
import { useSqlCompletions } from "../hooks/useSqlCompletions";
import { FormEvent, useRef, useState } from "react";
import { useDataFrameRenderer } from "../hooks/useDataFrameRenderer";
import { RootState } from "../stores/Store";
import { useSelector } from "react-redux";
import { UploadCard } from "./UploadCard";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export function TransformCard() {
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

  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <UploadCard open={openModal} onClose={() => setOpenModal(false)} />
      <Card elevation={3} sx={{ p: 2, m: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <SearchIcon />
            <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
              Query
            </Typography>
            <Button
              variant="contained"
              size="medium"
              color="secondary"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={() => setOpenModal(true)}
            >
              Add Dataframe
            </Button>
          </Stack>
          <Stack spacing={3} sx={{ mt: 5 }}>
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
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Box sx={{ flexGrow: 1 }} />

              <Tooltip title="Run query (Ctrl+Enter)">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                >
                  Run
                </Button>
              </Tooltip>
            </Box>

            {rows.length > 0 && (
              <Box sx={{ height: 400, width: "100%" }}>
                <DataframeViewer
                  rows={rows}
                  columns={columns}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                />
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
