import {
  Box,
  Button,
  Container,
  Drawer,
  Fab,
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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 400, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Transform Steps
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
                    <Typography variant="caption"> {load}</Typography>
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
          <Button onClick={() => setDrawerOpen(false)}>Close</Button>
        </Box>
      </Drawer>

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
        color="secondary"
        sx={{ position: "fixed", bottom: 80, right: 16 }}
        onClick={() => openStepsDrawer()}
      >
        Steps
      </Fab>
    </Container>
  );
}
