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
} from "@mui/material";
import { QueryEditor } from "./QueryEditor";
import { DataframeViewer } from "./DataFrameViewer";
import { useSqlCompletions } from "../hooks/useSqlCompletions";
import { FormEvent, useImperativeHandle, useRef, useState } from "react";
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

interface TransformCardProps {
  id: number;
  ref?: React.Ref<TransformCardRef>;
  onRemove: (id: number) => void;
}

export type TransformStep = {
  id: number;
  title: React.RefObject<string>;
  load?: string;
  query?: string;
};

export type TransformCardRef = {
  getSteps: () => TransformStep;
};

export function TransformCard({ id, ref, onRemove }: TransformCardProps) {
  const dfSelector = useSelector((state: RootState) => state.file.df);
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const dispatch = useDispatch<AppDispatch>();

  const { rows, columns, renderDataframe } = useDataFrameRenderer();
  const query = useRef<string>("");
  const title = useRef<string>("Cell " + id);
  const steps = useRef<TransformStep>({ id, title });

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getSteps: () => steps.current,
  }));

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
  });

  const beforeMount = useSqlCompletions(dfSelector!, fluxcraftSelector);

  function handleSubmit() {
    steps.current.query = query.current;
    if (fluxcraftSelector) {
      try {
        const df = fluxcraftSelector.query(query.current);
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

  const [openModal, setOpenModal] = useState(false);

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
    onRemove(id);
  }

  return (
    <>
      <Accordion
        key={id}
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
            <Typography sx={{ mr: 1, fontSize: "1.2rem" }}>#{id}:</Typography>
            <TextField
              variant="standard"
              placeholder="Cell title"
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => {
                setIsEditing(true);
                e.stopPropagation();
              }}
              onBlur={(_e) => setIsEditing(false)}
              onChange={(e) => {
                title.current = e.target.value;
              }}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: { fontSize: "1.2rem" },
                },
              }}
              fullWidth
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
            open={openModal}
            onClose={() => setOpenModal(false)}
            onLoadFile={(loadFile: string) => {
              steps.current.load = loadFile;
            }}
          />
          <Stack spacing={3}>
            <Box component="form" onSubmit={handleFormSubmit}>
              <Box sx={{ display: "flex", width: "100%", mb: 3 }}>
                <QueryEditor
                  key={"editor-" + id}
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
    </>
  );
}
