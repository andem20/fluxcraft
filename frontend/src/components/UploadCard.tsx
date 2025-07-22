import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  styled,
  Grid,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { fileSlice } from "../stores/slices/FileSlice";

const Input = styled("input")({
  display: "none",
});

interface UploadCardProps {
  handleNext: () => void;
}

export function UploadCard(props: UploadCardProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );
  const dispatch = useDispatch<AppDispatch>();

  const [files, setFiles] = useState<String[]>([]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...fileArray.map((f) => f.name)]);

    for (const file of fileArray) {
      const df = fluxcraftSelector.add(
        new Uint8Array(await file.arrayBuffer()),
        true,
        file.name
      );
      dispatch(fileSlice.actions.setDataFrame(df));
    }
  };

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
                <Paper
                  elevation={1}
                  sx={{ p: 1, textAlign: "center" }}
                  key={idx}
                >
                  <Typography variant="body2">{file}</Typography>
                </Paper>
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
        </Stack>
      </CardContent>
    </Card>
  );
}
