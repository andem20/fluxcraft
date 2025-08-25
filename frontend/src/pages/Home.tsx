import { Container, Fab } from "@mui/material";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { TransformCard } from "../components/TransformCard";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

export function Home() {
  const [cells, setCells] = useState<number[]>([]);
  const [index, setIndex] = useState<number>(1);

  function addTransformCard() {
    setCells([...cells, index]);
    setIndex(index + 1);
  }

  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />
      {cells.map((id) => (
        <TransformCard id={id} />
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
    </Container>
  );
}
