import {
  Box,
  Button,
  Chip,
  Drawer,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArticleIcon from "@mui/icons-material/Article";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { TransformStep } from "./TransformCard";

interface PipelineProps {
  steps: TransformStep[];
  drawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
}

export function Pipeline({ steps, drawerOpen, setDrawerOpen }: PipelineProps) {
  function exportPipeline() {
    const pipeline = {
      steps: steps.map((step) => ({ ...step, title: step.title.current })),
    };
    const blob = new Blob([JSON.stringify(pipeline)], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pipeline.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importPipeline() {}

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    >
      <Box sx={{ width: 400, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Pipeline
        </Typography>
        {steps.length === 0 && <Typography>No steps yet</Typography>}
        <Stepper orientation="vertical" nonLinear>
          {steps.map(({ id, query, load, title }) => (
            <Step key={id} active>
              <StepLabel>
                <Typography variant="subtitle2" fontWeight="bold">
                  {title.current}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ pl: 3, mb: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    Load
                    <br />
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {load.map((x) => {
                      return (
                        <Tooltip title={x.uri}>
                          <Chip
                            icon={
                              x.type === "FILE" ? (
                                <ArticleIcon />
                              ) : (
                                <CloudDownloadIcon />
                              )
                            }
                            label={x.name}
                            size="small"
                            variant="filled"
                          />
                        </Tooltip>
                      );
                    })}
                  </Stack>
                </Box>

                <Box sx={{ pl: 3, mb: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    Query
                  </Typography>
                  <Typography variant="caption">
                    {" "}
                    {query && query?.length > 100
                      ? query?.substring(0, 100) + "..."
                      : query}
                  </Typography>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        <Button
          startIcon={<FileDownloadIcon />}
          onClick={() => exportPipeline()}
        >
          Export
        </Button>
        <Button
          startIcon={<FileDownloadIcon />}
          onClick={() => importPipeline()}
        >
          Import
        </Button>
      </Box>
    </Drawer>
  );
}
