import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  styled,
  Grid,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { fileSlice } from "../stores/slices/FileSlice";
import { ColumnHeaderJS } from "polars-wasm";

const Input = styled("input")({
  display: "none",
});

interface UploadCardProps {
  handleNext: () => void;
}

interface ColumnHeaderMutationJS {
  header: ColumnHeaderJS;
  new_column_name: string | null;
}

type DataframeMetadata = {
  name: string;
  columns: ColumnHeaderMutationJS[];
};

export function UploadCard(props: UploadCardProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );
  const dispatch = useDispatch<AppDispatch>();

  const [files, setFiles] = useState<String[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasHeaders, setHasHeaders] = useState<boolean>(true);
  const [selectedDataframe, setSelectedDataframe] =
    useState<DataframeMetadata | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);

    for (const file of fileArray) {
      const df = fluxcraftSelector.add(
        new Uint8Array(await file.arrayBuffer()),
        hasHeaders,
        file.name
      );

      setFiles((prev) => {
        prev.push(df.get_name());
        return prev;
      });

      dispatch(fileSlice.actions.setDataFrame(df));
    }
  };

  function renderTooltip(file: String) {
    return fluxcraftSelector
      .get(file as string)
      .get_headers()
      .map((header) => (
        <div>
          <b>{header.get_name()}</b>: {header.get_dtype()}
        </div>
      ));
  }

  function handleCloseDialog() {
    setIsOpen(false);
    setSelectedDataframe(null);
  }

  return (
    <Card elevation={3} sx={{ p: 2, m: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Upload files
        </Typography>
        <Stack spacing={3}>
          <label htmlFor="file-upload">
            <Input
              accept=".csv"
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasHeaders}
                  onChange={(event) => setHasHeaders(event.target.checked)}
                />
              }
              label="Has headers?"
              labelPlacement="start"
            />
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ padding: "2rem" }}
            >
              Upload Files
            </Button>
          </label>

          {files.length > 0 && (
            <Grid container spacing={2}>
              {files.map((file, idx) => (
                <Tooltip title={renderTooltip(file)}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, textAlign: "center" }}
                    key={idx}
                    onClick={() => {
                      setIsOpen(true);
                      setSelectedDataframe({
                        name: file as string,
                        columns: fluxcraftSelector
                          .get(file as string)
                          .get_headers()
                          .map((h) => {
                            return {
                              header: h,
                              new_column_name: null,
                            };
                          }),
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Typography variant="body2">{file}</Typography>
                  </Paper>
                </Tooltip>
              ))}
            </Grid>
          )}

          <Button
            variant="contained"
            size="large"
            disabled={files.length === 0}
            onClick={props.handleNext}
          >
            Next
          </Button>
          <Dialog onClose={handleCloseDialog} open={isOpen}>
            <DialogTitle>{selectedDataframe?.name}</DialogTitle>
            {selectedDataframe?.columns.map((column) => (
              <TextField
                id="filled-basic"
                label={column.header.get_name()}
                variant="filled"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  column.new_column_name = event.target.value;
                }}
              />
            ))}
            <Button onClick={() => console.log(selectedDataframe)}>
              Submit
            </Button>
          </Dialog>
        </Stack>
      </CardContent>
    </Card>
  );
}
