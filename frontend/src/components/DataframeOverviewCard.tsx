import {
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";
import DescriptionIcon from "@mui/icons-material/Description";

export function DataframeOverviewCard() {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );

  const dataframeOverviewSelector = useSelector(
    (state: RootState) => state.dataframeOverviewSlice.dataframes
  );

  function renderTooltip(file: String) {
    return fluxcraftSelector.get_schema(file as string).map((header) => (
      <div>
        <b>{header.get_name()}</b>: {header.get_dtype()}
      </div>
    ));
  }

  return (
    <Card elevation={3} sx={{ p: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <DescriptionIcon />
          <Typography variant="h5" gutterBottom>
            Dataframe Overview
          </Typography>
        </Stack>
        {dataframeOverviewSelector.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {dataframeOverviewSelector.map((name, idx) => (
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
