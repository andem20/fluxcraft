import { Container, Fab, Tooltip } from "@mui/material";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { TransformCard, TransformStep } from "../components/TransformCard";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { PipelineDrawer } from "../components/PipelineDrawer";
import { EnvironmentCard } from "../components/EnvironmentCard";
import { LineAxis } from "@mui/icons-material";

interface HomeProps {
  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
}

export function Home({ isDrawerOpen, setDrawerOpen }: HomeProps) {
  const [steps, setSteps] = useState<TransformStep[]>([]);
  const [pendingSteps, setPendingSteps] = useState<TransformStep[]>([]);
  const [environmentOpen, setEnvironmentOpen] = useState(false);

  function addTransformCard() {
    const step: TransformStep = {
      id: steps.reduce((max, step) => (step.id > max ? step.id : max), 0) + 1,
      load: [],
    };

    setSteps([...steps, step]);
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
        drawerOpen={isDrawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <EnvironmentCard
        open={environmentOpen}
        onClose={() => {
          setEnvironmentOpen(false);
        }}
      />

      <Tooltip title="Add Step" placement="top">
        <Fab
          onClick={addTransformCard}
          sx={{ position: "fixed", bottom: 16, right: "50%" }}
          color="primary"
          aria-label="add"
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <Tooltip title="Show Pipeline" placement="top">
        <Fab
          onClick={() => setDrawerOpen(true)}
          sx={{ position: "fixed", bottom: 16, right: "45%" }}
          color="secondary"
          aria-label="pipeline"
        >
          <LineAxis />
        </Fab>
      </Tooltip>
    </Container>
  );
}
