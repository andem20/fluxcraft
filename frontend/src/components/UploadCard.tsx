import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  styled,
  Checkbox,
  FormControlLabel,
  Modal,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { fileSlice } from "../stores/slices/FileSlice";
import { dataframesOverviewSlice } from "../stores/Store";
import { DataFrameJS } from "polars-wasm";

const Input = styled("input")({
  display: "none",
});

interface UploadCardProps {
  open: boolean;
  onClose: () => void;
  onLoadFile: (loadFile: string) => void;
}

export function UploadCard(props: UploadCardProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );
  const dispatch = useDispatch<AppDispatch>();

  const [hasHeaders, setHasHeaders] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);

    for (const file of fileArray) {
      const df = fluxcraftSelector.add(
        new Uint8Array(await file.arrayBuffer()),
        hasHeaders,
        file.name
      );

      updateDataframeStore(df);
    }
  };

  async function fetchJson() {
    setLoading(true);
    const df = await fluxcraftSelector.add_from_http_json(
      "https://dummyjson.com/products?limit=200",
      "products"
    );

    updateDataframeStore(df);
  }

  function updateDataframeStore(df: DataFrameJS) {
    props.onLoadFile(`LOAD(${df.get_name()})`);
    dispatch(fileSlice.actions.setDataFrame(df));
    dispatch(
      dataframesOverviewSlice.actions.update(
        fluxcraftSelector.get_dataframe_names()
      )
    );

    props.onClose();
    setLoading(false);
  }

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card elevation={3} sx={{ p: 2, m: 2, maxWidth: 800, width: "100%" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
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
                variant="contained"
                sx={{ margin: "2rem" }}
                onClick={fetchJson}
                loading={loading}
              >
                Fetch external json data
              </Button>
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                loading={loading}
              >
                Upload Files
              </Button>
            </label>
          </Stack>
        </CardContent>
      </Card>
    </Modal>
  );
}
