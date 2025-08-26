import {
  Container,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { TransformCard } from "../components/TransformCard";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

type TransformItem = {
  id: number;
  title: string;
  isExpanded: boolean;
  setTitle: (title: string) => void;
};

export function Home() {
  const [cells, setCells] = useState<TransformItem[]>([]);
  const [index, setIndex] = useState<number>(1);

  function addTransformCard() {
    const newEntry: TransformItem = {
      id: index,
      title: "",
      isExpanded: true,
      setTitle: function (title: string) {
        this.title = title;
      },
    };

    setCells([...cells.map((c) => ({ ...c, isExpanded: false })), newEntry]);
    setIndex(index + 1);
  }

  function toggleExpand(id: number) {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, isExpanded: !cell.isExpanded } : cell
      )
    );
  }

  function updateTitle(id: number, newTitle: string) {
    setCells((prev) =>
      prev.map((cell) => (cell.id === id ? { ...cell, title: newTitle } : cell))
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />

      {cells.map(({ id, isExpanded, title }) => (
        <Accordion
          key={id}
          expanded={isExpanded}
          onChange={() => toggleExpand(id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography sx={{ mr: 1, fontSize: "1.2rem" }}>#{id}:</Typography>
              <TextField
                variant="standard"
                value={title}
                placeholder="Cell title"
                onChange={(e) => updateTitle(id, e.target.value)}
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: { fontSize: "1.2rem" },
                  },
                }}
                fullWidth
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TransformCard id={id} />
          </AccordionDetails>
        </Accordion>
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
