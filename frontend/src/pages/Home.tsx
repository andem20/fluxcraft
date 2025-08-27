import { Container, Fab, IconButton } from "@mui/material";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { TransformCard, TransformCardRef } from "../components/TransformCard";
import AddIcon from "@mui/icons-material/Add";
import { useRef, useState } from "react";

type TransformItem = {
  id: number;
};

export function Home() {
  const [cells, setCells] = useState<TransformItem[]>([]);
  const [index, setIndex] = useState<number>(1);
  const cardRefs = useRef<Map<number, TransformCardRef>>(new Map());

  function extractAllSteps() {
    const allSteps = cells.map(({ id }) => {
      const ref = cardRefs.current.get(id);
      return { id, steps: ref?.getSteps() };
    });
    console.log("All steps:", allSteps);
  }

  function addTransformCard() {
    const newEntry: TransformItem = {
      id: index,
    };

    setCells([...cells, newEntry]);
    setIndex(index + 1);
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
        />
      ))}

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
        onClick={addTransformCard}
      >
        <AddIcon />
      </Fab>

      <Fab
        onClick={extractAllSteps}
        color="secondary"
        sx={{ position: "fixed", bottom: 80, right: 16 }}
      >
        Steps
      </Fab>
    </Container>
  );
}
