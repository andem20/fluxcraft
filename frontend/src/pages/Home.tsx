import {
  Container,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
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
import { Pipeline } from "../components/Pipeline";

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

      <Pipeline
        steps={steps}
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
