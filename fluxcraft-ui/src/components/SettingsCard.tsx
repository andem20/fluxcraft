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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { settingsSlice } from "../stores/slices/SettingsSlice";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InputAdornment from "@mui/material/InputAdornment";
import SaveIcon from "@mui/icons-material/Save";
import { useState } from "react";

interface SettingsCardProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsCard({ open, onClose }: SettingsCardProps) {
  const settingsSelector = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();
  const [path, setPath] = useState(settingsSelector.rootPath);

  const handleSave = () => {
    let value = path.replace(/\\/g, "/");
    if (!value.endsWith("/")) value += "/";

    setPath(value);
    dispatch(
      settingsSlice.actions.update({
        rootPath: value,
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
              <Typography variant="h6">User settings</Typography>
              <Divider />

              <TextField
                label="Root path"
                fullWidth
                size="small"
                placeholder="/data/uploads/"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                helperText="Base directory used for file uploads"
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
                  "& input": {
                    fontFamily: "monospace",
                  },
                }}
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
