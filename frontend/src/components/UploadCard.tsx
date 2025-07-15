import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  styled,
  Box,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ChangeEvent } from "react";
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
  const fileSelector = useSelector((state: RootState) => state.file.file);
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );
  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files != null) {
      dispatch(fileSlice.actions.setFile(files[0]));

      const df = fluxcraftSelector.add(
        new Uint8Array(await files[0].arrayBuffer()),
        true,
        files[0].name
      );

      console.log(df.print());

      dispatch(fileSlice.actions.setDataFrame(df));
    }
  };

  return (
    <Card elevation={3} sx={{ p: 2, m: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Upload a file
        </Typography>
        <Stack spacing={3}>
          <label htmlFor="file-upload">
            <Input
              accept=".csv"
              id="file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ padding: "2rem" }}
            >
              Upload File
            </Button>
          </label>
          {fileSelector && (
            <Box textAlign="center" color="text.secondary">
              Selected file: {fileSelector.name}
            </Box>
          )}
          <Button
            variant="contained"
            size="large"
            disabled={fileSelector == null}
            onClick={props.handleNext}
          >
            Next
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
