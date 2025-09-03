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
  TextField,
  IconButton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

export function UploadCard({ open, onClose, onLoadFile }: UploadCardProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );
  const dispatch = useDispatch<AppDispatch>();

  const [hasHeaders, setHasHeaders] = useState(true);
  const [loading, setLoading] = useState(false);

  // External JSON state
  const [jsonUrl, setJsonUrl] = useState(
    "https://dummyjson.com/products?limit=200"
  );
  const [jsonName, setJsonName] = useState("products");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [payloadDataframeName, setPayloadDataframeName] = useState<string>();
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);

  /** Handle file upload */
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
    }
  };

  /** Fetch JSON data from external API */
  async function fetchJson(
    url: string,
    headers: Map<string, string> = new Map(),
    name: string = "json_data",
    method: "GET" | "POST" = "GET",
    payloadName?: string
  ) {
    try {
      setLoading(true);
      let df;
      console.log(headers);
      if (method === "GET") {
        df = await fluxcraftSelector.add_from_http_json(url, headers, name);
      } else {
        const payload = fluxcraftSelector.get(payloadName!);

        df = await fluxcraftSelector.add_from_http_json_post(
          url,
          headers,
          name,
          payload
        );
      }

      updateDataframeStore(df);
      onLoadFile(`HTTP(${url}) → ${name}`);
    } finally {
      setLoading(false);
    }
  }

  /** Update Redux store */
  function updateDataframeStore(df: DataFrameJS) {
    dispatch(fileSlice.actions.setDataFrame(df));
    dispatch(
      dataframesOverviewSlice.actions.update(
        fluxcraftSelector.get_dataframe_names()
      )
    );
    onClose();
  }

  /** Header input handling */
  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (index: number) =>
    setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...headers];
    updated[index][field] = value;
    setHeaders(updated);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Card elevation={3} sx={{ p: 3, maxWidth: 800, width: "100%" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload or Fetch Data
          </Typography>

          <Stack spacing={3}>
            {/* File Upload */}
            <Stack direction="row" spacing={2} alignItems="center">
              <label htmlFor="file-upload">
                <Input
                  accept=".csv"
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

            {/* JSON Fetch Accordion */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Fetch JSON from URL</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    label="JSON URL"
                    fullWidth
                    size="small"
                    value={jsonUrl}
                    onChange={(e) => setJsonUrl(e.target.value)}
                  />

                  <TextField
                    label="DataFrame Name"
                    fullWidth
                    size="small"
                    value={jsonName}
                    onChange={(e) => setJsonName(e.target.value)}
                  />

                  {/* Header key-value editor */}
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Request Headers</Typography>
                    {headers.map((header, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <TextField
                          label="Key"
                          size="small"
                          value={header.key}
                          onChange={(e) =>
                            updateHeader(index, "key", e.target.value)
                          }
                        />
                        <TextField
                          label="Value"
                          size="small"
                          value={header.value}
                          onChange={(e) =>
                            updateHeader(index, "value", e.target.value)
                          }
                          fullWidth
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeHeader(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addHeader}
                      variant="outlined"
                      size="small"
                    >
                      Add Header
                    </Button>
                  </Stack>

                  {/* Method selection */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FormControl fullWidth size="small">
                      <InputLabel>Method</InputLabel>
                      <Select
                        value={method}
                        label="Method"
                        onChange={(e) => {
                          setMethod(e.target.value as "GET" | "POST");
                        }}
                      >
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="POST">POST</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl
                      fullWidth
                      size="small"
                      disabled={method !== "POST"}
                    >
                      <InputLabel>Payload</InputLabel>
                      <Select
                        value={payloadDataframeName}
                        label="Payload"
                        onChange={(e) =>
                          setPayloadDataframeName(e.target.value)
                        }
                      >
                        {fluxcraftSelector.get_dataframe_names().map((name) => (
                          <MenuItem value={name}>{name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Button
                    variant="contained"
                    disabled={loading}
                    onClick={() => {
                      const headerObj: Record<string, string> = {};
                      headers.forEach(({ key, value }) => {
                        if (key.trim()) headerObj[key.trim()] = value;
                      });
                      fetchJson(
                        jsonUrl,
                        new Map(Object.entries(headerObj)),
                        jsonName,
                        method,
                        payloadDataframeName
                      );
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Fetch external JSON"
                    )}
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </CardContent>
      </Card>
    </Modal>
  );
}
