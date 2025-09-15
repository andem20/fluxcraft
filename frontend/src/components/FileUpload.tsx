import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  styled,
} from "@mui/material";
import { DataSourceProps } from "./UploadCard";
import { RootState } from "../stores/Store";
import { useSelector } from "react-redux";
import { ChangeEvent, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Input = styled("input")({
  display: "none",
});

export function FileUpload({
  onLoadFile,
  setLoading,
  updateDataframeStore,
  loading,
}: DataSourceProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const [hasHeaders, setHasHeaders] = useState(true);

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
      onLoadFile(`FILE(${file.name})`);

      setLoading(false);
    }
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <label htmlFor="file-upload">
        <Input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
        />
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
  );
}
