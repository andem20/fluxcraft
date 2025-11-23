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
import { EnvironmentCard } from "../components/EnvironmentCard";

export function Home() {
  const [steps, setSteps] = useState<TransformStep[]>([]);
  const [pendingSteps, setPendingSteps] = useState<TransformStep[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [environmentOpen, setEnvironmentOpen] = useState(false);

  function addTransformCard() {
    const step: TransformStep = {
      id: steps.reduce((max, step) => (step.id > max ? step.id : max), 0) + 1,
      load: [],
    };

    setSteps([...steps, step]);
  }

  function openStepsDrawer(): void {
    setDrawerOpen(true);
  }

  function nextPendingStep() {
    const pendingStep = pendingSteps.shift();
    setPendingSteps(pendingSteps);

    const tempSteps = [...steps].map(({ pending, ...cleaned }) => cleaned);

    if (pendingStep) {
      tempSteps.push(pendingStep);
    }

    setSteps(tempSteps);
  }

  function updatePendingLoad() {
    let isEmpty = false;

    setSteps((prevSteps) => {
      if (prevSteps.length === 0) return prevSteps;

      const lastIndex = prevSteps.length - 1;
      const step = prevSteps[lastIndex];

      const load = step.pending?.step.load ?? [];
      const newLoad = load.slice(1);

      isEmpty = newLoad.length === 0;

      const updatedStep = {
        ...step,
        pending: step.pending && {
          ...step.pending,
          step: { ...step.pending.step, load: newLoad },
        },
      };

      return [...prevSteps.slice(0, -1), updatedStep];
    });

    return isEmpty;
  }

  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />

      {steps.map((step) => (
        <TransformCard
          key={step.id}
          step={step}
          updatePendingLoad={updatePendingLoad}
          nextPendingStep={nextPendingStep}
          onRemove={(id: number) =>
            setSteps(steps.filter((step) => step.id !== id))
          }
        />
      ))}

      <PipelineDrawer
        steps={steps}
        setSteps={setSteps}
        setPendingSteps={setPendingSteps}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <EnvironmentCard
        open={environmentOpen}
        onClose={() => {
          setEnvironmentOpen(false);
        }}
      />

      <SpeedDial
        ariaLabel="actions"
        sx={{ position: "fixed", bottom: 16, right: "50%" }}
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
        {/* <SpeedDialAction
          key="environment_variables"
          icon={<FormatListBulletedIcon />}
          onClick={() => setEnvironmentOpen(true)}
          slotProps={{
            tooltip: {
              title: "Environment",
              open: true,
            },
          }}
        /> */}
      </SpeedDial>
    </Container>
  );
}
