import {
  Button,
  Card,
  CardContent,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { envSlice } from "../stores/slices/EnvSlice";

interface EnvironmentCardProps {
  open: boolean;
  onClose: () => void;
}

export function EnvironmentCard({ open, onClose }: EnvironmentCardProps) {
  const envSelector = useSelector((state: RootState) => state.env);
  const dispatch = useDispatch<AppDispatch>();

  const addEnv = () => dispatch(envSlice.actions.add({ key: "", value: "" }));

  const removeEnv = (index: number) => dispatch(envSlice.actions.remove(index));

  const updateEnv = (index: number, key: string, value: string) => {
    dispatch(
      envSlice.actions.update({
        index,
        keyValue: {
          key,
          value,
        },
      })
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Card elevation={3} sx={{ p: 3, maxWidth: 800, width: "100%" }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Environment Variables</Typography>
            {envSelector.envs.map((env, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <TextField
                  label="Key"
                  size="small"
                  value={env.key}
                  onChange={(e) => updateEnv(index, e.target.value, env.value)}
                />
                <TextField
                  label="Value"
                  size="small"
                  value={env.value}
                  onChange={(e) => updateEnv(index, env.key, e.target.value)}
                  fullWidth
                />
                <IconButton color="error" onClick={() => removeEnv(index)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addEnv}
              variant="outlined"
              size="small"
            >
              Add Variable
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Modal>
  );
}
