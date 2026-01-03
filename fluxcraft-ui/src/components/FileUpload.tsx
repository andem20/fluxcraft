import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  styled,
  TextField,
} from "@mui/material";
import { DataSourceProps } from "./UploadCard";
import { RootState } from "../stores/Store";
import { useSelector } from "react-redux";
import { ChangeEvent, useRef, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InputAdornment from "@mui/material/InputAdornment";

export const Input = styled("input")({
  display: "none",
});

export function FileUpload({
  step,
  onLoadFile,
  setLoading,
  updateDataframeStore,
  loading,
}: DataSourceProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const [hasHeaders, setHasHeaders] = useState(true);
  const rootPath = useRef(
    step.pending?.step.load[0]?.uri.replace(/[^\/]+$/, "") ?? ""
  );

  const initRootPath = rootPath.current;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setLoading(true);
    const fileArray = Array.from(selectedFiles);

    for (const file of fileArray) {
      const df = fluxcraftSelector.add(
        new Uint8Array(await file.arrayBuffer()),
        hasHeaders,
        file.name
      );
      updateDataframeStore(df);
      onLoadFile({
        type: "FILE",
        uri: step.pending?.step.load[0]?.uri ?? rootPath.current + file.name,
        name: file.name,
        options: {
          has_headers:
            step.pending?.step.load[0]?.options?.has_headers ??
            String(hasHeaders),
        },
      });

      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <label htmlFor="file-upload">
          <Input id="file-upload" type="file" onChange={handleFileChange} />
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Upload Files"}
          </Button>
        </label>
        <FormControlLabel
          control={
            <Checkbox
              checked={hasHeaders}
              onChange={(e) => setHasHeaders(e.target.checked)}
            />
          }
          label="Has headers?"
        />
      </Stack>
      <TextField
        label="Root path"
        size="small"
        fullWidth
        placeholder="/data/uploads/"
        value={initRootPath}
        onChange={(e) => {
          rootPath.current = e.target.value.replace(/\\/g, "/");
          rootPath.current = rootPath.current.endsWith("/")
            ? rootPath.current
            : rootPath.current + "/";
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FolderOpenIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          mt: 2,
          "& input": {
            fontFamily: "monospace",
          },
        }}
      />
    </Box>
  );
}
