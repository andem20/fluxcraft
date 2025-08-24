import {
  Card,
  CardContent,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";

export function DataframeOverviewCard() {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  function renderTooltip(file: String) {
    return fluxcraftSelector.get_schema(file as string).map((header) => (
      <div>
        <b>{header.get_name()}</b>: {header.get_dtype()}
      </div>
    ));
  }

  return (
    <Card elevation={3} sx={{ p: 2, m: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Dataframe Overview
        </Typography>
        {fluxcraftSelector.get_dataframe_names().length > 0 && (
          <Grid container spacing={2}>
            {fluxcraftSelector.get_dataframe_names().map((name, idx) => (
              <Tooltip title={renderTooltip(name)}>
                <Paper
                  elevation={1}
                  sx={{ p: 1, textAlign: "center" }}
                  key={idx}
                  style={{ cursor: "pointer" }}
                >
                  <Typography variant="body2">{name}</Typography>
                </Paper>
              </Tooltip>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
