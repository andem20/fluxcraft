import {
  Container,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { TransformCard, TransformStep } from "../components/TransformCard";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import LineAxisIcon from "@mui/icons-material/LineAxis";
import { PipelineDrawer } from "../components/PipelineDrawer";

export function Home() {
  const [steps, setSteps] = useState<TransformStep[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function addTransformCard() {
    const step: TransformStep = {
      id: steps.reduce((max, step) => (step.id > max ? step.id : max), 0),
      title: "",
      load: [],
    };

    setSteps([...steps, step]);
  }

  function openStepsDrawer(): void {
    setDrawerOpen(true);
  }

  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />

      {steps.map((step) => (
        <TransformCard
          key={step.id}
          step={step}
          onRemove={(id: number) =>
            setSteps(steps.filter((step) => step.id !== id))
          }
        />
      ))}

      <PipelineDrawer
        steps={steps}
        setSteps={setSteps}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

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
              open: true,
            },
          }}
        />
        <SpeedDialAction
          key="pipline"
          icon={<LineAxisIcon />}
          onClick={openStepsDrawer}
          slotProps={{
            tooltip: {
              title: "Pipeline",
              open: true,
            },
          }}
        />
      </SpeedDial>
    </Container>
  );
}
