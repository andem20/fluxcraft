import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { RootState } from "../stores/Store";
import { useSelector } from "react-redux";
import { DataSourceProps } from "./UploadCard";

export function JsonFetch({
  step,
  onLoadFile,
  setLoading,
  updateDataframeStore,
  loading,
}: DataSourceProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const [jsonUrl, setJsonUrl] = useState(
    step.pending?.step.load[0]?.uri ??
      "https://dummyjson.com/products?limit=200"
  );
  const [jsonName, setJsonName] = useState("products");
  const [method, setMethod] = useState<"GET" | "POST">(
    step.pending?.step.load[0]?.options?.method ?? "GET"
  );
  const [payloadDataframeName, setPayloadDataframeName] = useState<string>();
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    Object.entries(step.pending?.step.load[0]?.headers ?? {}).map(
      ([key, value]) => ({ key, value })
    ) ?? []
  );

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

  async function fetchJson(
    url: string,
    headers: Map<string, string> = new Map(),
    name: string = "json_data",
    method: "GET" | "POST" = "GET",
    payloadName?: string
  ) {
    setLoading(true);
    let df;
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
    onLoadFile({
      type: "HTTP",
      uri: url,
      name,
      options: {
        method,
        payload_name: payloadName,
      },
      headers: Object.fromEntries(headers),
    });

    setLoading(false);
  }

  return (
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
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                />
                <TextField
                  label="Value"
                  size="small"
                  value={header.value}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                  fullWidth
                />
                <IconButton color="error" onClick={() => removeHeader(index)}>
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

            <FormControl fullWidth size="small" disabled={method !== "POST"}>
              <InputLabel>Payload</InputLabel>
              <Select
                value={payloadDataframeName}
                label="Payload"
                onChange={(e) => setPayloadDataframeName(e.target.value)}
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
            {loading ? <CircularProgress size={20} /> : "Fetch external JSON"}
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
