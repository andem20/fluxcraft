import {
  Box,
  Button,
  Container,
  Drawer,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import {
  TransformCard,
  TransformCardRef,
  TransformStep,
} from "../components/TransformCard";
import AddIcon from "@mui/icons-material/Add";
import { useRef, useState } from "react";
import LineAxisIcon from "@mui/icons-material/LineAxis";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

type TransformItem = {
  id: number;
};

export function Home() {
  const [cells, setCells] = useState<TransformItem[]>([]);
  const [index, setIndex] = useState<number>(1);
  const [steps, setSteps] = useState<TransformStep[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cardRefs = useRef<Map<number, TransformCardRef>>(new Map());

  function onCardStepsChange() {
    const allSteps = cells
      .map(({ id }) => {
        const ref = cardRefs.current.get(id);
        return ref?.getSteps();
      })
      .filter((x) => x != undefined);
    setSteps(allSteps);
  }

  function addTransformCard() {
    const newEntry: TransformItem = {
      id: index,
    };

    setCells([...cells, newEntry]);
    setIndex(index + 1);
  }

  function openStepsDrawer(): void {
    onCardStepsChange();
    setDrawerOpen(true);
  }

  function exportPipeline() {
    const pipeline = { pipeline: steps };
    const blob = new Blob([JSON.stringify(pipeline)], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pipeline.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />

      {cells.map(({ id }) => (
        <TransformCard
          id={id}
          ref={(el) => {
            if (el) {
              cardRefs.current.set(id, el);
            } else {
              cardRefs.current.delete(id);
            }
          }}
          onRemove={(id: number) =>
            setCells(cells.filter((cell) => cell.id !== id))
          }
        />
      ))}

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
                    </Typography>
                    <Typography variant="caption">
                      {" "}
                      {load.join("\n")}
                    </Typography>
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
        </Box>
      </Drawer>

      <SpeedDial
        ariaLabel="actions"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          key="add-cell"
          icon={<AddIcon />}
          onClick={addTransformCard}
          slotProps={{
            tooltip: {
              title: "Add",
            },
          }}
        />
        <SpeedDialAction
          key="pipline"
          icon={<LineAxisIcon />}
          onClick={openStepsDrawer}
          slotProps={{
            tooltip: {
              title: "Pipline",
            },
          }}
        />
      </SpeedDial>
    </Container>
  );
}
