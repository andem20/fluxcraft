import {
  Accordion,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Tooltip,
  AccordionDetails,
  Typography,
  TextField,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Modal,
} from "@mui/material";
import { QueryEditor } from "./QueryEditor";
import { DataframeViewer } from "./DataFrameViewer";
import { useSqlCompletions } from "../hooks/useSqlCompletions";
import { FormEvent, useRef, useState } from "react";
import { useDataFrameRenderer } from "../hooks/useDataFrameRenderer";
import {
  AppDispatch,
  dataframesOverviewSlice,
  RootState,
} from "../stores/Store";
import { useDispatch, useSelector } from "react-redux";
import { UploadCard } from "./UploadCard";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import BarChartIcon from "@mui/icons-material/BarChart";
import { FileDownload } from "@mui/icons-material";
import { JsDataFrame } from "polars-wasm";
import { Charts } from "./Chart";
import { TitleEditor } from "./TitleEditor";

interface TransformCardProps {
  step: TransformStep;
  nextPendingStep: () => void;
  updatePendingLoad: () => boolean;
  onRemove: (id: number) => void;
}

export interface LoadStep {
  type: "FILE" | "HTTP";
  uri: string;
  name: string;
  options?: {
    method?: "GET" | "POST";
    has_headers?: string;
    payload_name?: string;
  };
  headers?: Record<string, string>;
}

export interface TransformStep {
  id: number;
  title?: string;
  load: LoadStep[];
  query?: string;
  pending?: {
    step: TransformStep;
  };
}

export function TransformCard({
  step,
  nextPendingStep,
  updatePendingLoad,
  onRemove,
}: TransformCardProps) {
  const dfSelector = useSelector((state: RootState) => state.file.df);
  const settingsSelector = useSelector((state: RootState) => state.settings);
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const dispatch = useDispatch<AppDispatch>();

  const {
    rows,
    columns,
    paginationModel,
    setPaginationModel,
    renderDataframe,
  } = useDataFrameRenderer();
  const query = useRef<string>(step.query ?? "");

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [output, setOutput] = useState<JsDataFrame | null>(null);
  const [isOpenCharts, setIsOpenCharts] = useState<boolean>(false);
  const title = useRef<string>(step.title ?? "Cell " + step.id);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const beforeMount = useSqlCompletions(dfSelector!, fluxcraftSelector);

  function handleSubmit() {
    step.query = query.current;
    if (fluxcraftSelector) {
      try {
        const df = fluxcraftSelector.query(query.current);
        setOutput(df);
        renderDataframe(df);
      } catch (error: any) {
        console.error(error);
        setErrorMsg(error.message ?? "Failed to run query");
      }
    }

    dispatch(
      dataframesOverviewSlice.actions.update(
        fluxcraftSelector.get_dataframe_names()
      )
    );
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSubmit();
  }

  const [openModal, setOpenModal] = useState(
    (step.pending && step.pending.step.load.length > 0) ?? false
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleDelete(
    _event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ): void {
    handleClose();
    onRemove(step.id);
  }

  function exportDataframe(): void {
    const inputDf = structuredClone(output);
    if (inputDf) {
      const df = fluxcraftSelector.export_csv(
        inputDf,
        settingsSelector.export.csv.separator
      );
      const blob = new Blob([df], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download =
        (title.current ?? "export").replace(" ", "_").toLowerCase() + ".csv";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  const commitTitle = () => {
    if (step.title !== title.current) {
      step.title = title.current;
    }
  };

  return (
    <>
      <Accordion
        key={step.id}
        expanded={isExpanded}
        onChange={() => {
          if (!isEditing) setIsExpanded(!isExpanded);
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box
            sx={{ display: "flex", alignItems: "center", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography sx={{ mr: 1, fontSize: "1.2rem" }}>
              #{step.id}:
            </Typography>
            <TitleEditor
              id={0}
              initialTitle={step.title ?? ""}
              onCommit={(value) => (title.current = value)}
              setIsEditing={(value) => setIsEditing(value)}
            />
            <Box onClick={handleClick}>
              <MoreVertIcon />
            </Box>
            <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose}>
              <MenuItem onClick={handleDelete}>
                <DeleteIcon /> Delete
              </MenuItem>
            </Menu>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <UploadCard
            step={step}
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              if (step.pending) {
                const isEmpty = updatePendingLoad();
                if (!isEmpty) {
                  setOpenModal(true);
                } else {
                  handleSubmit();
                  setIsExpanded(false);
                  nextPendingStep();
                }
              }
            }}
            onLoadFile={(loadFile: LoadStep) => {
              step.load.push(loadFile);
            }}
          />
          <Stack spacing={3}>
            <Box component="form" onSubmit={handleFormSubmit}>
              <Box sx={{ display: "flex", width: "100%", mb: 3 }}>
                <QueryEditor
                  key={"editor-" + step.id}
                  query={step.query ?? ""}
                  onChange={(val) => (query.current = val)}
                  onSubmitShortcut={handleSubmit}
                  beforeMount={beforeMount}
                />
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    onClick={() => setOpenModal(true)}
                    sx={{ mr: 2 }}
                  >
                    Add Dataframe
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={exportDataframe}
                    startIcon={<FileDownload />}
                    sx={{ mr: 2 }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() => setIsOpenCharts(true)}
                    startIcon={<BarChartIcon />}
                  >
                    Graph
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
                  onPaginationModelChange={(pageModel) => {
                    setPaginationModel(pageModel);
                    if (output) {
                      renderDataframe(output, pageModel);
                    }
                  }}
                  rowCount={output?.size() ?? 0}
                />
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Snackbar
        color="alert"
        open={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMsg(null)}
          severity="error"
          sx={{ width: "100%" }}
          variant="filled"
        >
          {errorMsg}
        </Alert>
      </Snackbar>
      <Modal
        open={isOpenCharts}
        onClose={() => setIsOpenCharts(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Charts df={output} />
      </Modal>
    </>
  );
}
