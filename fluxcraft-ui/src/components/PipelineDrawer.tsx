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
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ChangeEvent } from "react";
import { TransformStep } from "./TransformCard";
import { Input } from "./FileUpload";

interface PipelineProps {
  steps: TransformStep[];
  setSteps: (steps: TransformStep[]) => void;
  setPendingSteps: (steps: TransformStep[]) => void;
  drawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
}

interface Pipeline {
  steps: TransformStep[];
}

export function PipelineDrawer({
  steps,
  setSteps,
  setPendingSteps,
  drawerOpen,
  setDrawerOpen,
}: PipelineProps) {
  function exportPipeline() {
    const pipeline: Pipeline = {
      steps: steps.map((step) => {
        delete step.pending;
        return { ...step };
      }),
    };
    const blob = new Blob([JSON.stringify(pipeline)], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pipeline.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function handlePipelineImport(e: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;

    if (selectedFiles?.length === 1) {
      const file = selectedFiles[0];
      const pipeline: Pipeline = JSON.parse(await file.text());
      const pendingSteps: TransformStep[] = pipeline.steps.map((step) => ({
        ...step,
        load: [],
        pending: {
          step: { ...step },
        },
      }));

      setPendingSteps(pendingSteps);
      const pendingStep = pendingSteps.shift();
      if (pendingStep) {
        setSteps([pendingStep]);
      }
    }
  }

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
                  {title}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ pl: 3, mb: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    Load
                    <br />
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    width="100%"
                    flexWrap="wrap"
                  >
                    {load.map((x) => {
                      return (
                        <Tooltip title={x.uri} key={x.name}>
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
        <Box>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => exportPipeline()}
          >
            Export
          </Button>
          <label htmlFor="pipeline-upload">
            <Input
              id="pipeline-upload"
              type="file"
              accept=".json"
              onChange={handlePipelineImport}
            />
            <Button component="span" startIcon={<FileUploadIcon />}>
              Import
            </Button>
          </label>
        </Box>
      </Box>
    </Drawer>
  );
}
