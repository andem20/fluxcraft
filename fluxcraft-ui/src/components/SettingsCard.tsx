import {
  Button,
  Card,
  CardActions,
  CardContent,
  Modal,
  Stack,
  TextField,
  Typography,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SaveIcon from "@mui/icons-material/Save";
import InputAdornment from "@mui/material/InputAdornment";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { settingsSlice } from "../stores/slices/SettingsSlice";
import { ReactNode, useState } from "react";

interface SettingsCardProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsCard({ open, onClose }: SettingsCardProps) {
  const settingsSelector = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();

  const [path, setPath] = useState(settingsSelector.rootPath);
  const [separator, setSeparator] = useState(
    settingsSelector.export.csv.separator
  );

  const handleSave = () => {
    let rootPath = path.replace(/\\/g, "/");
    if (!rootPath.endsWith("/")) rootPath += "/";
    setPath(rootPath);

    dispatch(
      settingsSlice.actions.update({
        rootPath,
        export: {
          csv: { separator },
        },
      })
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Card elevation={3} sx={{ width: "100%", maxWidth: 600 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <CardContent>
            <Stack spacing={3}>
              {/* USER SETTINGS */}
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FolderOpenIcon fontSize="small" />
                  <Typography variant="h6">File system</Typography>
                </Stack>
                <Divider />
              </Stack>

              <SettingsRow
                label="Root path"
                caption="Base directory for uploads"
                control={
                  <TextField
                    size="small"
                    fullWidth
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FolderOpenIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ "& input": { fontFamily: "monospace" } }}
                  />
                }
              />

              {/* EXPORT SETTINGS */}
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FileDownloadIcon fontSize="small" />
                  <Typography variant="h6">Export</Typography>
                </Stack>
                <Divider />
              </Stack>

              <SettingsRow
                label="CSV separator"
                caption="Character used between values"
                control={
                  <FormControl size="small" sx={{ maxWidth: 160 }}>
                    <InputLabel>Separator</InputLabel>
                    <Select
                      value={separator}
                      label="Separator"
                      onChange={(e) => setSeparator(e.target.value)}
                    >
                      <MenuItem value=",">Comma (,)</MenuItem>
                      <MenuItem value=";">Semicolon (;)</MenuItem>
                    </Select>
                  </FormControl>
                }
              />
            </Stack>
          </CardContent>

          <CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
              Save
            </Button>
          </CardActions>
        </form>
      </Card>
    </Modal>
  );
}

interface SettingsRowProps {
  label: string;
  caption: string;
  control: ReactNode;
}

export function SettingsRow({ label, control, caption }: SettingsRowProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "4fr 8fr",
        gap: 0,
        alignItems: "center",
      }}
    >
      <Typography variant="body1" color="text.secondary">
        <b>{label}</b>
        <br />
        <Typography variant="caption">{caption}</Typography>
      </Typography>
      {control}
    </Box>
  );
}
