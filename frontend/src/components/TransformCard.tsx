import { Box, Button, Stack, Tooltip } from "@mui/material";
import { QueryEditor } from "./QueryEditor";
import { DataframeViewer } from "./DataFrameViewer";
import { useSqlCompletions } from "../hooks/useSqlCompletions";
import { FormEvent, useRef, useState } from "react";
import { useDataFrameRenderer } from "../hooks/useDataFrameRenderer";
import { RootState } from "../stores/Store";
import { useSelector } from "react-redux";
import { UploadCard } from "./UploadCard";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface TransformCardProps {
  id: number;
}

export function TransformCard(props: TransformCardProps) {
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
      <Stack spacing={3}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", width: "100%", mb: 3 }}>
            <QueryEditor
              key={"editor-" + props.id}
              onChange={(val) => (query.current = val)}
              onSubmitShortcut={() =>
                fluxcraftSelector &&
                renderDataframe(fluxcraftSelector.query(query.current))
              }
              beforeMount={beforeMount}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={() => setOpenModal(true)}
              >
                Add Dataframe
              </Button>
            </Box>

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
    </>
  );
}
