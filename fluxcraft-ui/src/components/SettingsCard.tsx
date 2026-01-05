import {
  Button,
  Card,
  CardContent,
  Modal,
  Stack,
  TextField,
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Card elevation={3} sx={{ p: 3, maxWidth: 800, width: "100%" }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="Root path"
              size="small"
              fullWidth
              placeholder="/data/uploads/"
              value={path}
              onChange={(e) => {
                setPath(e.target.value);
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
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={() => {
                let value = path.replace(/\\/g, "/");
                if (!value.endsWith("/")) value += "/";
                setPath(value);
                dispatch(
                  settingsSlice.actions.update({
                    rootPath: path,
                  })
                );
              }}
            >
              Save
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Modal>
  );
}
